<?php

namespace App\Services\PaymentGateways;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class NagadService
{
    protected $baseUrl;
    protected $merchantId;
    protected $merchantNumber;
    protected $publicKey;
    protected $privateKey;

    public function __construct()
    {
        $this->baseUrl = config('payment.nagad.base_url', 'https://api.mynagad.com:10443/remote-payment-gateway-1.0/api/dfs');
        $this->merchantId = config('payment.nagad.merchant_id');
        $this->merchantNumber = config('payment.nagad.merchant_number');
        $this->publicKey = config('payment.nagad.public_key');
        $this->privateKey = config('payment.nagad.private_key');
    }

    /**
     * Generate signature for Nagad API
     */
    private function generateSignature($data): string
    {
        openssl_sign(json_encode($data), $signature, $this->privateKey, OPENSSL_ALGO_SHA256);
        return base64_encode($signature);
    }

    /**
     * Create payment
     */
    public function createPayment(array $data): array
    {
        try {
            $orderId = 'ORD-' . time() . '-' . Str::random(6);
            
            // Step 1: Initialize payment
            $datetime = date('YmdHis');
            $sensitiveData = [
                'merchantId' => $this->merchantId,
                'datetime' => $datetime,
                'orderId' => $orderId,
                'challenge' => Str::random(40)
            ];

            $publicKey = "-----BEGIN PUBLIC KEY-----\n" . $this->publicKey . "\n-----END PUBLIC KEY-----";
            openssl_public_encrypt(json_encode($sensitiveData), $encryptedData, $publicKey);

            $initResponse = Http::withHeaders([
                'X-KM-Api-Version' => 'v-0.2.0',
                'X-KM-IP-V4' => request()->ip(),
                'X-KM-Client-Type' => 'PC_WEB'
            ])->post($this->baseUrl . '/check-out/initialize/' . $this->merchantId . '/' . $orderId, [
                'dateTime' => $datetime,
                'sensitiveData' => base64_encode($encryptedData),
                'signature' => $this->generateSignature($sensitiveData)
            ]);

            if (!$initResponse->successful()) {
                return [
                    'success' => false,
                    'message' => 'Failed to initialize payment'
                ];
            }

            $initData = $initResponse->json();
            
            // Step 2: Complete payment
            $paymentData = [
                'merchantId' => $this->merchantId,
                'orderId' => $orderId,
                'currencyCode' => '050', // BDT
                'amount' => $data['amount'],
                'challenge' => $initData['challenge']
            ];

            $completeResponse = Http::withHeaders([
                'X-KM-Api-Version' => 'v-0.2.0',
                'X-KM-IP-V4' => request()->ip(),
                'X-KM-Client-Type' => 'PC_WEB'
            ])->post($this->baseUrl . '/check-out/complete/' . $initData['paymentReferenceId'], [
                'merchantId' => $this->merchantId,
                'orderId' => $orderId,
                'currencyCode' => '050',
                'amount' => $data['amount'],
                'challenge' => $initData['challenge'],
                'productDetails' => $data['description'] ?? 'ISP Payment',
                'additionalMerchantInfo' => [
                    'invoice_id' => $data['invoice_id'] ?? null
                ]
            ]);

            if ($completeResponse->successful()) {
                $result = $completeResponse->json();
                
                // Store transaction
                \DB::table('pgw_transactions')->insert([
                    'user_id' => $data['user_id'],
                    'invoice_id' => $data['invoice_id'] ?? null,
                    'gateway' => 'nagad',
                    'transaction_id' => $orderId,
                    'gateway_transaction_id' => $result['paymentReferenceId'] ?? null,
                    'amount' => $data['amount'],
                    'currency' => 'BDT',
                    'status' => 'pending',
                    'customer_phone' => $data['customer_phone'] ?? null,
                    'gateway_response' => json_encode($result),
                    'initiated_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return [
                    'success' => true,
                    'payment_url' => $result['callBackUrl'] ?? null,
                    'transaction_id' => $orderId,
                    'message' => 'Payment created successfully'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to complete payment initialization'
            ];

        } catch (\Exception $e) {
            Log::error('Nagad create payment exception: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Verify payment callback
     */
    public function verifyPayment(string $paymentReferenceId): array
    {
        try {
            $response = Http::withHeaders([
                'X-KM-Api-Version' => 'v-0.2.0',
                'X-KM-IP-V4' => request()->ip(),
                'X-KM-Client-Type' => 'PC_WEB'
            ])->get($this->baseUrl . '/verify/payment/' . $paymentReferenceId);

            if ($response->successful()) {
                $result = $response->json();
                
                // Update transaction
                \DB::table('pgw_transactions')
                    ->where('gateway_transaction_id', $paymentReferenceId)
                    ->update([
                        'status' => strtolower($result['status']) === 'success' ? 'success' : 'failed',
                        'gateway_response' => json_encode($result),
                        'completed_at' => now(),
                        'updated_at' => now()
                    ]);

                return [
                    'success' => $result['status'] === 'Success',
                    'data' => $result
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to verify payment'
            ];

        } catch (\Exception $e) {
            Log::error('Nagad verify payment exception: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

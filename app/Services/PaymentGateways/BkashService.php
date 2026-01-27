<?php

namespace App\Services\PaymentGateways;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BkashService
{
    protected $baseUrl;
    protected $username;
    protected $password;
    protected $appKey;
    protected $appSecret;
    protected $token;

    public function __construct()
    {
        $this->baseUrl = config('payment.bkash.base_url', 'https://tokenized.pay.bka.sh/v1.2.0-beta');
        $this->username = config('payment.bkash.username');
        $this->password = config('payment.bkash.password');
        $this->appKey = config('payment.bkash.app_key');
        $this->appSecret = config('payment.bkash.app_secret');
    }

    /**
     * Get authorization token from bKash
     */
    public function getToken(): ?string
    {
        try {
            $response = Http::withHeaders([
                'username' => $this->username,
                'password' => $this->password,
            ])->post($this->baseUrl . '/tokenized/checkout/token/grant', [
                'app_key' => $this->appKey,
                'app_secret' => $this->appSecret,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                $this->token = $data['id_token'] ?? null;
                return $this->token;
            }

            Log::error('bKash token generation failed', [
                'response' => $response->json()
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('bKash token exception: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Create payment
     */
    public function createPayment(array $data): array
    {
        if (!$this->token) {
            $this->getToken();
        }

        try {
            $transactionId = 'TXN-' . time() . '-' . Str::random(6);

            $response = Http::withHeaders([
                'Authorization' => $this->token,
                'X-APP-Key' => $this->appKey,
            ])->post($this->baseUrl . '/tokenized/checkout/create', [
                'mode' => '0011',
                'payerReference' => $data['customer_phone'] ?? '',
                'callbackURL' => route('payment.bkash.callback'),
                'amount' => $data['amount'],
                'currency' => 'BDT',
                'intent' => 'sale',
                'merchantInvoiceNumber' => $data['invoice_number'] ?? $transactionId
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                // Store transaction in database
                \DB::table('pgw_transactions')->insert([
                    'user_id' => $data['user_id'],
                    'invoice_id' => $data['invoice_id'] ?? null,
                    'gateway' => 'bkash',
                    'transaction_id' => $transactionId,
                    'gateway_transaction_id' => $result['paymentID'] ?? null,
                    'amount' => $data['amount'],
                    'currency' => 'BDT',
                    'status' => 'pending',
                    'customer_phone' => $data['customer_phone'] ?? null,
                    'customer_email' => $data['customer_email'] ?? null,
                    'gateway_response' => json_encode($result),
                    'initiated_at' => now(),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);

                return [
                    'success' => true,
                    'payment_id' => $result['paymentID'],
                    'bkash_url' => $result['bkashURL'] ?? null,
                    'transaction_id' => $transactionId,
                    'message' => 'Payment created successfully'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to create payment',
                'error' => $response->json()
            ];

        } catch (\Exception $e) {
            Log::error('bKash create payment exception: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Execute payment after user approval
     */
    public function executePayment(string $paymentId): array
    {
        if (!$this->token) {
            $this->getToken();
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
                'X-APP-Key' => $this->appKey,
            ])->post($this->baseUrl . '/tokenized/checkout/execute', [
                'paymentID' => $paymentId
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                // Update transaction status
                \DB::table('pgw_transactions')
                    ->where('gateway_transaction_id', $paymentId)
                    ->update([
                        'status' => strtolower($result['transactionStatus']) === 'completed' ? 'success' : 'failed',
                        'gateway_response' => json_encode($result),
                        'completed_at' => now(),
                        'updated_at' => now()
                    ]);

                return [
                    'success' => $result['transactionStatus'] === 'Completed',
                    'data' => $result,
                    'message' => 'Payment executed'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to execute payment',
                'error' => $response->json()
            ];

        } catch (\Exception $e) {
            Log::error('bKash execute payment exception: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Query payment status
     */
    public function queryPayment(string $paymentId): array
    {
        if (!$this->token) {
            $this->getToken();
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
                'X-APP-Key' => $this->appKey,
            ])->post($this->baseUrl . '/tokenized/checkout/payment/status', [
                'paymentID' => $paymentId
            ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'data' => $response->json()
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to query payment'
            ];

        } catch (\Exception $e) {
            Log::error('bKash query payment exception: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Refund payment
     */
    public function refundPayment(string $paymentId, float $amount, string $reason = ''): array
    {
        if (!$this->token) {
            $this->getToken();
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => $this->token,
                'X-APP-Key' => $this->appKey,
            ])->post($this->baseUrl . '/tokenized/checkout/payment/refund', [
                'paymentID' => $paymentId,
                'amount' => $amount,
                'trxID' => 'TXN-' . time(),
                'sku' => 'payment',
                'reason' => $reason
            ]);

            if ($response->successful()) {
                $result = $response->json();
                
                // Update transaction
                \DB::table('pgw_transactions')
                    ->where('gateway_transaction_id', $paymentId)
                    ->update([
                        'status' => 'refunded',
                        'notes' => $reason,
                        'updated_at' => now()
                    ]);

                return [
                    'success' => true,
                    'data' => $result,
                    'message' => 'Refund processed'
                ];
            }

            return [
                'success' => false,
                'message' => 'Failed to process refund'
            ];

        } catch (\Exception $e) {
            Log::error('bKash refund exception: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

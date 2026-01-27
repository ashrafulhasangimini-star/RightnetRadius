<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentGateways\BkashService;
use App\Services\PaymentGateways\NagadService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $bkash;
    protected $nagad;

    public function __construct(BkashService $bkash, NagadService $nagad)
    {
        $this->bkash = $bkash;
        $this->nagad = $nagad;
    }

    /**
     * Create payment
     * POST /api/payments/create
     */
    public function createPayment(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'gateway' => 'required|in:bkash,nagad,cash,bank_transfer',
            'amount' => 'required|numeric|min:10',
            'user_id' => 'required|exists:users,id',
            'invoice_id' => 'nullable|exists:invoices,id',
            'customer_phone' => 'required_if:gateway,bkash,nagad|string',
            'customer_email' => 'nullable|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->all();

        switch ($request->gateway) {
            case 'bkash':
                $result = $this->bkash->createPayment($data);
                break;
                
            case 'nagad':
                $result = $this->nagad->createPayment($data);
                break;
                
            case 'cash':
            case 'bank_transfer':
                // Record manual payment
                $result = $this->recordManualPayment($data);
                break;
                
            default:
                return response()->json([
                    'success' => false,
                    'message' => 'Unsupported payment gateway'
                ], 400);
        }

        return response()->json($result);
    }

    /**
     * Bkash callback handler
     */
    public function bkashCallback(Request $request)
    {
        $paymentId = $request->get('paymentID');
        $status = $request->get('status');

        if ($status === 'success' && $paymentId) {
            $result = $this->bkash->executePayment($paymentId);
            
            if ($result['success']) {
                // Update invoice status, activate user, etc.
                $this->processSuccessfulPayment($paymentId, 'bkash');
                
                return redirect()->route('payment.success')->with('message', 'Payment successful!');
            }
        }

        return redirect()->route('payment.failed')->with('message', 'Payment failed!');
    }

    /**
     * Nagad callback handler
     */
    public function nagadCallback(Request $request)
    {
        $paymentRefId = $request->get('payment_ref_id');

        if ($paymentRefId) {
            $result = $this->nagad->verifyPayment($paymentRefId);
            
            if ($result['success']) {
                $this->processSuccessfulPayment($paymentRefId, 'nagad');
                
                return redirect()->route('payment.success')->with('message', 'Payment successful!');
            }
        }

        return redirect()->route('payment.failed')->with('message', 'Payment failed!');
    }

    /**
     * Get payment status
     * GET /api/payments/status/{transactionId}
     */
    public function getPaymentStatus($transactionId)
    {
        $transaction = \DB::table('pgw_transactions')
            ->where('transaction_id', $transactionId)
            ->orWhere('gateway_transaction_id', $transactionId)
            ->first();

        if (!$transaction) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $transaction
        ]);
    }

    /**
     * Get user payment history
     * GET /api/payments/history/{userId}
     */
    public function getPaymentHistory($userId)
    {
        $transactions = \DB::table('pgw_transactions')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $transactions
        ]);
    }

    /**
     * Record manual payment (cash/bank transfer)
     */
    protected function recordManualPayment(array $data): array
    {
        try {
            $transactionId = 'TXN-' . time() . '-' . \Illuminate\Support\Str::random(6);

            \DB::table('pgw_transactions')->insert([
                'user_id' => $data['user_id'],
                'invoice_id' => $data['invoice_id'] ?? null,
                'gateway' => $data['gateway'],
                'transaction_id' => $transactionId,
                'amount' => $data['amount'],
                'currency' => 'BDT',
                'status' => 'success',
                'notes' => $data['notes'] ?? null,
                'initiated_at' => now(),
                'completed_at' => now(),
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Process payment
            $this->processSuccessfulPayment($transactionId, $data['gateway']);

            return [
                'success' => true,
                'transaction_id' => $transactionId,
                'message' => 'Payment recorded successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }

    /**
     * Process successful payment
     */
    protected function processSuccessfulPayment($transactionId, $gateway): void
    {
        $transaction = \DB::table('pgw_transactions')
            ->where($gateway === 'bkash' || $gateway === 'nagad' ? 'gateway_transaction_id' : 'transaction_id', $transactionId)
            ->first();

        if (!$transaction) return;

        // Update invoice if exists
        if ($transaction->invoice_id) {
            \DB::table('invoices')
                ->where('id', $transaction->invoice_id)
                ->update([
                    'status' => 'paid',
                    'paid_at' => now(),
                    'payment_method' => $gateway
                ]);
        }

        // Update user balance
        \DB::table('users')
            ->where('id', $transaction->user_id)
            ->increment('balance', $transaction->amount);

        // TODO: Send notification to user
        // TODO: Activate/extend service if needed
    }
}

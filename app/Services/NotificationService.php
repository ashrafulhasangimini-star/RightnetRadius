<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class NotificationService
{
    /**
     * Send notification via multiple channels
     */
    public function send(int $userId, string $title, string $message, array $channels = ['email', 'sms']): array
    {
        $user = \App\Models\User::find($userId);
        
        if (!$user) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $results = [];

        if (in_array('email', $channels) && $user->email) {
            $results['email'] = $this->sendEmail($user->email, $title, $message);
        }

        if (in_array('sms', $channels) && $user->phone) {
            $results['sms'] = $this->sendSms($user->phone, $message);
        }

        if (in_array('push', $channels)) {
            $results['push'] = $this->sendPushNotification($userId, $title, $message);
        }

        return [
            'success' => true,
            'results' => $results
        ];
    }

    /**
     * Send email notification
     */
    public function sendEmail(string $email, string $subject, string $message): bool
    {
        try {
            Mail::raw($message, function ($mail) use ($email, $subject) {
                $mail->to($email)
                     ->subject($subject);
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Email notification failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send SMS notification
     */
    public function sendSms(string $phone, string $message): bool
    {
        try {
            // Example: Using SMS Gateway API
            $apiUrl = config('sms.api_url');
            $apiKey = config('sms.api_key');

            if (!$apiUrl || !$apiKey) {
                Log::warning('SMS gateway not configured');
                return false;
            }

            $response = Http::post($apiUrl, [
                'api_key' => $apiKey,
                'to' => $phone,
                'message' => $message
            ]);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('SMS notification failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send push notification
     */
    public function sendPushNotification(int $userId, string $title, string $message): bool
    {
        try {
            // Store notification in database for realtime display
            \DB::table('notifications')->insert([
                'user_id' => $userId,
                'type' => 'info',
                'title' => $title,
                'message' => $message,
                'read' => false,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // TODO: Implement WebSocket/Pusher for real-time delivery
            // broadcast(new NotificationEvent($userId, $title, $message));

            return true;

        } catch (\Exception $e) {
            Log::error('Push notification failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Send FUP warning notification
     */
    public function sendFupWarning(int $userId, float $usagePercent, float $usedGB, float $quotaGB): void
    {
        $user = \App\Models\User::find($userId);
        
        if (!$user) return;

        $title = 'Data Usage Warning';
        $message = sprintf(
            'You have used %.1f%% (%.2fGB of %.2fGB) of your monthly quota. ' .
            'Speed will be reduced to %s after quota exhaustion.',
            $usagePercent,
            $usedGB,
            $quotaGB,
            $user->package->fup_speed ?? '1M/1M'
        );

        $this->send($userId, $title, $message, ['email', 'sms', 'push']);
    }

    /**
     * Send FUP applied notification
     */
    public function sendFupApplied(int $userId, float $usedGB, float $quotaGB, string $newSpeed): void
    {
        $title = 'FUP Applied - Speed Reduced';
        $message = sprintf(
            'Your monthly quota (%.2fGB) has been exceeded. ' .
            'Your speed has been reduced to %s. ' .
            'Normal speed will restore on next billing cycle.',
            $quotaGB,
            $newSpeed
        );

        $this->send($userId, $title, $message, ['email', 'sms', 'push']);
    }

    /**
     * Send payment success notification
     */
    public function sendPaymentSuccess(int $userId, float $amount, string $transactionId): void
    {
        $title = 'Payment Successful';
        $message = sprintf(
            'Your payment of BDT %.2f has been received successfully. ' .
            'Transaction ID: %s',
            $amount,
            $transactionId
        );

        $this->send($userId, $title, $message, ['email', 'sms', 'push']);
    }

    /**
     * Send payment failed notification
     */
    public function sendPaymentFailed(int $userId, float $amount, string $reason): void
    {
        $title = 'Payment Failed';
        $message = sprintf(
            'Your payment of BDT %.2f failed. Reason: %s. ' .
            'Please try again or contact support.',
            $amount,
            $reason
        );

        $this->send($userId, $title, $message, ['email', 'push']);
    }

    /**
     * Send invoice reminder
     */
    public function sendInvoiceReminder(int $userId, string $invoiceNumber, float $amount, string $dueDate): void
    {
        $title = 'Payment Reminder';
        $message = sprintf(
            'Your invoice %s for BDT %.2f is due on %s. ' .
            'Please pay to avoid service interruption.',
            $invoiceNumber,
            $amount,
            $dueDate
        );

        $this->send($userId, $title, $message, ['email', 'sms']);
    }

    /**
     * Send service expiry warning
     */
    public function sendExpiryWarning(int $userId, int $daysRemaining): void
    {
        $title = 'Service Expiring Soon';
        $message = sprintf(
            'Your internet service will expire in %d days. ' .
            'Please renew to continue enjoying uninterrupted service.',
            $daysRemaining
        );

        $this->send($userId, $title, $message, ['email', 'sms', 'push']);
    }

    /**
     * Send service suspended notification
     */
    public function sendServiceSuspended(int $userId, string $reason): void
    {
        $title = 'Service Suspended';
        $message = sprintf(
            'Your internet service has been suspended. Reason: %s. ' .
            'Please contact support or renew your package.',
            $reason
        );

        $this->send($userId, $title, $message, ['email', 'sms', 'push']);
    }

    /**
     * Send speed changed notification
     */
    public function sendSpeedChanged(int $userId, string $oldSpeed, string $newSpeed, string $reason): void
    {
        $title = 'Speed Changed';
        $message = sprintf(
            'Your internet speed has been changed from %s to %s. Reason: %s.',
            $oldSpeed,
            $newSpeed,
            $reason
        );

        $this->send($userId, $title, $message, ['push']);
    }

    /**
     * Get user notifications
     */
    public function getUserNotifications(int $userId, bool $unreadOnly = false)
    {
        $query = \DB::table('notifications')
            ->where('user_id', $userId);

        if ($unreadOnly) {
            $query->where('read', false);
        }

        return $query->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId): bool
    {
        return \DB::table('notifications')
            ->where('id', $notificationId)
            ->update(['read' => true, 'updated_at' => now()]) > 0;
    }

    /**
     * Mark all user notifications as read
     */
    public function markAllAsRead(int $userId): int
    {
        return \DB::table('notifications')
            ->where('user_id', $userId)
            ->where('read', false)
            ->update(['read' => true, 'updated_at' => now()]);
    }
}

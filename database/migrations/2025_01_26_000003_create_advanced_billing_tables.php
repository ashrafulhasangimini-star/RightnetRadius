<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Payment gateway transactions
        Schema::create('pgw_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('invoice_id')->nullable()->constrained()->onDelete('set null');
            
            // Gateway info
            $table->enum('gateway', [
                'bkash', 'nagad', 'rocket', 'upay',
                'ssl_commerz', 'aamarpay', 'paypal',
                'stripe', 'razorpay', 'cash', 'bank_transfer'
            ]);
            $table->string('transaction_id')->unique();
            $table->string('gateway_transaction_id')->nullable();
            
            // Amount details
            $table->decimal('amount', 10, 2);
            $table->decimal('gateway_fee', 10, 2)->default(0);
            $table->decimal('net_amount', 10, 2)->comment('Amount after gateway fee');
            $table->string('currency', 3)->default('BDT');
            
            // Status
            $table->enum('status', [
                'pending', 'processing', 'success', 
                'failed', 'cancelled', 'refunded'
            ])->default('pending');
            
            // Additional data
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->json('gateway_response')->nullable();
            $table->text('notes')->nullable();
            
            // Timestamps
            $table->timestamp('initiated_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('transaction_id');
            $table->index('created_at');
        });

        // Invoice items (for itemized billing)
        Schema::create('invoice_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->string('item_type')->comment('package, addon, installation, equipment, etc.');
            $table->foreignId('item_id')->nullable()->comment('Reference to package_id, addon_id, etc.');
            $table->string('description');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 10, 2);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->timestamps();
            
            $table->index('invoice_id');
        });

        // Recurring billing
        Schema::create('recurring_billing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->constrained();
            
            $table->enum('frequency', ['monthly', 'quarterly', 'semi-annual', 'annual'])->default('monthly');
            $table->decimal('amount', 10, 2);
            $table->date('start_date');
            $table->date('next_billing_date');
            $table->date('end_date')->nullable();
            
            $table->boolean('auto_charge')->default(false);
            $table->string('payment_method')->nullable();
            
            $table->enum('status', ['active', 'paused', 'cancelled', 'completed'])->default('active');
            $table->timestamp('last_billed_at')->nullable();
            $table->integer('billing_count')->default(0);
            
            $table->timestamps();
            
            $table->index(['user_id', 'status']);
            $table->index('next_billing_date');
        });

        // Payment reminders
        Schema::create('payment_reminders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            $table->enum('type', ['email', 'sms', 'both'])->default('both');
            $table->enum('trigger', ['before_due', 'on_due', 'after_due'])->default('on_due');
            $table->integer('days_offset')->default(0)->comment('Days before/after due date');
            
            $table->timestamp('scheduled_at');
            $table->timestamp('sent_at')->nullable();
            $table->enum('status', ['pending', 'sent', 'failed', 'skipped'])->default('pending');
            
            $table->text('message')->nullable();
            $table->json('response')->nullable();
            
            $table->timestamps();
            
            $table->index(['status', 'scheduled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_reminders');
        Schema::dropIfExists('recurring_billing');
        Schema::dropIfExists('invoice_items');
        Schema::dropIfExists('pgw_transactions');
    }
};

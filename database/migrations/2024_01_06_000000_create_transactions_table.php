<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('transaction_number')->unique();
            $table->decimal('amount', 15, 2);
            $table->enum('type', ['credit', 'debit', 'refund', 'adjustment'])->default('credit');
            $table->enum('status', ['pending', 'completed', 'failed'])->default('completed');
            $table->enum('method', ['cash', 'bank', 'mobile', 'invoice'])->nullable();
            $table->string('reference')->nullable();
            $table->text('description')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('admin_users');
            $table->timestamps();

            $table->index('user_id');
            $table->index('type');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

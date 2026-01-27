<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // FUP usage tracking table
        Schema::create('fup_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('usage_date');
            $table->bigInteger('total_bytes')->default(0);
            $table->bigInteger('quota_bytes');
            $table->boolean('fup_applied')->default(false);
            $table->timestamp('fup_applied_at')->nullable();
            $table->string('original_speed')->nullable();
            $table->string('fup_speed')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'usage_date']);
            $table->index('usage_date');
        });

        // Package addons table
        Schema::create('package_addons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['speed_boost', 'extra_quota', 'static_ip', 'unlimited_time'])->default('extra_quota');
            $table->string('value')->comment('e.g., 50GB, 10M/10M');
            $table->decimal('price', 10, 2);
            $table->integer('validity_days')->default(30);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // User package history
        Schema::create('user_package_history', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('package_id')->constrained();
            $table->dateTime('activated_at');
            $table->dateTime('expires_at');
            $table->dateTime('deactivated_at')->nullable();
            $table->enum('status', ['active', 'expired', 'upgraded', 'downgraded'])->default('active');
            $table->decimal('price_paid', 10, 2);
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'activated_at']);
        });

        // Time-based policy
        Schema::create('time_policies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->enum('day_type', ['weekday', 'weekend', 'all'])->default('all');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('speed_limit')->comment('e.g., 5M/5M');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('time_policies');
        Schema::dropIfExists('user_package_history');
        Schema::dropIfExists('package_addons');
        Schema::dropIfExists('fup_usage');
    }
};

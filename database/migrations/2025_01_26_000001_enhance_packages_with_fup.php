<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add FUP and advanced features to packages table
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            // FUP (Fair Usage Policy)
            $table->bigInteger('quota_gb')->default(0)->comment('Monthly quota in GB, 0 = unlimited')->after('price');
            $table->string('fup_speed')->default('1M/1M')->comment('Speed after quota exceeded')->after('quota_gb');
            $table->boolean('fup_enabled')->default(false)->after('fup_speed');
            
            // Time-based restrictions
            $table->json('time_restrictions')->nullable()->comment('Peak/off-peak hours')->after('fup_enabled');
            $table->string('peak_hours_speed')->nullable()->comment('Speed during peak hours')->after('time_restrictions');
            $table->string('off_peak_speed')->nullable()->comment('Speed during off-peak')->after('peak_hours_speed');
            
            // Connection limits
            $table->integer('simultaneous_sessions')->default(1)->comment('Max concurrent sessions')->after('off_peak_speed');
            $table->boolean('static_ip_enabled')->default(false)->after('simultaneous_sessions');
            $table->string('ip_pool_name')->nullable()->comment('RADIUS IP pool')->after('static_ip_enabled');
            
            // Bandwidth burst
            $table->enum('burst_mode', ['enabled', 'disabled'])->default('disabled')->after('ip_pool_name');
            $table->string('burst_limit')->nullable()->comment('e.g., 20M/20M')->after('burst_mode');
            $table->integer('burst_threshold')->nullable()->comment('Burst threshold in KB')->after('burst_limit');
            $table->integer('burst_time')->nullable()->comment('Burst time in seconds')->after('burst_threshold');
            
            // Service validity
            $table->integer('validity_days')->default(30)->comment('Package validity period')->after('burst_time');
            $table->boolean('auto_renewal')->default(false)->after('validity_days');
            $table->decimal('grace_period_days', 5, 2)->default(3)->after('auto_renewal');
            
            // Priority & QoS
            $table->integer('priority')->default(5)->comment('1=highest, 10=lowest')->after('grace_period_days');
            $table->string('qos_class')->nullable()->comment('gold, silver, bronze')->after('priority');
            
            // Billing
            $table->decimal('setup_fee', 10, 2)->default(0)->after('qos_class');
            $table->decimal('installation_fee', 10, 2)->default(0)->after('setup_fee');
            $table->enum('billing_cycle', ['monthly', 'quarterly', 'semi-annual', 'annual'])->default('monthly')->after('installation_fee');
            
            // Mikrotik specific
            $table->string('mikrotik_profile')->nullable()->comment('PPP profile name')->after('billing_cycle');
            $table->string('mikrotik_queue')->nullable()->comment('Queue tree name')->after('mikrotik_profile');
            $table->json('mikrotik_attributes')->nullable()->comment('Custom RADIUS attributes')->after('mikrotik_queue');
            
            // Visibility
            $table->boolean('visible_to_subscribers')->default(true)->after('mikrotik_attributes');
            $table->boolean('is_trial')->default(false)->after('visible_to_subscribers');
            $table->integer('trial_days')->nullable()->after('is_trial');
        });
    }

    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropColumn([
                'quota_gb', 'fup_speed', 'fup_enabled',
                'time_restrictions', 'peak_hours_speed', 'off_peak_speed',
                'simultaneous_sessions', 'static_ip_enabled', 'ip_pool_name',
                'burst_mode', 'burst_limit', 'burst_threshold', 'burst_time',
                'validity_days', 'auto_renewal', 'grace_period_days',
                'priority', 'qos_class',
                'setup_fee', 'installation_fee', 'billing_cycle',
                'mikrotik_profile', 'mikrotik_queue', 'mikrotik_attributes',
                'visible_to_subscribers', 'is_trial', 'trial_days'
            ]);
        });
    }
};

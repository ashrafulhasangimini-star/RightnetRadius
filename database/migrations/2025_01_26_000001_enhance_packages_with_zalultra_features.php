<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Enhanced package system inspired by Zalultra
     * Adding advanced features to RightnetRadius
     */
    public function up(): void
    {
        // Enhance packages table with Zalultra features
        Schema::table('packages', function (Blueprint $table) {
            // FUP (Fair Usage Policy) - check if column exists first
            if (!Schema::hasColumn('packages', 'quota_gb')) {
                $table->bigInteger('quota_gb')->default(0)->comment('Monthly quota in GB, 0 = unlimited')->after('price');
            }
            if (!Schema::hasColumn('packages', 'fup_speed')) {
                $table->string('fup_speed')->default('1M/1M')->comment('Speed after quota exceeded')->after('quota_gb');
            }
            if (!Schema::hasColumn('packages', 'fup_enabled')) {
                $table->boolean('fup_enabled')->default(false)->after('fup_speed');
            }
            
            // Time-based restrictions
            if (!Schema::hasColumn('packages', 'time_restrictions')) {
                $table->json('time_restrictions')->nullable()->comment('{"weekday": "09:00-17:00", "weekend": "00:00-23:59"}')->after('fup_enabled');
            }
            if (!Schema::hasColumn('packages', 'peak_hours_speed')) {
                $table->string('peak_hours_speed')->nullable()->comment('Speed during peak hours')->after('time_restrictions');
            }
            if (!Schema::hasColumn('packages', 'off_peak_speed')) {
                $table->string('off_peak_speed')->nullable()->comment('Speed during off-peak')->after('peak_hours_speed');
            }
            
            // Advanced features
            if (!Schema::hasColumn('packages', 'simultaneous_sessions')) {
                $table->integer('simultaneous_sessions')->default(1)->comment('Max concurrent sessions')->after('off_peak_speed');
            }
            if (!Schema::hasColumn('packages', 'static_ip_enabled')) {
                $table->boolean('static_ip_enabled')->default(false)->after('simultaneous_sessions');
            }
            if (!Schema::hasColumn('packages', 'ip_pool_name')) {
                $table->string('ip_pool_name')->nullable()->comment('RADIUS IP pool')->after('static_ip_enabled');
            }
            
            // Bandwidth management
            if (!Schema::hasColumn('packages', 'burst_mode')) {
                $table->enum('burst_mode', ['enabled', 'disabled'])->default('disabled')->after('ip_pool_name');
            }
            if (!Schema::hasColumn('packages', 'burst_limit')) {
                $table->string('burst_limit')->nullable()->comment('e.g., 20M/20M')->after('burst_mode');
            }
            if (!Schema::hasColumn('packages', 'burst_threshold')) {
                $table->integer('burst_threshold')->nullable()->comment('Burst threshold in seconds')->after('burst_limit');
            }
            if (!Schema::hasColumn('packages', 'burst_time')) {
                $table->integer('burst_time')->nullable()->comment('Burst time in seconds')->after('burst_threshold');
            }
            
            // Service validity
            if (!Schema::hasColumn('packages', 'validity_days')) {
                $table->integer('validity_days')->default(30)->comment('Package validity period')->after('burst_time');
            }
            if (!Schema::hasColumn('packages', 'auto_renewal')) {
                $table->boolean('auto_renewal')->default(false)->after('validity_days');
            }
            if (!Schema::hasColumn('packages', 'grace_period_days')) {
                $table->decimal('grace_period_days', 5, 2)->default(3)->after('auto_renewal');
            }
            
            // Content filtering
            if (!Schema::hasColumn('packages', 'content_filter_enabled')) {
                $table->boolean('content_filter_enabled')->default(false)->after('grace_period_days');
            }
            if (!Schema::hasColumn('packages', 'blocked_sites')) {
                $table->json('blocked_sites')->nullable()->comment('List of blocked domains')->after('content_filter_enabled');
            }
            
            // Priority & QoS
            if (!Schema::hasColumn('packages', 'priority')) {
                $table->integer('priority')->default(5)->comment('1=highest, 10=lowest')->after('blocked_sites');
            }
            if (!Schema::hasColumn('packages', 'qos_class')) {
                $table->string('qos_class')->nullable()->comment('e.g., gold, silver, bronze')->after('priority');
            }
            
            // Billing
            if (!Schema::hasColumn('packages', 'setup_fee')) {
                $table->decimal('setup_fee', 10, 2)->default(0)->after('qos_class');
            }
            if (!Schema::hasColumn('packages', 'installation_fee')) {
                $table->decimal('installation_fee', 10, 2)->default(0)->after('setup_fee');
            }
            if (!Schema::hasColumn('packages', 'billing_cycle')) {
                $table->enum('billing_cycle', ['monthly', 'quarterly', 'semi-annual', 'annual'])->default('monthly')->after('installation_fee');
            }
            
            // Mikrotik specific
            if (!Schema::hasColumn('packages', 'mikrotik_profile')) {
                $table->string('mikrotik_profile')->nullable()->comment('PPP profile name')->after('billing_cycle');
            }
            if (!Schema::hasColumn('packages', 'mikrotik_queue')) {
                $table->string('mikrotik_queue')->nullable()->comment('Queue tree name')->after('mikrotik_profile');
            }
            if (!Schema::hasColumn('packages', 'mikrotik_attributes')) {
                $table->json('mikrotik_attributes')->nullable()->comment('Custom Mikrotik RADIUS attributes')->after('mikrotik_queue');
            }
            
            // Status
            if (!Schema::hasColumn('packages', 'visible_to_subscribers')) {
                $table->boolean('visible_to_subscribers')->default(true)->after('mikrotik_attributes');
            }
            if (!Schema::hasColumn('packages', 'is_trial')) {
                $table->boolean('is_trial')->default(false)->after('visible_to_subscribers');
            }
            if (!Schema::hasColumn('packages', 'trial_days')) {
                $table->integer('trial_days')->nullable()->after('is_trial');
            }
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
                'content_filter_enabled', 'blocked_sites',
                'priority', 'qos_class',
                'setup_fee', 'installation_fee', 'billing_cycle',
                'mikrotik_profile', 'mikrotik_queue', 'mikrotik_attributes',
                'visible_to_subscribers', 'is_trial', 'trial_days'
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // NAS Clients টেবিল - RADIUS সার্ভারের ক্লায়েন্ট (RouterOS, WiFi AP, etc.)
        Schema::create('nas_clients', function (Blueprint $table) {
            $table->id();
            $table->string('nas_name')->unique(); // shortname: "mikrotik-main"
            $table->string('nas_ip')->unique(); // IP Address: "192.168.1.1"
            $table->string('shared_secret'); // শেয়ার্ড সিক্রেট
            $table->enum('nas_type', ['mikrotik', 'cisco', 'ubiquiti', 'generic'])->default('generic');
            $table->string('description')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('port')->default(1812); // RADIUS পোর্ট
            $table->string('vendor')->nullable(); // Device ভেন্ডর
            $table->string('firmware')->nullable(); // ফার্মওয়্যার ভার্সন
            $table->timestamp('last_heartbeat')->nullable(); // শেষ কানেকশন
            $table->integer('auth_requests')->default(0); // মোট অথেন্টিকেশন রিকোয়েস্ট
            $table->integer('auth_accepts')->default(0); // অ্যাকসেপ্ট কাউন্ট
            $table->integer('auth_rejects')->default(0); // রিজেক্ট কাউন্ট
            $table->timestamps();
        });

        // RADIUS Accounting টেবিল - অথেন্টিকেশন এবং ব্যান্ডউইথ লগ
        Schema::create('radius_accounting', function (Blueprint $table) {
            $table->id();
            $table->string('acct_session_id')->unique(); // সেশন ID
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('username'); // ইউজার নাম
            $table->string('nas_ip'); // NAS IP
            $table->integer('nas_port')->nullable(); // NAS Port
            $table->string('framed_ip')->nullable(); // ইউজারের IP
            $table->string('mac_address')->nullable(); // ইউজারের MAC
            $table->enum('acct_status_type', ['Start', 'Interim-Update', 'Stop', 'Accounting-On', 'Accounting-Off'])->default('Start');
            $table->bigInteger('acct_input_octets')->default(0); // ডাউনলোড বাইট
            $table->bigInteger('acct_output_octets')->default(0); // আপলোড বাইট
            $table->integer('acct_session_time')->default(0); // সেশন সময় (সেকেন্ড)
            $table->dateTime('acct_start_time')->nullable(); // স্টার্ট টাইম
            $table->dateTime('acct_stop_time')->nullable(); // স্টপ টাইম
            $table->string('terminate_cause')->nullable(); // বন্ধ হওয়ার কারণ
            $table->timestamps();
            $table->index(['username', 'nas_ip']);
            $table->index('created_at');
        });

        // RADIUS Users টেবিল - ইউজার ক্রেডেনশিয়াল (স্পষ্ট ফর্ম্যাট)
        Schema::create('radius_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('username')->unique();
            $table->string('password'); // স্পষ্ট পাসওয়ার্ড (FreeRADIUS এর জন্য)
            $table->string('email')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->dateTime('expires_at')->nullable(); // পাসওয়ার্ড এক্সপায়ারি
            $table->text('attributes')->nullable(); // কাস্টম RADIUS অ্যাট্রিবিউট (JSON)
            $table->timestamps();
        });

        // RADIUS Groups টেবিল - ইউজার গ্রুপ এবং পারমিশন
        Schema::create('radius_groups', function (Blueprint $table) {
            $table->id();
            $table->string('group_name')->unique();
            $table->string('description')->nullable();
            $table->text('attributes')->nullable(); // গ্রুপ অ্যাট্রিবিউট (JSON)
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // RADIUS Group Members টেবিল
        Schema::create('radius_group_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('radius_group_id')->constrained('radius_groups')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['user_id', 'radius_group_id']);
        });

        // RADIUS Configuration টেবিল - সার্ভার কনফিগ ইতিহাস
        Schema::create('radius_config_history', function (Blueprint $table) {
            $table->id();
            $table->string('config_key'); // কনফিগ কী
            $table->text('old_value')->nullable(); // পুরাতন মান
            $table->text('new_value')->nullable(); // নতুন মান
            $table->string('changed_by')->nullable(); // পরিবর্তনকারী
            $table->string('reason')->nullable(); // পরিবর্তনের কারণ
            $table->timestamps();
        });

        // RADIUS Health Check টেবিল - সার্ভার স্বাস্থ্য মনিটরিং
        Schema::create('radius_health_checks', function (Blueprint $table) {
            $table->id();
            $table->string('server_host');
            $table->integer('server_port');
            $table->enum('status', ['ok', 'warning', 'critical', 'offline'])->default('ok');
            $table->float('response_time')->nullable(); // মিলিসেকেন্ডে
            $table->string('last_error')->nullable();
            $table->integer('consecutive_failures')->default(0);
            $table->timestamps();
            $table->index('server_host');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('radius_health_checks');
        Schema::dropIfExists('radius_config_history');
        Schema::dropIfExists('radius_group_members');
        Schema::dropIfExists('radius_groups');
        Schema::dropIfExists('radius_users');
        Schema::dropIfExists('radius_accounting');
        Schema::dropIfExists('nas_clients');
    }
};

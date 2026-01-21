<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mikrotik_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mikrotik_device_id')->constrained('mikrotik_devices')->onDelete('cascade');
            $table->enum('type', ['hotspot', 'pppoe', 'queue'])->default('pppoe');
            $table->string('profile_name');
            $table->string('target_address_list')->nullable();
            $table->string('max_packet_queue')->nullable();
            $table->string('parent_queue')->nullable();
            $table->string('queue_type')->nullable();
            $table->enum('sync_status', ['synced', 'pending', 'error'])->default('pending');
            $table->timestamps();

            $table->unique(['mikrotik_device_id', 'profile_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mikrotik_profiles');
    }
};

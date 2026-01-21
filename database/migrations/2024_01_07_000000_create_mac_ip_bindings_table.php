<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mac_ip_bindings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->macAddress('mac_address');
            $table->ipAddress('ip_address');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();

            $table->unique(['user_id', 'mac_address']);
            $table->index('ip_address');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mac_ip_bindings');
    }
};

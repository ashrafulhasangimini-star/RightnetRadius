<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mikrotik_devices', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('hostname');
            $table->ipAddress('api_host');
            $table->unsignedInteger('api_port')->default(8728);
            $table->string('api_username');
            $table->string('api_password');
            $table->boolean('api_ssl')->default(false);
            $table->enum('status', ['connected', 'disconnected', 'error'])->default('disconnected');
            $table->text('notes')->nullable();
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mikrotik_devices');
    }
};

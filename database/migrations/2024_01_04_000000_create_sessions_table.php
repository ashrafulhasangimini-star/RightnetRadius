<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('unique_id')->unique();
            $table->ipAddress('nas_ip_address');
            $table->unsignedInteger('nas_port');
            $table->ipAddress('framed_ip_address')->nullable();
            $table->string('called_station_id')->nullable();
            $table->string('calling_station_id')->nullable();
            $table->string('acct_session_id')->nullable();
            $table->enum('status', ['online', 'offline'])->default('offline');
            $table->timestamp('started_at');
            $table->timestamp('expires_at')->nullable();
            $table->unsignedBigInteger('input_octets')->default(0);
            $table->unsignedBigInteger('output_octets')->default(0);
            $table->unsignedInteger('session_timeout')->nullable();
            $table->unsignedInteger('idle_timeout')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('started_at');
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};

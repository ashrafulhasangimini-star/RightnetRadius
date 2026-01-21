<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->foreignId('package_id')->nullable()->constrained('packages');
            $table->enum('status', ['active', 'suspended', 'expired', 'disabled'])->default('active');
            $table->timestamp('expires_at')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('ip_address')->nullable();
            $table->decimal('balance', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->foreignId('reseller_id')->nullable()->constrained('users');
            $table->foreignId('created_by')->nullable()->constrained('admin_users');
            $table->softDeletes();
            $table->timestamps();

            $table->index('status');
            $table->index('expires_at');
            $table->index('reseller_id');
            $table->index('created_by');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

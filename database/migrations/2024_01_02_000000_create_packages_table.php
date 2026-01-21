<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            $table->unsignedInteger('speed_download')->comment('Mbps');
            $table->unsignedInteger('speed_upload')->comment('Mbps');
            $table->double('fup_limit', 10, 2)->comment('GB')->default(0);
            $table->unsignedSmallInteger('fup_reset_day')->nullable()->comment('Day of month');
            $table->unsignedSmallInteger('validity_days');
            $table->decimal('price', 12, 2);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index('status');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};

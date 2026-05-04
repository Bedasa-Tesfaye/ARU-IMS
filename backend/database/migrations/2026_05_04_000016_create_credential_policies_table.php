<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credential_policies', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('password_length')->default(12);
            $table->boolean('require_uppercase')->default(true);
            $table->boolean('require_lowercase')->default(true);
            $table->boolean('require_numbers')->default(true);
            $table->boolean('require_special')->default(true);
            $table->unsignedTinyInteger('minimum_numbers')->default(2);
            $table->unsignedTinyInteger('minimum_special')->default(2);
            $table->unsignedSmallInteger('password_expiry_days')->default(90);
            $table->boolean('force_password_change')->default(true);
            $table->string('user_email_domain')->default('arsi.edu.et');
            $table->string('partner_email_domain')->default('partner.arsi.edu.et');
            $table->boolean('auto_send_welcome_email')->default(false);
            $table->string('duplicate_strategy')->default('increment_suffix');
            $table->unsignedTinyInteger('failed_login_limit')->default(5);
            $table->unsignedSmallInteger('lockout_minutes')->default(30);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credential_policies');
    }
};

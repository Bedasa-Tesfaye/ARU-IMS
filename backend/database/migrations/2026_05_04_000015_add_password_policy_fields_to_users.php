<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('password_expires_at')->nullable()->after('password');
            $table->timestamp('password_changed_at')->nullable()->after('password_expires_at');
            $table->boolean('must_change_password')->default(true)->after('password_changed_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'password_expires_at',
                'password_changed_at',
                'must_change_password',
            ]);
        });
    }
};

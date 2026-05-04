<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('examiner_settings', function (Blueprint $table) {
            $table->json('rubric_templates')->nullable()->after('notification_prefs');
        });
    }

    public function down(): void
    {
        Schema::table('examiner_settings', function (Blueprint $table) {
            $table->dropColumn('rubric_templates');
        });
    }
};

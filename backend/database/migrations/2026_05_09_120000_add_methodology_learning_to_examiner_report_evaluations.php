<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('examiner_report_evaluations', function (Blueprint $table) {
            $table->unsignedTinyInteger('methodology_score')->nullable()->after('documentation_score');
            $table->unsignedTinyInteger('learning_score')->nullable()->after('methodology_score');
        });
    }

    public function down(): void
    {
        Schema::table('examiner_report_evaluations', function (Blueprint $table) {
            $table->dropColumn(['methodology_score', 'learning_score']);
        });
    }
};

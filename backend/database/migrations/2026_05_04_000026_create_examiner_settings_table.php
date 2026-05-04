<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examiner_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examiner_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('ai_assistance_level', 20)->default('balanced');
            $table->boolean('auto_suggest_scores')->default(true);
            $table->boolean('auto_feedback_drafts')->default(true);
            $table->boolean('bias_detection')->default(true);
            $table->string('theme', 20)->default('system');
            $table->json('notification_prefs')->nullable();
            $table->unsignedTinyInteger('max_examinees_capacity')->default(40);
            $table->unsignedTinyInteger('weekly_evaluation_capacity')->default(10);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examiner_settings');
    }
};

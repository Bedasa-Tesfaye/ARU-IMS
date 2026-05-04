<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('ai_assistance_level', 20)->default('balanced');
            $table->boolean('smart_alerts')->default(true);
            $table->boolean('deadline_predictions')->default(true);
            $table->boolean('profile_nudges')->default(true);
            $table->boolean('share_data_for_ai')->default(true);
            $table->string('theme', 20)->default('system');
            $table->boolean('high_contrast')->default(false);
            $table->integer('font_scale')->default(100);
            $table->json('feature_toggles')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_settings');
    }
};

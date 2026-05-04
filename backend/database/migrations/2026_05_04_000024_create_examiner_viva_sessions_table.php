<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examiner_viva_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examiner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('applications')->nullOnDelete();
            $table->dateTime('scheduled_at');
            $table->string('format', 30)->default('virtual');
            $table->string('room_or_link')->nullable();
            $table->string('status', 30)->default('scheduled');
            $table->unsignedTinyInteger('communication_score')->nullable();
            $table->unsignedTinyInteger('technical_score')->nullable();
            $table->unsignedTinyInteger('problem_solving_score')->nullable();
            $table->unsignedTinyInteger('confidence_score')->nullable();
            $table->unsignedTinyInteger('overall_score')->nullable();
            $table->string('result', 30)->nullable();
            $table->text('feedback')->nullable();
            $table->json('ai_questions')->nullable();
            $table->json('ai_transcript_meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examiner_viva_sessions');
    }
};

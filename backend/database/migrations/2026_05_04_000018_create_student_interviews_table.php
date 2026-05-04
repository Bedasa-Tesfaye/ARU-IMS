<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('applications')->nullOnDelete();
            $table->string('company_name');
            $table->string('position_title');
            $table->dateTime('scheduled_at');
            $table->string('format', 30)->default('video');
            $table->string('location')->nullable();
            $table->string('interviewer_name')->nullable();
            $table->string('interviewer_email')->nullable();
            $table->text('notes')->nullable();
            $table->text('post_interview_feedback')->nullable();
            $table->integer('confidence_score')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_interviews');
    }
};

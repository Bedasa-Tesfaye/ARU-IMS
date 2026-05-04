<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examiner_report_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examiner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('application_id')->nullable()->constrained('applications')->nullOnDelete();
            $table->string('report_type', 40)->default('final');
            $table->string('status', 30)->default('pending');
            $table->unsignedTinyInteger('technical_score')->nullable();
            $table->unsignedTinyInteger('documentation_score')->nullable();
            $table->unsignedTinyInteger('presentation_score')->nullable();
            $table->unsignedTinyInteger('overall_score')->nullable();
            $table->string('grade', 10)->nullable();
            $table->text('strengths')->nullable();
            $table->text('improvements')->nullable();
            $table->text('comments')->nullable();
            $table->json('ai_meta')->nullable();
            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examiner_report_evaluations');
    }
};

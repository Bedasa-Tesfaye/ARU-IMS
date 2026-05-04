<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('code', 60);
            $table->string('title', 120);
            $table->text('description')->nullable();
            $table->timestamp('achieved_at')->useCurrent();
            $table->timestamps();

            $table->unique(['student_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_achievements');
    }
};

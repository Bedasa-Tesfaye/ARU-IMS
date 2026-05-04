<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('examiner_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('examiner_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('thread_key', 120)->index();
            $table->string('subject', 255)->nullable();
            $table->string('from_name', 120);
            $table->string('from_role', 40)->default('student');
            $table->string('category', 30)->default('general');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examiner_messages');
    }
};

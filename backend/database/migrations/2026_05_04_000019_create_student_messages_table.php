<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->string('thread_key', 120)->index();
            $table->string('subject', 255)->nullable();
            $table->string('from_name', 120);
            $table->string('from_email', 255)->nullable();
            $table->enum('category', ['urgent', 'follow_up', 'general', 'promotional'])->default('general');
            $table->enum('sentiment', ['positive', 'neutral', 'urgent'])->default('neutral');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_messages');
    }
};

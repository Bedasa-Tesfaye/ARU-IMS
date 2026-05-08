<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_messages', function (Blueprint $table) {
            if (!Schema::hasColumn('student_messages', 'attachment_path')) {
                $table->string('attachment_path')->nullable()->after('body');
            }
            if (!Schema::hasColumn('student_messages', 'attachment_name')) {
                $table->string('attachment_name')->nullable()->after('attachment_path');
            }
            if (!Schema::hasColumn('student_messages', 'attachment_mime')) {
                $table->string('attachment_mime', 120)->nullable()->after('attachment_name');
            }
            if (!Schema::hasColumn('student_messages', 'attachment_size')) {
                $table->integer('attachment_size')->nullable()->after('attachment_mime');
            }
        });
    }

    public function down(): void
    {
        Schema::table('student_messages', function (Blueprint $table) {
            $cols = [];
            foreach (['attachment_path', 'attachment_name', 'attachment_mime', 'attachment_size'] as $c) {
                if (Schema::hasColumn('student_messages', $c)) {
                    $cols[] = $c;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};


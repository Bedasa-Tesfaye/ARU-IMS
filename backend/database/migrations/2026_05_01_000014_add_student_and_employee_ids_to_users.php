<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'student_id')) {
                $table->string('student_id', 50)->nullable()->after('company_id');
            }
            if (!Schema::hasColumn('users', 'employee_id')) {
                $table->string('employee_id', 100)->nullable()->after('student_id');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            try {
                $table->unique('student_id', 'users_student_id_unique');
            } catch (\Throwable $e) {
            }

            try {
                $table->unique('employee_id', 'users_employee_id_unique');
            } catch (\Throwable $e) {
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            try {
                $table->dropUnique('users_student_id_unique');
            } catch (\Throwable $e) {
            }
            try {
                $table->dropUnique('users_employee_id_unique');
            } catch (\Throwable $e) {
            }

            if (Schema::hasColumn('users', 'employee_id')) {
                $table->dropColumn('employee_id');
            }
            if (Schema::hasColumn('users', 'student_id')) {
                $table->dropColumn('student_id');
            }
        });
    }
};


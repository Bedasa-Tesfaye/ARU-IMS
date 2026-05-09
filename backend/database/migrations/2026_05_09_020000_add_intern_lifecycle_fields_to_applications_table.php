<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (!Schema::hasColumn('applications', 'intern_status')) {
                $table->enum('intern_status', ['active', 'completed', 'terminated'])
                    ->nullable()
                    ->after('approved_date');
            }
            if (!Schema::hasColumn('applications', 'intern_started_at')) {
                $table->dateTime('intern_started_at')->nullable()->after('intern_status');
            }
            if (!Schema::hasColumn('applications', 'intern_ended_at')) {
                $table->dateTime('intern_ended_at')->nullable()->after('intern_started_at');
            }
            if (!Schema::hasColumn('applications', 'intern_end_reason')) {
                $table->text('intern_end_reason')->nullable()->after('intern_ended_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            if (Schema::hasColumn('applications', 'intern_end_reason')) {
                $table->dropColumn('intern_end_reason');
            }
            if (Schema::hasColumn('applications', 'intern_ended_at')) {
                $table->dropColumn('intern_ended_at');
            }
            if (Schema::hasColumn('applications', 'intern_started_at')) {
                $table->dropColumn('intern_started_at');
            }
            if (Schema::hasColumn('applications', 'intern_status')) {
                $table->dropColumn('intern_status');
            }
        });
    }
};


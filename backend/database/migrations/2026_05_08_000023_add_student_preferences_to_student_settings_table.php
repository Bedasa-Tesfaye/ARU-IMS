<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_settings', function (Blueprint $table) {
            $table->boolean('notify_new_matches')->default(true)->after('feature_toggles');
            $table->boolean('notify_status_changes')->default(true)->after('notify_new_matches');
            $table->boolean('notify_interview_reminders')->default(true)->after('notify_status_changes');
            $table->string('privacy_profile_visibility', 20)->default('department')->after('notify_interview_reminders');
            $table->string('privacy_document_visibility', 30)->default('advisor_examiner')->after('privacy_profile_visibility');
            $table->string('language', 10)->default('en')->after('privacy_document_visibility');
        });
    }

    public function down(): void
    {
        Schema::table('student_settings', function (Blueprint $table) {
            $table->dropColumn([
                'notify_new_matches',
                'notify_status_changes',
                'notify_interview_reminders',
                'privacy_profile_visibility',
                'privacy_document_visibility',
                'language',
            ]);
        });
    }
};


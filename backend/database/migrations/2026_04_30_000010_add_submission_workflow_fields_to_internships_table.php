<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->string('program_field')->nullable()->after('description');
            $table->enum('work_modality', ['on-site', 'remote', 'hybrid'])->default('on-site')->after('program_field');
            $table->text('required_skills')->nullable()->after('requirements');
            $table->text('opportunities_during_program')->nullable()->after('responsibilities');
            $table->text('post_program_opportunities')->nullable()->after('opportunities_during_program');

            $table->dateTime('submission_date')->nullable()->after('post_program_opportunities');
            $table->enum('submission_status', ['pending_review', 'approved', 'rejected', 'improvement_requested'])
                ->default('pending_review')
                ->after('status');
            $table->foreignId('routing_department_id')
                ->nullable()
                ->after('coordinator_id')
                ->constrained('departments')
                ->nullOnDelete();
            $table->foreignId('reviewed_by')
                ->nullable()
                ->after('routing_department_id')
                ->constrained('users')
                ->nullOnDelete();
            $table->text('review_notes')->nullable()->after('reviewed_by');
            $table->dateTime('reviewed_at')->nullable()->after('review_notes');
            $table->dateTime('published_at')->nullable()->after('reviewed_at');
            $table->dateTime('sla_deadline_at')->nullable()->after('published_at');
        });
    }

    public function down(): void
    {
        Schema::table('internships', function (Blueprint $table) {
            $table->dropForeign(['routing_department_id']);
            $table->dropForeign(['reviewed_by']);
            $table->dropColumn([
                'program_field',
                'work_modality',
                'required_skills',
                'opportunities_during_program',
                'post_program_opportunities',
                'submission_date',
                'submission_status',
                'routing_department_id',
                'reviewed_by',
                'review_notes',
                'reviewed_at',
                'published_at',
                'sla_deadline_at',
            ]);
        });
    }
};

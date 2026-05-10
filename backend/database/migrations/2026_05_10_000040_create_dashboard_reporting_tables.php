<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_report_runs', function (Blueprint $table) {
            $table->id();
            $table->string('module', 40);
            $table->foreignId('owner_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('report_type', 60);
            $table->string('title', 180);
            $table->string('status', 20)->default('completed');
            $table->json('filters')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('generated_at');
            $table->timestamps();

            $table->index(['module', 'owner_user_id', 'report_type'], 'idx_dashboard_report_runs_scope');
        });

        Schema::create('dashboard_audit_events', function (Blueprint $table) {
            $table->id();
            $table->string('module', 40);
            $table->string('action', 80);
            $table->string('severity', 15)->default('info');
            $table->foreignId('actor_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('target_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('description', 255);
            $table->json('meta')->nullable();
            $table->timestamp('created_at');

            $table->index(['module', 'action'], 'idx_dashboard_audit_events_module_action');
            $table->index(['actor_user_id', 'target_user_id'], 'idx_dashboard_audit_events_users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dashboard_audit_events');
        Schema::dropIfExists('dashboard_report_runs');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Remove all users with actor roles
        \DB::table('users')->whereIn('role', [
            'super_admin',
            'admin', 
            'coordinator',
            'student',
            'company',
            'examiner',
            'advisor'
        ])->delete();

        // Remove all related data
        \DB::table('internships')->delete();
        \DB::table('applications')->delete();
        \DB::table('reports')->delete();
        \DB::table('evaluations')->delete();
        \DB::table('notifications')->delete();
        
        // Remove all departments and companies
        \DB::table('departments')->delete();
        \DB::table('companies')->delete();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed as it deletes data
        // To restore data, you would need to run the seeder again
    }
};

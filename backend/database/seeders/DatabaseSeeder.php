<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Company;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $dept = Department::firstOrCreate(
            ['code' => 'CS'],
            ['name' => 'Computer Science']
        );

        $company = Company::firstOrCreate(
            ['contact_email' => 'hr@acme.test'],
            [
                'name' => 'Acme Ltd',
                'industry' => 'Technology',
                'description' => 'Demo company',
                'website' => 'https://example.com',
                'address' => 'Demo Address',
                'city' => 'Demo City',
                'country' => 'Demo Country',
                'contact_person' => 'HR',
                'contact_phone' => '0000000000',
                'is_verified' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'superadmin@aru.test'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'password' => Hash::make('password123'),
                'role' => 'super_admin',
                'department_id' => $dept->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'coordinator@aru.test'],
            [
                'first_name' => 'Dept',
                'last_name' => 'Coordinator',
                'password' => Hash::make('password123'),
                'role' => 'coordinator',
                'department_id' => $dept->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'company@aru.test'],
            [
                'first_name' => 'Company',
                'last_name' => 'User',
                'password' => Hash::make('password123'),
                'role' => 'company',
                'company_id' => $company->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'student@aru.test'],
            [
                'first_name' => 'Demo',
                'last_name' => 'Student',
                'password' => Hash::make('password123'),
                'role' => 'student',
                'department_id' => $dept->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'examiner@aru.test'],
            [
                'first_name' => 'Demo',
                'last_name' => 'Examiner',
                'password' => Hash::make('password123'),
                'role' => 'examiner',
                'department_id' => $dept->id,
                'is_active' => true,
            ]
        );

        User::firstOrCreate(
            ['email' => 'advisor@aru.test'],
            [
                'first_name' => 'Demo',
                'last_name' => 'Advisor',
                'password' => Hash::make('password123'),
                'role' => 'advisor',
                'department_id' => $dept->id,
                'is_active' => true,
            ]
        );
    }
}

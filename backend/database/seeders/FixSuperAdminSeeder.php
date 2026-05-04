<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class FixSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@aru.test'],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'role' => 'super_admin',
                'is_active' => true,
                'must_change_password' => false,
                'password' => Hash::make('password123'),
            ]
        );
    }
}

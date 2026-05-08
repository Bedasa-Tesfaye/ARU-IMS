<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ResetSuperAdmin extends Command
{
    protected $signature = 'aru:reset-superadmin {email=superadmin@aru.test} {--password=}';

    protected $description = 'Create or update the super-admin user and set a new password.';

    public function handle(): int
    {
        $email = strtolower(trim((string) $this->argument('email')));
        $password = (string) ($this->option('password') ?? '');

        if ($password === '') {
            $entered = (string) ($this->secret('New password (leave empty to generate)') ?? '');
            $password = $entered !== '' ? $entered : Str::random(16);
        }

        User::updateOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Super',
                'last_name' => 'Admin',
                'role' => 'super_admin',
                'is_active' => true,
                'must_change_password' => false,
                'password' => Hash::make($password),
            ]
        );

        $this->info("Super-admin updated: {$email}");
        $this->line("Password: {$password}");

        return self::SUCCESS;
    }
}


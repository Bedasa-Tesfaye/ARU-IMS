<?php

namespace App\Services;

use App\Models\CredentialPolicy;
use App\Models\User;

class CredentialService
{
    public function getPolicy(): CredentialPolicy
    {
        $policy = CredentialPolicy::query()->first();

        if (!$policy) {
            $policy = CredentialPolicy::query()->create([
                'password_length' => 12,
                'require_uppercase' => true,
                'require_lowercase' => true,
                'require_numbers' => true,
                'require_special' => true,
                'minimum_numbers' => 2,
                'minimum_special' => 2,
                'password_expiry_days' => 90,
                'force_password_change' => true,
                'user_email_domain' => 'arsi.edu.et',
                'partner_email_domain' => 'partner.arsi.edu.et',
                'auto_send_welcome_email' => false,
                'duplicate_strategy' => 'increment_suffix',
                'failed_login_limit' => 5,
                'lockout_minutes' => 30,
            ]);
        }

        return $policy;
    }

    public function generateUserEmail(string $fullName, array $existingEmails = [], ?string $domain = null): string
    {
        $policy = $this->getPolicy();
        $domain = $domain ?: $policy->user_email_domain;

        $parts = preg_split('/\s+/', trim($this->normalizeText($fullName))) ?: [];
        $first = $parts[0] ?? 'user';
        $last = count($parts) > 1 ? ($parts[count($parts) - 1] ?? $first) : $first;

        $base = $this->safeLocalPart("{$first}.{$last}");
        return $this->resolveDuplicateEmail($base, $domain, $existingEmails);
    }

    public function generateCompanyEmail(string $companyName, ?string $website = null, array $existingEmails = []): string
    {
        $policy = $this->getPolicy();

        if ($website) {
            $host = parse_url($website, PHP_URL_HOST);
            if (is_string($host) && $host !== '') {
                $host = strtolower(preg_replace('/^www\./i', '', $host));
                $host = preg_replace('/[^a-z0-9\.\-]/', '', $host);
                if ($host !== '') {
                    return $this->resolveDuplicateEmail('contact', $host, $existingEmails);
                }
            }
        }

        $companyPart = $this->safeLocalPart($companyName);
        return $this->resolveDuplicateEmail($companyPart, $policy->partner_email_domain, $existingEmails);
    }

    public function generatePassword(?CredentialPolicy $policy = null): string
    {
        $policy = $policy ?: $this->getPolicy();

        $uppercase = 'ABCDEFGHJKLMNPQRTUVWXYZ';
        $lowercase = 'abcdefghjkmnpqrtuvwxyz';
        $numbers = '234679';
        $specials = '!@#$%^&*()_+-=[]{}|;:,.?';
        $all = $uppercase . $lowercase . $numbers . $specials;
        $targetLength = max(8, min(20, (int) $policy->password_length));

        $dictionary = ['admin', 'user', 'pass', 'login', 'student', 'advisor', 'examiner', 'company', 'arsi'];
        $maxAttempts = 200;

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $chars = [];

            if ($policy->require_uppercase) {
                $chars[] = $uppercase[random_int(0, strlen($uppercase) - 1)];
            }
            if ($policy->require_lowercase) {
                $chars[] = $lowercase[random_int(0, strlen($lowercase) - 1)];
            }
            if ($policy->require_numbers) {
                for ($i = 0; $i < max(1, (int) $policy->minimum_numbers); $i++) {
                    $chars[] = $numbers[random_int(0, strlen($numbers) - 1)];
                }
            }
            if ($policy->require_special) {
                for ($i = 0; $i < max(1, (int) $policy->minimum_special); $i++) {
                    $chars[] = $specials[random_int(0, strlen($specials) - 1)];
                }
            }

            while (count($chars) < $targetLength) {
                $chars[] = $all[random_int(0, strlen($all) - 1)];
            }

            shuffle($chars);
            $password = implode('', array_slice($chars, 0, $targetLength));

            if ($this->isWeakPattern($password, $dictionary)) {
                continue;
            }

            if ($this->hasMoreThanTwoRepeats($password)) {
                continue;
            }

            return $password;
        }

        throw new \RuntimeException('Unable to generate a strong password after multiple attempts.');
    }

    public function resolveDuplicateEmail(string $base, string $domain, array $additionalBlocked = []): string
    {
        $blocked = [];
        foreach ($additionalBlocked as $email) {
            $blocked[strtolower($email)] = true;
        }

        $counter = 1;
        while (true) {
            $candidateBase = $counter === 1 ? $base : "{$base}{$counter}";
            $candidate = strtolower("{$candidateBase}@{$domain}");

            $exists = User::query()->where('email', $candidate)->exists() || isset($blocked[$candidate]);
            if (!$exists) {
                return $candidate;
            }
            $counter++;
        }
    }

    private function normalizeText(string $input): string
    {
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $input);
        $ascii = $ascii !== false ? $ascii : $input;
        $ascii = strtolower($ascii);
        $ascii = preg_replace('/[^a-z\s]/', ' ', $ascii) ?? '';
        return trim(preg_replace('/\s+/', ' ', $ascii) ?? '');
    }

    private function safeLocalPart(string $value): string
    {
        $normalized = $this->normalizeText($value);
        $normalized = str_replace(' ', '.', $normalized);
        $normalized = preg_replace('/\.{2,}/', '.', $normalized) ?? 'user.user';
        $normalized = trim($normalized, '.');

        if ($normalized === '') {
            $normalized = 'user.user';
        } elseif (!str_contains($normalized, '.')) {
            $normalized = "{$normalized}.{$normalized}";
        }

        return substr($normalized, 0, 48);
    }

    private function isWeakPattern(string $password, array $dictionary): bool
    {
        $lower = strtolower($password);
        foreach ($dictionary as $word) {
            if (str_contains($lower, $word)) {
                return true;
            }
        }

        $sequences = ['abc', 'bcd', 'cde', 'def', '123', '234', '345', '456', '567', '678', '789'];
        foreach ($sequences as $seq) {
            if (str_contains($lower, $seq)) {
                return true;
            }
        }

        return false;
    }

    private function hasMoreThanTwoRepeats(string $password): bool
    {
        $counts = [];
        foreach (str_split($password) as $char) {
            $counts[$char] = ($counts[$char] ?? 0) + 1;
            if ($counts[$char] > 2) {
                return true;
            }
        }
        return false;
    }
}

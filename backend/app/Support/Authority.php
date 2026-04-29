<?php

namespace App\Support;

use App\Models\User;

final class Authority
{
    /**
     * Role-gated check based on `config('authority.permissions')`.
     *
     * For scoped permissions ('own'/'assigned'/'department'/'final'), this only
     * answers "is this role eligible?". The caller must still enforce scope.
     */
    public static function allows(?User $user, string $permission): bool
    {
        if (!$user) {
            return false;
        }

        $role = $user->role;
        $matrix = (array) config('authority.permissions', []);

        if (!array_key_exists($permission, $matrix)) {
            return false;
        }

        $rules = (array) $matrix[$permission];

        if (!array_key_exists($role, $rules)) {
            return false;
        }

        $value = $rules[$role];

        if ($value === true) {
            return true;
        }

        if ($value === false || $value === null) {
            return false;
        }

        // Scoped permissions: role is eligible; scope must be enforced at controller/policy level.
        return in_array($value, ['own', 'assigned', 'department', 'final'], true);
    }
}


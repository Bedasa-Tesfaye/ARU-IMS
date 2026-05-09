<?php

namespace App\Policies;

use App\Models\Internship;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class InternshipPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Internship $internship): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->isCompany() || $user->isSuperAdmin() || $user->isCoordinator();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Internship $internship): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }
        if ($user->isCompany() && (int) $internship->company_id === (int) $user->company_id) {
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Internship $internship): bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }
        if ($user->isCompany() && (int) $internship->company_id === (int) $user->company_id) {
            return true;
        }
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Internship $internship): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Internship $internship): bool
    {
        return $user->isSuperAdmin();
    }

    /**
     * Determine whether the user can approve/reject internship posts.
     */
    public function approvePost(User $user): bool
    {
        return $user->isSuperAdmin() || $user->isCoordinator();
    }

    /**
     * Determine whether the user can apply for internships.
     */
    public function apply(User $user): bool
    {
        return $user->isStudent();
    }
}
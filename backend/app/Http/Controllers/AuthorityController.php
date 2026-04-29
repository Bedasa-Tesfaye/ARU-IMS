<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AuthorityController extends Controller
{
    /**
     * Expose the authority matrix to the frontend.
     * This is useful for UI gating and for debugging.
     */
    public function matrix(Request $request)
    {
        // Any authenticated user can view the matrix.
        $this->authorize('system.dashboard.view');

        return response()->json([
            'roles' => config('authority.roles'),
            'permissions' => config('authority.permissions'),
        ]);
    }
}


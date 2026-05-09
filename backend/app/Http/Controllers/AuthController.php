<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'role' => 'required|in:super_admin,admin,coordinator,student,company,examiner,advisor',
            'department_id' => 'nullable|exists:departments,id',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validate department requirements for department-scoped roles
        $departmentScopedRoles = ['student', 'coordinator', 'examiner', 'advisor'];
        if (in_array($request->role, $departmentScopedRoles) && !$request->department_id) {
            return response()->json([
                'error' => 'Department ID is required for this role'
            ], 422);
        }

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'role' => $request->role,
            'department_id' => $request->department_id,
            'company_id' => $request->company_id,
        ]);

        $token = JWTAuth::fromUser($user);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = [
            'email' => strtolower(trim((string) $request->input('email'))),
            'password' => (string) $request->input('password'),
        ];

        $validator = Validator::make($credentials, [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $isInertia = $request->header('X-Inertia');

        if ($validator->fails()) {
            if ($isInertia) {
                return back()->withErrors($validator)->withInput();
            }

            if ($request->expectsJson()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            return back()->withErrors($validator)->withInput();
        }

        if ($isInertia || !$request->expectsJson()) {
            $remember = $request->boolean('remember');
            $attempted = Auth::guard('web')->attempt($credentials, $remember);

            if (!$attempted) {
                $user = User::query()
                    ->whereRaw('lower(email) = ?', [$credentials['email']])
                    ->first();

                if ($user && Hash::check($credentials['password'], $user->password)) {
                    Auth::guard('web')->login($user, $remember);
                    $attempted = true;
                }
            }

            if ($attempted) {
                $request->session()->regenerate();
                $user = Auth::guard('web')->user();

                if ($user && !$user->is_active) {
                    Auth::guard('web')->logout();
                    $request->session()->invalidate();
                    $request->session()->regenerateToken();

                    return back()->withErrors(['email' => 'Account is deactivated'])->withInput();
                }

                if ($user && $user->must_change_password) {
                    $next = $request->input('next') ?: null;
                    $url = '/force-password-change' . ($next ? ('?next=' . urlencode((string) $next)) : '');
                    if ($isInertia) {
                        return Inertia::location($url);
                    }
                    return redirect($url);
                }

                $redirectTo = '/';
                if ($user && in_array($user->role, ['super_admin', 'admin', 'coordinator'], true)) {
                    $redirectTo = '/superadmin';
                }

                if ($user && $user->role === 'student') {
                    $redirectTo = '/student-dashboard';
                }

                if ($user && $user->role === 'examiner') {
                    $redirectTo = '/examiner-dashboard';
                }

                if ($user && $user->role === 'advisor') {
                    $redirectTo = '/advisor-dashboard';
                }

                if ($user && $user->role === 'company') {
                    $redirectTo = '/company-dashboard';
                }

                if ($isInertia) {
                    return Inertia::location($redirectTo);
                }

                return redirect($redirectTo);
            }

            if ($isInertia) {
                return back()->withErrors(['email' => 'Invalid credentials'])->withInput();
            }

            return back()->withErrors(['email' => 'Invalid credentials'])->withInput();
        }

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user = auth()->user();

        if (!$user->is_active) {
            return response()->json(['error' => 'Account is deactivated'], 401);
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function changePassword(Request $request)
    {
        $user = Auth::guard('web')->user();
        abort_unless($user, 401, 'Unauthorized');

        $validated = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ])->validate();

        if (!Hash::check((string) $validated['current_password'], (string) $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update([
            'password' => Hash::make((string) $validated['new_password']),
            'must_change_password' => false,
            'password_changed_at' => now(),
        ]);

        return response()->json(['message' => 'Password updated.']);
    }

    public function logout(Request $request)
    {
        if (Auth::guard('web')->check()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            return redirect('/login');
        }

        if (JWTAuth::getToken()) {
            JWTAuth::invalidate(JWTAuth::getToken());
        }

        return response()->json(['message' => 'Successfully logged out']);
    }

    public function refresh()
    {
        $token = JWTAuth::refresh(JWTAuth::getToken());

        return response()->json([
            'token' => $token,
        ]);
    }

    public function me()
    {
        return response()->json(auth()->user());
    }
}

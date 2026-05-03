<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class SuperAdminController extends Controller
{
    public function getUsers()
    {
        return User::all();
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->all());
        return $user;
    }

    public function suspendUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        // Implement suspend logic
        return response()->json(['message' => 'User suspended']);
    }

    public function deleteUser($id)
    {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'User deleted']);
    }

    public function resetUserPassword($id)
    {
        $user = User::findOrFail($id);
        // Implement password reset
        return response()->json(['message' => 'Password reset']);
    }

    public function registerStudent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
        ]);

        return $user;
    }

    public function registerCompany(Request $request)
    {
        // Similar to registerStudent, with role 'company'
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'company',
        ]);

        return $user;
    }

    public function registerExaminer(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'examiner',
        ]);

        return $user;
    }

    public function registerAdvisor(Request $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'advisor',
        ]);

        return $user;
    }

    public function getApprovalsSummary()
    {
        // Implement logic
        return response()->json(['summary' => []]);
    }

    public function getPartnerRequests(Request $request)
    {
        // Implement logic
        return response()->json(['requests' => []]);
    }

    public function approvePartnerRequest($id)
    {
        // Implement
        return response()->json(['message' => 'Approved']);
    }

    public function rejectPartnerRequest($id)
    {
        // Implement
        return response()->json(['message' => 'Rejected']);
    }
}
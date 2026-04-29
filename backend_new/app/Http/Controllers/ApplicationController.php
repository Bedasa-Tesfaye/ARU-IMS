<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    public function index(Request $request)
    {
        $query = Application::with(['student', 'internship.company', 'coordinator']);

        if (auth()->user()->isStudent()) {
            $query->where('student_id', auth()->id());
        }

        if (auth()->user()->isCoordinator()) {
            $query->where('coordinator_id', auth()->id());
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->paginate(10);

        return response()->json($applications);
    }

    public function show($id)
    {
        $application = Application::with(['student', 'internship.company', 'coordinator', 'reports'])
            ->findOrFail($id);

        $user = auth()->user();
        
        if ($user->isStudent() && $application->student_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCoordinator() && $application->coordinator_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($application);
    }

    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|in:pending,approved,rejected,withdrawn',
            'rejection_reason' => 'sometimes|required|string',
            'coordinator_id' => 'sometimes|required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('status')) {
            if ($request->status === 'approved') {
                $application->approve();
            } elseif ($request->status === 'rejected') {
                $application->reject($request->rejection_reason);
            } elseif ($request->status === 'withdrawn') {
                $application->withdraw();
            } else {
                $application->update(['status' => $request->status]);
            }
        }

        if ($request->has('coordinator_id')) {
            $application->update(['coordinator_id' => $request->coordinator_id]);
        }

        return response()->json([
            'message' => 'Application updated successfully',
            'application' => $application->load(['student', 'internship.company', 'coordinator']),
        ]);
    }

    public function approve($id)
    {
        $application = Application::findOrFail($id);

        if (!auth()->user()->isCoordinator()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $application->approve();

        return response()->json([
            'message' => 'Application approved successfully',
            'application' => $application->load(['student', 'internship.company', 'coordinator']),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $application = Application::findOrFail($id);

        if (!auth()->user()->isCoordinator()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application->reject($request->rejection_reason);

        return response()->json([
            'message' => 'Application rejected successfully',
            'application' => $application->load(['student', 'internship.company', 'coordinator']),
        ]);
    }

    public function withdraw($id)
    {
        $application = Application::findOrFail($id);

        if (!auth()->user()->isStudent() || $application->student_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $application->withdraw();

        return response()->json([
            'message' => 'Application withdrawn successfully',
            'application' => $application->load(['student', 'internship.company', 'coordinator']),
        ]);
    }
}

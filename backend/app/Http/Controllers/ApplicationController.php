<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ApplicationController extends Controller
{
    private function inferPipelineStage(Application $app): string
    {
        $company = $app->internship?->company;
        $ats = is_array($company?->meta) ? ($company->meta['ats_stages'] ?? []) : [];
        $sid = (string) $app->id;

        if (is_array($ats) && isset($ats[$sid]) && is_string($ats[$sid])) {
            return $ats[$sid];
        }

        if ($app->status === 'approved') {
            return 'hired';
        }

        if ($app->status === 'rejected') {
            return 'rejected';
        }

        return 'applied';
    }

    public function index(Request $request)
    {
        $this->authorize('applications.viewAny');

        $query = Application::with(['student', 'internship.company', 'coordinator']);
        $user = auth()->user();

        if ($user && $user->isStudent()) {
            $query->where('student_id', auth()->id());
        }

        if ($user && $user->isCoordinator()) {
            $query->where('coordinator_id', auth()->id());
        }

        if ($user && $user->isCompany()) {
            $query->whereHas('internship', fn ($q) => $q->where('company_id', $user->company_id));
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $applications = $query->paginate(10);

        // Add a derived pipeline stage (used by Student UI tabs مثل Shortlisted/Interview/Offer)
        $applications->getCollection()->transform(function ($app) {
            /** @var Application $app */
            $app->setAttribute('pipeline_stage', $this->inferPipelineStage($app));
            return $app;
        });

        return response()->json($applications);
    }

    public function show($id)
    {
        $this->authorize('applications.viewAny');

        $application = Application::with(['student', 'internship.company', 'coordinator', 'reports'])
            ->findOrFail($id);

        $user = auth()->user();
        
        if ($user->isStudent() && $application->student_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCoordinator() && $application->coordinator_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCompany() && (int) $application->internship->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $application->setAttribute('pipeline_stage', $this->inferPipelineStage($application));

        return response()->json($application);
    }

    public function update(Request $request, $id)
    {
        $application = Application::findOrFail($id);
        $application->loadMissing('internship');
        $user = auth()->user();

        // Student dashboard withdraws via PUT { status: 'withdrawn' } — must not require applications.review.
        if ($user && $user->isStudent()
            && (int) $application->student_id === (int) $user->id
            && $request->input('status') === 'withdrawn') {
            $this->authorize('applications.withdraw');
            $application->withdraw();

            return response()->json([
                'message' => 'Application withdrawn successfully',
                'application' => $application->load(['student', 'internship.company', 'coordinator']),
            ]);
        }

        $this->authorize('applications.review');

        if ($user->isCompany() && (int) $application->internship->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

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
        $this->authorize('applications.approve');

        $application = Application::findOrFail($id);
        $application->loadMissing('internship');
        $user = auth()->user();

        if ($user->isCompany() && (int) $application->internship->company_id !== (int) $user->company_id) {
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
        $this->authorize('applications.reject');

        $application = Application::findOrFail($id);
        $application->loadMissing('internship');
        $user = auth()->user();

        if ($user->isCompany() && (int) $application->internship->company_id !== (int) $user->company_id) {
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
        $this->authorize('applications.withdraw');

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

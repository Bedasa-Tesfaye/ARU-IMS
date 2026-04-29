<?php

namespace App\Http\Controllers;

use App\Models\Internship;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InternshipController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('internships.viewAny');

        $query = Internship::with(['company', 'coordinator']);
        $user = auth()->user();

        // Company can only view its own internships.
        if ($user && $user->isCompany()) {
            $query->where('company_id', $user->company_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        $internships = $query->paginate(10);

        return response()->json($internships);
    }

    public function publicIndex(Request $request)
    {
        $query = Internship::with(['company'])
            ->where('status', 'active')
            ->where('start_date', '>', now());

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('location')) {
            $query->where('location', 'like', '%' . $request->location . '%');
        }

        $internships = $query->paginate(12);

        return response()->json($internships);
    }

    public function store(Request $request)
    {
        $this->authorize('internships.create');

        $user = auth()->user();

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'location' => 'required|string|max:255',
            'type' => 'required|in:full-time,part-time,remote,hybrid',
            'duration_weeks' => 'required|integer|min:1',
            'stipend' => 'nullable|numeric|min:0',
            'start_date' => 'required|date|after:today',
            'end_date' => 'required|date|after:start_date',
            'requirements' => 'nullable|string',
            'responsibilities' => 'nullable|string',
            'max_applicants' => 'required|integer|min:1',
            'company_id' => ($user && $user->isCompany())
                ? 'nullable|exists:companies,id'
                : 'required|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $request->all();

        // For company users, force ownership to their company_id.
        if ($user && $user->isCompany()) {
            $payload['company_id'] = $user->company_id;
        }

        $internship = Internship::create($payload);

        return response()->json([
            'message' => 'Internship created successfully',
            'internship' => $internship->load(['company', 'coordinator']),
        ], 201);
    }

    public function show($id)
    {
        $internship = Internship::with(['company', 'coordinator', 'applications.student'])
            ->findOrFail($id);

        return response()->json($internship);
    }

    public function update(Request $request, $id)
    {
        $this->authorize('internships.edit');

        $internship = Internship::findOrFail($id);
        $user = auth()->user();

        if ($user && $user->isCompany() && (int) $internship->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'location' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:full-time,part-time,remote,hybrid',
            'duration_weeks' => 'sometimes|required|integer|min:1',
            'stipend' => 'sometimes|nullable|numeric|min:0',
            'start_date' => 'sometimes|required|date|after:today',
            'end_date' => 'sometimes|required|date|after:start_date',
            'requirements' => 'sometimes|nullable|string',
            'responsibilities' => 'sometimes|nullable|string',
            'max_applicants' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:draft,active,closed,completed',
            'coordinator_id' => 'sometimes|nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $payload = $request->all();
        if ($user && $user->isCompany()) {
            unset($payload['company_id'], $payload['coordinator_id'], $payload['status']);
        }

        $internship->update($payload);

        return response()->json([
            'message' => 'Internship updated successfully',
            'internship' => $internship->load(['company', 'coordinator']),
        ]);
    }

    public function destroy($id)
    {
        $this->authorize('internships.delete');

        $internship = Internship::findOrFail($id);
        $user = auth()->user();

        if ($user && $user->isCompany() && (int) $internship->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($internship->applications()->exists()) {
            return response()->json([
                'error' => 'Cannot delete internship with existing applications'
            ], 422);
        }

        $internship->delete();

        return response()->json(['message' => 'Internship deleted successfully']);
    }

    public function apply(Request $request, $id)
    {
        $this->authorize('applications.apply');

        $internship = Internship::findOrFail($id);
        $student = auth()->user();

        if (!$internship->isAvailable()) {
            return response()->json(['error' => 'Internship is not available for application'], 422);
        }

        $existingApplication = Application::where('student_id', $student->id)
            ->where('internship_id', $internship->id)
            ->first();

        if ($existingApplication) {
            return response()->json(['error' => 'You have already applied for this internship'], 422);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => 'required|string',
            'resume_path' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::create([
            'cover_letter' => $request->cover_letter,
            'resume_path' => $request->resume_path,
            'applied_date' => now(),
            'student_id' => $student->id,
            'internship_id' => $internship->id,
        ]);

        $internship->incrementApplicants();

        return response()->json([
            'message' => 'Application submitted successfully',
            'application' => $application->load(['student', 'internship']),
        ], 201);
    }
}

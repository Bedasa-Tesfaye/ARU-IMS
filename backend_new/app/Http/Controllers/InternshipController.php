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
        $query = Internship::with(['company', 'coordinator']);

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

    public function store(Request $request)
    {
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
            'company_id' => 'required|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $internship = Internship::create($request->all());

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
        $internship = Internship::findOrFail($id);

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

        $internship->update($request->all());

        return response()->json([
            'message' => 'Internship updated successfully',
            'internship' => $internship->load(['company', 'coordinator']),
        ]);
    }

    public function destroy($id)
    {
        $internship = Internship::findOrFail($id);

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
        $internship = Internship::findOrFail($id);
        $student = auth()->user();

        if (!$student->isStudent()) {
            return response()->json(['error' => 'Only students can apply'], 403);
        }

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

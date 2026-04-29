<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('reports.viewAny');

        $query = Report::with(['student', 'application.internship.company', 'examiner']);
        $user = auth()->user();

        if ($user && $user->isStudent()) {
            $query->where('student_id', auth()->id());
        }

        if ($user && $user->isExaminer()) {
            $query->where('examiner_id', auth()->id());
        }

        if ($user && $user->isCompany()) {
            $query->whereHas('application.internship', fn ($q) => $q->where('company_id', $user->company_id));
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $reports = $query->paginate(10);

        return response()->json($reports);
    }

    public function store(Request $request)
    {
        // Students submit reports.
        $this->authorize('reports.weekly.submit');

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:weekly,monthly,final',
            'report_date' => 'required|date',
            'application_id' => 'required|exists:applications,id',
            'file_path' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::findOrFail($request->application_id);

        if (!auth()->user()->isStudent() || $application->student_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $report = Report::create([
            'title' => $request->title,
            'content' => $request->content,
            'type' => $request->type,
            'report_date' => $request->report_date,
            'application_id' => $request->application_id,
            'student_id' => auth()->id(),
            'file_path' => $request->file_path,
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report->load(['student', 'application.internship.company']),
        ], 201);
    }

    public function show($id)
    {
        $this->authorize('reports.viewAny');

        $report = Report::with(['student', 'application.internship.company', 'examiner'])
            ->findOrFail($id);

        $user = auth()->user();
        
        if ($user->isStudent() && $report->student_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isExaminer() && $report->examiner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCompany() && (int) $report->application?->internship?->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($report);
    }

    public function update(Request $request, $id)
    {
        $this->authorize('reports.weekly.submit');

        $report = Report::findOrFail($id);

        if (!auth()->user()->isStudent() || $report->student_id !== auth()->id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($report->status !== 'submitted') {
            return response()->json(['error' => 'Cannot update reviewed report'], 422);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string',
            'report_date' => 'sometimes|required|date',
            'file_path' => 'sometimes|nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report->update($request->all());

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report->load(['student', 'application.internship.company']),
        ]);
    }

    public function review(Request $request, $id)
    {
        $this->authorize('reports.review');

        $report = Report::findOrFail($id);

        if (!auth()->user()->isExaminer()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'feedback' => 'required|string',
            'status' => 'required|in:reviewed,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report->update([
            'feedback' => $request->feedback,
            'status' => $request->status,
            'examiner_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Report reviewed successfully',
            'report' => $report->load(['student', 'application.internship.company', 'examiner']),
        ]);
    }

    public function assignExaminer(Request $request, $id)
    {
        $this->authorize('assignments.examiner.assign');

        $report = Report::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'examiner_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $report->update(['examiner_id' => $request->examiner_id]);

        return response()->json([
            'message' => 'Examiner assigned successfully',
            'report' => $report->load(['student', 'application.internship.company', 'examiner']),
        ]);
    }
}

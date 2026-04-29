<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use App\Models\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EvaluationController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('evaluations.results.view');

        $query = Evaluation::with(['student', 'application.internship.company', 'examiner', 'company']);
        $user = auth()->user();

        if ($user && $user->isExaminer()) {
            $query->where('examiner_id', auth()->id());
        }

        if ($user && $user->isStudent()) {
            $query->where('student_id', auth()->id());
        }

        if ($user && $user->isCompany()) {
            $query->where('company_id', $user->company_id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $evaluations = $query->paginate(10);

        return response()->json($evaluations);
    }

    public function store(Request $request)
    {
        $this->authorize('evaluations.student.evaluate');

        $validator = Validator::make($request->all(), [
            'technical_skills' => 'required|integer|min:1|max:10',
            'communication_skills' => 'required|integer|min:1|max:10',
            'problem_solving' => 'required|integer|min:1|max:10',
            'teamwork' => 'required|integer|min:1|max:10',
            'time_management' => 'required|integer|min:1|max:10',
            'strengths' => 'nullable|string',
            'weaknesses' => 'nullable|string',
            'recommendations' => 'nullable|string',
            'type' => 'required|in:midterm,final',
            'evaluation_date' => 'required|date',
            'application_id' => 'required|exists:applications,id',
            'company_id' => 'nullable|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $application = Application::findOrFail($request->application_id);
        $application->loadMissing('internship');

        $user = auth()->user();

        if ($user->isCompany() && (int) $application->internship->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $existingEvaluation = Evaluation::where('application_id', $request->application_id)
            ->where('type', $request->type)
            ->first();

        if ($existingEvaluation) {
            return response()->json(['error' => 'Evaluation already exists for this application and type'], 422);
        }

        $evaluation = Evaluation::create([
            'technical_skills' => $request->technical_skills,
            'communication_skills' => $request->communication_skills,
            'problem_solving' => $request->problem_solving,
            'teamwork' => $request->teamwork,
            'time_management' => $request->time_management,
            'strengths' => $request->strengths,
            'weaknesses' => $request->weaknesses,
            'recommendations' => $request->recommendations,
            'type' => $request->type,
            'evaluation_date' => $request->evaluation_date,
            'application_id' => $request->application_id,
            'student_id' => $application->student_id,
            'examiner_id' => $user->id,
            'company_id' => $user->isCompany() ? $user->company_id : $request->company_id,
        ]);

        $evaluation->calculateOverallPerformance();

        return response()->json([
            'message' => 'Evaluation created successfully',
            'evaluation' => $evaluation->load(['student', 'application.internship.company', 'examiner']),
        ], 201);
    }

    public function show($id)
    {
        $this->authorize('evaluations.results.view');

        $evaluation = Evaluation::with(['student', 'application.internship.company', 'examiner', 'company'])
            ->findOrFail($id);

        $user = auth()->user();
        
        if ($user->isStudent() && $evaluation->student_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isExaminer() && $evaluation->examiner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCompany() && (int) $evaluation->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($evaluation);
    }

    public function update(Request $request, $id)
    {
        $this->authorize('evaluations.student.evaluate');

        $evaluation = Evaluation::findOrFail($id);

        $user = auth()->user();

        if ($user->isExaminer() && (int) $evaluation->examiner_id !== (int) $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCompany() && (int) $evaluation->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'technical_skills' => 'sometimes|required|integer|min:1|max:10',
            'communication_skills' => 'sometimes|required|integer|min:1|max:10',
            'problem_solving' => 'sometimes|required|integer|min:1|max:10',
            'teamwork' => 'sometimes|required|integer|min:1|max:10',
            'time_management' => 'sometimes|required|integer|min:1|max:10',
            'strengths' => 'sometimes|nullable|string',
            'weaknesses' => 'sometimes|nullable|string',
            'recommendations' => 'sometimes|nullable|string',
            'evaluation_date' => 'sometimes|required|date',
            'company_id' => 'sometimes|nullable|exists:companies,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $evaluation->update($request->all());
        $evaluation->calculateOverallPerformance();

        return response()->json([
            'message' => 'Evaluation updated successfully',
            'evaluation' => $evaluation->load(['student', 'application.internship.company', 'examiner']),
        ]);
    }

    public function destroy($id)
    {
        $this->authorize('evaluations.student.evaluate');

        $evaluation = Evaluation::findOrFail($id);

        $user = auth()->user();

        if ($user->isExaminer() && (int) $evaluation->examiner_id !== (int) $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($user->isCompany() && (int) $evaluation->company_id !== (int) $user->company_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $evaluation->delete();

        return response()->json(['message' => 'Evaluation deleted successfully']);
    }

    public function getStudentEvaluations($studentId)
    {
        $this->authorize('evaluations.results.view');

        $evaluations = Evaluation::with(['examiner', 'application.internship.company'])
            ->where('student_id', $studentId)
            ->paginate(10);

        return response()->json($evaluations);
    }
}

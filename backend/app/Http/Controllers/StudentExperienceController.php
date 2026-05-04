<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\StudentAchievement;
use App\Models\StudentDocument;
use App\Models\StudentInterview;
use App\Models\StudentMessage;
use App\Models\StudentSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class StudentExperienceController extends Controller
{
    private function student(Request $request)
    {
        $student = $request->user();
        abort_unless($student && $student->role === 'student', 403, 'Only students can access this endpoint.');
        return $student;
    }

    public function interviews(Request $request)
    {
        $student = $this->student($request);
        return response()->json(
            StudentInterview::query()->where('student_id', $student->id)->orderBy('scheduled_at')->get()
        );
    }

    public function interviewCalendar(Request $request)
    {
        $student = $this->student($request);
        $items = StudentInterview::query()
            ->where('student_id', $student->id)
            ->orderBy('scheduled_at')
            ->get()
            ->map(fn ($interview) => [
                'id' => $interview->id,
                'title' => "{$interview->company_name} - {$interview->position_title}",
                'date' => optional($interview->scheduled_at)->toDateString(),
                'time' => optional($interview->scheduled_at)->format('H:i'),
                'format' => $interview->format,
            ]);

        return response()->json($items);
    }

    public function createInterview(Request $request)
    {
        $student = $this->student($request);
        $validated = Validator::make($request->all(), [
            'application_id' => 'nullable|exists:applications,id',
            'company_name' => 'required|string|max:255',
            'position_title' => 'required|string|max:255',
            'scheduled_at' => 'required|date',
            'format' => 'nullable|in:video,phone,in_person',
            'location' => 'nullable|string|max:255',
            'interviewer_name' => 'nullable|string|max:255',
            'interviewer_email' => 'nullable|email|max:255',
            'notes' => 'nullable|string',
        ])->validate();

        $interview = StudentInterview::query()->create([
            ...$validated,
            'student_id' => $student->id,
            'format' => $validated['format'] ?? 'video',
        ]);

        return response()->json(['message' => 'Interview scheduled.', 'interview' => $interview], 201);
    }

    public function updateInterviewFeedback(Request $request, int $id)
    {
        $student = $this->student($request);
        $interview = StudentInterview::query()->where('student_id', $student->id)->findOrFail($id);
        $validated = Validator::make($request->all(), [
            'post_interview_feedback' => 'required|string|max:2000',
            'confidence_score' => 'nullable|integer|min:1|max:100',
        ])->validate();

        $interview->update($validated);
        return response()->json(['message' => 'Interview feedback saved.', 'interview' => $interview->fresh()]);
    }

    public function messages(Request $request)
    {
        $student = $this->student($request);
        $query = StudentMessage::query()->where('student_id', $student->id)->orderByDesc('created_at');
        if ($request->filled('category')) {
            $query->where('category', $request->query('category'));
        }
        return response()->json($query->get());
    }

    public function markMessageRead(Request $request, int $id)
    {
        $student = $this->student($request);
        $message = StudentMessage::query()->where('student_id', $student->id)->findOrFail($id);
        $message->update(['read_at' => now()]);
        return response()->json(['message' => 'Message marked as read.', 'item' => $message->fresh()]);
    }

    public function threadSummary(Request $request, string $threadKey)
    {
        $student = $this->student($request);
        $messages = StudentMessage::query()
            ->where('student_id', $student->id)
            ->where('thread_key', $threadKey)
            ->orderBy('created_at')
            ->get();

        $summary = $messages->take(-3)->map(fn ($m) => "{$m->from_name}: " . mb_substr($m->body, 0, 120))->implode("\n");

        return response()->json([
            'thread_key' => $threadKey,
            'count' => $messages->count(),
            'summary' => $summary !== '' ? $summary : 'No messages found in this thread.',
        ]);
    }

    public function createMessage(Request $request)
    {
        $student = $this->student($request);
        $validated = Validator::make($request->all(), [
            'thread_key' => 'required|string|max:120',
            'subject' => 'nullable|string|max:255',
            'from_name' => 'required|string|max:120',
            'from_email' => 'nullable|email|max:255',
            'category' => 'nullable|in:urgent,follow_up,general,promotional',
            'sentiment' => 'nullable|in:positive,neutral,urgent',
            'body' => 'required|string|max:5000',
        ])->validate();

        $message = StudentMessage::query()->create([
            ...$validated,
            'student_id' => $student->id,
            'category' => $validated['category'] ?? 'general',
            'sentiment' => $validated['sentiment'] ?? 'neutral',
        ]);

        return response()->json(['message' => 'Message created.', 'item' => $message], 201);
    }

    public function documents(Request $request)
    {
        $student = $this->student($request);
        return response()->json(
            StudentDocument::query()->where('student_id', $student->id)->orderByDesc('updated_at')->get()
        );
    }

    public function createDocument(Request $request)
    {
        $student = $this->student($request);
        $validated = Validator::make($request->all(), [
            'type' => 'required|string|max:40',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'file_path' => 'nullable|string|max:255',
        ])->validate();

        $latestVersion = StudentDocument::query()
            ->where('student_id', $student->id)
            ->where('title', $validated['title'])
            ->max('version');

        $doc = StudentDocument::query()->create([
            ...$validated,
            'student_id' => $student->id,
            'version' => ((int) $latestVersion) + 1,
            'ai_review' => [
                'score' => 82,
                'notes' => ['Strong structure', 'Add role-specific keywords'],
            ],
        ]);

        return response()->json(['message' => 'Document saved.', 'document' => $doc], 201);
    }

    public function downloadDocument(Request $request, int $id)
    {
        $student = $this->student($request);
        $doc = StudentDocument::query()->where('student_id', $student->id)->findOrFail($id);

        $filename = preg_replace('/[^a-z0-9\-_]+/i', '_', strtolower($doc->title)) . '.txt';
        $content = $doc->content ?: "Title: {$doc->title}\nType: {$doc->type}\nNo content.";

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function progress(Request $request)
    {
        $student = $this->student($request);
        $applications = Application::query()->where('student_id', $student->id)->get();
        $total = $applications->count();
        $interviewCount = $applications->where('status', 'interview')->count();
        $accepted = $applications->where('status', 'accepted')->count();
        $placementProbability = min(95, 40 + ($total * 3) + ($interviewCount * 4) + ($accepted * 7));

        $achievements = StudentAchievement::query()->where('student_id', $student->id)->orderByDesc('achieved_at')->get();

        return response()->json([
            'funnel' => [
                'applications' => $total,
                'shortlisted' => $applications->where('status', 'shortlisted')->count(),
                'interviews' => $interviewCount,
                'offers' => $accepted,
            ],
            'chart_series' => [
                ['label' => 'Applications', 'value' => $total],
                ['label' => 'Shortlisted', 'value' => $applications->where('status', 'shortlisted')->count()],
                ['label' => 'Interviews', 'value' => $interviewCount],
                ['label' => 'Offers', 'value' => $accepted],
            ],
            'prediction' => [
                'placement_probability' => $placementProbability,
                'summary' => "Based on your trajectory, you have a {$placementProbability}% chance of securing an internship.",
            ],
            'goals' => [
                'target_monthly_applications' => 15,
                'current_monthly_applications' => $total,
                'on_track' => $total >= 10,
            ],
            'achievements' => $achievements,
        ]);
    }

    public function addAchievement(Request $request)
    {
        $student = $this->student($request);
        $validated = Validator::make($request->all(), [
            'code' => 'required|string|max:60',
            'title' => 'required|string|max:120',
            'description' => 'nullable|string|max:500',
        ])->validate();

        $achievement = StudentAchievement::query()->updateOrCreate(
            ['student_id' => $student->id, 'code' => $validated['code']],
            ['title' => $validated['title'], 'description' => $validated['description'] ?? null, 'achieved_at' => now()]
        );

        return response()->json(['message' => 'Achievement saved.', 'achievement' => $achievement]);
    }

    public function getSettings(Request $request)
    {
        $student = $this->student($request);
        $settings = StudentSetting::query()->firstOrCreate(
            ['student_id' => $student->id],
            ['feature_toggles' => ['chat' => true, 'smart_reply' => true, 'daily_briefing' => true]]
        );
        return response()->json($settings);
    }

    public function updateSettings(Request $request)
    {
        $student = $this->student($request);
        $settings = StudentSetting::query()->firstOrCreate(['student_id' => $student->id]);
        $validated = Validator::make($request->all(), [
            'ai_assistance_level' => 'nullable|in:minimal,balanced,maximum',
            'smart_alerts' => 'nullable|boolean',
            'deadline_predictions' => 'nullable|boolean',
            'profile_nudges' => 'nullable|boolean',
            'share_data_for_ai' => 'nullable|boolean',
            'theme' => 'nullable|in:light,dark,system',
            'high_contrast' => 'nullable|boolean',
            'font_scale' => 'nullable|integer|min:80|max:140',
            'feature_toggles' => 'nullable|array',
        ])->validate();

        $settings->update($validated);
        return response()->json(['message' => 'Settings updated.', 'settings' => $settings->fresh()]);
    }
}

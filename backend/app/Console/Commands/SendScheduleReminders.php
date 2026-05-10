<?php

namespace App\Console\Commands;

use App\Models\ExaminerVivaSession;
use App\Models\StudentInterview;
use App\Services\ScheduleNotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SendScheduleReminders extends Command
{
    protected $signature = 'schedule:send-reminders {--date= : YYYY-MM-DD (server timezone)}';

    protected $description = 'Send same-day reminders for scheduled interviews/meetings/viva sessions.';

    public function handle(ScheduleNotificationService $notifier): int
    {
        $day = $this->option('date')
            ? Carbon::parse((string) $this->option('date'))
            : now();

        $start = $day->copy()->startOfDay();
        $end = $day->copy()->endOfDay();

        $interviews = StudentInterview::query()
            ->whereBetween('scheduled_at', [$start, $end])
            ->orderBy('scheduled_at')
            ->get();

        foreach ($interviews as $i) {
            $title = 'Reminder: scheduled session today';
            $msg = sprintf(
                "You have a scheduled session today.\n\nTitle: %s\nWhen: %s\nFormat: %s\n\nNotes: %s",
                (string) ($i->position_title ?? 'Session'),
                $notifier->formatWhen($i->scheduled_at),
                (string) ($i->format ?? 'video'),
                (string) ($i->notes ?? '—')
            );

            // If an application_id exists, this is typically a company interview. If not, it's an advisor meeting.
            $eventType = $i->application_id ? 'company_interview' : 'advisor_meeting';
            // Use a stable system thread so reminders always appear in the student's inbox.
            $threadKey = 'system-schedule-' . ((int) $i->student_id);

            $notifier->notifyStudent(
                (int) $i->student_id,
                'reminder',
                $title,
                $msg,
                [
                    'event_type' => $eventType,
                    'event_id' => (int) $i->id,
                    'scheduled_at' => $i->scheduled_at?->toIso8601String(),
                ],
                $threadKey,
                'ARU IMS',
                null,
                'urgent',
                'urgent'
            );
        }

        $vivas = ExaminerVivaSession::query()
            ->where('status', 'scheduled')
            ->whereBetween('scheduled_at', [$start, $end])
            ->orderBy('scheduled_at')
            ->get();

        foreach ($vivas as $v) {
            $notifier->notifyStudent(
                (int) $v->student_id,
                'reminder',
                'Reminder: viva session today',
                sprintf(
                    "You have a viva / oral defense session scheduled today.\n\nWhen: %s\nFormat: %s\nRoom/Link: %s",
                    $notifier->formatWhen($v->scheduled_at),
                    (string) ($v->format ?? 'virtual'),
                    (string) ($v->room_or_link ?? '—')
                ),
                [
                    'event_type' => 'examiner_viva',
                    'event_id' => (int) $v->id,
                    'scheduled_at' => $v->scheduled_at?->toIso8601String(),
                    'examiner_id' => (int) $v->examiner_id,
                ],
                'examiner-' . ((int) $v->examiner_id) . '-' . ((int) $v->student_id),
                'ARU IMS',
                null,
                'urgent',
                'urgent'
            );
        }

        $this->info('Reminders sent.');
        return self::SUCCESS;
    }
}


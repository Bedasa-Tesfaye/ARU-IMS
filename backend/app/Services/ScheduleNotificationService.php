<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\StudentMessage;
use Carbon\CarbonInterface;

class ScheduleNotificationService
{
    /**
     * Create an in-app notification + student message.
     * Uses Notification.meta to dedupe repeated inserts.
     */
    public function notifyStudent(
        int $studentId,
        string $kind,
        string $title,
        string $message,
        array $meta,
        string $threadKey,
        string $fromName,
        ?string $fromEmail = null,
        string $category = 'general',
        string $sentiment = 'neutral',
    ): void {
        $meta = array_merge(
            [
                'kind' => $kind,
                'v' => 1,
            ],
            $meta
        );

        $exists = Notification::query()
            ->where('user_id', $studentId)
            ->where('type', 'schedule')
            ->where('meta->kind', $kind)
            ->when(isset($meta['event_type']), fn ($q) => $q->where('meta->event_type', $meta['event_type']))
            ->when(isset($meta['event_id']), fn ($q) => $q->where('meta->event_id', (int) $meta['event_id']))
            ->exists();

        if (! $exists) {
            Notification::query()->create([
                'user_id' => $studentId,
                'type' => 'schedule',
                'title' => $title,
                'message' => $message,
                'meta' => $meta,
            ]);
        }

        // Student dashboard surfaces StudentMessage as the primary "inbox" signal.
        // Dedupe by a stable tag embedded in the body.
        $tag = $this->tag($meta);
        $msgExists = StudentMessage::query()
            ->where('student_id', $studentId)
            ->where('thread_key', $threadKey)
            ->where('body', 'like', '%' . $tag . '%')
            ->exists();

        if (! $msgExists) {
            StudentMessage::query()->create([
                'student_id' => $studentId,
                'thread_key' => $threadKey,
                'subject' => $title,
                'from_name' => $fromName,
                'from_email' => $fromEmail,
                'category' => $category,
                'sentiment' => $sentiment,
                'body' => rtrim($message) . "\n\n" . $tag,
            ]);
        }
    }

    public function formatWhen(CarbonInterface $dt): string
    {
        return $dt->toDayDateTimeString();
    }

    private function tag(array $meta): string
    {
        $type = (string) ($meta['event_type'] ?? 'event');
        $id = (string) ($meta['event_id'] ?? '');
        $kind = (string) ($meta['kind'] ?? 'schedule');
        return "[aru:schedule:{$kind}:{$type}:{$id}]";
    }
}


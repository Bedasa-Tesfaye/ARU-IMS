<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        abort_unless($user, 401);

        $query = Notification::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at');

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        return response()->json($query->paginate($request->integer('per_page', 15)));
    }

    public function markRead(Request $request, int $id)
    {
        $user = $request->user();
        abort_unless($user, 401);

        $notification = Notification::query()
            ->where('user_id', $user->id)
            ->findOrFail($id);

        $notification->update(['read_at' => now()]);

        return response()->json(['message' => 'Marked as read.', 'notification' => $notification]);
    }
}


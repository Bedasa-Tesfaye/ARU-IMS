<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Migrated to routes/web.php for session-based auth using Inertia.
// Keep this file only for legacy compatibility.

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['message' => 'Welcome to RightnetRadius API'];
});

Route::get('/up', function () {
    return ['status' => 'ok'];
});

// Include API routes
require __DIR__.'/api.php';

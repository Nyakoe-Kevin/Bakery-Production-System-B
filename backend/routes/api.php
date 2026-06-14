<?php

use App\Http\Controllers\Api\ProductController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


// localhost:8000/api/user
// api.bakery.com/api/user

// ---------------------------------------------------------------
// Your first API endpoint!
// When the Vue app calls: axios.get('/api/products')
// This is what responds.
//
// For now, we return hardcoded data. In Feature 3, this will
// come from the database via Eloquent models.
// ---------------------------------------------------------------


Route::get('/products', function () {
    return [
        [
            'id' => 1,
            'name' => 'White Bread',
            'category' => 'bread',
            'selling_price' => 60,
            'shelf_life_hours' => 24,
            'unit' => 'loaf',
            'is_active' => true,
        ],
        [
            'id' => 2,
            'name' => 'Chocolate Cake',
            'category' => 'cake',
            'selling_price' => 350,
            'shelf_life_hours' => 72,
            'unit' => 'piece',
            'is_active' => true,
        ],
        [
            'id' => 3,
            'name' => 'Mandazi',
            'category' => 'bun',
            'selling_price' => 10,
            'shelf_life_hours' => 12,
            'unit' => 'piece',
            'is_active' => true,
        ],
    ];
});

// Simple health check endpoint
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Bakery API is running',
        'timestamp' => now()->toISOString(),
    ]);
});

// RESTful resource routes — one line creates all CRUD endpoints:
// GET    /api/products          → ProductController@index
// POST   /api/products          → ProductController@store
// GET    /api/products/{id}     → ProductController@show
// PUT    /api/products/{id}     → ProductController@update
// DELETE /api/products/{id}     → ProductController@destroy
Route::apiResource('products', ProductController::class);
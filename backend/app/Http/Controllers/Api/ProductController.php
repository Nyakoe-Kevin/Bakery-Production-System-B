<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProductController extends Controller
{
// GET /api/products — list all products
    public function index()
    {
        // For now: hardcoded. Feature 3: Product::all()
        $products = [
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
        ];

        return response()->json($products);
  
  
      }

      // POST /api/products — create a product
    public function store(Request $request)
    {
        info('Received request to create product: ' . json_encode($request->all()));
        // Feature 3: Product::create($request->validated())
        return response()->json([
            'message' => 'Product created' . ' — ID:' .$request->input('id'),
            'data' => $request->all(),
        ], 201);
    }
}
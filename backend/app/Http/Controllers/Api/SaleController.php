<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    // GET /api/sales
    public function index()
    {
        return response()->json(Sale::with('product')->orderBy('sold_at', 'desc')->get());
    }

    // POST /api/sales
    public function store(Request $request)
    {
        $user = $request->user();
        // only cashier or admin can record sales
        if (!in_array($user->role, ['admin', 'cashier'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'unit_price' => 'required|numeric|min:0',
        ]);

        $data['total_amount'] = $data['quantity'] * $data['unit_price'];
        $data['sold_at'] = now();

        $sale = Sale::create($data);

        return response()->json($sale, 201);
    }
}

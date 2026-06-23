<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductionBatch;
use App\Models\RecipeItem;
use App\Models\Ingredient;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductionBatchController extends Controller
{
    // GET /api/production-batches
    public function index()
    {
        $batches = ProductionBatch::with('product')->get()->map(function ($b) {
            $b->product_name = $b->product?->name;
            return $b;
        });

        return response()->json($batches);
    }

    // POST /api/production-batches/{id}/advance
    public function advance(Request $request, $id)
    {
        $user = $request->user();
        // only admin or baker can advance batches
        if (!in_array($user->role, ['admin', 'baker'])) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $batch = ProductionBatch::findOrFail($id);

        $newStatus = $request->input('status');
        if (!$newStatus) {
            return response()->json(['message' => 'Missing status'], 422);
        }

        DB::transaction(function () use ($batch, $newStatus) {
            $batch->status = $newStatus;

            if ($newStatus === 'mixing' && !$batch->started_at) {
                $batch->started_at = now();
            }

            if ($newStatus === 'done') {
                // if actual_quantity null assume planned
                if ($batch->actual_quantity === null) {
                    $batch->actual_quantity = $batch->planned_quantity;
                    $batch->wastage_quantity = 0;
                }
                $batch->completed_at = now();

                // deduct ingredients according to recipe
                $recipeItems = RecipeItem::where('product_id', $batch->product_id)->get();
                foreach ($recipeItems as $ri) {
                    $qtyNeededPerUnit = $ri->quantity_needed;
                    $totalNeeded = $qtyNeededPerUnit * $batch->actual_quantity;
                    $ingredient = Ingredient::find($ri->ingredient_id);
                    if ($ingredient) {
                        $ingredient->current_stock = max(0, $ingredient->current_stock - $totalNeeded);
                        $ingredient->save();

                        StockMovement::create([
                            'ingredient_id' => $ingredient->id,
                            'quantity' => -1 * $totalNeeded,
                            'balance_after' => $ingredient->current_stock,
                            'created_at' => now(),
                        ]);
                    }
                }
            }

            if ($newStatus === 'failed') {
                $batch->completed_at = now();
            }

            $batch->save();
        });

        return response()->json(['message' => 'Batch updated', 'batch' => $batch->fresh()]);
    }
}

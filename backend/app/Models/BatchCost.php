<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchCost extends Model
{
    protected $guarded = [];

    protected $casts = [
        'quantity_used' => 'decimal:4',
        'unit_cost' => 'decimal:2',
        'total_cost' => 'decimal:2',
    ];

    public function productionBatch()
    {
        return $this->belongsTo(ProductionBatch::class);
    }

    public function ingredient()
    {
        return $this->belongsTo(Ingredient::class);
    }
}

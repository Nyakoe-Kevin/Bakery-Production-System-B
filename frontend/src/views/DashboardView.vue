<script setup>
import { ref, computed } from 'vue'
import StockIndicator from '../components/StockIndicator.vue'
import BatchCard from '../components/BatchCard.vue'

// DATA
const ingredients = ref([
  { id: 1, name: 'Wheat Flour', current_stock: 50, reorder_level: 20, unit: 'kg', cost_per_unit: 100 },
  { id: 2, name: 'Cinnamon', current_stock: 0.4, reorder_level: 0.5, unit: 'kg', cost_per_unit: 1200 },
  { id: 3, name: 'Eggs', current_stock: 120, reorder_level: 50, unit: 'pcs', cost_per_unit: 15 },
  { id: 4, name: 'Yeast', current_stock: 2, reorder_level: 1, unit: 'kg', cost_per_unit: 800 },
  { id: 5, name: 'Sugar', current_stock: 30, reorder_level: 10, unit: 'kg', cost_per_unit: 150 },
  { id: 6, name: 'Cocoa Powder', current_stock: 5, reorder_level: 3, unit: 'kg', cost_per_unit: 600 },
  { id: 7, name: 'Butter', current_stock: 8, reorder_level: 5, unit: 'kg', cost_per_unit: 500 },
  { id: 8, name: 'Milk', current_stock: 20, reorder_level: 10, unit: 'ltr', cost_per_unit: 70 },
])
//sample data: production batches

//GET /api/production-batches

const batches = ref([
  {
    id: 1,
    product_name: 'White Bread',
    product_id: 1,
    planned_quantity: 50,
    actual_quantity: 47,
    wastage_quantity: 3,
    status: 'done',
    started_at: '2026-05-20 06:30',
    completed_at: '2026-05-20 08:15'
  },
  {
    id: 2,
    product_name: 'Chocolate Cake',
    product_id: 2,
    planned_quantity: 30,
    actual_quantity: 0,
    wastage_quantity: 30,
    status: 'failed',
    started_at: '2026-05-21 09:00',
    completed_at: '2026-05-21 09:30'
  },
  {
    id: 3,
    product_name: 'Cinnamon Roll',
    product_id: 3,
    planned_quantity: 20,
    actual_quantity: null,
    wastage_quantity: null,
    status: 'planned',
    started_at: null,
    completed_at: null
  },
  {
    id: 4,
    product_name: 'Meat Pie',
    product_id: 4,
    planned_quantity: 40,
    actual_quantity: 0,
    wastage_quantity: 40,
    status: 'failed',
    started_at: '2026-05-21 10:00',
    completed_at: '2026-05-21 10:30'
  },
  {
    id: 5,
    product_name: 'Blueberry Muffin',
    product_id: 5,
    planned_quantity: 60,
    actual_quantity: null,
    wastage_quantity: null,
    status: 'cooling',
    started_at: '2026-05-21 07:00',
    completed_at: null
  },
  {
    id: 6,
    product_name: 'Sourdough Loaf',
    product_id: 6,
    planned_quantity: 25,
    actual_quantity: 22,
    wastage_quantity: 3,
    status: 'done',
    started_at: '2026-05-20 05:00',
    completed_at: '2026-05-20 07:30'
  },
  {
    id: 7,
    product_name: 'Banana Bread',
    product_id: 7,
    planned_quantity: 15,
    actual_quantity: 12,
    wastage_quantity: 3,
    status: 'done',
    started_at: '2026-05-20 11:00',
    completed_at: '2026-05-20 12:45'
  },
  {
    id: 8,
    product_name: 'Apple Pie',
    product_id: 8,
    planned_quantity: 35,
    actual_quantity: null,
    wastage_quantity: null,
    status: 'planned',
    started_at: null,
    completed_at: null
  }
])
//sample data: production batches

// FILTERS
const showLowOnly = ref(false)
const sortOption = ref('status')

// STATUS EMPTY, DANGER, WARNING, HEALTHY
const getStatus = (i) => {
  if (i.current_stock <= 0) return 'empty'
  if (i.current_stock < i.reorder_level) return 'danger'
  if (i.current_stock < i.reorder_level * 2) return 'warning'
  return 'healthy'
}

// PERFOMANCE INDICATION COMPUTED
const lowStockCount = computed(() =>
  ingredients.value.filter(i => i.current_stock < i.reorder_level).length
)

const outOfStockCount = computed(() =>
  ingredients.value.filter(i => i.current_stock <= 0).length
)

const totalStockValue = computed(() =>
  ingredients.value.reduce(
    (sum, i) => sum + i.current_stock * i.cost_per_unit,
    0
  )
)

const totalBatches = computed(() => batches.value.length)

const completedCount = computed(() =>
  batches.value.filter(b => b.status === 'done').length
)

const plannedCount = computed(() =>
  batches.value.filter(b => b.status === 'planned').length
)

const inProgressCount = computed(() => {
  return batches.value.filter(b => ['mixing', 'baking', 'cooling'].includes(b.status)).length
})

const lowYieldCount = computed(() => {
  return batches.value.filter(b => {
    if (b.actual_quantity == null || b.planned_quantity == null) return false
    const yieldPercent = (b.actual_quantity / b.planned_quantity) * 100
    return yieldPercent < 80
  }).length
})

const failedCount = computed(() =>
  batches.value.filter(b => b.status === 'failed').length
)


// FILTER + SORT
const filteredIngredients = computed(() => {
  let data = [...ingredients.value]

  if (showLowOnly.value) {
    data = data.filter(i => i.current_stock < i.reorder_level)
  }

  if (sortOption.value === 'value') {
    data.sort((a, b) =>
      (b.current_stock * b.cost_per_unit) -
      (a.current_stock * a.cost_per_unit)
    )
  }

  if (sortOption.value === 'name') {
    data.sort((a, b) => a.name.localeCompare(b.name))
  }

  if (sortOption.value === 'status') {
    const priority = { empty: 0, danger: 1, warning: 2, healthy: 3 }
    data.sort((a, b) =>
      priority[getStatus(a)] - priority[getStatus(b)]
    )
  }

  return data
})
function advanceBatch(payload) {
  const { id: batchId, newStatus: nextStatus } = payload || {}
  const batch = batches.value.find(b => b.id === batchId)
  if (!batch) return

  batch.status = nextStatus
  if (nextStatus === 'mixing' && !batch.started_at) {
    batch.started_at = new Date().toISOString()
  }

  if (nextStatus === 'done') {
    if (batch.actual_quantity == null) {
      batch.actual_quantity = batch.planned_quantity
      batch.wastage_quantity = 0
    }
    batch.completed_at = new Date().toISOString()
  }

  if (nextStatus === 'failed') {
    batch.completed_at = new Date().toISOString()
  }
}

const markFailed = (batch) => {
  if (failedCount.value >= 2) return
  batch.status = 'failed'
  batch.completed_at = new Date().toISOString()
}
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">

    <!-- TITLE -->
    <h1 class="text-2xl font-bold mb-2">Baker's Dashboard</h1>
    <p class="text-gray-600 mb-6">Ingredient Stock Overview</p>

    <!-- ALERT -->
    <div
      v-if="lowStockCount > 0"
      class="bg-red-500 text-white p-3 rounded mb-4"
    >
      🚨 {{ lowStockCount }} ingredients below reorder level!
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"><!-- Total -->
<div class="bg-white p-4 rounded-xl shadow">
  <p class="text-sm text-gray-500">Total Batches</p>
  <p class="text-2xl font-bold">{{ totalBatches }}</p>
</div>

<!-- Completed -->
<div class="bg-green-50 p-4 rounded-xl shadow">
  <p class="text-sm text-green-600">Completed</p>
  <p class="text-2xl font-bold text-green-700">{{ completedCount }}</p>
</div>

<!-- In Progress -->
<div class="bg-orange-50 p-4 rounded-xl shadow">
  <p class="text-sm text-orange-600">In Progress</p>
  <p class="text-2xl font-bold text-orange-700">{{ inProgressCount }}</p>
</div>

<!-- Planned -->
<div class="bg-gray-100 p-4 rounded-xl shadow">
  <p class="text-sm text-gray-600">Planned</p>
  <p class="text-2xl font-bold text-gray-700">{{ plannedCount }}</p>
</div>

<!-- Low Yield -->
<div class="bg-red-50 p-4 rounded-xl shadow">
  <p class="text-sm text-red-600">Low Yield (&lt;80%)</p>
  <p class="text-2xl font-bold text-red-700">{{ lowYieldCount }}</p>
</div></div>

    <!-- KPI CARDS -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

      <div class="bg-red-100 p-4 rounded-xl">
        <p class="text-sm text-gray-600">Low Stock</p>
        <p class="text-xl font-bold text-red-600">
          ⚠️ {{ lowStockCount }}
        </p>
      </div>

      <div class="bg-yellow-100 p-4 rounded-xl">
        <p class="text-sm text-gray-600">Out of Stock</p>
        <p class="text-xl font-bold text-yellow-600">
          {{ outOfStockCount }}
        </p>
      </div>

      <div class="bg-blue-100 p-4 rounded-xl">
        <p class="text-sm text-gray-600">Total Value</p>
        <p class="text-xl font-bold text-blue-600">
          KES {{ totalStockValue.toLocaleString() }}
        </p>
      </div>

      <div class="bg-gray-100 p-4 rounded-xl">
        <p class="text-sm text-gray-600">Total Items</p>
        <p class="text-xl font-bold">
          {{ ingredients.length }}
        </p>
      </div>

    </div>

    <!-- FILTERS -->
    <div class="flex gap-4 items-center mb-4">

      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="showLowOnly" />
        Show low stock only
      </label>

      <select v-model="sortOption" class="border p-2 rounded">
        <option value="status">Sort by status</option>
        <option value="value">Sort by value</option>
        <option value="name">Sort by name</option>
      </select>

    </div>

    <!-- GRID -->
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StockIndicator
        v-for="ing in filteredIngredients"
        :key="ing.id"
        :name="ing.name"
        :current="ing.current_stock"
        :reorder="ing.reorder_level"
        :unit="ing.unit"
        :costPerUnit="ing.cost_per_unit"
      />
    </div>

  </div>
<!--production batches-->
  <div class="p-6 bg-gray-50 min-h-screen">
    <h1 class="text-2xl font-bold mb-2">Production Batches</h1>
    <p class="text-gray-600 mb-6">Overview of ongoing and completed production batches</p>
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      <BatchCard
        v-for="batch in batches"
        :key="batch.id"
        :batch="batch"
        :failedCount="failedCount"
        @advance-batch="advanceBatch"
        @mark-failed="markFailed"
      />
    </div>

  </div>
</template>
<style scoped>

/* ===== GLOBAL DASHBOARD LAYOUT ===== */
.p-6 {
  padding: 24px;
  background: #f6f7fb;
  min-height: 100vh;
  font-family: Arial, sans-serif;
}

h1 {
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 4px;
  color: #1f2937;
}

p {
  color: #6b7280;
  margin-bottom: 20px;
}

/* ===== ALERT BOX ===== */
.bg-red-500 {
  background: #ef4444;
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.2);
}

/* ===== KPI GRID ===== */
.grid {
  display: grid;
  gap: 16px;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.md\:grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

/* KPI CARDS */
.bg-red-100,
.bg-yellow-100,
.bg-blue-100,
.bg-gray-100 {
  padding: 16px;
  border-radius: 14px;
  background: white;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.bg-red-100:hover,
.bg-yellow-100:hover,
.bg-blue-100:hover,
.bg-gray-100:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

/* KPI TEXT */
.text-sm {
  font-size: 13px;
  color: #6b7280;
}

.text-xl {
  font-size: 22px;
  font-weight: 700;
  margin-top: 6px;
}

.text-red-600 {
  color: #dc2626;
}

.text-yellow-600 {
  color: #ca8a04;
}

.text-blue-600 {
  color: #2563eb;
}

/* ===== FILTERS ===== */
.flex {
  display: flex;
}

.gap-4 {
  gap: 12px;
}

.items-center {
  align-items: center;
}

.mb-4 {
  margin-bottom: 16px;
}

select {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: white;
  outline: none;
  cursor: pointer;
}

input[type="checkbox"] {
  transform: scale(1.2);
}

/* ===== STOCK GRID ===== */
.grid.md\:grid-cols-2.lg\:grid-cols-3 {
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 900px) {
  .md\:grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .grid-cols-2,
  .md\:grid-cols-4,
  .grid.md\:grid-cols-2.lg\:grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>





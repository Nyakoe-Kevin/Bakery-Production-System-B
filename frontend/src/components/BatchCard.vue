<script setup>
import { ref, computed } from 'vue'

// ---------------------------------------------------------------
// PROPS: match PRODUCTION_BATCHES table from ERD
//
// In Week 6: GET /api/production-batches
// Response includes product_name from a JOIN with PRODUCTS table:
//   SELECT pb.*, p.name as product_name
//   FROM production_batches pb
//   JOIN products p ON pb.product_id = p.id
//
// This is why product_name is in the data — it comes from the JOIN,
// not from the PRODUCTION_BATCHES table itself.
// ---------------------------------------------------------------
const props = defineProps({
  batch: { type: Object, required: true },
  failedCount: { type: Number, required: false, default: 0 }
  // Expected shape:
  // {
  //   id: 1,                          ← PK
  //   product_name: 'White Bread',    ← from JOIN with PRODUCTS
  //   product_id: 1,                  ← FK to PRODUCTS
  //   planned_quantity: 50,           ← how many we plan to make
  //   actual_quantity: 47,            ← how many we actually made (null if not done)
  //   wastage_quantity: 3,            ← how many were lost
  //   status: 'done',                 ← planned|mixing|baking|cooling|done|failed
  //   started_at: '2026-05-20 06:30', ← when mixing started
  //   completed_at: '2026-05-20 08:15' ← when marked done
  // }
})

//computation for status label and colors
//data emissions for status

const emit = defineEmits(['advance-batch', 'mark-failed'])



const yieldRate = computed(() => {
  if (props.batch.actual_quantity == null || props.batch.planned_quantity == null) return null
  return ((props.batch.actual_quantity / props.batch.planned_quantity) * 100)
})

const yieldStatus = computed(() => {
  if (yieldRate.value === null) return null
  if (yieldRate.value >= 90) return {label: 'Excellent', class: 'bg-green-50 text-green-700'}
  if (yieldRate.value >= 80) return {label: 'Acceptable', class: 'bg-yellow-50 text-yellow-700'}
  return {label: 'Low yield - review needed', class: 'bg-red-50 text-red-700'}
})

const duration = computed(() => {
  if (!props.batch.started_at || !props.batch.completed_at) return null
  const start = new Date(props.batch.started_at)
  const end = new Date(props.batch.completed_at)
  const diffMs = end - start
  const diffMins = Math.round(diffMs / 60000)
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return hours + ' hrs ' + mins + ' mins'
})

//batch lifecycle status
const nextStatus = computed(() => {
  switch (props.batch.status) {
    case 'planned':
      return {label: 'Start Mixing', next: 'mixing', icon: 'mdi-progress-clock', class: 'bg-blue-50 text-blue-700'}
    case 'mixing':
      return {label: 'Start Baking', next: 'baking', icon: 'mdi-progress-clock', class: 'bg-green-50 text-green-700'}
    case 'baking':
      return {label: 'Start Cooling', next: 'cooling', icon: 'mdi-progress-clock', class: 'bg-orange-50 text-orange-700'}
    case 'cooling':
      return {label: 'Complete Batch', next: 'done', icon: 'mdi-check-bold', class: 'bg-emerald-50 text-emerald-700'}
    default:
      return null
  }
})

function handleAdvance() {
  if (!nextStatus.value) return
  emit('advance-batch', { id: props.batch.id, newStatus: nextStatus.value.next })
}

</script>
<template>
  <div class="batch-card">

    <div
  v-if="batch.status === 'failed'"
  class="bg-red-500 text-white text-sm px-3 py-1 rounded-t-lg"
>
  ❌ Batch Failed
</div>


    <!-- 🔹 Header -->
    <div class="flex justify-between items-start mb-4">
      <div>
        <h2 class="text-xl font-bold text-gray-800">
          Batch #{{ batch.id }}
        </h2>
        <p class="text-sm text-gray-500">
          {{ batch.product_name }}
        </p>
      </div>

      <span
        class="px-3 py-1 text-xs font-semibold rounded-full capitalize"
        :class="{
          'bg-gray-100 text-gray-700': batch.status === 'planned',
          'bg-blue-100 text-blue-700': batch.status === 'mixing',
          'bg-yellow-100 text-yellow-700': batch.status === 'baking',
          'bg-orange-100 text-orange-700': batch.status === 'cooling',
          'bg-green-100 text-green-700': batch.status === 'done',
          'bg-red-100 text-red-700': batch.status === 'failed'
        }"
      >
        {{ batch.status }}
      </span>
    </div>

    <!-- 🔹 Quantities -->
    <div class="grid grid-cols-3 gap-3 text-sm mb-4">
      <div>
        <p class="text-gray-500">Planned</p>
        <p class="font-semibold">{{ batch.planned_quantity }}</p>
      </div>
      <div>
        <p class="text-gray-500">Actual</p>
        <p class="font-semibold">{{ batch.actual_quantity ?? '-' }}</p>
      </div>
      <div>
        <p class="text-gray-500">Wastage</p>
        <p class="font-semibold text-red-600">
          {{ batch.wastage_quantity ?? 0 }}
        </p>
      </div>
    </div>

    <!-- 🔹 Yield -->
    <div class="mb-4">
      <p class="text-sm text-gray-500 mb-1">Yield Rate</p>

      <div v-if="yieldRate !== null" class="flex justify-between items-center">
        <p class="font-semibold">
          {{ yieldRate.toFixed(1) }}%
        </p>

        <span
          v-if="yieldStatus"
          class="text-xs px-2 py-1 rounded"
          :class="yieldStatus.class"
        >
          {{ yieldStatus.label }}
        </span>
      </div>

      <p v-else class="text-gray-400 text-sm">Not available</p>
    </div>
    

    <!-- 🔹 Duration -->
    <div class="mb-4">
      <p class="text-gray-500 text-sm">Duration</p>
      <p class="font-semibold">
        {{ duration || 'In progress...' }}
      </p>
    </div>

    <!-- 🔹 Button -->
    <button
      type="button"
      v-if="nextStatus"
      @click="handleAdvance"
      class="action-btn w-full rounded-xl font-semibold gap-2"
      :class="nextStatus.class"
    >
      <i :class="nextStatus.icon"></i>
      {{ nextStatus.label }}
    </button>

  </div>
  <button
    v-if="(batch.status === 'mixing' || batch.status === 'baking') && failedCount < 2"
    @click="$emit('mark-failed', batch)"
    class="text-red-600 text-sm mt-2 hover:underline"
  >
    ❌ Mark Failed
  </button>
</template>

<style scoped>
/* 🔹 Card Base */
.batch-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}

/* subtle hover lift */
.batch-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.1);
}

/* 🔹 Header */
.batch-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

.batch-subtitle {
  font-size: 0.85rem;
  color: #6b7280;
}

/* 🔹 Status Badge */
.status-badge {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.3px;
  text-transform: capitalize;
}

/* 🔹 Grid Info */
.info-label {
  font-size: 0.75rem;
  color: #9ca3af;
}

.info-value {
  font-weight: 600;
  color: #111827;
}

/* 🔹 Yield Section */
.yield-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.yield-rate {
  font-weight: 700;
  font-size: 1rem;
}

/* 🔹 Progress Bar Container */
.progress-container {
  height: 8px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  position: relative;
}

/* 🔹 Progress Fill */
.progress-bar {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
  position: relative;
}

/* animated shine effect */
.progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: -40%;
  width: 40%;
  height: 100%;
  background: linear-gradient(
    120deg,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0)
  );
  animation: shine 2s infinite;
}

@keyframes shine {
  0% { left: -40%; }
  100% { left: 120%; }
}

/* 🔹 Button */
.action-btn {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  transition: all 0.2s ease;
  cursor: pointer;
}

/* hover effect */
.action-btn:hover {
  transform: scale(1.02);
  filter: brightness(1.05);
}

/* click effect */
.action-btn:active {
  transform: scale(0.97);
}

/* 🔹 Subtle divider */
.divider {
  height: 1px;
  background: #f3f4f6;
  margin: 14px 0;
}

/* 🔹 Fade-in animation (optional but 🔥) */
.batch-card {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
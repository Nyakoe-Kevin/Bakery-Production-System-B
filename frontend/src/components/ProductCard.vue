<script setup>
import { computed } from 'vue'
import productcard from './ProductCard.vue'
// --------------------------------------------------
// PROPS
// --------------------------------------------------
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

// --------------------------------------------------
// EMITS
// --------------------------------------------------
const emit = defineEmits(['sell-product', 'view-recipe', 'toggle', 'delete-product'])

// --------------------------------------------------
// COMPUTED: Shelf life status
// --------------------------------------------------
const shelfLifeStatus = computed(() => {
  const hours = props.product.shelf_life_hours

  if (hours <= 8) {
    return { label: 'Very short shelf life', class: 'urgent', icon: '🔴' }
  }
  if (hours <= 24) {
    return { label: 'Sells fast — prioritize', class: 'warning', icon: '🟡' }
  }
  if (hours <= 48) {
    return { label: 'Sell within 2 days', class: 'today', icon: '🟠' }
  }

  // ✅ TASK 3: LONG SHELF LIFE
  return { label: 'Long shelf life', class: 'safe', icon: '🟢' }
})

// --------------------------------------------------
// FORMAT PRICE
// --------------------------------------------------
const formattedPrice = computed(() => {
  return props.product.selling_price.toLocaleString()
})

// --------------------------------------------------
// ACTIONS
// --------------------------------------------------
function handleSell() {
  emit('sell-product', props.product)
}

function handleViewRecipe() {
  emit('view-recipe', props.product.id)
}

function toggleActive() {
  emit('toggle', props.product.id)
}

function handleDelete() {
  emit('delete-product', props.product.id)
}
</script>

<template>
  <div class="product-card" :class="{ inactive: !product.is_active }">

    <!-- HEADER -->
    <div class="card-header">
      <h3 class="product-name">{{ product.name }}</h3>

      <span :class="'category-badge category-' + product.category">
        {{ product.category }}
      </span>
    </div>

    <!-- PRICE -->
    <div class="price-section">
      <span class="price">KES {{ formattedPrice }}</span>
      <span class="unit">per {{ product.unit }}</span>
    </div>

    <!-- STOCK -->
    <div class="stock-badge" :class="{ 'stock-low': product.available_stock <= 5, 'stock-ok': product.available_stock > 5 }">
      Stock: {{ product.available_stock }} pcs
    </div>

    <!-- SHELF LIFE -->
    <div :class="'shelf-life shelf-' + shelfLifeStatus.class">
      <span class="shelf-icon">{{ shelfLifeStatus.icon }}</span>
      <span>
        {{ shelfLifeStatus.label }} ({{ product.shelf_life_hours }}h)
      </span>
    </div>

    <!-- INACTIVE WARNING -->
    <div v-if="!product.is_active" class="inactive-banner">
      ⚠ Product inactive — not available for sale
    </div>

    <!-- ACTIONS -->
    <div class="card-actions">

      <!-- TOGGLE ACTIVE -->
      <button class="btn-toggle" @click="toggleActive">
        {{ product.is_active ? 'Deactivate' : 'Activate' }}
      </button>

      <!-- SELL -->
      <button
        class="btn-primary"
        @click="handleSell"
        :disabled="!product.is_active"
      >
        Sell
      </button>

      <!-- VIEW -->
      <button class="btn-secondary" @click="handleViewRecipe">
        View Recipe
      </button>

        <!-- DELETE -->
        <button class="btn-danger" @click="handleDelete">
          Delete
        </button>

    </div>
  </div>
</template>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #2563EB;
  transition: 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.product-card.inactive {
  opacity: 0.5;
  border-left-color: #9CA3AF;
}

/* HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
}

/* CATEGORY */
.category-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
}

.category-bread  { background: #FEF3C7; color: #92400E; }
.category-cake   { background: #FCE7F3; color: #9D174D; }
.category-pastry { background: #E0E7FF; color: #3730A3; }
.category-bun    { background: #D1FAE5; color: #065F46; }

/* PRICE */
.price-section {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
}

.price {
  font-size: 1.4rem;
  font-weight: bold;
  color: #E8541E;
}

.unit {
  font-size: 0.85rem;
  color: #9CA3AF;
}

/* SHELF LIFE */
.shelf-life {
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.shelf-urgent  { background: #FEF2F2; color: #DC2626; }
.shelf-warning { background: #FFFBEB; color: #D97706; }
.shelf-today   { background: #FFF7ED; color: #C2410C; }
.shelf-safe    { background: #F0FDF4; color: #059669; }

/* INACTIVE */
.inactive-banner {
  background: #FEF2F2;
  color: #991B1B;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.stock-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #EEF2FF;
  color: #3730A3;
  padding: 7px 10px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stock-low {
  background: #FEF2F2;
  color: #B91C1C;
}

.stock-ok {
  background: #ECFDF5;
  color: #166534;
}

/* ACTIONS */
.card-actions {
  display: flex;
  gap: 0.4rem;
  margin-top: auto;
}

button {
  flex: 1;
  padding: 6px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
}

/* BUTTON STYLES */
.btn-toggle {
  background: #E5E7EB;
}

.btn-toggle:hover {
  background: #D1D5DB;
}

.btn-primary {
  background: #1A1A2E;
  color: white;
}

.btn-primary:hover {
  background: #E8541E;
}

.btn-primary:disabled {
  background: #D1D5DB;
  cursor: not-allowed;
}

.btn-secondary {
  background: #F3F4F6;
}

.btn-secondary:hover {
  background: #E5E7EB;
}
</style>
<script setup>
import { ref, computed } from 'vue'
import ProductCard from '../components/ProductCard.vue'

// ------------------- DATA -------------------
const products = ref([
  { id: 1, name: 'White Bread', category: 'bread', selling_price: 60, shelf_life_hours: 24, is_active: true },
  { id: 2, name: 'Chocolate Cake', category: 'cake', selling_price: 350, shelf_life_hours: 72, is_active: true },
  { id: 3, name: 'Mandazi', category: 'bun', selling_price: 10, shelf_life_hours: 12, is_active: true },
  { id: 4, name: 'Brown Bread', category: 'bread', selling_price: 65, shelf_life_hours: 24, is_active: true },
  { id: 5, name: 'Cinnamon Roll', category: 'pastry', selling_price: 40, shelf_life_hours: 12, is_active: true },
  { id: 6, name: 'Meat Pie', category: 'pastry', selling_price: 80, shelf_life_hours: 8, is_active: true },
  { id: 7, name: 'Chapati', category: 'bread', selling_price: 20, shelf_life_hours: 8, is_active: true }
])


const searchQuery = ref('')
const selectedCategory = ref('all')
const showInactive = ref(false)

const selectedProduct = ref(null)
const quantity = ref(1)


const categories = computed(() => {
  const cats = [...new Set(products.value.map(p => p.category))]
  return ['all', ...cats]
})

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value
    const matchesActive = showInactive.value ? true : product.is_active

    return matchesSearch && matchesCategory && matchesActive
  })
})

const total = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.selling_price * quantity.value
})

// ------------------- COUNTERS -------------------
const urgentCount = computed(() =>
  products.value.filter(p => p.shelf_life_hours <= 12).length
)

const fastCount = computed(() =>
  products.value.filter(p => p.shelf_life_hours > 12 && p.shelf_life_hours <= 48).length
)

const longCount = computed(() =>
  products.value.filter(p => p.shelf_life_hours > 48).length
)

// ------------------- METHODS -------------------
const selectProduct = (product) => {
  selectedProduct.value = product
  quantity.value = 1
}

const confirmSale = () => {
  alert(`Sold ${quantity.value} x ${selectedProduct.value.name}`)
  selectedProduct.value = null
}

const toggleActive = (product) => {
  product.is_active = !product.is_active
}
</script>

<template>
  <div class="products-page">

    <!-- HEADER -->
    <div class="page-header">
      <h1>Product Catalog</h1>
    </div>

    <!-- FILTERS -->
    <div class="filter-bar">
      <input v-model="searchQuery" placeholder="Search..." class="search-input" />

      <select v-model="selectedCategory" class="filter-select">
        <option v-for="cat in categories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>

      <label>
        <input type="checkbox" v-model="showInactive" />
        Show inactive
      </label>
    </div>

    <!-- COUNTERS -->
    <div class="summary">
      🔴 {{ urgentCount }} urgent |
      🟡 {{ fastCount }} fast sellers |
      🟢 {{ longCount }} long shelf life
    </div>

    <!-- GRID -->
    <div class="product-grid">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"  
        @sell-product="selectProduct" 
        @toggle="toggleActive"
      />
    </div>

    <!-- SALE PANEL -->
    <div v-if="selectedProduct" class="sale-panel">
      <h3>Confirm Sale</h3>

      <p><strong>{{ selectedProduct.name }}</strong></p>
      <p>Price: KES {{ selectedProduct.selling_price }}</p>

      <input type="number" v-model="quantity" min="1" />

      <p>Total: <strong>KES {{ total }}</strong></p>

      <button @click="confirmSale">Confirm Sale</button>
    </div>

    <!-- EMPTY -->
    <div v-if="filteredProducts.length === 0" class="empty-state">
      No products found
    </div>

  </div>
</template>

<style scoped>
.products-page {
  max-width: 1100px;
  margin: auto;
}

.filter-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input, .filter-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}

.summary {
  margin-bottom: 10px;
  font-size: 14px;
}

.sale-panel {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9fafb;
}

.sale-panel input {
  width: 100px;
  padding: 6px;
  margin: 10px 0;
}

.sale-panel button {
  padding: 8px 12px;
  background: green;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  margin-top: 20px;
  color: gray;
}
</style>
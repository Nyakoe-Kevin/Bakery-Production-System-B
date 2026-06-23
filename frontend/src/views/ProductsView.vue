<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import { useProductStore } from '../stores/ProductStore'

const productStore = useProductStore()

onMounted(() => {
  if (productStore.fetchProducts) productStore.fetchProducts()
})

// ------------------- DATA -------------------
const searchQuery = ref('')
const selectedCategory = ref('all')
const showInactive = ref(false)

const selectedProduct = ref(null)
const quantity = ref(1)

// Add product form state
const newName = ref('')
const newCategory = ref('')
const newSellingPrice = ref(0)
const newShelfLife = ref(24)
const newUnit = ref('piece')
const newStock = ref(0)

const categories = computed(() => {
  const cats = [...new Set(productStore.products.map(p => p.category))]
  return ['all', ...cats]
})

const productCategories = computed(() => {
  return [...new Set(productStore.products.map(p => p.category))]
})

const filteredProducts = computed(() => {
  return productStore.products.filter(product => {
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
  productStore.products.filter(p => p.shelf_life_hours <= 12).length
)

const fastCount = computed(() =>
  productStore.products.filter(p => p.shelf_life_hours > 12 && p.shelf_life_hours <= 48).length
)

const longCount = computed(() =>
  productStore.products.filter(p => p.shelf_life_hours > 48).length
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

function toggleActive(productId) {
  productStore.toggleActive(productId)
}

function handleDelete(id) {
  productStore.deleteProduct(id)
}

function handleSale(product) {
  selectProduct(product)
}

function handleViewRecipe(productId) {
  // Placeholder
  alert('Recipe view not implemented in this demo.')
}

function addProduct() {
  if (!newName.value) return
  productStore.addProduct({
    name: newName.value,
    category: newCategory.value || 'other',
    selling_price: Number(newSellingPrice.value),
    shelf_life_hours: Number(newShelfLife.value),
    unit: newUnit.value,
    available_stock: Number(newStock.value),
    is_active: true
  })

  // reset
  newName.value = ''
  newCategory.value = ''
  newSellingPrice.value = 0
  newShelfLife.value = 24
  newUnit.value = 'piece'
  newStock.value = 0
}
</script>

<template>
  <div class="products-page">

    <!-- HEADER -->
    <div class="page-header">
      <h1>Product Catalog</h1>
    </div>

    <!-- ADD PRODUCT FORM -->
    <form @submit.prevent="addProduct" class="mb-4 bg-white rounded-lg p-4 shadow-sm">
      <h2 class="font-semibold mb-2">Add Product</h2>
      <div class="grid grid-cols-1 md:grid-cols-6 gap-2">
        <input v-model="newName" placeholder="Name" class="col-span-2 p-2 border rounded" />
        <select v-model="newCategory" class="p-2 border rounded">
          <option disabled value="">Select category</option>
          <option v-for="cat in productCategories" :key="cat" :value="cat">{{ cat }}</option>
          <option value="other">Other</option>
        </select>
        <input v-model.number="newSellingPrice" type="number" placeholder="Price" class="p-2 border rounded" />
        <input v-model.number="newShelfLife" type="number" placeholder="Shelf life (hrs)" class="p-2 border rounded" />
        <input v-model="newUnit" placeholder="Unit" class="p-2 border rounded" />
        <input v-model.number="newStock" type="number" placeholder="Stock" class="p-2 border rounded" />
      </div>
      <div class="mt-3">
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Add Product</button>
      </div>
    </form>

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
    <!-- Product grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        @sell-product="handleSale"
        @view-recipe="handleViewRecipe"
        @toggle="toggleActive"
        @delete-product="handleDelete"
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
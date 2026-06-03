<script setup>
import { ref, computed } from 'vue'

// SAMPLE DATA: Products - this would normally come from an API call to /api/products

const products = ref([
  { id: 1, name: 'White Bread', selling_price: 50, available_stock: 120 },
  { id: 2, name: 'Chocolate Cake', selling_price: 200, available_stock: 16 },
  { id: 3, name: 'Croissant', selling_price: 30, available_stock: 54 },
  { id: 4, name: 'Mandazi', selling_price: 10, available_stock: 80 },
  { id: 5, name: 'Brown Bread', selling_price: 65, available_stock: 90 },
  { id: 6, name: 'Cinnamon Roll', selling_price: 40, available_stock: 42 },
  { id: 7, name: 'Meat Pie', selling_price: 80, available_stock: 14 },
  { id: 8, name: 'Chapati', selling_price: 20, available_stock: 72 },
  { id: 9, name: 'Blueberry Muffin', selling_price: 25, available_stock: 60 },
  { id: 10, name: 'Sourdough Loaf', selling_price: 90, available_stock: 20 },
  { id: 11, name: 'Banana Bread', selling_price: 45, available_stock: 30 },
  { id: 12, name: 'Apple Pie', selling_price: 120, available_stock: 18 }
])

// Form State for recording a new sale

const selectedProductId = ref(null)
const searchTerm = ref('')
const quantity = ref(1)
const paymentMethod = ref('cash')
const mpesaRef = ref('')
const saleError = ref('')

const filteredProducts = computed(() => {
  const query = searchTerm.value.trim().toLowerCase()
  if (!query) return products.value
  return products.value.filter(product =>
    product.name.toLowerCase().includes(query)
  )
})

function selectProduct(product) {
  selectedProductId.value = product.id
  searchTerm.value = product.name
}

// Sales history - this would normally come from an API call to /api/sales=today or similar endpoint
const sales = ref([
  {
    id: 1,
    product_id: 1,
    product_name: 'White Bread',
    quantity: 10,
    total_amount: 500,
    payment_method: 'cash',
    mpesa_ref: null,
    timestamp: '2026-06-02T09:10:00'
  },
  {
    id: 2,
    product_id: 2,
    product_name: 'Chocolate Cake',
    quantity: 1,
    total_amount: 200,
    payment_method: 'mpesa',
    mpesa_ref: 'SHK7X9M2LP',
    timestamp: '2026-06-02T11:25:00'
  },
  {
    id: 3,
    product_id: 3,
    product_name: 'Croissant',
    quantity: 5,
    total_amount: 150,
    payment_method: 'cash',
    mpesa_ref: null,
    timestamp: '2026-06-03T08:15:00'
  }
])
// COMPUTED: find the selected product details based on selectedProductId

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === selectedProductId.value) || null
})

// COMPUTED: calculate total price based on selected product and quantity
const totalAmount = computed(() => {
  if (!selectedProduct.value) return 0
  return selectedProduct.value.selling_price * quantity.value
})

const mpesaPattern = /^[A-Z0-9]{8,12}$/

const mpesaValidationError = computed(() => {
  if (paymentMethod.value !== 'mpesa') return ''
  if (!mpesaRef.value.trim()) return 'M-Pesa reference is required.'
  const normalized = mpesaRef.value.toUpperCase().replace(/\s+/g, '')
  if (!mpesaPattern.test(normalized)) {
    return 'Enter a valid M-Pesa reference (8-12 uppercase letters or digits).'
  }
  return ''
})

const stockWarning = computed(() => {
  if (!selectedProduct.value) return ''
  if (quantity.value > selectedProduct.value.available_stock) {
    return `Only ${selectedProduct.value.available_stock} items left in stock.`
  }
  return ''
})

const isSaleDisabled = computed(() => {
  if (!selectedProduct.value) return true
  if (quantity.value < 1) return true
  if (paymentMethod.value === 'mpesa' && mpesaValidationError.value) return true
  if (selectedProduct.value.available_stock <= 0) return true
  if (quantity.value > selectedProduct.value.available_stock) return true
  return false
})

const cashRevenue = computed(() =>
  sales.value
    .filter(sale => sale.payment_method === 'cash')
    .reduce((sum, sale) => sum + sale.total_amount, 0)
)

const mpesaRevenue = computed(() =>
  sales.value
    .filter(sale => sale.payment_method === 'mpesa')
    .reduce((sum, sale) => sum + sale.total_amount, 0)
)

const cashSalesCount = computed(() =>
  sales.value.filter(sale => sale.payment_method === 'cash').length
)

const mpesaSalesCount = computed(() =>
  sales.value.filter(sale => sale.payment_method === 'mpesa').length
)

const salesHistory = computed(() => {
  if (!selectedProduct.value) return sales.value
  return sales.value.filter(sale => sale.product_id === selectedProduct.value.id)
})

const salesByDay = computed(() => {
  const groups = salesHistory.value.reduce((acc, sale) => {
    const dayKey = new Date(sale.timestamp).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'short'
    })
    if (!acc[dayKey]) {
      acc[dayKey] = {
        date: dayKey,
        sales: [],
        total: 0
      }
    }
    acc[dayKey].sales.push(sale)
    acc[dayKey].total += sale.total_amount
    return acc
  }, {})

  return Object.values(groups).sort((a, b) => {
    return new Date(b.sales[0].timestamp) - new Date(a.sales[0].timestamp)
  })
})

// Computed: today's summary stats
const todayRevenue = computed(() => {
  return sales.value.reduce((sum, sale) => sum + sale.total_amount, 0)
})

const salesCount = computed(() => sales.value.length)

function recordSale() {
  saleError.value = ''

  if (!selectedProduct.value) {
    saleError.value = 'Please select a product before recording a sale.'
    return
  }

  if (quantity.value < 1) {
    saleError.value = 'Quantity must be at least 1.'
    return
  }

  if (selectedProduct.value.available_stock <= 0) {
    saleError.value = 'This product is out of stock.'
    return
  }

  if (quantity.value > selectedProduct.value.available_stock) {
    saleError.value = `Only ${selectedProduct.value.available_stock} items are available.`
    return
  }

  if (paymentMethod.value === 'mpesa' && mpesaValidationError.value) {
    saleError.value = mpesaValidationError.value
    return
  }

  const newSale = {
    id: sales.value.length + 1,
    product_id: selectedProduct.value.id,
    product_name: selectedProduct.value.name,
    quantity: quantity.value,
    total_amount: totalAmount.value,
    payment_method: paymentMethod.value,
    mpesa_ref: paymentMethod.value === 'mpesa' ? mpesaRef.value.toUpperCase().replace(/\s+/g, '') : null,
    timestamp: new Date().toISOString()
  }

  sales.value.push(newSale)
  selectedProduct.value.available_stock -= quantity.value

  selectedProductId.value = null
  searchTerm.value = ''
  quantity.value = 1
  paymentMethod.value = 'cash'
  mpesaRef.value = ''
}

</script>

<template>
<div>
    <h1 class="text-2xl font-bold text-[#1A1A2E] mb-1">Record a Sale</h1>
    <p class="text-gray-500 text-sm mb-6">Cashier sales interface</p>

    <!-- Summary stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl px-6 py-4 shadow-sm text-center">
        <span class="block text-2xl font-bold text-[#1A1A2E]">{{ salesCount }}</span>
        <span class="text-xs text-gray-500">Sales today</span>
      </div>
      <div class="bg-white rounded-xl px-6 py-4 shadow-sm text-center">
        <span class="block text-2xl font-bold text-[#E8541E]">KES {{ todayRevenue.toLocaleString() }}</span>
        <span class="text-xs text-gray-500">Revenue today</span>
      </div>
      <div class="bg-white rounded-xl px-6 py-4 shadow-sm text-center">
        <span class="block text-2xl font-bold text-[#15803D]">KES {{ cashRevenue.toLocaleString() }}</span>
        <span class="text-xs text-gray-500">Cash revenue</span>
      </div>
      <div class="bg-white rounded-xl px-6 py-4 shadow-sm text-center">
        <span class="block text-2xl font-bold text-[#1D4ED8]">KES {{ mpesaRevenue.toLocaleString() }}</span>
        <span class="text-xs text-gray-500">M-Pesa revenue</span>
      </div>
    </div>

    <!-- Two-column layout: form + history -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

      <!-- Sale form -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-[#1A1A2E] mb-4">New Sale</h2>

        <label class="block text-sm font-medium text-gray-600 mb-1">Search product</label>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Type product name to search..."
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-3"
        />

        <div class="max-h-48 overflow-y-auto mb-4 rounded-lg border border-gray-200 bg-white">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            type="button"
            @click="selectProduct(product)"
            class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b last:border-b-0"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ product.name }}</span>
              <span class="text-xs text-gray-500">KES {{ product.selling_price }}</span>
            </div>
            <p class="text-xs text-gray-500">Stock: {{ product.available_stock }}</p>
          </button>
          <div v-if="filteredProducts.length === 0" class="px-4 py-3 text-sm text-gray-500">
            No products found.
          </div>
        </div>

        <div v-if="selectedProduct" class="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Selected: <strong>{{ selectedProduct.name }}</strong>
        </div>

        <label class="block text-sm font-medium text-gray-600 mb-1">Quantity</label>
        <input
          v-model.number="quantity"
          type="number"
          min="1"
          max="100"
          class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 mb-4"
        >

        <label class="block text-sm font-medium text-gray-600 mb-2">Payment method</label>
        <div class="flex gap-3 mb-4">
          <label
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-colors"
            :class="paymentMethod === 'cash'
              ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <input type="radio" v-model="paymentMethod" value="cash" class="hidden">
            💵 Cash
          </label>
          <label
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer text-sm transition-colors"
            :class="paymentMethod === 'mpesa'
              ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            <input type="radio" v-model="paymentMethod" value="mpesa" class="hidden">
            📱 M-Pesa
          </label>
        </div>

        <!-- Conditional M-Pesa reference field -->
        <div v-if="paymentMethod === 'mpesa'" class="mb-4 animate-fade-in">
          <label class="block text-sm font-medium text-gray-600 mb-1">M-Pesa Reference</label>
          <input
            v-model="mpesaRef"
            type="text"
            placeholder="e.g., SHK7X9M2LP"
            class="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm
                   focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          >
          <p v-if="mpesaValidationError" class="text-sm text-red-600 mt-2">
            {{ mpesaValidationError }}
          </p>
        </div>

        <!-- Live total -->
        <div v-if="selectedProduct"
             class="flex justify-between items-center bg-orange-50 px-4 py-3 rounded-lg
                    border-l-4 border-[#E8541E] mb-4">
          <span class="text-sm text-gray-600">Total</span>
          <span class="text-xl font-bold text-[#E8541E]">KES {{ totalAmount.toLocaleString() }}</span>
        </div>

        <button
          @click="recordSale"
          :disabled="isSaleDisabled"
          class="w-full py-3 bg-[#1A1A2E] text-white rounded-lg font-medium
                 hover:bg-[#E8541E] transition-colors
                 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Record Sale
        </button>
        <p v-if="saleError" class="mt-3 text-sm text-red-600">{{ saleError }}</p>
        <p v-else-if="stockWarning" class="mt-3 text-sm text-orange-600">{{ stockWarning }}</p>
      </div>

      <!-- Sales history panel -->
      <div class="bg-white rounded-xl p-6 shadow-sm">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
          <div>
            <h2 class="text-lg font-semibold text-[#1A1A2E]">
              {{ selectedProduct ? `Sales history for ${selectedProduct.name}` : 'Sales history for all products' }}
            </h2>
            <p class="text-gray-500 text-sm">
              {{ selectedProduct
                ? 'Showing all sales for the selected product.'
                : 'No product selected — showing full daily sales history.'
              }}
            </p>
          </div>
          <div class="text-right">
            <span class="inline-flex items-center rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold">
              {{ salesHistory.length }} total records
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div class="rounded-xl border border-gray-200 p-4">
            <p class="text-sm text-gray-500">Cash sales</p>
            <p class="text-xl font-bold text-[#15803D]">KES {{ cashRevenue.toLocaleString() }}</p>
            <p class="text-xs text-gray-500">{{ cashSalesCount }} transactions</p>
          </div>
          <div class="rounded-xl border border-gray-200 p-4">
            <p class="text-sm text-gray-500">M-Pesa sales</p>
            <p class="text-xl font-bold text-[#1D4ED8]">KES {{ mpesaRevenue.toLocaleString() }}</p>
            <p class="text-xs text-gray-500">{{ mpesaSalesCount }} transactions</p>
          </div>
        </div>

        <div v-if="salesByDay.length === 0" class="rounded-xl border border-dashed border-gray-300 p-6 text-center text-gray-500">
          No sales have been recorded yet.
        </div>

        <div v-else class="space-y-4">
          <div v-for="day in salesByDay" :key="day.date" class="rounded-2xl border border-gray-200 p-4">
            <div class="flex justify-between items-center mb-3">
              <div>
                <p class="text-sm text-gray-500">{{ day.date }}</p>
                <p class="text-lg font-semibold text-[#1A1A2E]">KES {{ day.total.toLocaleString() }}</p>
              </div>
              <span class="text-xs font-semibold text-gray-600">{{ day.sales.length }} sale{{ day.sales.length === 1 ? '' : 's' }}</span>
            </div>
            <div class="space-y-3">
              <div v-for="sale in day.sales" :key="sale.id" class="rounded-xl bg-gray-50 p-3">
                <div class="flex justify-between items-center gap-3 text-sm">
                  <div>
                    <p class="font-semibold text-[#1A1A2E]">{{ sale.product_name }}</p>
                    <p class="text-gray-500">Qty: {{ sale.quantity }}</p>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold">KES {{ sale.total_amount.toLocaleString() }}</p>
                    <p class="text-xs text-gray-500">{{ new Date(sale.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) }}</p>
                  </div>
                </div>
                <div class="mt-2 flex flex-wrap gap-2 text-xs">
                  <span class="rounded-full bg-green-100 text-green-700 px-2 py-1">
                    {{ sale.payment_method === 'mpesa' ? 'M-Pesa' : 'Cash' }}
                  </span>
                  <span v-if="sale.mpesa_ref" class="rounded-full bg-blue-100 text-blue-700 px-2 py-1">
                    Ref: {{ sale.mpesa_ref }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

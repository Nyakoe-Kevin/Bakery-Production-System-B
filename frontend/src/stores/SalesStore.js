import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '../api'

export const useSalesStore = defineStore('sales', () => {
  // State
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

  // Getters
  const totalRevenue = computed(() =>
    sales.value.reduce((sum, sale) => sum + sale.total_amount, 0)
  )

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

  const salesCount = computed(() => sales.value.length)

  const cashSalesCount = computed(() =>
    sales.value.filter(sale => sale.payment_method === 'cash').length
  )

  const mpesaSalesCount = computed(() =>
    sales.value.filter(sale => sale.payment_method === 'mpesa').length
  )

  const averageSaleAmount = computed(() => {
    if (sales.value.length === 0) return 0
    return totalRevenue.value / sales.value.length
  })

  const topProducts = computed(() => {
    const products = {}
    sales.value.forEach(sale => {
      if (!products[sale.product_id]) {
        products[sale.product_id] = {
          product_id: sale.product_id,
          product_name: sale.product_name,
          quantity: 0,
          revenue: 0,
          sales_count: 0
        }
      }
      products[sale.product_id].quantity += sale.quantity
      products[sale.product_id].revenue += sale.total_amount
      products[sale.product_id].sales_count += 1
    })

    return Object.values(products).sort((a, b) => b.revenue - a.revenue)
  })

  const salesByDay = computed(() => {
    const groups = sales.value.reduce((acc, sale) => {
      const dayKey = new Date(sale.timestamp).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      })

      if (!acc[dayKey]) {
        acc[dayKey] = {
          date: dayKey,
          sales: [],
          total: 0,
          count: 0
        }
      }

      acc[dayKey].sales.push(sale)
      acc[dayKey].total += sale.total_amount
      acc[dayKey].count += 1
      return acc
    }, {})

    return Object.values(groups).sort((a, b) => {
      return new Date(b.sales[0].timestamp) - new Date(a.sales[0].timestamp)
    })
  })

  const todayRevenue = computed(() => {
    const today = new Date().toLocaleDateString('en-GB')
    return sales.value
      .filter(sale => new Date(sale.timestamp).toLocaleDateString('en-GB') === today)
      .reduce((sum, sale) => sum + sale.total_amount, 0)
  })

  const todaySalesCount = computed(() => {
    const today = new Date().toLocaleDateString('en-GB')
    return sales.value.filter(sale => new Date(sale.timestamp).toLocaleDateString('en-GB') === today).length
  })

  const todayCashRevenue = computed(() => {
    const today = new Date().toLocaleDateString('en-GB')
    return sales.value
      .filter(
        sale =>
          sale.payment_method === 'cash' &&
          new Date(sale.timestamp).toLocaleDateString('en-GB') === today
      )
      .reduce((sum, sale) => sum + sale.total_amount, 0)
  })

  const todayMpesaRevenue = computed(() => {
    const today = new Date().toLocaleDateString('en-GB')
    return sales.value
      .filter(
        sale =>
          sale.payment_method === 'mpesa' &&
          new Date(sale.timestamp).toLocaleDateString('en-GB') === today
      )
      .reduce((sum, sale) => sum + sale.total_amount, 0)
  })

  // Actions
  function recordSale(saleData) {
    // optimistic local update, try persist to server
    try {
      api.post('/sales', {
        product_id: saleData.product_id,
        quantity: saleData.quantity,
        unit_price: saleData.unit_price ?? (saleData.total_amount / saleData.quantity)
      }).catch(() => {})
    } catch (e) {
      // ignore
    }

    const newSale = {
      id: sales.value.length > 0 ? Math.max(...sales.value.map(s => s.id)) + 1 : 1,
      product_id: saleData.product_id,
      product_name: saleData.product_name,
      quantity: saleData.quantity,
      total_amount: saleData.total_amount,
      payment_method: saleData.payment_method,
      mpesa_ref: saleData.mpesa_ref || null,
      timestamp: saleData.timestamp || new Date().toISOString()
    }

    sales.value.push(newSale)
    return newSale
  }

  function getSaleById(id) {
    return sales.value.find(sale => sale.id === id)
  }

  function getSalesByProduct(productId) {
    return sales.value.filter(sale => sale.product_id === productId)
  }

  function getSalesByDate(date) {
    const dateStr = new Date(date).toLocaleDateString('en-GB')
    return sales.value.filter(
      sale => new Date(sale.timestamp).toLocaleDateString('en-GB') === dateStr
    )
  }

  function getSalesByDateRange(startDate, endDate) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()

    return sales.value.filter(sale => {
      const saleTime = new Date(sale.timestamp).getTime()
      return saleTime >= start && saleTime <= end
    })
  }

  function getSalesByPaymentMethod(method) {
    return sales.value.filter(sale => sale.payment_method === method)
  }

  function deleteSale(id) {
    const index = sales.value.findIndex(sale => sale.id === id)
    if (index > -1) {
      sales.value.splice(index, 1)
      return true
    }
    return false
  }

  function updateSale(id, updatedData) {
    const sale = sales.value.find(s => s.id === id)
    if (sale) {
      Object.assign(sale, updatedData)
      return sale
    }
    return null
  }

  function clearAllSales() {
    sales.value = []
  }

  function clearSalesToday() {
    const today = new Date().toLocaleDateString('en-GB')
    sales.value = sales.value.filter(
      sale => new Date(sale.timestamp).toLocaleDateString('en-GB') !== today
    )
  }

  return {
    // State
    sales,

    // Getters
    totalRevenue,
    cashRevenue,
    mpesaRevenue,
    salesCount,
    cashSalesCount,
    mpesaSalesCount,
    averageSaleAmount,
    topProducts,
    salesByDay,
    todayRevenue,
    todaySalesCount,
    todayCashRevenue,
    todayMpesaRevenue,

    // Actions
    recordSale,
    getSaleById,
    getSalesByProduct,
    getSalesByDate,
    getSalesByDateRange,
    getSalesByPaymentMethod,
    deleteSale,
    updateSale,
    clearAllSales,
    clearSalesToday
  }
})

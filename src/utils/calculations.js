// Currency formatting
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

// Calculate percentage change between two values
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

// Get previous period data for comparison
export const getPreviousPeriodData = (data, currentDate, period = 'month') => {
  const current = new Date(currentDate)
  const previous = new Date(current)
  
  switch (period) {
    case 'day':
      previous.setDate(previous.getDate() - 1)
      break
    case 'week':
      previous.setDate(previous.getDate() - 7)
      break
    case 'month':
      previous.setMonth(previous.getMonth() - 1)
      break
    case 'year':
      previous.setFullYear(previous.getFullYear() - 1)
      break
  }
  
  return previous
}

// Filter data by period
export const filterDataByPeriod = (data, period = 'month') => {
  const now = new Date()
  const filterDate = new Date()
  
  switch (period) {
    case 'day':
      filterDate.setDate(now.getDate() - 1)
      break
    case 'week':
      filterDate.setDate(now.getDate() - 7)
      break
    case 'month':
      filterDate.setMonth(now.getMonth() - 1)
      break
    case 'year':
      filterDate.setFullYear(now.getFullYear() - 1)
      break
  }
  
  return data.filter(item => {
    const itemDate = new Date(item.date)
    return itemDate >= filterDate
  })
}

// Calculate stock alerts
export const calculateStockAlerts = (products) => {
  const lowStockThreshold = 10 // Items with less than 10 units
  const outOfStockItems = products.filter(p => (p.total_units_in_stock || 0) === 0)
  const lowStockItems = products.filter(p => (p.total_units_in_stock || 0) > 0 && (p.total_units_in_stock || 0) < lowStockThreshold)
  
  return {
    outOfStock: outOfStockItems.length,
    lowStock: lowStockItems.length,
    totalAlerts: outOfStockItems.length + lowStockItems.length,
    lowStockItems,
    outOfStockItems
  }
}

// Calculate expiring items (mock function - would need actual expiry dates)
export const calculateExpiringItems = (products) => {
  // This is a mock calculation - in real app, you'd check actual expiry dates
  const mockExpiringItems = products.filter(p => Math.random() > 0.8).slice(0, 3)
  return mockExpiringItems.length
}

// Get time-based data aggregation
export const aggregateDataByPeriod = (data, period = 'month', valueField = 'value') => {
  const aggregated = {}
  
  data.forEach(item => {
    const date = new Date(item.date)
    let key
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]
        break
      case 'week':
        const startOfWeek = new Date(date)
        startOfWeek.setDate(date.getDate() - date.getDay())
        key = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        break
      case 'year':
        key = date.getFullYear().toString()
        break
    }
    
    if (!aggregated[key]) {
      aggregated[key] = 0
    }
    aggregated[key] += item[valueField] || 0
  })
  
  return Object.entries(aggregated)
    .map(([key, value]) => ({ period: key, value }))
    .sort((a, b) => a.period.localeCompare(b.period))
}

// Return ISO week number start date string for grouping and display
export const getWeekStartISO = (dateInput) => {
  const d = new Date(dateInput)
  const day = d.getDay()
  const diff = d.getDate() - day // Sunday-based start
  const start = new Date(d.setDate(diff))
  return start.toISOString().split('T')[0]
}

// Simple time-ago helper (returns human-friendly relative time)
export const timeAgo = (dateInput) => {
  try {
    const d = new Date(dateInput)
    const ts = d.getTime()
    if (Number.isNaN(ts)) return ''
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 5) return 'just now'
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
    return `${Math.floor(diff/86400)}d ago`
  } catch (e) { return '' }
}

// Calculate total units for a product
export const productTotalUnits = (p) => {
  if (typeof p.total_units_in_stock === 'number') return p.total_units_in_stock
  if (Array.isArray(p.batches) && p.batches.length) {
    return p.batches.reduce((s, b) => s + (b.remaining_units || 0), 0)
  }
  return 0
}

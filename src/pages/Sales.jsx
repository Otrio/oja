import React, { useState, useMemo } from 'react'
import AddSaleModal from '../components/AddSaleModal'
import EditSaleModal from '../components/EditSaleModal'
import ConfirmationModal from '../components/ConfirmationModal'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'
import { useSales } from '../context/SaleContext'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../utils/calculations'

export default function Sales() {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { sales, deleteSale, loading } = useSales()
  const { products } = useProducts()
  // multi-column sort criteria: [{ col: 'date'|'id'|'product', dir: 'asc'|'desc' }, ...]
  const [sortCriteria, setSortCriteria] = useState([{ col: 'date', dir: 'desc' }])
  // filters
  const [productFilter, setProductFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const filteredSales = useMemo(() => {
    if (!Array.isArray(sales)) return []
    return sales.filter(s => {
      // category filter (apply first)
      if (categoryFilter) {
        const prod = products.find(p => p.id === s.product_id)
        const cat = prod?.category || ''
        if (String(cat) !== String(categoryFilter)) return false
      }
      if (productFilter && String(s.product_id) !== String(productFilter)) return false
      // date filter (inclusive)
      if (dateFrom) {
        const fromTs = new Date(dateFrom).setHours(0,0,0,0)
        const sTs = new Date(s.date).getTime()
        if (isFinite(fromTs) && sTs < fromTs) return false
      }
      if (dateTo) {
        const toTs = new Date(dateTo).setHours(23,59,59,999)
        const sTs = new Date(s.date).getTime()
        if (isFinite(toTs) && sTs > toTs) return false
      }
      return true
    })
  }, [sales, productFilter, dateFrom, dateTo])


  const sortedSales = useMemo(() => {
    const list = (filteredSales || []).slice()
    const getProductName = (id) => products.find(p => p.id === id)?.name || String(id)
    list.sort((a, b) => {
      for (let i = 0; i < sortCriteria.length; i++) {
        const { col, dir } = sortCriteria[i]
        let va, vb
        if (col === 'id') {
          va = Number(a.id || 0)
          vb = Number(b.id || 0)
        } else if (col === 'product') {
          va = getProductName(a.product_id).toLowerCase()
          vb = getProductName(b.product_id).toLowerCase()
        } else { // date
          va = new Date(a.date).getTime() || 0
          vb = new Date(b.date).getTime() || 0
        }

        if (va === vb) continue

        // numeric compare
        if (typeof va === 'number' && typeof vb === 'number') {
          return dir === 'asc' ? va - vb : vb - va
        }
        // string compare
        return dir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
      }
      return 0
    })
    return list
  }, [filteredSales, sortCriteria, products])
  const [page, setPage] = useState(1)
  const perPage = 10
  const totalPages = Math.max(1, Math.ceil(sortedSales.length / perPage))
  function pageSlice(items) { const start = (page-1)*perPage; return items.slice(start, start+perPage) }

  // setSort handles clicks; if shiftKey is held, we append/toggle secondary sort criteria
  const setSort = (col, e) => {
    const shift = !!(e && e.shiftKey)
    setSortCriteria(prev => {
      const existingIdx = prev.findIndex(s => s.col === col)
      // default direction for new columns
      const defaultDir = col === 'date' ? 'desc' : 'asc'

      if (shift) {
        // multi-column: if exists, toggle dir; otherwise append
        if (existingIdx >= 0) {
          const next = prev.slice()
          next[existingIdx] = { col, dir: next[existingIdx].dir === 'asc' ? 'desc' : 'asc' }
          return next
        }
        return [...prev, { col, dir: defaultDir }]
      }

      // no shift: set single primary sort; toggle if same
      if (prev[0] && prev[0].col === col) {
        return [{ col, dir: prev[0].dir === 'asc' ? 'desc' : 'asc' }]
      }
      return [{ col, dir: defaultDir }]
    })
    setPage(1)
  }

  const clearSorts = () => {
    setSortCriteria([{ col: 'date', dir: 'desc' }])
  }

  const clearFilters = () => {
    setProductFilter('')
    setCategoryFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function productName(id) { return products.find(p => p.id === id)?.name || id }

  const handleDelete = () => {
    deleteSale(deleting.id)
    setDeleting(null)
  }

  const handleSave = () => {
    setEditing(null)
    // Data is already saved by the context
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales</h1>
          <p className="text-sm text-gray-400 mt-1">Track your sales transactions and revenue.</p>
        </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="grid grid-cols-2 sm:flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1) }} className="text-sm bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 outline-none min-w-[120px] sm:min-w-[140px] w-full sm:w-auto text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="">All categories</option>
              {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select value={productFilter} onChange={e => { setProductFilter(e.target.value); setPage(1) }} className="text-sm bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 outline-none min-w-[120px] sm:min-w-[140px] w-full sm:w-auto text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="">All products</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:flex items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <i className="fas fa-calendar-alt text-gray-400 mr-2"></i>
              <input aria-label="Date from" type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1) }} className="text-sm outline-none w-full bg-transparent text-white [color-scheme:dark]" />
            </div>
            <div className="flex items-center border border-gray-600 rounded-lg px-3 py-2 text-sm bg-gray-800 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <i className="fas fa-calendar-alt text-gray-400 mr-2"></i>
              <input aria-label="Date to" type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1) }} className="text-sm outline-none w-full bg-transparent text-white [color-scheme:dark]" />
            </div>
          </div>

          <div className="flex items-center gap-2 w-auto self-end sm:self-auto">
            <button onClick={() => setShowAdd(true)} className="modern-btn modern-btn-primary px-2 py-1 text-sm w-auto"> <i className="fas fa-plus mr-1"></i> Add</button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAdd && <AddSaleModal onClose={() => setShowAdd(false)} />}

      {/* Edit Modal */}
      {editing && (
        <EditSaleModal 
          isOpen={true}
          onClose={() => setEditing(null)}
          sale={editing}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleting && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleting(null)}
          onConfirm={handleDelete}
          title="Delete Sale"
          message={`Are you sure you want to delete the sale for "${productName(deleting.product_id)}"? This action cannot be undone and will affect your inventory stock levels.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {/* Sales Table */}
  <div className="modern-card overflow-x-auto">
        {/* Controls above the table */}
        <div className="p-3 border-b border-gray-700 bg-gray-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button onClick={clearFilters} className="px-2 py-1 bg-gray-700 text-white rounded text-xs sm:text-sm w-auto hover:bg-gray-600">Clear filters</button>
            <button onClick={clearSorts} title="Clear sorts" className="px-2 py-1 bg-gray-800 border border-gray-600 text-white rounded text-xs sm:text-sm w-auto hover:bg-gray-700">Clear sorts</button>
          </div>
          <div className="text-xs sm:text-sm text-gray-300 ml-2">Showing {sortedSales.length} result(s)</div>
        </div>
  {loading ? (
          <div className="p-4">
            <LoadingSkeleton count={6} />
          </div>
        ) : sales.length === 0 ? (
          <EmptyState icon="fas fa-chart-line" title="No sales yet" description="Start recording sales to track revenue and inventory." />
          ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                  <th onClick={(e) => setSort('product', e)} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer">
                    Product {(() => {
                      const idx = sortCriteria.findIndex(s => s.col === 'product')
                      if (idx === -1) return null
                      const d = sortCriteria[idx].dir
                      return <span className="ml-1">{d === 'asc' ? '▲' : '▼'}<span className="ml-1 text-[10px] text-gray-400">{idx+1}</span></span>
                    })()}
                  </th>
                  <th onClick={(e) => setSort('id', e)} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer">
                    ID {(() => {
                      const idx = sortCriteria.findIndex(s => s.col === 'id')
                      if (idx === -1) return null
                      const d = sortCriteria[idx].dir
                      return <span className="ml-1">{d === 'asc' ? '▲' : '▼'}<span className="ml-1 text-[10px] text-gray-400">{idx+1}</span></span>
                    })()}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Units Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Profit</th>
                  <th onClick={(e) => setSort('date', e)} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer">Date {(() => {
                    const idx = sortCriteria.findIndex(s => s.col === 'date')
                    if (idx === -1) return null
                    const d = sortCriteria[idx].dir
                    return <span className="ml-1">{d === 'asc' ? '▲' : '▼'}<span className="ml-1 text-[10px] text-gray-400">{idx+1}</span></span>
                  })()}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageSlice(sortedSales).map((sale, index) => (
                  <tr key={sale.id} className={`transition-colors duration-200 ${index > 0 ? 'border-t-0' : ''}`}>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
                          <i className="fas fa-chart-line text-green-400 text-sm"></i>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{productName(sale.product_id)}</div>
                          <div className="text-xs text-gray-400">{products.find(p => p.id === sale.product_id)?.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="text-sm text-white">{sale.id}</div>
                      <div className="text-xs text-gray-400 capitalize">{sale.type}</div>
                    </td>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-minus-circle text-red-500 text-xs"></i>
                        <div className="text-sm font-medium text-white">
                          {(sale.total_units_sold || 0)} unit(s) - {sale.packs ? `${sale.packs} pack(s) ` : (sale.cartons ? `${sale.cartons} carton(s) ` : '')}{sale.units ? `+ ${sale.units} unit(s)` : ''}
                        </div>
                      </div>
                    </td>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="text-sm font-medium text-white">
                        {(() => {
                          // Prefer explicit per-pack price, then per-unit price; otherwise fall back to total price
                          const ppack = typeof sale.price_per_pack !== 'undefined' ? Number(sale.price_per_pack) : null
                          const punit = typeof sale.price_per_unit !== 'undefined' ? Number(sale.price_per_unit) : null
                          if (ppack && !Number.isNaN(ppack) && ppack > 0) return `${formatCurrency(ppack)} /pack`
                          if (punit && !Number.isNaN(punit) && punit > 0) return `${formatCurrency(punit)} /unit`
                          return formatCurrency(sale.total_price || sale.price || 0)
                        })()}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${(sale.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {formatCurrency(sale.profit)}
                        </span>
                        {(sale.profit || 0) >= 0 ? (
                          <i className="fas fa-arrow-up text-green-500 text-xs"></i>
                        ) : (
                          <i className="fas fa-arrow-down text-red-500 text-xs"></i>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="text-sm text-white">{sale.date}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditing(sale)}
                          className="p-2 sm:p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                          title="Edit sale"
                        >
                          <i className="fas fa-edit text-sm"></i>
                        </button>
                        <button
                          onClick={() => setDeleting(sale)}
                          className="p-2 sm:p-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                          title="Delete sale"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sales.length > perPage && (
              <div className="p-4 flex items-center justify-center gap-2">
                <button disabled={page<=1} onClick={() => setPage(p => Math.max(1,p-1))} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600">Prev</button>
                <div className="text-sm text-gray-300">Page {page} of {totalPages}</div>
                <button disabled={page>=totalPages} onClick={() => setPage(p => Math.min(totalPages,p+1))} className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600">Next</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

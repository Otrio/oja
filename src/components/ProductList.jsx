import React, { useState, useRef, useEffect } from 'react'
import { useProducts } from '../context/ProductContext'
import ProductForm from './ProductForm'
import AddBatchModal from './AddBatchModal'
import EditBatchModal from './EditBatchModal'
import EditPriceModal from './EditPriceModal'
import ConfirmationModal from './ConfirmationModal'
import { formatCurrency } from '../utils/calculations'
import { LoadingSkeleton, EmptyState } from './LoadingStates'
import PrimaryActionButton from './PrimaryActionButton'

export default function ProductList() {
  const { products, deleteProduct, deleteBatch, loading } = useProducts()
  const [page, setPage] = useState(1)
  const perPage = 8
  const STORAGE_KEY = 'oja_show_zero_products'
  const [showZero, setShowZero] = useState(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      return v === '1' || v === 'true'
    } catch (e) {
      return false
    }
  })

  // Helper to compute total remaining units for a product (used for UI-only filtering)
  function totalRemainingForProduct(p) {
    if (typeof p.total_units_in_stock === 'number') return Number(p.total_units_in_stock)
    if (p.current_stock && typeof p.current_stock === 'number') return Number(p.current_stock)
    return (p.batches || []).reduce((s, b) => s + Number(b.remaining_units ?? b.units_added ?? 0), 0)
  }

  // Reset to page 1 when the visible products change (handles add/remove and hiding zeros)
  useEffect(() => {
    const vlen = (products || []).filter(p => Number(totalRemainingForProduct(p)) > 0).length
    console.log('Visible products changed, resetting to page 1. Visible count:', vlen, 'Current page:', page, 'showZero:', showZero)
    setPage(1)
  }, [products?.length, showZero])

  // Persist the showZero preference in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, showZero ? '1' : '0')
    } catch (e) {
      // ignore storage errors (e.g., private mode)
    }
  }, [showZero])

  function productsPaginated(list) {
    const start = (page - 1) * perPage
    const paginated = list.slice(start, start + perPage)
    console.log('Pagination:', { 
      totalProducts: list.length, 
      currentPage: page, 
      perPage, 
      start, 
      end: start + perPage,
      paginatedCount: paginated.length,
      productNames: paginated.map(p => p.name)
    })
    return paginated
  }
  const [editingProduct, setEditingProduct] = useState(null)
  const editProductSubmitRef = useRef(null)
  const [deleting, setDeleting] = useState(null)
  const [batchFor, setBatchFor] = useState(null)
  const [editBatchFor, setEditBatchFor] = useState(null)
  const [editPriceFor, setEditPriceFor] = useState(null)
  const [batchToDelete, setBatchToDelete] = useState(null)

  function showStock(p) {
    const cs = p.pack_size || p.carton_size || 1
    const packs = Math.floor((p.total_units_in_stock || 0) / cs)
    const units = (p.total_units_in_stock || 0) % cs
    return `${packs} packs + ${units} units`
  }

  function timeAgo(dateStr) {
    try {
      if (!dateStr) return ''
      const d = new Date(dateStr)
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

  // Derive visible products (UI-only): hide products whose total remaining units are 0
  const visibleProducts = showZero ? (products || []) : (products || []).filter(p => Number(totalRemainingForProduct(p)) > 0)

  return (
    <div className="space-y-4 overflow-x-hidden">
      {loading ? (
        <div>
          <LoadingSkeleton count={4} />
        </div>
      ) : !products || products.length === 0 ? (
        <EmptyState icon="fas fa-box" title="No products yet" description="Add products to start tracking inventory." />
      ) : visibleProducts.length === 0 ? (
        <EmptyState icon="fas fa-box" title="Nothing to show" description="All products currently have zero stock. Toggle a setting or add stock to see products listed." />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" className="form-checkbox h-4 w-4" checked={showZero} onChange={(e) => setShowZero(e.target.checked)} />
              <span>Show zero-stock products</span>
            </label>
          </div>
          {productsPaginated(visibleProducts).map((p) => (
            <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 w-full sb-fade-in sb-transition hover:bg-gray-700 overflow-hidden">
              {/* Top row: product info, stock, and actions (no squeezing) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                          <div className="font-medium text-white truncate sm:truncate-none">{p.name}</div>
                        <div className="flex items-center gap-2 whitespace-nowrap ml-1">
                          {(() => {
                            const ps = Number(p.pack_size || p.units_per_pack || p.carton_size || p.units_per_carton || 1) || 1
                            const unitPrice = (typeof p.unit_selling_price !== 'undefined' && p.unit_selling_price !== null && p.unit_selling_price !== '') ? Number(p.unit_selling_price) : (p.pack_selling_price ? (Number(p.pack_selling_price) / ps) : null)
                            const packPrice = (typeof p.pack_selling_price !== 'undefined' && p.pack_selling_price !== null && p.pack_selling_price !== '') ? Number(p.pack_selling_price) : (unitPrice ? Number(unitPrice) * ps : null)
                            const cartonPrice = (typeof p.carton_selling_price !== 'undefined' && p.carton_selling_price !== null && p.carton_selling_price !== '') ? Number(p.carton_selling_price) : null
                            return (
                              <>
                                {cartonPrice != null && !Number.isNaN(cartonPrice) && (
                                  <span className="text-xs bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded">{formatCurrency(cartonPrice)} <span className="text-[10px]">/carton</span></span>
                                )}
                                {packPrice != null && !Number.isNaN(packPrice) && (
                                  <span className="text-xs bg-violet-50 text-violet-800 px-2 py-0.5 rounded">{formatCurrency(packPrice)} <span className="text-[10px]">/pack</span></span>
                                )}
                                {unitPrice != null && !Number.isNaN(unitPrice) && (
                                  <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">{formatCurrency(unitPrice)} <span className="text-[10px]">/unit</span></span>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                      {(() => {
                        const totalRemaining = (p.batches || []).reduce((s, b) => s + Number(b.remaining_units ?? b.units_added ?? 0), 0) || Number(p.current_stock ?? p.total_units_in_stock ?? 0)
                        const threshold = Number(p.minimum_stock ?? p.low_stock_threshold ?? 0)
                        return (threshold > 0 && totalRemaining <= threshold) ? (<div className="inline-block text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">Low stock</div>) : null
                      })()}
                    </div>
                    <div className="text-sm text-gray-400 truncate">{p.category}</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-4 w-full sm:w-auto">
                  <div className="text-sm text-gray-300 text-left sm:text-right mr-0 sm:mr-4 w-full sm:w-auto">
                    {(() => {
                      const cs = Number(p.pack_size || p.units_per_pack || p.carton_size || p.units_per_carton || 1)
                      const totalRemaining = typeof p.total_units_in_stock === 'number' 
                        ? p.total_units_in_stock 
                        : (p.batches || []).reduce((s, b) => s + Number(b.remaining_units ?? 0), 0);
                      const packs = Math.floor(totalRemaining / cs)
                      const units = totalRemaining % cs
                      return (
                        <>
                          <div>Remaining: {totalRemaining} unit(s) - {packs} packs + {units} units</div>
                          <div className="text-xs text-gray-400">Pack size: {cs} unit(s)</div>
                        </>
                      )
                    })()}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap sm:flex-shrink-0">
                    <PrimaryActionButton onClick={() => setBatchFor(p)} className="sm:flex-shrink-0 bg-gray-700 text-white hover:bg-gray-600">Add Batch</PrimaryActionButton>
                    <button onClick={() => setEditPriceFor(p)} className="sb-transition-base text-sm px-3 py-1 rounded-lg text-yellow-700 bg-yellow-50 border border-yellow-100 sm:flex-shrink-0">Edit Price</button>
                    <button onClick={() => setDeleting(p)} className="sb-transition-base text-sm px-3 py-1 rounded-lg text-red-700 bg-red-50 border border-red-100 sm:flex-shrink-0">Delete</button>
                  </div>
                </div>
              </div>

              {/* Batches area below top row */}
              {p.batches && p.batches.length > 0 && (
                (() => {
                  const sortedBatches = (p.batches || []).sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.created_at || a.created)
                    const dateB = new Date(b.createdAt || b.created_at || b.created)
                    return dateA - dateB
                  })

                  // UI-only: hide batches with zero remaining units unless showZero is enabled
                  const visibleBatches = showZero ? sortedBatches : sortedBatches.filter(b => Number(b.remaining_units ?? b.units_added ?? 0) > 0)
                  if (visibleBatches.length === 0) return null

                  return (
                    <div className="mt-4 text-sm text-gray-700 dark:text-gray-300 w-full">
                      <div className="font-medium mb-2">Batches</div>
                      <ol className="border-l border-gray-200 w-full space-y-[5px]">
                        {visibleBatches.slice().reverse().map((b, idx) => (
                          <li key={b.id} className="ml-4 flex flex-col sm:flex-row items-start justify-between w-full">
                            <div className="flex items-start gap-3 flex-grow min-w-0 w-full sm:pr-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center text-xs text-indigo-600 mt-1">
                                <i className="fas fa-boxes"></i>
                              </div>
                              <div className="min-w-0 flex-grow w-full">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="text-sm font-medium">Batch {visibleBatches.length - idx} - {b.units_added} unit(s) added</div>
                                  <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-0.5 rounded">Remaining: {b.remaining_units}</span>
                                  {b.cost_per_pack && (
                                    <span className="text-xs bg-violet-50 text-violet-800 px-2 py-0.5 rounded">Cost: {formatCurrency(b.cost_per_pack)} <span className="text-[10px]">/pack</span></span>
                                  )}
                                  {b.cost_per_unit && (
                                    <span className="text-xs bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded">Cost: {formatCurrency(b.cost_per_unit)} <span className="text-[10px]">/unit</span></span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                                  <span>{timeAgo(b.createdAt || b.created_at || b.created)}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="hidden sm:inline">{b.createdAt ? new Date(b.createdAt).toLocaleDateString() : (b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Unknown')}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:flex-shrink-0 mt-1 sm:mt-0 w-full sm:w-auto justify-end ml-0 sm:ml-4 pr-3 sm:pr-0 mb-3 sm:mb-0">
                              <button title="Edit batch" onClick={() => setEditBatchFor({ product: p, batch: b })} className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 sb-transition-base group relative flex-shrink-0" aria-label={`Edit batch ${idx + 1}`}>
                                <i className="fas fa-edit text-xs"></i>
                              </button>
                              <button title="Delete batch" onClick={() => setBatchToDelete({ product: p, batch: b })} className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-red-50 text-red-600 hover:bg-red-100 sb-transition-base group relative flex-shrink-0" aria-label={`Delete batch ${idx + 1}`}>
                                <i className="fas fa-trash text-xs"></i>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )
                })()
              )}
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modern-card bg-gray-800 rounded-xl shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 relative border border-gray-700">
            <div className="px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-900/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-edit text-sky-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-white">Edit Product</h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="absolute right-3 top-3 w-8 h-8 rounded bg-red-900/20 text-red-400 flex items-center justify-center hover:bg-red-900/30"
                aria-label="Close edit product"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="px-6 py-4 pb-6">
              <ProductForm initial={editingProduct} onClose={() => setEditingProduct(null)} submitRef={editProductSubmitRef} hideFooter={true} darkMode={true} />
            </div>

            <div className="py-4 bg-gray-700/50 rounded-b-xl flex gap-3 justify-end border-t border-gray-700 px-6">
              <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="button" onClick={() => editProductSubmitRef.current?.()} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-supabase-600 to-supabase-500 hover:from-supabase-500 hover:to-supabase-400 rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
        {batchFor && (
          <AddBatchModal product={batchFor} onClose={() => setBatchFor(null)} />
        )}
        {editBatchFor && (
          <EditBatchModal product={editBatchFor.product} batch={editBatchFor.batch} onClose={() => setEditBatchFor(null)} />
        )}
        {editPriceFor && (
          <EditPriceModal product={editPriceFor} onClose={() => setEditPriceFor(null)} />
        )}
      {batchToDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setBatchToDelete(null)}
          onConfirm={() => { deleteBatch(batchToDelete.product.id, batchToDelete.batch.id); setBatchToDelete(null) }}
          title="Delete Batch"
          message={`Are you sure you want to delete this batch? This will adjust the product stock accordingly.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {/* Delete confirmation modal for products - matches purchases modal style */}
      {deleting && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDeleting(null)}
          onConfirm={() => { deleteProduct(deleting.id); setDeleting(null) }}
          title="Delete Product"
          message={`Are you sure you want to delete the product "${deleting.name}" and all its related records? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {/* Pagination controls */}
      {visibleProducts.length > perPage && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Prev</button>
          <div className="text-sm text-gray-600">Page {page} of {Math.max(1, Math.ceil(visibleProducts.length / perPage))}</div>
          <button disabled={page >= Math.ceil(visibleProducts.length / perPage)} onClick={() => setPage(p => Math.min(Math.ceil(visibleProducts.length / perPage), p + 1))} className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  )
}

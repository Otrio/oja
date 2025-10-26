import React, { useMemo, useState, useCallback } from 'react'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../utils/calculations'
import { useSales } from '../context/SaleContext'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'

export default function AvailableStock() {
  const { products } = useProducts()
  const { sales } = useSales()
  const loading = (products === undefined || sales === undefined)

  const showStock = useCallback((p) => {
    // Get pack size - prefer pack_size, then units_per_pack for consistency
    const ps = Number(p.pack_size || p.units_per_pack || 1) || 1
    
    // Always use total_units_in_stock as source of truth, as it's updated by FIFO calculations
    let total = 0;
    if (typeof p.total_units_in_stock === 'number' && !Number.isNaN(p.total_units_in_stock)) {
      total = Math.max(0, Math.round(p.total_units_in_stock));
    } else if (Array.isArray(p.batches) && p.batches.length > 0) {
      // Fallback to sum of remaining units in batches
      total = p.batches.reduce((sum, b) => sum + Number(b.remaining_units || 0), 0);
    }

    // Calculate packs and remaining units
    const packs = Math.floor(total / ps);
    const units = total % ps;

    console.log('Stock calculation for ' + p.name, {
      total_units_in_stock: p.total_units_in_stock,
      batches_remaining: p.batches?.map(b => b.remaining_units),
      total,
      pack_size: ps,
      packs,
      units
    });

    return { packs, units, total }
  }, [])
  const [showOnlyLow, setShowOnlyLow] = useState(false)
  const lowStockProducts = useMemo(() => {
    return products.filter(p => {
      // Skip deleted products
      if (p.deleted_at || p.deletedAt) return false;
      
      // Get current stock level
      const s = showStock(p)
      
      // Check against threshold
      const threshold = Number(p.low_stock_threshold || 0)
      return threshold > 0 && s.total > 0 && s.total <= threshold
    })
  }, [products, showStock])
  const lowCount = lowStockProducts.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Available Stock</h1>
          <p className="text-sm text-gray-400">Current available packs and units per product</p>
        </div>
      </div>
      {/* Low stock alert + filter */}
      {loading ? (
        <div>
          <LoadingSkeleton count={6} />
        </div>
      ) : null}
      {/* Compute low-stock items and expose a simple toggle to filter the list. */}
      {lowCount > 0 && (
        <div className="p-4 rounded-lg bg-orange-900/30 border border-orange-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-900/30 rounded flex items-center justify-center text-orange-400">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div>
              <div className="font-medium text-orange-400">{lowCount} low stock {lowCount === 1 ? 'item' : 'items'}</div>
              <div className="text-sm text-orange-300">Set low stock thresholds on products to get alerts.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowOnlyLow(s => !s)} className={`px-3 py-1 rounded ${showOnlyLow ? 'bg-orange-600 text-white' : 'bg-gray-700 border border-gray-600 text-white'}`}>
              {showOnlyLow ? 'Showing only low' : 'Show only low'}
            </button>
            {showOnlyLow && (
              <button onClick={() => setShowOnlyLow(false)} className="px-3 py-1 bg-gray-700 border border-gray-600 text-white rounded">Show all</button>
            )}
          </div>
        </div>
      )}

  <div className="space-y-4">
  {(!products || products.length === 0) ? (
    <EmptyState icon="fas fa-boxes" title="No products" description="Add products to view available stock." />
  ) : (
    (showOnlyLow ? lowStockProducts : products).map(p => {
        const s = showStock(p)
        const isLow = (typeof p.low_stock_threshold === 'number') && !Number.isNaN(p.low_stock_threshold) && s.total <= p.low_stock_threshold
        if (showOnlyLow && !isLow) return null
        return (
          <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-lg p-4 w-full">
              <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <h3 className="text-sm font-semibold text-white min-w-0 break-words">{p.name}</h3>
                  {/* Price badges */}
                  {(() => {
                    const ps = Number(p.pack_size || p.units_per_pack || 1) || 1
                    const unitPrice = (typeof p.unit_selling_price !== 'undefined' && p.unit_selling_price !== null && p.unit_selling_price !== '') ? Number(p.unit_selling_price) : (p.pack_selling_price ? (Number(p.pack_selling_price) / ps) : null)
                    const packPrice = (typeof p.pack_selling_price !== 'undefined' && p.pack_selling_price !== null && p.pack_selling_price !== '') ? Number(p.pack_selling_price) : (unitPrice ? Number(unitPrice) * ps : null)
                    return (
                      <div className="flex flex-wrap items-center gap-2">
                        {packPrice != null && !Number.isNaN(packPrice) && (
                          <span aria-label={`Price per pack ${formatCurrency(packPrice)}`} title={`Per pack ${formatCurrency(packPrice)}`} className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded whitespace-nowrap">{formatCurrency(packPrice)} <span className="text-[10px]">/pack</span></span>
                        )}
                        {unitPrice != null && !Number.isNaN(unitPrice) && (
                          <span aria-label={`Price per unit ${formatCurrency(unitPrice)}`} title={`Per unit ${formatCurrency(unitPrice)}`} className="text-xs bg-teal-900/30 text-teal-400 px-2 py-0.5 rounded whitespace-nowrap">{formatCurrency(unitPrice)} <span className="text-[10px]">/unit</span></span>
                        )}
                      </div>
                    )
                  })()}
                </div>
                <div className="text-xs text-gray-400 mt-2 sm:mt-0">Pack size: {p.pack_size || p.units_per_pack || 1} unit(s)</div>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="text-xs text-gray-400">Total units</div>
                <div className="text-lg font-medium text-white min-w-[3rem]">{s.total}</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">Packs</div>
                <div className="px-2 py-1 bg-gray-700 rounded text-sm font-medium text-white min-w-[3rem] text-center">{s.packs}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">Units</div>
                <div className="px-2 py-1 bg-gray-700 rounded text-sm font-medium text-white min-w-[3rem] text-center">{s.units}</div>
              </div>
              {isLow && (
                <div className="bg-orange-900/30 text-orange-400 px-2 py-0.5 rounded-full text-xs font-medium sm:ml-auto">Low stock</div>
              )}
            </div>
          </div>
        )
  }))}
      </div>
    </div>
  )
}

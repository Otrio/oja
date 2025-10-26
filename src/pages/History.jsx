import React, { useMemo, useState } from 'react'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../utils/calculations'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'

function KPI({ title, value, sub }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex-1">
      <div className="text-xs text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
    </div>
  )
}

export default function History() {
  const { products } = useProducts()
  const loading = (products === undefined)
  const [q, setQ] = useState('')
  const [sortBy, setSortBy] = useState('removedAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const perPage = 10

  // Build list of archived history entries.
  // Support two possible sources:
  // 1) explicit `product.batch_history` array (legacy or server-provided), and
  // 2) any batch in `product.batches` that appears archived (remaining_units === 0).
  const historyEntries = useMemo(() => {
    const out = []
    for (const p of products || []) {
      // 1) explicit batch_history if provided
      if (Array.isArray(p.batch_history) && p.batch_history.length) {
        for (const h of p.batch_history) out.push({ product: p, batch: h })
      }

      // 2) archived batches inside p.batches (remaining_units === 0)
      if (Array.isArray(p.batches) && p.batches.length) {
        for (const b of p.batches) {
          const rem = Number(b.remaining_units ?? b.remainingUnits ?? b.remaining ?? 0)
          if (rem === 0) {
            // Normalize some common fields so History display is consistent
            const normalized = {
              ...b,
              units_added: b.units_added ?? b.unitsAdded ?? b.units ?? 0,
              cost_per_unit: Number(b.cost_per_unit ?? b.costPerUnit ?? 0),
              remaining_units: rem,
              createdAt: b.createdAt || b.created_at || b.created || null,
              removedAt: b.removedAt || b.removed_at || b.updated_at || b.updatedAt || null
            }
            out.push({ product: p, batch: normalized })
          }
        }
      }
    }
    return out
  }, [products])

  const totalArchived = historyEntries.length
  const totalUnitsArchived = historyEntries.reduce((s, e) => s + (e.batch.units_added || 0), 0)
  // Use acquisition cost estimate (units_added * cost_per_unit) — more meaningful for history of depleted batches
  const totalCostLocked = historyEntries.reduce((s, e) => s + ((e.batch.cost_per_unit || 0) * (e.batch.units_added || 0)), 0)
  const productsWithHistory = new Set(historyEntries.map(h => h.product.id)).size

  function getBatchLabel(product, batch) {
    try {
      const list = Array.isArray(product.batches) && product.batches.length ? product.batches : (Array.isArray(product.batch_history) ? product.batch_history : [])
      if (list && list.length) {
        const sorted = list.slice().sort((a, b) => {
          const da = new Date(a.createdAt || a.created_at || a.created)
          const db = new Date(b.createdAt || b.created_at || b.created)
          return da - db
        })
        const idx = sorted.findIndex(x => String(x.id) === String(batch.id))
        if (idx !== -1) return `Batch ${idx + 1}`
      }
      if (batch.name) return batch.name
      return `Batch ${batch.id ?? ''}`
    } catch (err) {
      return batch.id ?? 'Batch'
    }
  }

  const filtered = useMemo(() => {
    return historyEntries.filter(h => {
      if (!q) return true
      const text = `${h.product.name} ${h.batch.id} ${h.batch.reason || ''}`.toLowerCase()
      return text.includes(q.toLowerCase())
    }).sort((a,b) => {
      const av = a.batch[sortBy] || ''
      const bv = b.batch[sortBy] || ''
      if (av === bv) return 0
      if (sortDir === 'asc') return av < bv ? -1 : 1
      return av > bv ? -1 : 1
    })
  }, [historyEntries, q, sortBy, sortDir])

  // Reset to page 1 when filters/sorts/search change
  React.useEffect(() => {
    setPage(1)
  }, [q, sortBy, sortDir])

  function pageSlice(items) { const start = (page-1)*perPage; return items.slice(start, start+perPage) }
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))


  return (
    <div className="space-y-6">
      {loading ? (
        <div>
          <LoadingSkeleton count={4} />
        </div>
      ) : null}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">History</h1>
          <p className="text-sm text-gray-400">Comprehensive archive of depleted batches and product history.</p>
        </div>
        <div className="flex items-center gap-3">
          <input value={q} onChange={e => setQ(e.target.value)} className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg placeholder-gray-400" placeholder="Search archived batches..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPI title="Total archived batches" value={totalArchived} />
        <KPI title="Total units archived" value={totalUnitsArchived} />
  <KPI title={<span>Estimated acquisition cost <span title="Estimated total cost when these batches were added (units_added × cost_per_unit)." aria-hidden="true"><i className="fas fa-info-circle text-gray-400 ml-1"></i></span></span>} value={formatCurrency(totalCostLocked)} />
        <KPI title="Products with archive" value={productsWithHistory} />
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Archived batches</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <label>Sort</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded">
              <option value="removedAt">Removed At</option>
              <option value="createdAt">Added At</option>
              <option value="units_added">Units</option>
              <option value="cost_per_unit">Cost/unit</option>
            </select>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded">{sortDir === 'asc' ? 'Asc' : 'Desc'}</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState icon="fas fa-archive" title="No archived batches" description="There are no archived batches to display." />
          ) : (
            <>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-gray-300 uppercase bg-gray-700">
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2">Batch</th>
                  <th className="px-3 py-2">Units</th>
                  <th className="px-3 py-2">Remaining</th>
                  <th className="px-3 py-2">Cost / unit</th>
                  <th className="px-3 py-2">Cost / pack</th>
                  <th className="px-3 py-2">Added</th>
                  <th className="px-3 py-2">Archived</th>
                  <th className="px-3 py-2">Reason</th>
                  {/* Actions removed for history (read-only) */}
                </tr>
              </thead>
              <tbody>
                {pageSlice(filtered).map((e, idx) => (
                  <tr key={`${e.product.id}-${e.batch.id}-${idx}`} className="border-t border-gray-600 hover:bg-gray-700 bg-gray-800">
                    <td className="px-3 py-2 font-medium text-white">{e.product.name}</td>
                        <td className="px-3 py-2 text-white">{getBatchLabel(e.product, e.batch)}</td>
                    <td className="px-3 py-2 text-white">{e.batch.units_added || 0}</td>
                    <td className="px-3 py-2 text-white">{e.batch.remaining_units || 0}</td>
                    <td className="px-3 py-2 text-white">{formatCurrency(Number(e.batch.cost_per_unit || 0))}</td>
                    <td className="px-3 py-2 text-white">{formatCurrency(Number(e.batch.cost_per_pack || 0))}</td>
                    <td className="px-3 py-2 text-white">{(e.batch.createdAt || '').split('T')[0]}</td>
                    <td className="px-3 py-2 text-white">{(e.batch.removedAt || '').split('T')[0]}</td>
                    <td className="px-3 py-2 text-white">{e.batch.reason || 'depleted'}</td>
                        {/* actions removed for history page (read-only) */}
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > perPage ? (
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600"
                >
                  Prev
                </button>

                <div className="text-sm text-gray-300">Page {page} of {totalPages}</div>

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 hover:bg-gray-600"
                >
                  Next
                </button>
              </div>
            ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend, CartesianGrid } from 'recharts'
import { useSales } from '../context/SaleContext'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../utils/calculations'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'

function sumByProduct(sales, products = []) {
  const map = new Map()
  if (!Array.isArray(sales) || !Array.isArray(products)) return map;
  
  for (const s of sales) {
    const id = s.product_id
    const cur = map.get(id) || { units: 0, revenue: 0, count: 0, profit: 0 }
    const units = Number(s.total_units_sold || 0)
    cur.units += units

    // Get the product for this sale
    const product = products.find(p => p.id === id);
    if (!product) {
      // Fallback to using sale's own price data if product not found
      const saleRevenue = Number(s.total_price || 0);
      cur.revenue += saleRevenue;
      cur.profit += Number(s.profit || 0);
      cur.count += 1;
      map.set(id, cur);
      console.warn('Product not found for sale:', s);
      continue;
    }

    // Calculate revenue using pack-based pricing
    const ps = Number(product.pack_size || product.units_per_pack || 1);
    const completePacks = Math.floor(units / ps);
    const remainingUnits = units % ps;

    // Calculate revenue
    let saleRevenue = 0;
    
    // Revenue from complete packs
    if (completePacks > 0) {
      const packPrice = Number(s.price_per_pack || product.pack_selling_price || (product.unit_selling_price * ps) || 0);
      saleRevenue += completePacks * packPrice;
    }

    // Revenue from remaining units
    if (remainingUnits > 0) {
      const unitPrice = Number(s.price_per_unit || product.unit_selling_price || 0);
      saleRevenue += remainingUnits * unitPrice;
    }

    cur.revenue += saleRevenue;
    cur.profit += Number(s.profit || 0);
    cur.count += 1;
    map.set(id, cur);

    console.log('Sale summary:', {
      product: product.name,
      totalUnits: units,
      packSize: ps,
      completePacks,
      remainingUnits,
      saleRevenue,
      profit: s.profit || 0
    });
  }
  return map
}

function filterByRange(sales, fromTs, toTs) {
  return sales.filter(s => {
    const t = new Date(s.date).getTime()
    return t >= fromTs && t <= toTs
  })
}

function topByRange(sales = [], products = [], rangeKey, comparator = (a,b) => b.revenue - a.revenue) {
  if (!Array.isArray(sales) || !Array.isArray(products)) return null;
  
  // compute start/end for the given rangeKey
  const now = new Date()
  let start = new Date(now)
  start.setHours(0,0,0,0)
  if (rangeKey === 'day') {
    start = new Date(now.getTime() - (24 * 60 * 60 * 1000))
  } else if (rangeKey === 'week') {
    // Calendar-week: start from previous Monday
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Sunday=0, treat as 7
    start = new Date(now);
    start.setDate(now.getDate() - (dayOfWeek - 1));
    start.setHours(0,0,0,0);
  } else if (rangeKey === 'month') {
    start.setDate(1)
  } else if (rangeKey === 'year') {
    start.setMonth(0,1)
    start.setDate(1)
  }
  const end = new Date().getTime()
  const startTs = start.getTime()
  const endTs = end
  const s = filterByRange(sales || [], startTs, endTs)
  const m = sumByProduct(s, products)
  const rows = []
  for (const [pid, stats] of m.entries()) {
    const product = products.find(p => p.id === pid);
    if (!product) continue;

    // Calculate revenue using pack-based pricing
    const units = stats.units;
    const ps = Number(product.pack_size || product.units_per_pack || 1);
    const completePacks = Math.floor(units / ps);
    const remainingUnits = units % ps;

    let revenue = 0;
    
    // Revenue from complete packs
    if (completePacks > 0) {
      const packPrice = Number(product.pack_selling_price || (product.unit_selling_price * ps) || 0);
      revenue += completePacks * packPrice;
    }

    // Revenue from remaining units
    if (remainingUnits > 0) {
      const unitPrice = Number(product.unit_selling_price || 0);
      revenue += remainingUnits * unitPrice;
    }

    console.log('Best/Worst seller calculation:', {
      product: product.name,
      units,
      pack_size: ps,
      completePacks,
      remainingUnits,
      packPrice: product.pack_selling_price,
      unitPrice: product.unit_selling_price,
      revenue
    });

    rows.push({ 
      product, 
      units: stats.units, 
      revenue: revenue, 
      profit: stats.profit, 
      txns: stats.count 
    });
  }
  rows.sort(comparator)
  return rows[0] || null
}

export default function Performance() {
  const { sales } = useSales()
  const { products } = useProducts()
  const loading = (products === undefined || sales === undefined)
  const [range, setRange] = useState('week') // week, month, year, day
  // per-card ranges
  const [bestRange, setBestRange] = useState('day')
  const [worstRange, setWorstRange] = useState('day')
  const [trendMetric, setTrendMetric] = useState('units') // 'units' | 'revenue' | 'profit'
  const [selectedProductId, setSelectedProductId] = useState(null)

  const { startTs, endTs } = useMemo(() => {
    const now = new Date()
    let start = new Date(now)
      // treat 'day' as the last 24 hours
      if (range === 'day') {
        start = new Date(now.getTime() - (24 * 60 * 60 * 1000))
      } else if (range === 'week') {
        // Calendar-week: start from previous Monday
        const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // Sunday=0, treat as 7
        start = new Date(now);
        start.setDate(now.getDate() - (dayOfWeek - 1));
        start.setHours(0,0,0,0);
    } else if (range === 'month') {
      start.setDate(1)
    } else if (range === 'year') {
      start.setMonth(0,1)
      start.setDate(1)
    }
    const end = new Date().getTime()
    return { startTs: start.getTime(), endTs: end }
  }, [range])

  const salesInRange = useMemo(() => filterByRange(sales || [], startTs, endTs), [sales, startTs, endTs])

  const byProduct = useMemo(() => sumByProduct(salesInRange, products), [salesInRange, products])

  // previous period: compute a prior window of same duration
  const { prevStartTs, prevEndTs } = useMemo(() => {
    const len = endTs - startTs
    return { prevStartTs: Math.max(0, startTs - len), prevEndTs: Math.max(0, startTs - 1) }
  }, [startTs, endTs])

  const salesPrev = useMemo(() => filterByRange(sales || [], prevStartTs, prevEndTs), [sales, prevStartTs, prevEndTs])
  const byProductPrev = useMemo(() => sumByProduct(salesPrev, products), [salesPrev, products])

  const rows = useMemo(() => {
    if (!Array.isArray(products)) return [];
    
    const out = []
    for (const [pid, stats] of byProduct.entries()) {
      const prod = products.find(p => String(p.id) === String(pid)) || { id: String(pid), name: String(pid) }
      const prev = byProductPrev.get(pid) || { units: 0, revenue: 0, count: 0 }
      const pctChangeRevenue = prev.revenue ? ((stats.revenue - prev.revenue) / Math.abs(prev.revenue)) * 100 : (stats.revenue ? 100 : 0)
      out.push({ product: prod, units: stats.units, revenue: stats.revenue, profit: stats.profit, txns: stats.count, prevRevenue: prev.revenue || 0, pctChangeRevenue })
    }
    // Rank products by profit (highest profit first)
    return out.sort((a,b) => (b.profit || 0) - (a.profit || 0))
  }, [byProduct, byProductPrev, products])

  const best = rows[0]
  const worst = rows.length ? rows[rows.length-1] : null

  // ranking deltas: compare current rank vs previous rank
  const rankDeltas = useMemo(() => {
    // Previous ranking computed by profit as well so deltas reflect profit movement
    const prevList = Array.from(byProductPrev.entries()).map(([pid, stats]) => ({ pid: String(pid), profit: stats.profit || 0 })).sort((a,b) => (b.profit || 0) - (a.profit || 0))
    const prevRankMap = new Map(prevList.map((r,i) => [String(r.pid), i+1]))
    const deltas = new Map()
    rows.forEach((r, idx) => {
      const key = String(r.product.id)
      const prevRank = prevRankMap.has(key) ? prevRankMap.get(key) : null
      deltas.set(key, { currentRank: idx+1, prevRank })
    })
    return deltas
  }, [byProductPrev, rows])

  // KPIs
  const totalRevenue = rows.reduce((s,r) => s + (r.revenue || 0), 0)
  const totalUnits = rows.reduce((s,r) => s + (r.units || 0), 0)
  const avgPricePerUnit = totalUnits ? totalRevenue / totalUnits : 0
  const totalTxns = salesInRange ? salesInRange.length : 0
  const totalProfit = rows.reduce((s,r) => s + (r.profit || 0), 0)

  // compute previous period profit for percent change
  const rowsPrev = []
  for (const [pid, stats] of byProductPrev.entries()) {
    const prod = products.find(p => p.id === pid) || { id: pid }
    rowsPrev.push({ product: prod, units: stats.units, revenue: stats.revenue, profit: stats.profit, txns: stats.count })
  }
  const totalProfitPrev = rowsPrev.reduce((s,r) => s + (r.profit || 0), 0)
  const pctChangeProfit = totalProfitPrev ? ((totalProfit - totalProfitPrev) / Math.abs(totalProfitPrev)) * 100 : (totalProfit ? 100 : 0)

  // prepare data for recharts (include previous period for comparison)
  const top5Data = rows.slice(0, 5).map(r => ({ name: r.product.name, revenue: r.revenue || 0, prevRevenue: r.prevRevenue || 0, profit: r.profit || 0 }))

  // build totals series for KPI sparklines
  const buildTotalsSeries = (metric = 'revenue') => {
    const days = Math.max(1, Math.ceil((endTs - startTs) / (1000*60*60*24)))
    const arr = new Array(days).fill(0)
    const sStart = startTs
    for (const s of (sales || [])) {
      const t = new Date(s.date).getTime()
      if (t >= startTs && t <= endTs) {
        const idx = Math.min(days-1, Math.floor((t - sStart) / (1000*60*60*24)))
        if (metric === 'revenue') arr[idx] += Number(s.total_price || 0)
        else if (metric === 'units') arr[idx] += Number(s.total_units_sold || 0)
        else if (metric === 'profit') arr[idx] += Number(s.profit || 0)
        else if (metric === 'txns') arr[idx] += 1
      }
    }
    return arr.map((v,i) => ({ day: i+1, value: v }))
  }

  // (Export removed) - Top 5 CSV export was intentionally removed per UX update

  // prepare overlay trend data for top N products: build array of { date, current: val, prev: val }
  const buildOverlaySeries = (productId, metric = 'units') => {
    const days = Math.max(1, Math.ceil((endTs - startTs) / (1000*60*60*24)))
    const current = new Array(days).fill(0)
    const prev = new Array(days).fill(0)
    const sStart = startTs
    const prevStart = prevStartTs
    for (const s of (sales || [])) {
      const t = new Date(s.date).getTime()
      if (String(s.product_id) !== String(productId)) continue
      // select metric value for this sale
      let val = 0
      if (metric === 'units') val = Number(s.total_units_sold || 0)
      else if (metric === 'revenue') val = Number(s.total_price || 0)
      else if (metric === 'profit') val = Number(s.profit || 0)

      if (t >= startTs && t <= endTs) {
        const idx = Math.min(days-1, Math.floor((t - sStart) / (1000*60*60*24)))
        current[idx] += val
      }
      if (t >= prevStartTs && t <= prevEndTs) {
        const idx = Math.min(days-1, Math.floor((t - prevStart) / (1000*60*60*24)))
        prev[idx] += val
      }
    }
    // transform into series
    const series = []
    for (let i = 0; i < days; i++) {
      series.push({ day: i+1, current: current[i], prev: prev[i] })
    }
    return series
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div>
          <LoadingSkeleton count={4} />
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Performance</h1>
          <p className="text-sm text-gray-400">Top/bottom sellers and product performance metrics for the selected period.</p>
        </div>
        <div className="text-sm text-gray-400 self-end sm:self-auto">As of: {new Date().toLocaleString()}</div>
      </div>

      <div className="flex items-start gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 items-stretch">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex flex-col justify-between">
            <div>
              <div className="text-xs text-gray-400">Revenue</div>
              <div className="text-2xl font-semibold text-white">{formatCurrency(totalRevenue)}</div>
              <div className="text-xs text-gray-400 mt-2">{pctChangeProfit >= 0 ? '▲' : '▼'} {pctChangeProfit.toFixed(1)}% vs prev</div>
            </div>
            <div className="mt-2" style={{ height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildTotalsSeries('revenue')}>
                  <Line dataKey="value" stroke="#7C3AED" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex flex-col justify-between">
              <div>
                <div className="text-xs text-gray-400">Units Sold</div>
                <div className="text-2xl font-semibold text-white">{totalUnits}</div>
              </div>
              <div className="mt-2" style={{ height: 36 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buildTotalsSeries('units')}>
                    <Line dataKey="value" stroke="#06B6D4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex flex-col justify-between">
            <div>
              <div className="text-xs text-gray-400">Transactions</div>
              <div className="text-2xl font-semibold text-white">{totalTxns}</div>
            </div>
            <div className="mt-2" style={{ height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildTotalsSeries('txns')}>
                  <Line dataKey="value" stroke="#F59E0B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 h-full flex flex-col justify-between">
            <div>
              <div className="text-xs text-gray-400">Profit</div>
              <div className="text-2xl font-semibold text-white">{formatCurrency(totalProfit)}</div>
              <div className={`text-xs text-gray-400 mt-2 ${pctChangeProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>{pctChangeProfit >= 0 ? '▲' : '▼'} {pctChangeProfit.toFixed(1)}%</div>
            </div>
            <div className="mt-2" style={{ height: 36 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={buildTotalsSeries('profit')}>
                  <Line dataKey="value" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
  </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-white">Best seller</h3>
            <div className="flex items-center gap-2">
              <select value={bestRange} onChange={e => setBestRange(e.target.value)} className={`text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white ${bestRange === range ? 'bg-blue-600' : ''}`}>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          {(() => {
            const b = topByRange(sales, products, bestRange)
            if (!b) return <div className="mt-3 text-sm text-gray-400">No data</div>
            return (
                <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-green-900/30 flex items-center justify-center text-green-400 text-xl"><i className="fas fa-arrow-up"></i></div>
                <div>
                  <div className="text-lg font-semibold text-white">{b.product.name}</div>
                  <div className="text-sm text-gray-400">{b.units} unit(s) - {formatCurrency(b.revenue)}</div>
                </div>
              </div>
            )
          })()}
        </div>

  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <h3 className="text-sm font-medium text-white">Worst seller</h3>
            <div className="flex items-center gap-2">
              <select value={worstRange} onChange={e => setWorstRange(e.target.value)} className={`text-xs px-2 py-1 rounded bg-gray-700 border border-gray-600 text-white ${worstRange === range ? 'bg-blue-600' : ''}`}>
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="year">Year</option>
              </select>
            </div>
          </div>
          {(() => {
            const w = topByRange(sales, products, worstRange, (a,b) => a.revenue - b.revenue)
            if (!w) return <div className="mt-3 text-sm text-gray-400">No data</div>
            return (
                <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-red-900/30 flex items-center justify-center text-red-400 text-xl"><i className="fas fa-arrow-down"></i></div>
                <div>
                  <div className="text-lg font-semibold text-white">{w.product.name}</div>
                  <div className="text-sm text-gray-400">{w.units} unit(s) - {formatCurrency(w.revenue)}</div>
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-yellow-900/30 rounded flex items-center justify-center text-yellow-400"><i className="fas fa-trophy"></i></div>
              <div className="w-full">
                <h3 className="text-lg font-semibold text-white">Top 5 - {range === 'day' ? 'Day' : range === 'week' ? 'This week' : range === 'month' ? 'Month' : 'Year'}</h3>
                <div className="text-xs text-gray-400">Executive ranking of highest revenue products</div>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center gap-2">
              <button onClick={() => setRange('day')} className={`px-3 py-1 text-xs rounded ${range === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white border border-gray-600'}`}>Day</button>
              <button onClick={() => setRange('week')} className={`px-3 py-1 text-xs rounded ${range === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white border border-gray-600'}`}>Week</button>
              <button onClick={() => setRange('month')} className={`px-3 py-1 text-xs rounded ${range === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white border border-gray-600'}`}>Month</button>
              <button onClick={() => setRange('year')} className={`px-3 py-1 text-xs rounded ${range === 'year' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white border border-gray-600'}`}>Year</button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {rows.slice(0,5).map((r, i) => (
              <div key={r.product.id} onClick={() => setSelectedProductId(r.product.id)} className={`p-4 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors ${selectedProductId === r.product.id ? 'ring-2 ring-blue-400 bg-gray-700' : 'bg-gray-800'}`} style={{ cursor: 'pointer' }}>
                <div className="flex gap-4 w-full">
                  <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full text-white font-bold`} style={{ background: i === 0 ? 'linear-gradient(90deg,#FFD54A,#FFC107)' : (i===1 ? 'linear-gradient(90deg,#7C3AED,#06B6D4)' : 'linear-gradient(90deg,#06B6D4,#7C3AED)') }}>
                    {i === 0 ? <i className="fas fa-crown text-yellow-700"></i> : (i+1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <div className="text-sm font-semibold text-white mb-1">{r.product.name}</div>
                        <div className="text-xs text-gray-400">{r.product.category || ''}</div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-lg font-semibold text-white">{formatCurrency(r.revenue)}</div>
                        <div className={`text-xs font-medium ${r.pctChangeRevenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>{r.pctChangeRevenue >= 0 ? '+' : ''}{r.pctChangeRevenue.toFixed(0)}%</div>
                      </div>
                    </div>
                    <div className="mt-4 w-full">
                      <ResponsiveContainer width="100%" height={36}>
                        <LineChart data={buildOverlaySeries(r.product.id, 'revenue')} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                          <Line dataKey="current" stroke="#7C3AED" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Trend comparison (top 3)</h3>
            <div className="flex items-center gap-3">
              <div className="text-xs text-gray-400">Metric</div>
              <select value={trendMetric} onChange={e => setTrendMetric(e.target.value)} className="text-xs bg-gray-700 border border-gray-600 text-white px-2 py-1 rounded">
                <option value="units">Units</option>
                <option value="revenue">Revenue</option>
                <option value="profit">Profit</option>
              </select>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            {rows.slice(0,3).map((r, idx) => {
              const series = buildOverlaySeries(r.product.id, trendMetric)
              return (
                <div key={r.product.id} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-white">{r.product.name}</div>
                      <div className="text-sm font-semibold text-white">{trendMetric === 'revenue' ? formatCurrency(r.revenue) : (trendMetric === 'profit' ? formatCurrency(r.profit || 0) : r.units)}</div>
                    </div>
                    <div style={{ height: 64 }} className="mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={series} margin={{ top: 6, right: 8, left: 0, bottom: 6 }}>
                          <defs>
                            <linearGradient id={`lineGrad${idx}`} x1="0" x2="0" y1="0" y2="1">
                              <stop offset="0%" stopColor="#6D28D9" stopOpacity={0.6} />
                              <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.08} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                          <XAxis dataKey="day" hide />
                          <YAxis hide />
                          <Tooltip formatter={(v, name) => [Number(v).toFixed(0), name === 'current' ? 'Current' : 'Previous']} />
                          <Line type="monotone" dataKey="prev" stroke="#9CA3AF" strokeWidth={2} dot={false} name="Previous" />
                          <Line type="monotone" dataKey="current" stroke="#0EA5A4" strokeWidth={2} dot={false} name="Current" fillOpacity={0.2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-white">Product performance</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-gray-300 uppercase bg-gray-700">
                <th className="px-3 py-2">Rank</th>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Units</th>
                <th className="px-3 py-2">Revenue</th>
                <th className="px-3 py-2">Profit</th>
                <th className="px-3 py-2" title="Number of sales transactions">Txns <span className="ml-1" title="Number of sales transactions"><i className="fas fa-info-circle"></i></span></th>
                <th className="px-3 py-2" title="Average revenue per transaction">Avg / txn <span className="ml-1" title="Average revenue per transaction"><i className="fas fa-info-circle"></i></span></th>
                <th className="px-3 py-2">Change</th>
                <th className="px-3 py-2">Trend</th>
                <th className="px-3 py-2">Rank Δ</th>
              </tr>
            </thead>
            <tbody>
        {rows.map((r, idx) => (
          <tr key={r.product.id} className={`border-t border-gray-600 hover:bg-gray-700 transition-colors ${selectedProductId === r.product.id ? 'bg-gray-700' : 'bg-gray-800'}`}>
            <td className="px-3 py-2 text-center">
              {idx === 0 ? <span title="#1"><i className="fas fa-crown text-yellow-500 text-lg"></i></span>
                : idx === 1 ? <span title="#2"><i className="fas fa-medal text-gray-400 text-lg"></i></span>
                : idx === 2 ? <span title="#3"><i className="fas fa-medal text-orange-400 text-lg"></i></span>
                : <span className="font-bold text-white">{idx+1}</span>}
            </td>
            <td className="px-3 py-2">
              <div className="font-medium text-white">{r.product.name}</div>
              <div className="text-xs text-gray-400">{r.product.category || ''}</div>
            </td>
            <td className="px-3 py-2 text-white">{r.units}</td>
            <td className="px-3 py-2 text-white">{formatCurrency(r.revenue)}</td>
            <td className="px-3 py-2 text-white">{formatCurrency(r.profit || 0)}</td>
            <td className="px-3 py-2 text-white">{r.txns}</td>
            <td className="px-3 py-2 text-white">{r.txns ? formatCurrency(r.revenue / r.txns) : '-'}</td>
            <td className="px-3 py-2"><span className={`font-medium ${r.pctChangeRevenue >= 0 ? 'text-green-400' : 'text-red-400'}`}>{r.pctChangeRevenue >= 0 ? '+' : ''}{r.pctChangeRevenue.toFixed(1)}%</span></td>
            <td className="px-3 py-2 w-40">
              <div style={{ height: 40 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={buildOverlaySeries(r.product.id, 'units').map(x => ({ day: x.day, current: x.current }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Line dataKey="current" stroke="#06B6D4" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </td>
            <td className="px-3 py-2 text-center">
              {(() => {
                const d = rankDeltas.get(String(r.product.id)) || {}
                if (!d.prevRank) return <span title="No previous data">-</span>
                const delta = (d.prevRank - d.currentRank)
                if (delta > 0) return <span className="font-bold text-green-400 flex items-center gap-1" title={`Up ${delta} from previous rank`}><i className="fas fa-arrow-up"></i>+{delta}</span>
                if (delta < 0) return <span className="font-bold text-red-400 flex items-center gap-1" title={`Down ${Math.abs(delta)} from previous rank`}><i className="fas fa-arrow-down"></i>-{Math.abs(delta)}</span>
                return <span className="font-bold text-gray-400" title="No change">=</span>
              })()}
            </td>
          </tr>
        ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

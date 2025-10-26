import React, { useState, useEffect, useCallback } from 'react'
import { useProducts } from '../context/ProductContext'
import ImageUpload from './ImageUpload'
import { computeInitialUnits, computeCostPerUnit } from '../utils/productFormUtils'

export default function ProductForm({ onClose, initial, submitRef = null, hideFooter = false, formId = undefined }) {
  const { addProduct, updateProduct } = useProducts()
  const [form, setForm] = useState(initial || { name: '', category: '', pack_size: 12, cost_per_unit: '', cost_per_pack: '', selling_per_unit: '', selling_per_pack: '', image: '', initial_packs: 0, initial_units: '', low_stock_threshold: 0 })

  useEffect(() => { if (initial) setForm(initial) }, [initial])

  // Auto-calc initial_units when pack_size or initial_packs change
  // Only auto-fill when the user has not manually overridden the initial_units (we treat empty string as "not set").
  const [initialUnitsManual, setInitialUnitsManual] = useState(false)
  useEffect(() => {
    const ps = Number(form.pack_size || form.carton_size || 1)
    const packs = Number(form.initial_packs || form.initial_cartons || 0)
    const autoUnits = computeInitialUnits(ps, packs)
    const isEmpty = form.initial_units === '' || form.initial_units === null || typeof form.initial_units === 'undefined'
    if (!initialUnitsManual && isEmpty) {
      setForm(prev => ({ ...prev, initial_units: autoUnits }))
    }
  }, [form.pack_size, form.initial_packs, form.carton_size, form.initial_cartons, initialUnitsManual])

  // Auto-calc cost_per_unit when cost_per_pack or pack_size change
  useEffect(() => {
  const ps = Number(form.pack_size || form.carton_size || 1)
  const cpp = Number(form.cost_per_pack || form.cost_per_carton || 0)
    const autoCpu = computeCostPerUnit(cpp, ps)
    // only update if there's a meaningful value
    if (cpp > 0 && String(form.cost_per_unit) !== String(autoCpu)) {
      setForm(prev => ({ ...prev, cost_per_unit: autoCpu }))
    }
  }, [form.cost_per_pack, form.cost_per_carton, form.pack_size, form.carton_size])

  const submit = useCallback((e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault()
    const p = { ...form }
    // auto calculate missing fields (prefer pack fields, fall back to legacy carton fields)
    const ps = Number(p.pack_size || p.carton_size || 1)
    if (!p.cost_per_unit && (p.cost_per_pack || p.cost_per_carton)) p.cost_per_unit = (Number(p.cost_per_pack || p.cost_per_carton) / ps).toFixed(2)
    if (!p.cost_per_pack && p.cost_per_unit) p.cost_per_pack = (Number(p.cost_per_unit) * ps).toFixed(2)
    if (!p.selling_per_unit && (p.selling_per_pack || p.selling_per_carton)) p.selling_per_unit = (Number(p.selling_per_pack || p.selling_per_carton) / ps).toFixed(2)
    if (!p.selling_per_pack && p.selling_per_unit) p.selling_per_pack = (Number(p.selling_per_unit) * ps).toFixed(2)

    const total_units_in_stock = (Number(p.initial_packs || p.initial_cartons || 0) * ps) + Number(p.initial_units || 0)
  const payload = { 
      name: p.name, 
      category: p.category, 
      image: p.image, 
      pack_size: Number(p.pack_size || p.carton_size || 1), 
      cost_per_unit: Number(p.cost_per_unit || 0), 
      cost_per_pack: Number(p.cost_per_pack || p.cost_per_carton || 0), 
      selling_per_unit: Number(p.selling_per_unit || 0), 
      selling_per_pack: Number(p.selling_per_pack || p.selling_per_carton || 0), 
      total_units_in_stock, 
      low_stock_threshold: Number(p.low_stock_threshold || 0),
      // Pass through batch-related fields
      initial_packs: Number(p.initial_packs || 0),
      initial_units: Number(p.initial_units || 0),
      initial_cartons: Number(p.initial_cartons || 0)
  }
    if (initial?.id) updateProduct(initial.id, payload)
    else addProduct(payload)
    onClose?.()
  }, [form, initial, addProduct, updateProduct, onClose])

  // expose submit to parent via ref so parent modal can trigger the save from its footer
  React.useEffect(() => {
    if (!submitRef) return
    try { submitRef.current = submit } catch (err) {}
    return () => { try { submitRef.current = null } catch (err) {} }
  }, [submitRef, submit])

  const [showCalc, setShowCalc] = useState(false)
  const packSize = Number(form.pack_size || 1)
  const computed = {
    costPerUnitFromPack: form.cost_per_pack ? (Number(form.cost_per_pack) / (packSize || 1)).toFixed(2) : null,
    costPerPackFromUnit: form.cost_per_unit ? (Number(form.cost_per_unit) * (packSize || 1)).toFixed(2) : null,
    sellPerUnitFromPack: form.selling_per_pack ? (Number(form.selling_per_pack) / (packSize || 1)).toFixed(2) : null,
    sellPerPackFromUnit: form.selling_per_unit ? (Number(form.selling_per_unit) * (packSize || 1)).toFixed(2) : null
  }

  return (
    <form id={formId} onSubmit={submit} className="sb-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input required placeholder="Product name (e.g., Indomie Noodles)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded col-span-1 md:col-span-2 focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
        <input placeholder="Category (e.g., Food)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />

  {/* Hierarchical: pack size -> initial packs -> initial units (auto) */}
          <div>
              <label htmlFor="product-pack_size" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Pack size (units)</label>
              <input id="product-pack_size" title="Pack size (units) - e.g., 12" type="number" placeholder="Pack size (units) - e.g., 12" value={form.pack_size} onChange={e => setForm({ ...form, pack_size: Number(e.target.value) })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
          </div>
          <div>
            <label htmlFor="product-initial_packs" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Initial packs (optional)</label>
            <input id="product-initial_packs" title="Initial packs (optional)" type="number" placeholder="Initial packs (optional)" value={form.initial_packs} onChange={e => setForm({ ...form, initial_packs: Number(e.target.value) })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
          </div>
          <div>
            <label htmlFor="product-initial_units" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Initial units</label>
            <input id="product-initial_units" title="Initial units (calculated)" type="number" placeholder="Initial units (calculated)" value={form.initial_units} onChange={e => { setInitialUnitsManual(true); setForm(prev => ({ ...prev, initial_units: e.target.value })) }} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
            <div className="text-xs text-gray-500 mt-1">
            {!initialUnitsManual ? (<span>Calculated from packs × pack size</span>) : (<span className="italic">Manual override</span>)}
          </div>
        </div>

          <div>
            <label htmlFor="product-low_stock_threshold" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Low stock threshold (units)</label>
            <input id="product-low_stock_threshold" title="Low stock threshold" type="number" placeholder="0 (disabled)" value={form.low_stock_threshold} onChange={e => setForm(prev => ({ ...prev, low_stock_threshold: Number(e.target.value) }))} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">When product stock is ≤ this value, it will show a <em>Low stock</em> badge.</div>
          </div>

  {/* Costs: cost per pack -> cost per unit (auto) */}
  <input placeholder="Cost per pack (₦) - e.g., 1440.00" value={form.cost_per_pack} onChange={e => setForm({ ...form, cost_per_pack: e.target.value })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />
        <div className="flex items-center gap-2">
          <input placeholder="Cost per unit (₦) - e.g., 120.00" value={form.cost_per_unit} onChange={e => setForm({ ...form, cost_per_unit: e.target.value })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex-1" />
          <button type="button" onClick={() => setShowCalc(s => !s)} className="text-xs text-gray-500 px-2">Calculate</button>
        </div>

        {/* Selling prices */}
  <input placeholder="Selling per pack (₦) - e.g., 1800.00" value={form.selling_per_pack} onChange={e => setForm({ ...form, selling_per_pack: e.target.value })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />
  <input placeholder="Selling per unit (₦) - e.g., 150.00" value={form.selling_per_unit} onChange={e => setForm({ ...form, selling_per_unit: e.target.value })} className="sb-transition-base p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded" />

        {showCalc && (
          <div className="col-span-2 bg-gray-800/50 border border-gray-700 p-3 rounded text-sm text-gray-200">
            <div>Pack size: <strong>{packSize}</strong> unit(s)</div>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-gray-400">From cost per pack</div>
                <div className="font-medium">Cost per unit: {computed.costPerUnitFromPack ?? '-'} </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">From cost per unit</div>
                <div className="font-medium">Cost per pack: {computed.costPerPackFromUnit ?? '-'} </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">From selling per pack</div>
                <div className="font-medium">Selling per unit: {computed.sellPerUnitFromPack ?? '-'} </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">From selling per unit</div>
                <div className="font-medium">Selling per pack: {computed.sellPerPackFromUnit ?? '-'} </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {!hideFooter ? (
        <div className="mt-3 flex gap-2">
          <button type="submit" className="sb-transition-base px-3 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 bg-gradient-to-r from-supabase-600 to-supabase-500 text-white">Save</button>
          <button type="button" onClick={() => onClose?.()} className="sb-transition-base px-3 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">Cancel</button>
        </div>
      ) : null}
    </form>
  )
}

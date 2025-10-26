import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { useProducts } from '../context/ProductContext'

export default function AddBatchModal({ product, onClose }) {
  const { addBatch } = useProducts()
  const [packs, setPacks] = useState(0)
  const [units, setUnits] = useState(0)
  const [cost, setCost] = useState(0)
  const [costType, setCostType] = useState('per_pack')
  const [costPerUnit, setCostPerUnit] = useState(null)
  const [costPerPack, setCostPerPack] = useState(null)
  const [sellingPerUnit, setSellingPerUnit] = useState(null)
  const [sellingPerPack, setSellingPerPack] = useState(null)
  const [date, setDate] = useState(new Date().toISOString().slice(0,10))

  function submit(e) {
    e.preventDefault()
    // prefer packs; product context will accept legacy cartons as needed
    const payload = { packs, units, date: new Date(date).toISOString() }
    if (costPerUnit !== null && costPerUnit !== undefined) payload.cost_per_unit = Number(costPerUnit)
    if (costPerPack !== null && costPerPack !== undefined) payload.cost_per_pack = Number(costPerPack)
  if (sellingPerUnit !== null && sellingPerUnit !== undefined) payload.selling_per_unit = Number(sellingPerUnit)
  if (sellingPerPack !== null && sellingPerPack !== undefined) payload.selling_per_pack = Number(sellingPerPack)
    addBatch(product.id, payload)
    onClose?.()
  }

  const content = (
    <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modern-card max-w-md w-full relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100">
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <i className="fas fa-layer-group text-green-500"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Batch for {product.name}</h3>
          </div>
        </div>

  <form onSubmit={submit} className="px-6 py-4 pb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Packs</label>
              <input type="number" min="0" value={packs} onChange={e => setPacks(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Units</label>
              <input type="number" min="0" value={units} onChange={e => setUnits(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Cost</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="0.01" value={costPerUnit ?? ''} onChange={e => setCostPerUnit(e.target.value === '' ? null : Number(e.target.value))} placeholder="Cost per unit" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input type="number" min="0" step="0.01" value={costPerPack ?? ''} onChange={e => setCostPerPack(e.target.value === '' ? null : Number(e.target.value))} placeholder="Cost per pack" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Selling price</label>
              <div className="flex gap-2">
                <input type="number" min="0" step="0.01" value={sellingPerUnit ?? ''} onChange={e => setSellingPerUnit(e.target.value === '' ? null : Number(e.target.value))} placeholder="Selling per unit" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                <input type="number" min="0" step="0.01" value={sellingPerPack ?? ''} onChange={e => setSellingPerPack(e.target.value === '' ? null : Number(e.target.value))} placeholder="Selling per pack" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
            </div>
          </div>
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => onClose?.()} className="sb-transition-base px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="sb-transition-base px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-supabase-600 to-supabase-500 hover:from-supabase-500 hover:to-supabase-400 rounded-lg">Add Batch</button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

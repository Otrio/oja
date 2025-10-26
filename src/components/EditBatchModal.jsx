import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useProducts } from '../context/ProductContext'
import ConfirmationModal from './ConfirmationModal'

export default function EditBatchModal({ product, batch, onClose }) {
  const { updateBatch, deleteBatch } = useProducts()
  const [packs, setPacks] = useState((batch?.packs ?? batch?.cartons) || 0)
  const [units, setUnits] = useState(batch?.units || 0)
  const [costPerUnit, setCostPerUnit] = useState(batch?.cost_per_unit || 0)
  const [costPerPack, setCostPerPack] = useState(batch?.cost_per_pack || 0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [date, setDate] = useState(batch?.createdAt ? new Date(batch.createdAt).toISOString().slice(0,10) : new Date().toISOString().slice(0,10))

  useEffect(() => {
    setPacks((batch?.packs ?? batch?.cartons) || 0)
    setUnits(batch?.units || 0)
    setCostPerUnit(batch?.cost_per_unit || 0)
    setCostPerPack(batch?.cost_per_pack || 0)
  }, [batch])

  function submit(e) {
    e.preventDefault()
    const packSize = Number(product.pack_size || product.units_per_pack || product.carton_size || product.units_per_carton || 1)
    const totalUnits = Math.round(Number(packs) * packSize + Number(units))
    console.log('Calculating total units:', { packs, packSize, units, totalUnits })
    updateBatch(product.id, batch.id, { 
      packs: Number(packs), 
      cartons: Number(packs), 
      units: Number(units), 
      cost_per_unit: Number(costPerUnit), 
      cost_per_pack: Number(costPerPack), 
      units_added: totalUnits,
      remaining_units: totalUnits,
      created_at: new Date(date).toISOString()
    })
    onClose?.()
  }

  function confirmAndDelete() {
    deleteBatch(product.id, batch.id)
    setConfirmDelete(false)
    onClose?.()
  }

  const content = (
    <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modern-card bg-white dark:bg-gray-900 rounded-xl shadow-sm max-w-md w-full relative border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100">
              <i className="fas fa-times"></i>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-layer-group text-green-500"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Batch for {product.name}</h3>
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
                <label className="block text-sm text-gray-700 mb-2">Cost per unit</label>
                <input type="number" min="0" step="0.01" value={costPerUnit} onChange={e => setCostPerUnit(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Cost per pack</label>
                <input type="number" min="0" step="0.01" value={costPerPack} onChange={e => setCostPerPack(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-2">Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setConfirmDelete(true)} className="sb-transition-base px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete</button>
              <button type="button" onClick={() => onClose?.()} className="sb-transition-base px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">Cancel</button>
              <button type="submit" className="sb-transition-base px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-supabase-600 to-supabase-500 hover:from-supabase-500 hover:to-supabase-400 rounded-lg">Save</button>
            </div>
          </form>
      </div>
    </div>
  )

  return (
    <>
      {createPortal(content, document.body)}
      {confirmDelete && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setConfirmDelete(false)}
          onConfirm={confirmAndDelete}
          title="Delete Batch"
          message={`Are you sure you want to delete this batch for "${product.name}"? This will remove the batch and adjust stock accordingly.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}
    </>
  )
}

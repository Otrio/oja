import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useProducts } from '../context/ProductContext'

export default function EditPriceModal({ product, onClose }) {
  const { updateProduct } = useProducts()
  const [sellingPerUnit, setSellingPerUnit] = useState(product?.selling_per_unit ?? '')
  const [sellingPerPack, setSellingPerPack] = useState(product?.selling_per_pack ?? '')
  const [packSize, setPackSize] = useState(product?.pack_size ?? product?.carton_size ?? 1)

  useEffect(() => {
    setSellingPerUnit(product?.selling_per_unit ?? '')
    setSellingPerPack(product?.selling_per_pack ?? '')
    setPackSize(product?.pack_size ?? product?.carton_size ?? 1)
  }, [product])

  function submit(e) {
    e?.preventDefault?.()
    updateProduct(product.id, { selling_per_unit: Number(sellingPerUnit || 0), selling_per_pack: Number(sellingPerPack || 0), pack_size: Number(packSize || 1) })
    onClose?.()
  }

  const content = (
    <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modern-card max-w-md w-full relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-tag text-yellow-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Selling Price for {product.name}</h3>
          </div>
          <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={submit} className="px-6 py-4 pb-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Selling per pack</label>
              <input type="number" min="0" step="0.01" value={sellingPerPack} onChange={e => setSellingPerPack(e.target.value)} className="sb-transition-base w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Pack size (units)</label>
              <input type="number" min="1" step="1" value={packSize} onChange={e => setPackSize(Number(e.target.value))} className="sb-transition-base w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Selling per unit</label>
              <input type="number" min="0" step="0.01" value={sellingPerUnit} onChange={e => setSellingPerUnit(e.target.value)} className="sb-transition-base w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-supabase-500/20" />
            </div>
          </div>

          <div className="py-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex gap-3 justify-end">
            <button type="button" onClick={() => onClose?.()} className="sb-transition-base px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">Cancel</button>
            <button type="submit" className="sb-transition-base px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-supabase-600 to-supabase-500 rounded-lg">Save</button>
          </div>
        </form>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

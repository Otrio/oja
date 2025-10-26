import React, { useState, useEffect } from 'react'
import { usePurchases } from '../context/PurchaseContext'

export default function EditPurchaseModal({ isOpen, onClose, purchase, onSave }) {
  const { updatePurchase } = usePurchases()

  const [form, setForm] = useState({
    product_name: '',
    type: '',
    cost: '',
    date: new Date().toISOString().slice(0,10),
    payment_method: '',
    notes: '',
    description: '',
    supplier: ''
  })

  useEffect(() => {
    if (!purchase) return
    setForm({
      product_name: purchase.product_name || '',
      type: purchase.type || '',
      cost: purchase.total_price || purchase.cost || '',
      date: purchase.date ? purchase.date.slice(0,10) : new Date().toISOString().slice(0,10),
      payment_method: purchase.payment_method || '',
      notes: purchase.notes || '',
      description: purchase.description || purchase.notes || '',
      supplier: purchase.supplier || ''
    })
  }, [purchase])

  if (!isOpen) return null

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault()

    // require either an item description or selected product id
    if (!form.product_name) {
      alert('Please enter an item description')
      return
    }

    // ensure cost is provided
    if (!form.cost || Number(form.cost) <= 0) {
      alert('Please enter a valid cost')
      return
    }

    try {
      // Ensure purchases do not affect inventory by default (this modal is for tracking expenses)
      const payload = {
        ...form,
        total_price: Number(form.cost),
        for_inventory: false,
        notes: form.description || form.notes
      }

      await updatePurchase(purchase.id, payload)
      onSave?.()
      onClose?.()
    } catch (err) {
      console.error('Failed to update purchase', err)
      alert('Failed to update purchase: ' + (err?.message || String(err)))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-lg max-w-2xl w-full relative text-white">
        <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-gray-800 text-gray-200 flex items-center justify-center hover:bg-gray-700">
          <i className="fas fa-times"></i>
        </button>
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-yellow-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Edit Purchase</h3>
          </div>
        </div>

        <form onSubmit={submit} className="px-6 py-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Item / Description</label>
              <input aria-label="Item" title="Item or description" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} placeholder="e.g. Delivery fee, Packaging materials" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label htmlFor="purchase-type" className="block text-sm font-medium text-gray-200 mb-2">Purchase type (manual)</label>
              <input id="purchase-type" aria-label="Type" title="Purchase type description" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} placeholder="e.g. service, materials, shipping" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
              <textarea aria-label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Optional description or details about the purchase" rows={3} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Supplier</label>
              <input aria-label="Supplier" title="Supplier" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="e.g. Vendor name" className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Payment method</label>
              <select value={form.payment_method || ''} onChange={e => setForm({ ...form, payment_method: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Price</label>
              <input aria-label="Price" type="number" step="0.01" value={form.cost} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Price (e.g., 1440.00)" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Date</label>
              <input aria-label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="py-4 bg-gray-800 rounded-b-xl flex gap-3 justify-end mt-4">
            <button type="button" onClick={() => onClose?.()} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-700 rounded-lg hover:bg-gray-600">Cancel</button>
            <button type="button" onClick={submit} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { useProducts } from '../context/ProductContext'
import { useSales } from '../context/SaleContext'

export default function EditSaleModal({ isOpen, onClose, sale, onSave }) {
  const { products } = useProducts()
  const { updateSale } = useSales()

  const [formData, setFormData] = useState({
    product_id: '',
    packs: 0,
    units: 0,
    price_per_unit: 0,
    price_per_pack: 0,
    date: ''
  })

  useEffect(() => {
    if (sale) {
      setFormData({
        product_id: sale.product_id || '',
        packs: Number(sale.packs ?? sale.cartons ?? 0),
        units: Number(sale.units ?? 0),
        price_per_unit: Number(sale.price_per_unit ?? 0) || 0,
        price_per_pack: Number(sale.price_per_pack ?? sale.price_per_pack ?? 0) || 0,
        date: sale.date || new Date().toISOString().slice(0, 10)
      })
    }
  }, [sale])

  // When the selected product changes, seed price fields from the product's current selling prices
  useEffect(() => {
    const pid = formData.product_id
    if (!pid) return
    const prod = products.find(p => p.id === (typeof pid === 'string' ? Number(pid) : pid))
    if (!prod) return
    const ps = Number(prod.pack_size || prod.carton_size || 1) || 1
    setFormData(current => {
      const next = { ...current }
      // only seed when the current values are falsy (0 or not set)
      if (!next.price_per_unit || Number(next.price_per_unit) <= 0) {
        if (typeof prod.selling_per_unit !== 'undefined' && prod.selling_per_unit !== null && prod.selling_per_unit !== '') {
          next.price_per_unit = Number(prod.selling_per_unit)
        } else if (typeof prod.selling_per_pack !== 'undefined' && prod.selling_per_pack !== null && prod.selling_per_pack !== '') {
          next.price_per_unit = Number(prod.selling_per_pack) / ps
        }
      }
      if (!next.price_per_pack || Number(next.price_per_pack) <= 0) {
        if (typeof prod.selling_per_pack !== 'undefined' && prod.selling_per_pack !== null && prod.selling_per_pack !== '') {
          next.price_per_pack = Number(prod.selling_per_pack)
        } else if (typeof prod.selling_per_unit !== 'undefined' && prod.selling_per_unit !== null && prod.selling_per_unit !== '') {
          next.price_per_pack = Number(prod.selling_per_unit) * ps
        }
      }
      return next
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.product_id, products])

  const handleSubmit = (e) => {
    e.preventDefault()

    const product = products.find(p => p.id === formData.product_id)
    const packSize = product?.pack_size || product?.carton_size || 1
    const qtyPacks = Number(formData.packs || 0)
    const qtyUnits = Number(formData.units || 0)
    const totalUnits = Math.round(qtyPacks * packSize + qtyUnits)

    if (!formData.product_id) {
      alert('Please select a product')
      return
    }
    // determine price per unit: prefer explicit unit price, else derive from pack price
    const ppu = Number(formData.price_per_unit) > 0 ? Number(formData.price_per_unit) : (Number(formData.price_per_pack) > 0 ? (Number(formData.price_per_pack) / packSize) : 0)
    if (!ppu || ppu <= 0) {
      alert('Please enter a valid price per unit or per pack')
      return
    }
    if (!formData.date) {
      alert('Please select a date')
      return
    }
    if (!totalUnits || totalUnits <= 0) {
      alert('Please enter a valid quantity (packs/units)')
      return
    }

    try {
      const totalPrice = ppu * totalUnits
      updateSale(sale.id, {
        product_id: formData.product_id,
        packs: qtyPacks,
        cartons: qtyPacks, // legacy field kept for compatibility
        units: qtyUnits,
        total_price: totalPrice,
        price_per_unit: ppu,
        price_per_pack: Number(formData.price_per_pack) || (ppu * packSize),
        date: formData.date
      })

      onSave()
      onClose()
    } catch (err) {
      alert(err?.message || 'Failed to update sale')
    }
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl shadow-lg max-w-2xl w-full relative text-white">
        <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-gray-800 text-gray-200 flex items-center justify-center hover:bg-gray-700">
          <i className="fas fa-times"></i>
        </button>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-cash-register text-green-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Edit Sale</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Packs</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    aria-label="Packs"
                    value={formData.packs}
                    onChange={(e) => setFormData({ ...formData, packs: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter number of packs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Units</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    title="Units (quantity in units)"
                    aria-label="Units"
                    value={formData.units}
                    onChange={(e) => setFormData({ ...formData, units: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter number of units"
                  />
                </div>
              </div>
        </div>

  {/* Body */}
  <form onSubmit={handleSubmit} className="px-6 py-4 pb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Product</label>
            <select
              aria-label="Product"
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select a product</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.category})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Price per unit</label>
              <input
                title="Price per unit (e.g., 5.00)"
                aria-label="Price per unit"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Price per unit (e.g., 5.00)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Price per pack</label>
              <input
                title="Price per pack (e.g., 150.00)"
                aria-label="Price per pack"
                type="number"
                step="0.01"
                min="0"
                value={formData.price_per_pack}
                onChange={(e) => setFormData({ ...formData, price_per_pack: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Price per pack (e.g., 150.00)"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500 [color-scheme:dark]"
              aria-label="Date"
              required
            />
          </div>
        {/* Footer inside form so submit works via type="submit" */}
        <div className="py-4 bg-gray-800 rounded-b-xl flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-700 rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Save Changes
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

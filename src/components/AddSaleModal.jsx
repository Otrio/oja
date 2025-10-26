import React, { useState, useEffect } from 'react'
import { useSales } from '../context/SaleContext'
import { useProducts } from '../context/ProductContext'

export default function AddSaleModal({ onClose }) {
  const { addSale } = useSales()
  const { products } = useProducts()
  const [form, setForm] = useState({ 
    product_id: null, 
    packs: 0, 
    units: 0, 
    price_per_unit: 0, 
    price_per_pack: 0, 
    date: new Date().toISOString().slice(0,10) 
  })
  const [error, setError] = useState(null)

  // When product changes, seed price fields from the product's current selling prices
  useEffect(() => {
    console.log('useEffect triggered - product_id:', form.product_id, 'products length:', products.length); // Debug log
    
    if (!form.product_id || !products.length) return
    
    const prod = products.find(p => p.id === form.product_id)
    if (!prod) {
      console.log('Product not found for id:', form.product_id); // Debug log
      return
    }
    
    console.log('Selected product:', prod) // Debug log
    
    const ps = Number(prod.pack_size || prod.carton_size || 1) || 1
    
    // Get selling prices from product
    const sellingPerUnit = prod.selling_per_unit || prod.unit_selling_price || 0
    const sellingPerPack = prod.selling_per_pack || prod.pack_selling_price || 0
    
    console.log('Product data:', {
      sellingPerUnit,
      sellingPerPack,
      packSize: ps,
      unit_selling_price: prod.unit_selling_price,
      pack_selling_price: prod.pack_selling_price,
      selling_per_unit: prod.selling_per_unit,
      selling_per_pack: prod.selling_per_pack
    }) // Debug log
    
    // Calculate prices based on available data
    let pricePerUnit = 0
    let pricePerPack = 0
    
    // If we have both unit and pack prices, use them directly
    if (sellingPerUnit && sellingPerUnit > 0 && sellingPerPack && sellingPerPack > 0) {
      pricePerUnit = Number(sellingPerUnit)
      pricePerPack = Number(sellingPerPack)
    }
    // If we only have unit price, calculate pack price
    else if (sellingPerUnit && sellingPerUnit > 0) {
      pricePerUnit = Number(sellingPerUnit)
      pricePerPack = pricePerUnit * ps
    }
    // If we only have pack price, calculate unit price
    else if (sellingPerPack && sellingPerPack > 0) {
      pricePerPack = Number(sellingPerPack)
      pricePerUnit = pricePerPack / ps
    }
    
    console.log('Calculated prices:', { pricePerUnit, pricePerPack, packSize: ps }) // Debug log
    
    // Update form with calculated prices
    setForm(current => ({
      ...current,
      price_per_unit: pricePerUnit,
      price_per_pack: pricePerPack
    }))
  }, [form.product_id, products])

  function submit(e) {
    e.preventDefault()
    if (!form.product_id) return
    try {
      setError(null)
      // compute total units based on product pack size
      const product = products.find(p => p.id === form.product_id)
      const packSize = product?.pack_size || product?.carton_size || 1
      const packs = Number(form.packs || 0)
      const units = Number(form.units || 0)
      const totalUnits = Math.round(packs * packSize + units)
      if (!totalUnits || totalUnits <= 0) throw new Error('Please enter a valid quantity')

      // determine price per unit: prefer explicit unit price, else derive from pack price
      const ppu = Number(form.price_per_unit) > 0 ? Number(form.price_per_unit) : (Number(form.price_per_pack) > 0 ? (Number(form.price_per_pack) / packSize) : 0)
      if (!ppu || ppu <= 0) throw new Error('Please enter a valid price per unit or per pack')
      const totalPrice = ppu * totalUnits

      // prefer explicit pack price when provided
      const pricePerPack = Number(form.price_per_pack) > 0 ? Number(form.price_per_pack) : (ppu * packSize)
      addSale({ product_id: form.product_id, packs, units, price: totalPrice, price_per_unit: ppu, price_per_pack: pricePerPack, date: form.date })
      onClose?.()
    } catch (err) {
      setError(err.message || 'Failed to add sale')
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm max-w-2xl w-full relative">
        <div className="px-6 py-4 border-b border-gray-700">
          <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-red-900/30 text-red-400 flex items-center justify-center hover:bg-red-900/50">
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center">
              <i className="fas fa-shopping-cart text-green-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Add Sale</h3>
          </div>
        </div>

        <form id="add-sale-form" onSubmit={submit} className="px-6 py-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.length === 0 ? (
              <div className="p-2 text-sm text-gray-400">No products available. Add a product first.</div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Product</label>
                <select aria-label="Product" title="Select product" value={form.product_id || ''} onChange={e => {
                  const selectedId = e.target.value || null;
                  console.log('Product selected:', selectedId, e.target.value, 'Current form:', form); // Debug log
                  setForm(prev => {
                    const newForm = { ...prev, product_id: selectedId };
                    console.log('New form state:', newForm); // Debug log
                    return newForm;
                  });
                }} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white">
                  <option value="">Select a product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="sale-packs" className="block text-sm font-medium text-gray-300 mb-2">Packs</label>
              <input id="sale-packs" title="Packs (quantity in packs)" aria-label="Packs" type="number" min="0" step="1" value={form.packs} onChange={e => setForm({ ...form, packs: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400" placeholder="Packs" />
            </div>

            <div>
              <label htmlFor="sale-units" className="block text-sm font-medium text-gray-300 mb-2">Units</label>
              <input id="sale-units" title="Units (quantity in units)" aria-label="Units" type="number" min="0" step="1" value={form.units} onChange={e => setForm({ ...form, units: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400" placeholder="Units" />
            </div>

            <div className="flex items-center gap-2 md:col-span-2">
              <div className="flex-1">
                <label htmlFor="sale-price-unit" className="block text-sm font-medium text-gray-300 mb-2">Price per unit</label>
                <input id="sale-price-unit" title="Price per unit (e.g., 5.00)" aria-label="Price per unit" type="number" step="0.01" value={form.price_per_unit} onChange={e => setForm({ ...form, price_per_unit: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400" placeholder="Price per unit (e.g., 5.00)" />
              </div>
              <div className="flex-1">
                <label htmlFor="sale-price-pack" className="block text-sm font-medium text-gray-300 mb-2">Price per pack</label>
                <input id="sale-price-pack" title="Price per pack (e.g., 150.00)" aria-label="Price per pack" type="number" step="0.01" value={form.price_per_pack} onChange={e => setForm({ ...form, price_per_pack: Number(e.target.value) })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-400" placeholder="Price per pack (e.g., 150.00)" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input aria-label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white" />
            </div>
          </div>
          
          {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        </form>
        
        <div className="py-4 bg-gray-700 rounded-b-xl flex gap-3 justify-end">
          <button type="button" onClick={() => onClose?.()} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-600 rounded-lg hover:bg-gray-500 hover:text-white">Cancel</button>
          <button type="submit" form="add-sale-form" disabled={!products.length} className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50">Add Sale</button>
        </div>
      </div>
    </div>
  )
}
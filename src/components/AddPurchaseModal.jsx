
import React, { useState } from 'react'
import { usePurchases } from '../context/PurchaseContext'
import { useProducts } from '../context/ProductContext'

export default function AddPurchaseModal({ onClose }) {
  const { addPurchase } = usePurchases();
  const { products } = useProducts();
  const [form, setForm] = useState({
    product_name: '',
    type: '',
    payment_method: '',
    cost: '',
    supplier: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.product_name.trim()) {
      newErrors.product_name = 'Item description is required';
    }
    
    if (!form.cost || Number(form.cost) <= 0) {
      newErrors.cost = 'Please enter a valid cost greater than 0';
    }
    
    if (!form.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const purchaseData = {
        product_name: form.product_name.trim(),
        type: form.type.trim() || 'expense',
        payment_method: form.payment_method,
        cost: Number(form.cost),
        supplier: form.supplier.trim(),
        description: form.description.trim(),
        date: new Date(form.date).toISOString()
      };
      await addPurchase(purchaseData);
      onClose?.();
    } catch (err) {
      console.error('Failed to add purchase', err);
      setErrors({ submit: 'Failed to add purchase: ' + (err?.message || String(err)) });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl shadow-lg max-w-2xl w-full relative text-white">
        <div className="px-6 py-4 border-b border-gray-800">
          <button type="button" aria-label="Close" onClick={() => onClose?.()} className="absolute right-3 top-3 w-8 h-8 rounded bg-gray-800 text-gray-200 flex items-center justify-center hover:bg-gray-700">
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
              <i className="fas fa-box text-yellow-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-white">Add Purchase</h3>
          </div>
        </div>

    <form onSubmit={handleSubmit} className="px-6 py-4 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Item</label>
              <input 
                aria-label="Item" 
                title="Item" 
                value={form.product_name} 
                onChange={e => setForm({ ...form, product_name: e.target.value })} 
                placeholder="e.g. Delivery fee, Packaging" 
                className={`w-full px-3 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${
                  errors.product_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
                }`}
                required
              />
              {errors.product_name && <p className="text-red-400 text-xs mt-1">{errors.product_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Type</label>
              <input 
                aria-label="Type" 
                title="Type" 
                value={form.type} 
                onChange={e => setForm({ ...form, type: e.target.value })} 
                placeholder="e.g. service, materials" 
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Supplier</label>
              <input 
                aria-label="Supplier" 
                title="Supplier" 
                value={form.supplier} 
                onChange={e => setForm({ ...form, supplier: e.target.value })} 
                placeholder="e.g. Vendor name" 
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Payment method</label>
              <select 
                value={form.payment_method || ''} 
                onChange={e => setForm({ ...form, payment_method: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select payment method</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Price</label>
              <input 
                aria-label="Price" 
                type="number" 
                step="0.01" 
                min="0"
                value={form.cost} 
                onChange={e => setForm({ ...form, cost: e.target.value })} 
                className={`w-full px-3 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${
                  errors.cost ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
                }`}
                placeholder="Price (e.g., 1440.00)" 
                required
              />
              {errors.cost && <p className="text-red-400 text-xs mt-1">{errors.cost}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">Date</label>
              <input 
                aria-label="Date" 
                type="date" 
                value={form.date} 
                onChange={e => setForm({ ...form, date: e.target.value })} 
                className={`w-full px-3 py-2 border rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 ${
                  errors.date ? 'border-red-500 focus:ring-red-500' : 'border-gray-700 focus:ring-blue-500'
                }`}
                required
              />
              {errors.date && <p className="text-red-400 text-xs mt-1">{errors.date}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
              <textarea 
                aria-label="Description" 
                value={form.description} 
                onChange={e => setForm({ ...form, description: e.target.value })} 
                className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                placeholder="Optional description or details" 
                rows={3} 
              />
            </div>
          </div>
          
          {errors.submit && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm">{errors.submit}</p>
            </div>
          )}
          
          <div className="py-4 bg-gray-800 rounded-b-xl flex gap-3 justify-end">
          <button type="button" onClick={() => onClose?.()} className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-700 rounded-lg hover:bg-gray-600" disabled={isSubmitting}>Cancel</button>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={isSubmitting}>
            {isSubmitting && <i className="fas fa-spinner fa-spin"></i>}
            {isSubmitting ? 'Adding...' : 'Add Purchase'}
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

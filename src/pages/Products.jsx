import React, { useState, useRef } from 'react'
import ProductList from '../components/ProductList'
import ProductForm from '../components/ProductForm'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'

export default function Products() {
  const [showForm, setShowForm] = useState(false)
  const addProductSubmitRef = useRef(null)
  const addProductFormId = 'add-product-form-products'
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Products</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your product catalog and pricing.</p>
        </div>
        <button onClick={() => setShowForm(s => !s)} className="modern-btn modern-btn-primary">{showForm ? 'Close' : 'Add Product'}</button>
      </div>
  {showForm && (
        <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="modern-card bg-gray-800 rounded-none sm:rounded-xl shadow-sm w-full sm:max-w-2xl h-full sm:h-auto flex flex-col relative border-0 sm:border sm:border-gray-700">
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-plus text-orange-400"></i>
                </div>
                <h3 className="text-lg font-semibold text-white">Add New Product</h3>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-3 top-3 w-8 h-8 rounded bg-red-900/20 text-red-400 flex items-center justify-center hover:bg-red-900/30"
                aria-label="Close add product"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <ProductForm onClose={() => setShowForm(false)} submitRef={addProductSubmitRef} hideFooter={true} formId={addProductFormId} />
            </div>

            <div className="flex-shrink-0 py-4 bg-gray-700/50 rounded-none sm:rounded-b-xl flex gap-3 justify-end border-t border-gray-700 px-4 sm:px-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors">Cancel</button>
              <button type="button" onClick={() => { if (addProductSubmitRef.current) addProductSubmitRef.current(); else document.getElementById(addProductFormId)?.requestSubmit?.(); }} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-supabase-600 to-supabase-500 hover:from-supabase-500 hover:to-supabase-400 rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
      <div className="modern-card overflow-hidden">
          {false ? (
            <LoadingSkeleton count={6} />
          ) : (
            <div className="pt-4">
              <ProductList />
            </div>
          )}
      </div>
    </div>
  )
}

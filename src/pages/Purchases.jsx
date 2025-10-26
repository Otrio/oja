import React, { useState } from 'react'
import AddPurchaseModal from '../components/AddPurchaseModal'
import EditPurchaseModal from '../components/EditPurchaseModal'
import ConfirmationModal from '../components/ConfirmationModal'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'
import { usePurchases } from '../context/PurchaseContext'
import { useProducts } from '../context/ProductContext'
import { formatCurrency } from '../utils/calculations'

export default function Purchases() {
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const { purchases = [], deletePurchase, loading } = usePurchases() || {}
  const { products = [] } = useProducts() || {}
  const [page, setPage] = useState(1)
  const perPage = 10

  function pageSlice(items) { 
    const start = (page-1)*perPage; 
    return (items || []).slice(start, start+perPage) 
  }
  
  function productName(id) { 
    return (products || []).find(p => p.id === id)?.name || id 
  }

  const handleDelete = () => {
    if (!deleting) return
    deletePurchase && deletePurchase(deleting.id)
    setDeleting(null)
  }

  const totalPages = Math.max(1, Math.ceil((purchases || []).length / perPage))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Purchases</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your inventory purchases and stock levels.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="modern-btn modern-btn-primary">
          <i className="fas fa-plus"></i>
          Add
        </button>
      </div>

      {showAdd && <AddPurchaseModal onClose={() => setShowAdd(false)} />}
      {editing && <EditPurchaseModal isOpen onClose={() => setEditing(null)} purchase={editing} />}

      {deleting && (
        <ConfirmationModal 
          isOpen 
          onClose={() => setDeleting(null)} 
          onConfirm={handleDelete}
          title="Delete Purchase"
          message={`Are you sure you want to delete the purchase for "${productName(deleting.product_id)}"?`}
          confirmText="Delete" 
          cancelText="Cancel" 
          type="danger" 
        />
      )}

      <div className="modern-card overflow-hidden">
        {loading ? (
          <div className="p-4"><LoadingSkeleton count={6} /></div>
        ) : purchases.length === 0 ? (
          <EmptyState 
            icon="fas fa-shopping-cart" 
            title="No purchases yet" 
            description="Add your first purchase to start tracking inventory." 
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-800 border-b border-gray-700">
                <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item / Type</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Supplier</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <span>Description</span>
                        <span
                          className="text-gray-400 text-xs"
                          title="Click or hover on a description to read full description"
                          aria-hidden="true"
                        >
                          <i className="fas fa-info-circle"></i>
                        </span>
                      </div>
                    </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cost</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Payment</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800">
                {pageSlice(purchases).map((purchase, index) => (
                  <React.Fragment key={purchase.id}>
                  <tr className={`hover:bg-gray-700 transition-colors duration-200 ${index > 0 ? 'border-t-0' : ''}`}>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <i className="fas fa-box text-blue-400 text-sm"></i>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">{purchase.product_name}</div>
                            <div className="text-xs text-gray-400">{purchase.type || 'expense'}</div>
                        </div>
                      </div>
                    </td>
          <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
            <div className="text-sm text-white">{purchase.supplier || 'Not specified'}</div>
          </td>
                    <td className={`px-3 sm:px-6 py-4 max-w-[320px] ${index > 0 ? 'pt-2' : ''}`}>
                        <div
                          className="text-sm text-white truncate cursor-pointer"
                          title={purchase.description || 'No description'}
                          onClick={() => setExpandedId(expandedId === purchase.id ? null : purchase.id)}
                          aria-expanded={expandedId === purchase.id}
                        >
                          {purchase.description || 'No description'}
                        </div>
                    </td>
                    <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                          <div className="text-sm font-medium text-white">{formatCurrency(purchase.total_price || purchase.cost || 0)}</div>
                    </td>
                      <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="text-sm text-white">{purchase.date ? new Date(purchase.date).toLocaleDateString() : 'No date'}</div>
                    </td>
                      <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                        <div className="text-sm text-white capitalize">{purchase.payment_method ? purchase.payment_method.replace('_', ' ') : 'Not specified'}</div>
                      </td>
                      <td className={`px-3 sm:px-6 py-4 whitespace-nowrap ${index > 0 ? 'pt-2' : ''}`}>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button 
                          onClick={() => setEditing(purchase)} 
                          className="p-2 sm:p-3 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30 rounded-lg transition-colors duration-200" 
                          title="Edit purchase"
                        >
                          <i className="fas fa-edit text-xs sm:text-sm"></i>
                        </button>
                        <button 
                          onClick={() => setDeleting(purchase)} 
                          className="p-2 sm:p-3 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-colors duration-200" 
                          title="Delete purchase"
                        >
                          <i className="fas fa-trash text-xs sm:text-sm"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === purchase.id && (
                    <tr key={`${purchase.id}-expanded`} className="bg-gray-800 border-t border-gray-700">
                      <td colSpan={7} className="px-3 sm:px-6 py-3">
                        <div className="text-sm text-gray-200 whitespace-pre-wrap">{purchase.description || 'No description'}</div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Simple pagination */}
        {purchases.length > perPage && (
          <div className="p-4 flex items-center justify-center gap-2 border-t border-gray-700">
            <button 
              disabled={page<=1} 
              onClick={() => setPage(p => Math.max(1,p-1))} 
              className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              <i className="fas fa-chevron-left mr-1"></i>
              Prev
            </button>
            <div className="text-sm text-gray-300 px-4 py-2 bg-gray-800 rounded-lg font-medium">Page {page} of {totalPages}</div>
            <button 
              disabled={page>=totalPages} 
              onClick={() => setPage(p => Math.min(totalPages,p+1))} 
              className="px-3 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors text-sm font-medium"
            >
              Next
              <i className="fas fa-chevron-right ml-1"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

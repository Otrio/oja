import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import PrimaryActionButton from '../components/PrimaryActionButton'
import DashboardStats from '../components/DashboardStats'
import ProfitChart from '../components/ProfitChart'
import SalesChart from '../components/SalesChart'
import ProductForm from '../components/ProductForm'
import { useProducts } from '../context/ProductContext'
import { useSales } from '../context/SaleContext'
import { calculateStockAlerts, calculateExpiringItems, productTotalUnits } from '../utils/calculations'
import { usePurchases } from '../context/PurchaseContext'
import { timeAgo } from '../utils/calculations'
import { LoadingSkeleton, EmptyState } from '../components/LoadingStates'

export default function Dashboard() {
  const { products } = useProducts()
  const { sales } = useSales()
  const { purchases } = usePurchases()
  const loading = (products === undefined || sales === undefined || purchases === undefined)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const addProductSubmitRef = React.useRef(null)
  const addProductFormId = 'add-product-form-dashboard'
  
  // Calculate inventory alerts
  const stockAlerts = calculateStockAlerts(products)
  const expiringItems = calculateExpiringItems(products)

  return (
  <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your inventory.</p>
        </div>
        <PrimaryActionButton onClick={() => setShowAddProduct(true)}>
          <i className="fas fa-plus text-xs"></i>
          Add
        </PrimaryActionButton>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div>
          <LoadingSkeleton count={3} />
        </div>
      ) : (
        <DashboardStats />
      )}
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <ProfitChart />
        <SalesChart />
      </div>

      {/* Additional Info Cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/purchases" className="w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md hover:scale-[1.02] group">
              <div className="icon-circle purple transition-colors group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30">
                <i className="fas fa-shopping-cart transition-transform group-hover:scale-110"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">New Purchase</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Add inventory items</p>
              </div>
            </Link>
            <Link to="/sales" className="w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md hover:scale-[1.02] group">
              <div className="icon-circle teal transition-colors group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30">
                <i className="fas fa-cash-register transition-transform group-hover:scale-110"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">Record Sale</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Process a transaction</p>
              </div>
            </Link>
            <Link onClick={() => setShowAddProduct(true)} className="w-full flex items-center gap-3 p-3 text-left rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md hover:scale-[1.02] group">
              <div className="icon-circle orange transition-colors group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30">
                <i className="fas fa-box transition-transform group-hover:scale-110"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">Add Product</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Create new item</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {(() => {
                // Build a unified activity feed: sales, purchases, and batch additions
                const feed = []
                ;(sales || []).forEach(s => {
                  feed.push({
                    id: `sale-${s.id}`,
                    type: 'sale',
                    product_id: s.product_id,
                    units: s.total_units_sold || s.total_units || s.units || 0,
                    date: s.date || s.createdAt || s.id
                  })
                })
                ;(purchases || []).forEach(pu => {
                  feed.push({
                    id: `purchase-${pu.id}`,
                    type: 'purchase',
                    product_id: pu.product_id,
                    units: pu.total_units_added || 0,
                    date: pu.date || pu.id
                  })
                })
                // include batch additions present on products
                products.forEach(prod => {
                  ;(prod.batches || []).forEach(b => {
                    feed.push({ id: `batch-${b.id}`, type: 'batch', product_id: prod.id, units: b.units_added || b.remaining_units || 0, date: b.createdAt || b.date || b.id })
                  })
                })

                const latest = feed.sort((a,b) => {
                  const ta = new Date(a.date).getTime() || Number(a.id.split('-').pop()) || 0
                  const tb = new Date(b.date).getTime() || Number(b.id.split('-').pop()) || 0
                  return tb - ta
                }).slice(0,5)

                if (latest.length === 0) {
                  return <div className="text-sm text-gray-400">No recent activity</div>
                }

                return latest.map(item => {
                  const prod = products.find(p => p.id === item.product_id)
                  const name = prod ? prod.name : item.product_id
                  const label = item.type === 'sale' ? `Sale: ${name} - ${item.units} unit(s)` : (item.type === 'purchase' ? `Purchase: ${name} - ${item.units} unit(s)` : `Batch added: ${name} - ${item.units} unit(s)`)
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${item.type === 'sale' ? 'bg-green-400' : item.type === 'purchase' ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">{label}</p>
                        <p className="text-xs text-gray-400">{timeAgo(item.date)}</p>
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>

        {/* Inventory Alerts */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Inventory Alerts</h3>
            {stockAlerts.totalAlerts > 0 && (
              <span className="bg-red-900/30 text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full border border-red-800">
                {stockAlerts.totalAlerts}
              </span>
            )}
          </div>
          
          <div className="space-y-3">
            {stockAlerts.outOfStock > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-red-900/30 rounded-lg border border-red-800">
                <div className="flex items-center gap-3">
                  <i className="fas fa-times-circle text-red-400"></i>
                  <div>
                    <p className="text-sm font-medium text-red-400">Out of Stock</p>
                    <p className="text-xs text-red-300">{stockAlerts.outOfStock} items completely out of stock</p>
                  </div>
                </div>
                <div className="pl-8 space-y-1">
                  {(() => {
                  const outOfStockProducts = products.filter(p => {
                    // Skip deleted products
                    if (p.deleted_at || p.deletedAt) return false;
                    
                    const units = productTotalUnits(p);
                    console.log('Product stock check:', {
                      name: p.name,
                      total_units_in_stock: p.total_units_in_stock,
                      batches: p.batches?.map(b => ({
                        remaining_units: b.remaining_units,
                        units_added: b.units_added
                      })),
                      calculated_units: units
                    });
                    
                    return units === 0;
                  });
                  
                  console.log('Out of stock products:', outOfStockProducts);
                  
                  return outOfStockProducts.map(p => (
                    <p key={p.id} className="text-xs text-red-300">• {p.name}</p>
                  ));
                })()}
                </div>
              </div>
            )}
            
            {stockAlerts.lowStock > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-orange-900/30 rounded-lg border border-orange-800">
                <div className="flex items-center gap-3">
                  <i className="fas fa-exclamation-triangle text-orange-400"></i>
                  <div>
                    <p className="text-sm font-medium text-orange-400">Low Stock Alert</p>
                    <p className="text-xs text-orange-300">{stockAlerts.lowStock} items need restocking</p>
                  </div>
                </div>
                <div className="pl-8 space-y-1">
                  {products.filter(p => {
                    if (p.deleted_at || p.deletedAt) return false;
                    const units = productTotalUnits(p);
                    const threshold = p.low_stock_threshold || 0;
                    return threshold > 0 && units > 0 && units < threshold;
                  }).map(p => (
                    <p key={p.id} className="text-xs text-orange-300">
                      • {p.name} ({productTotalUnits(p)} units left)
                    </p>
                  ))}
                </div>
              </div>
            )}
            
            {expiringItems > 0 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-900/30 rounded-lg border border-yellow-800">
                <i className="fas fa-clock text-yellow-400"></i>
                <div>
                  <p className="text-sm font-medium text-yellow-400">Expiring Soon</p>
                  <p className="text-xs text-yellow-300">{expiringItems} items expire this week</p>
                </div>
              </div>
            )}
            
            {stockAlerts.totalAlerts === 0 && expiringItems === 0 && (
              <div className="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg border border-green-800">
                <i className="fas fa-check-circle text-green-400"></i>
                <div>
                  <p className="text-sm font-medium text-green-400">All Good</p>
                  <p className="text-xs text-green-300">No inventory alerts at this time</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

  {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="modern-card max-w-2xl w-full max-h-[90vh] overflow-y-auto mx-4 relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                  <i className="fas fa-plus text-orange-600"></i>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add New Product</h3>
              </div>
              <button
                onClick={() => setShowAddProduct(false)}
                className="absolute right-3 top-3 w-8 h-8 rounded bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100"
                aria-label="Close add product"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="px-6 py-4 pb-6">
              <ProductForm onClose={() => setShowAddProduct(false)} submitRef={addProductSubmitRef} hideFooter={true} formId={addProductFormId} />
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800">
              <button type="button" onClick={() => setShowAddProduct(false)} className="sb-transition-base px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
              <button type="button" onClick={() => { if (addProductSubmitRef.current) addProductSubmitRef.current(); else document.getElementById(addProductFormId)?.requestSubmit?.(); }} className="sb-transition-base px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-supabase-600 to-supabase-500 hover:from-supabase-500 hover:to-supabase-400 rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
      {!loading && products.length === 0 && (
        <EmptyState icon="fas fa-box" title="No products" description="Add your first product to start tracking inventory." />
      )}
    </div>
  )
}

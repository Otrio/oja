import React from 'react'
import { useProducts } from '../context/ProductContext'
import { usePurchases } from '../context/PurchaseContext'
import { useSales } from '../context/SaleContext'
import { formatCurrency } from '../utils/calculations'

export default function DashboardStats() {
  const { products } = useProducts()
  const { purchases } = usePurchases()
  const { sales } = useSales()

  const totalProducts = products.length
  // Helper: compute total units for a product. Prefer `total_units_in_stock`, fallback to sum of batch remaining_units.
  function productTotalUnits(p) {
    if (typeof p.total_units_in_stock === 'number') return p.total_units_in_stock
    if (Array.isArray(p.batches) && p.batches.length) return p.batches.reduce((s, b) => s + (b.remaining_units || 0), 0)
    return 0
  }

  // Helper: compute cost per unit. Prefer explicit `cost_per_unit`; fallback to cost_per_pack/pack_size,
  // then weighted average from batches, then weighted average from purchases for this product.
  function productCostPerUnit(p) {
    // helper to coerce safe numbers
    const toNum = (v) => {
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }

  const cpu = toNum(p.cost_per_unit)
  if (cpu > 0) return cpu

  // prefer pack-based fields, fall back to legacy carton fields
  const cpc = toNum(p.cost_per_pack) || toNum(p.cost_per_carton)
  const cs = toNum(p.pack_size) || toNum(p.carton_size) || 1
  if (cpc > 0 && cs > 0) return cpc / cs

    // weighted average from batches
    if (Array.isArray(p.batches) && p.batches.length) {
        const { totalCost = 0, totalUnits = 0 } = p.batches.reduce((acc, b) => {
        const buc = toNum(b.cost_per_unit)
        let unitCost = buc
        if (!unitCost) {
          // prefer cost_per_pack / packs, fall back to cost_per_carton / cartons
          const bCpc = toNum(b.cost_per_pack) || toNum(b.cost_per_carton)
          const bPacks = toNum(b.packs) || toNum(b.cartons) || 0
          if (bCpc > 0 && bPacks > 0) unitCost = bCpc / (bPacks * cs)
        }
        const units = toNum(b.remaining_units)
        acc.totalCost += unitCost * units
        acc.totalUnits += units
        return acc
      }, {})
      if (totalUnits > 0) return totalCost / totalUnits
    }

    // weighted average from purchases (fallback)
    const relatedPurchases = (purchases || []).filter(x => x.product_id === p.id && (x.total_units_added || 0) > 0)
    if (relatedPurchases.length) {
      const { totalCost = 0, totalUnits = 0 } = relatedPurchases.reduce((acc, pu) => {
        const puCpu = toNum(pu.cost_per_unit)
        const units = toNum(pu.total_units_added)
        acc.totalCost += puCpu * units
        acc.totalUnits += units
        return acc
      }, {})
      if (totalUnits > 0) return totalCost / totalUnits
    }

    return 0
  }

  const totalStock = products.reduce((sum, p) => sum + productTotalUnits(p), 0)
  const totalValue = products.reduce((total, product) => {
    // Calculate total value for this product's batches
    let productValue = 0;
    
    if (Array.isArray(product.batches) && product.batches.length > 0) {
      // Sort batches by created_at to process from oldest to newest
      const sortedBatches = [...product.batches].sort((a, b) => {
        const dateA = new Date(a.created_at || a.createdAt || 0);
        const dateB = new Date(b.created_at || b.createdAt || 0);
        return dateA - dateB;
      });

      // Calculate each batch's value
      productValue = sortedBatches.reduce((batchTotal, batch, index) => {
        const remaining = Number(batch.remaining_units || 0);
        let cost = Number(batch.cost_per_unit || 0);

        // First batch should use product's initial buying price if no cost set
        if (index === 0 && !cost) {
          const packSize = Number(product.pack_size || product.units_per_pack || product.carton_size || product.units_per_carton || 1);
          if (batch.cost_per_unit) {
            cost = Number(batch.cost_per_unit);
          } else if (batch.cost_per_pack) {
            cost = Number(batch.cost_per_pack) / packSize;
          } else if (product.unit_buying_price) {
            cost = Number(product.unit_buying_price);
          } else if (product.pack_buying_price) {
            cost = Number(product.pack_buying_price) / packSize;
          } else if (product.cost_per_unit) {
            cost = Number(product.cost_per_unit);
          } else if (product.cost_per_pack) {
            cost = Number(product.cost_per_pack) / packSize;
          }
          console.log('First batch cost calculation:', {
            batch_cost_per_unit: batch.cost_per_unit,
            batch_cost_per_pack: batch.cost_per_pack,
            product_unit_buying_price: product.unit_buying_price,
            product_pack_buying_price: product.pack_buying_price,
            product_cost_per_unit: product.cost_per_unit,
            product_cost_per_pack: product.cost_per_pack,
            packSize,
            finalCost: cost
          });
        }
        // For other batches, if no unit cost but have pack cost, calculate unit cost
        else if (!cost && batch.cost_per_pack) {
          const packSize = Number(product.pack_size || product.units_per_pack || product.carton_size || product.units_per_carton || 1);
          cost = Number(batch.cost_per_pack) / packSize;
        }

        const batchValue = remaining * cost;
        
        console.log(`Product: ${product.name}`)
        console.log(`  Batch ${index + 1}:`)
        console.log(`    Remaining units: ${remaining}`)
        console.log(`    Cost per unit: ${cost}`)
        console.log(`    Pack size: ${product.pack_size || product.units_per_pack || product.carton_size || product.units_per_carton || 1}`)
        console.log(`    Initial buying price: ${product.unit_buying_price || (product.pack_buying_price ? product.pack_buying_price + '/pack' : 'not set')}`)
        console.log(`    Batch value: ${batchValue}`)

        return batchTotal + batchValue;
      }, 0);

      console.log(`Total value for ${product.name}: ${productValue}`);
    } else {
      // Fallback to product level calculation if no batches
      const units = productTotalUnits(product);
      const cost = productCostPerUnit(product);
      productValue = units * cost;
    }

    return total + productValue;
  }, 0)
  // Sum all purchase entries: use explicit total_price when available (manual expenses),
  // otherwise fall back to legacy batch-based calculation.
  const totalPurchases = (purchases || []).reduce((sum, pu) => {
    const tp = Number(pu.total_price || pu.total_price === 0 ? pu.total_price : NaN)
    if (Number.isFinite(tp)) return sum + tp
    const legacy = (Number(pu.cost_per_unit || 0) * Number(pu.total_units_added || 0))
    return sum + legacy
  }, 0)
  
  // Calculate total sales value from all sales records
  const totalSales = (sales || []).reduce((sum, s) => {
    // Get the pack size from the product for this sale
    const product = products.find(p => p.id === s.product_id);
    if (!product) return sum;
    
    const ps = Number(product.pack_size || product.units_per_pack || 1);
    const totalUnits = Number(s.total_units_sold || 0);
    const completePacks = Math.floor(totalUnits / ps);
    const remainingUnits = totalUnits % ps;

    // Calculate sales value
    let saleValue = 0;

    // Value from complete packs
    if (completePacks > 0) {
      const packPrice = Number(s.price_per_pack || product.pack_selling_price || (product.unit_selling_price * ps) || 0);
      saleValue += completePacks * packPrice;
    }

    // Value from remaining units
    if (remainingUnits > 0) {
      const unitPrice = Number(s.price_per_unit || product.unit_selling_price || 0);
      saleValue += remainingUnits * unitPrice;
    }

    console.log('Sale calculation:', {
      product: product.name,
      totalUnits,
      packSize: ps,
      completePacks,
      remainingUnits,
      pricePerPack: s.price_per_pack || product.pack_selling_price,
      pricePerUnit: s.price_per_unit || product.unit_selling_price,
      saleValue
    });

    return sum + saleValue;
  }, 0)

  // Calculate total profit
  const totalProfit = (sales || []).reduce((sum, s) => sum + (s.profit || 0), 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Alerts</h3>
            <div className="space-y-2 mt-2">
              {products.filter(p => {
                // Skip deleted products
                if (p.deleted_at || p.deletedAt) return false;
                
                // Check for out of stock
                const units = productTotalUnits(p);
                const batches = p.batches || [];
                const hasPacks = batches.some(b => (b.packs || 0) > 0);
                const hasUnits = units > 0;
                if (!hasPacks && !hasUnits) {
                  return true;
                }
                
                // Check for low stock
                const threshold = p.low_stock_threshold || 0;
                if (threshold > 0 && units > 0 && units < threshold) {
                  return true;
                }

                return false;
              }).map(p => {
                const units = productTotalUnits(p);
                // If units is 0, it's out of stock
                if (units === 0) {
                  return (
                    <div key={p.id} className="text-sm text-red-500 dark:text-red-400">• {p.name}</div>
                  );
                }
                // Otherwise it's low stock
                return (
                  <div key={p.id} className="text-sm text-yellow-500 dark:text-yellow-400">
                    • {p.name} ({units} units left)
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center">
              <i className="fas fa-box text-lg"></i>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totalProducts}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Purchases</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total cost of purchases</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300 rounded-full flex items-center justify-center">
              <i className="fas fa-download text-lg"></i>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalPurchases)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sales</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total revenue from sales</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-full flex items-center justify-center">
              <i className="fas fa-upload text-lg"></i>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalSales)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profit</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total profit from sales</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300 rounded-full flex items-center justify-center">
              <i className="fas fa-coins text-lg"></i>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalProfit)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Stock</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Units currently in stock</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-full flex items-center justify-center">
              <i className="fas fa-warehouse text-lg"></i>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{totalStock}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="modern-card p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Value</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated stock value</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded-full flex items-center justify-center">
                <i className="fas fa-wallet text-lg"></i>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

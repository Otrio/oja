import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductContext'
import { allocateFromBatches } from '../utils/batchUtils'
import { useNotifications } from './NotificationContext'
import { useSettings } from './SettingsContext'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'oja_sales_v1'
const SaleContext = createContext(null)

export function useSales() { return useContext(SaleContext) }

function loadLocal() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] } }

function fromCartonsUnits(packsOrCartons = 0, units = 0, pack_size = 1) {
  return Math.round((packsOrCartons || 0) * (pack_size || 1) + (units || 0))
}

export function canFulfillSale(product, totalUnits) {
  if (!product) return false
  return totalUnits <= (product.current_stock || product.total_units_in_stock || 0)
}

export function SaleProvider({ children }) {
  const { products, updateProduct } = useProducts()
  const { addNotification } = useNotifications()
  const { settings, convertCurrency } = useSettings()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    let mounted = true
    // subscribe to auth state
    supabase.auth.getSession().then(({ data: { session } }) => { if (!mounted) return; setUser(session?.user ?? null) })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    fetchSales()
    return () => { mounted = false; sub?.subscription?.unsubscribe && sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sales)) } catch (e) {}
  }, [sales])

  async function fetchSales() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('sales').select('*').order('created_at', { ascending: false })
      if (error) {
        setSales(loadLocal())
        addNotification({ title: 'Sales (local)', message: 'Using local sales data', type: 'info' })
      } else {
        setSales(data || [])
      }
    } catch (err) {
      setSales(loadLocal())
      addNotification({ title: 'Error loading sales', message: String(err), type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function addSale({ product_id, price = 0, date, packs = 0, cartons = 0, units = 0, notes }) {
    const product = products.find(p => p.id === product_id)
    const ps = product?.units_per_pack || product?.pack_size || product?.units_per_carton || product?.carton_size || 1
    const qtyPacks = typeof packs !== 'undefined' ? Number(packs || 0) : (typeof cartons !== 'undefined' ? Number(cartons || 0) : 0)
    const totalUnits = fromCartonsUnits(qtyPacks, Number(units || 0), ps)
    if (!totalUnits || totalUnits <= 0) throw new Error('Invalid quantity for sale')

    // Calculate total units and do FIFO allocation
    const { allocations, updatedBatches, taken } = allocateFromBatches(product?.batches || [], totalUnits);
    
    // Calculate cost based on FIFO (using actual batch costs)
    let totalCost = 0;
    for (const allocation of allocations) {
      totalCost += allocation.unitsTaken * allocation.unitCost;
    }

    // Calculate selling prices
    const totalPrice = Number(price || 0);
    const provided_ppu = typeof arguments[0].price_per_unit !== 'undefined' ? Number(arguments[0].price_per_unit) : null;
    const provided_ppack = typeof arguments[0].price_per_pack !== 'undefined' ? Number(arguments[0].price_per_pack) : null;

    // Get product's standard prices
    const product_selling_per_unit = product?.unit_selling_price || 0;
    const product_selling_per_pack = product?.pack_selling_price || product?.selling_per_pack || (product_selling_per_unit * ps);
    
    // Calculate selling prices for the actual sale
    const selling_per_pack = provided_ppack > 0 ? provided_ppack : product_selling_per_pack;
    const selling_per_unit = provided_ppu > 0 ? provided_ppu : 
                            (provided_ppack > 0 ? provided_ppack / ps : product_selling_per_unit);

    // Calculate cost per pack and per unit
    const cost_per_unit = totalCost / totalUnits;
    const cost_per_pack = cost_per_unit * ps;

    // Split into complete packs and remaining units
    const complete_packs = Math.floor(totalUnits / ps);
    const remaining_units = totalUnits % ps;

    // Calculate profit separately for packs and units
    const pack_profit = complete_packs * (selling_per_pack - cost_per_pack);
    const unit_profit = remaining_units * (selling_per_unit - cost_per_unit);
    
    // Total profit is sum of pack profit and unit profit
    const profit = pack_profit + unit_profit;

    console.log('FIFO Sale calculation:', {
      product_name: product?.name,
      pack_size: ps,
      totalUnits,
      complete_packs,
      remaining_units,
      costs: {
        cost_per_unit,
        cost_per_pack,
        total_cost: totalCost
      },
      selling_prices: {
        selling_per_unit,
        selling_per_pack
      },
      profit_breakdown: {
        pack_profit,
        unit_profit,
        total_profit: profit
      },
      allocations
    });

    // validation
    if (!canFulfillSale(product, totalUnits)) throw new Error('Insufficient stock to complete sale')

    // Update product stock based on FIFO allocations
    const newTotalStock = Math.max(0, (product?.total_units_in_stock || product?.current_stock || 0) - taken)

    // Persist batch remaining_units for authenticated users so changes survive refresh.
    // For unauthenticated users we update local product state (updateProduct handles local persistence).
    const uid = user?.id || null
    if (uid) {
      try {
        // Only update batches that have an id in the DB
        const batchUpdates = (updatedBatches || []).filter(b => b && b.id).map(b => ({ id: b.id, remaining_units: b.remaining_units }))
        // perform updates in parallel
        const results = await Promise.all(batchUpdates.map(b => supabase.from('batches').update({ remaining_units: b.remaining_units }).eq('id', b.id)))
        for (const r of results) {
          if (r.error) throw r.error
        }
      } catch (err) {
        addNotification({ title: 'Error', message: 'Failed to persist batch updates. Sale not saved.', type: 'error' })
        console.error('Batch update error', err)
        throw err
      }

  // Update local product state immediately to reflect updated batches and stock so UI updates instantly
  await updateProduct(product_id, { total_units_in_stock: newTotalStock, current_stock: newTotalStock, batches: updatedBatches }, { persist: false })
  // then persist stock update to the server (this will merge with the local batches we just set)
  await updateProduct(product_id, { total_units_in_stock: newTotalStock, current_stock: newTotalStock })
    } else {
      // local mode: update product including updatedBatches so UI reflects change and localStorage persists
      updateProduct(product_id, { total_units_in_stock: newTotalStock, current_stock: newTotalStock, batches: updatedBatches })
    }

    // prepare sale record for DB (exclude allocations/batches)
    const dbSale = {
      product_id,
      date: date || new Date().toISOString().slice(0,10),
      units: Number(units || 0),
      packs: Number(packs || 0),
      cartons: Number(cartons || 0),
      total_units_sold: taken,
      price_per_unit: selling_per_unit,
      price_per_pack: selling_per_pack,
      price_per_carton: null,
      total_price: totalPrice,
      profit: profit,
      notes: notes || null
    }

    try {
      const uid = user?.id || null
      if (uid) dbSale.user_id = uid

      if (uid) {
        const { data, error } = await supabase.from('sales').insert([dbSale]).select()
        if (error) throw error
        // push DB record (has uuid id)
        setSales(prev => [...prev, data[0]])
      } else {
        const local = { id: Date.now(), ...dbSale, allocations }
        setSales(prev => [...prev, local])
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify([local, ...loadLocal()])) } catch(e) {}
      }

      addNotification({ title: 'Sale recorded', message: `Sale recorded for ${product?.name || product_id} (${taken} units)`, type: 'success' })
    } catch (err) {
      addNotification({ title: 'Error saving sale', message: String(err), type: 'error' })
    }
  }

  async function updateSale(id, changes) {
    // find existing
    const idx = sales.findIndex(s => s.id === id)
    if (idx === -1) return
    const prev = sales[idx]
    const product = products.find(p => p.id === prev.product_id)

    // compute new totals similar to existing logic (simplified)
    const newPacks = typeof changes.packs !== 'undefined' ? Number(changes.packs || 0) : (prev.packs || prev.cartons || 0)
    const newUnits = typeof changes.units !== 'undefined' ? Number(changes.units || 0) : (prev.units || 0)
    const newProductId = typeof changes.product_id !== 'undefined' ? changes.product_id : prev.product_id
    const newProduct = products.find(p => p.id === newProductId) || product
    const newTotalUnits = fromCartonsUnits(newPacks, newUnits, newProduct?.units_per_pack || newProduct?.pack_size || 1)

    // restore previous allocations locally and then allocate new amount; keep behavior local first
    function restoreAllocationsOnto(batchesOrig = [], allocations = []) {
      const batches = (batchesOrig || []).map(b => ({ ...b }))
      let restored = 0
      for (const a of allocations || []) {
        const b = batches.find(x => x.id === a.batchId)
        if (b) b.remaining_units = (b.remaining_units || 0) + (a.unitsTaken || 0)
        restored += (a.unitsTaken || 0)
      }
      return { batches, restored }
    }

    // If same product
    if (prev.product_id === newProductId) {
      const prod = products.find(p => p.id === newProductId)
      if (!prod) return
      const { batches: restoredBatches, restored } = restoreAllocationsOnto(prod.batches || [], prev.allocations || [])
      const availableAfterRestore = (prod.total_units_in_stock || prod.current_stock || 0) + restored
      if (newTotalUnits > availableAfterRestore) throw new Error('Insufficient stock to complete sale update')
      const { allocations: newAllocations, updatedBatches, taken } = allocateFromBatches(restoredBatches, newTotalUnits)
      const newTotalStock = Math.max(0, availableAfterRestore - taken)
      updateProduct(newProductId, { batches: updatedBatches, current_stock: newTotalStock })

      const totalPriceNew = typeof changes.total_price !== 'undefined' ? Number(changes.total_price) : (typeof changes.price !== 'undefined' ? Number(changes.price) : (prev.total_price || 0))
      const selling_per_unit_new = totalPriceNew && newTotalUnits ? (totalPriceNew / newTotalUnits) : 0
      const cost_per_unit_new = newProduct?.cost_per_unit ?? 0
      const newProfit = (selling_per_unit_new - cost_per_unit_new) * newTotalUnits

      const updatedRec = { ...prev, ...changes, packs: newPacks, cartons: prev.cartons || newPacks, units: newUnits, total_units_sold: newTotalUnits, total_price: totalPriceNew, profit: newProfit, allocations: newAllocations }
      setSales(prevList => prevList.map(s => s.id === id ? updatedRec : s))

      // attempt DB update if uuid
      try {
        const uid = user?.id || null
        if (uid && String(id).length === 36) {
          const dbChanges = { ...updatedRec }
          delete dbChanges.allocations
          const { data, error } = await supabase.from('sales').update(dbChanges).eq('id', id).select()
          if (error) throw error
        }
      } catch (err) {
        addNotification({ title: 'Warning', message: 'Sale updated locally but failed to persist to DB', type: 'warning' })
      }

      addNotification({ title: 'Sale updated', message: `Sale ${id} updated`, type: 'info' })
      return
    }

    // Product changed: restore to previous and allocate from new
    const prevProd = products.find(p => p.id === prev.product_id)
    if (prevProd) {
      const { batches: prevRestoredBatches, restored: restoredPrev } = restoreAllocationsOnto(prevProd.batches || [], prev.allocations || [])
      updateProduct(prev.product_id, { batches: prevRestoredBatches, current_stock: Math.max(0, (prevProd.current_stock || prevProd.total_units_in_stock || 0) + restoredPrev) })
    }

    const targetProd = products.find(p => p.id === newProductId)
    if (!targetProd) throw new Error('Target product not found')
    if (newTotalUnits > (targetProd.current_stock || targetProd.total_units_in_stock || 0)) throw new Error('Insufficient stock to complete sale update')
    const { allocations: allocs, updatedBatches: updatedTargetBatches, taken } = allocateFromBatches(targetProd.batches || [], newTotalUnits)
    updateProduct(newProductId, { batches: updatedTargetBatches, current_stock: Math.max(0, (targetProd.current_stock || targetProd.total_units_in_stock || 0) - taken) })

    const totalPrice2 = typeof changes.total_price !== 'undefined' ? Number(changes.total_price) : (typeof changes.price !== 'undefined' ? Number(changes.price) : (prev.total_price || 0))
    const selling_per_unit_new2 = totalPrice2 && newTotalUnits ? (totalPrice2 / newTotalUnits) : 0
    const cost_per_unit_new2 = newProduct?.cost_per_unit ?? 0
    const newProfit2 = (selling_per_unit_new2 - cost_per_unit_new2) * newTotalUnits

    const updated2 = { ...prev, ...changes, packs: newPacks, cartons: prev.cartons || newPacks, units: newUnits, total_units_sold: newTotalUnits, total_price: totalPrice2, profit: newProfit2, allocations: allocs }
    setSales(prevList => prevList.map(s => s.id === id ? updated2 : s))

    try {
      const uid = user?.id || null
      if (uid && String(id).length === 36) {
        const dbChanges = { ...updated2 }
        delete dbChanges.allocations
        const { data, error } = await supabase.from('sales').update(dbChanges).eq('id', id).select()
        if (error) throw error
      }
    } catch (err) {
      addNotification({ title: 'Warning', message: 'Sale update persisted locally but DB update failed', type: 'warning' })
    }

    addNotification({ title: 'Sale updated', message: `Sale ${id} updated`, type: 'info' })
  }

  async function deleteSale(id) {
    const s = sales.find(x => x.id === id)
    if (!s) return
    const product = products.find(p => p.id === s.product_id)
    // restore allocations if present
    if (product) {
      const batches = (product.batches || []).map(b => ({ ...b }))
      let restored = 0
      for (const a of s.allocations || []) {
        const b = batches.find(x => x.id === a.batchId)
        if (b) b.remaining_units = (b.remaining_units || 0) + (a.unitsTaken || 0)
        restored += (a.unitsTaken || 0)
      }
      updateProduct(s.product_id, { batches, current_stock: Math.max(0, (product.current_stock || product.total_units_in_stock || 0) + restored) })
    } else {
      updateProduct(s.product_id, { current_stock: (product?.current_stock || product?.total_units_in_stock || 0) + s.total_units_sold })
    }

    setSales(prev => prev.filter(x => x.id !== id))

    try {
      const uid = user?.id || null
      if (uid && String(id).length === 36) {
        const { error } = await supabase.from('sales').delete().eq('id', id)
        if (error) throw error
      }
    } catch (err) {
      addNotification({ title: 'Warning', message: 'Sale deleted locally but failed to delete from DB', type: 'warning' })
    }

    addNotification({ title: 'Sale deleted', message: `Sale removed for ${product?.name || s.product_id}`, type: 'warning' })
  }

  return <SaleContext.Provider value={{ sales, loading, addSale, updateSale, deleteSale }}>{children}</SaleContext.Provider>
}

export default SaleContext

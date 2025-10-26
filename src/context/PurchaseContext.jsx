import React, { createContext, useContext, useEffect, useState } from 'react'
import { useProducts } from './ProductContext'
import { useNotifications } from './NotificationContext'
import { createBatch } from '../utils/batchUtils'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'oja_purchases_v1'

const PurchaseContext = createContext(null)

export function usePurchases() { return useContext(PurchaseContext) }

function loadLocal() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] } }

function toUnits(quantity, type, pack_size) {
  const ps = Number(pack_size || 1)
  if (type === 'unit') return Math.round(quantity)
  if (type === 'pack' || type === 'carton') return Math.round(quantity * ps)
  if (type === 'half') return Math.round(quantity * ps * 0.5)
  if (type === 'quarter') return Math.round(quantity * ps * 0.25)
  return Math.round(quantity * ps)
}

function fromCartonsUnits(packsOrCartons = 0, units = 0, pack_size = 1) {
  return Math.round((packsOrCartons || 0) * (pack_size || 1) + (units || 0))
}

export function PurchaseProvider({ children }) {
  const { products, updateProduct } = useProducts()
  const { addNotification } = useNotifications()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => { 
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => { if (!mounted) return; setUser(session?.user ?? null) })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null))
    fetchPurchases()
    return () => { mounted = false; sub?.subscription?.unsubscribe && sub.subscription.unsubscribe() }
  }, [])

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases)) } catch (e) {} }, [purchases])

  async function fetchPurchases() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('purchases').select('*').order('created_at', { ascending: false })
      if (error) {
        setPurchases(loadLocal())
        addNotification({ title: 'Purchases (local)', message: 'Using local purchase data', type: 'info' })
      } else {
        setPurchases(data || [])
      }
    } catch (err) {
      setPurchases(loadLocal())
      addNotification({ title: 'Error loading purchases', message: String(err), type: 'error' })
    } finally { setLoading(false) }
  }

  async function addPurchase({ product_id, product_name, type, cost, date, packs, cartons, units, for_inventory = true, supplier, notes, description, payment_method }) {
    const product = products.find(p => p.id === product_id)
    const ps = product?.units_per_pack || product?.pack_size || product?.units_per_carton || product?.carton_size || 1
    let totalUnits = 0
    // compute total units from available inputs (packs/cartons/units). quantity/pack cost types removed.
    const qtyPacks = typeof packs !== 'undefined' ? Number(packs || 0) : (typeof cartons !== 'undefined' ? Number(cartons || 0) : null)
    if (qtyPacks !== null || typeof units !== 'undefined') {
      totalUnits = fromCartonsUnits(Number(qtyPacks || 0), Number(units || 0), ps)
    } else {
      totalUnits = 0
    }

    let cost_per_unit = null
    let cost_per_pack = null
    let cost_per_carton = null
    // If units provided, compute per-unit cost from total cost
    if (totalUnits > 0) {
      cost_per_unit = ps ? Number(cost || 0) / totalUnits : Number(cost || 0)
      cost_per_pack = cost_per_unit * ps
      cost_per_carton = cost_per_pack
    }

    // Simplified payload with only the fields we need for manual expenses
    const dbPurchase = {
      product_name: product_name || null,
      type: type || 'expense',
      total_price: Number(cost || 0),
      date: date || new Date().toISOString().slice(0,10),
      description: description || notes || null,  // use description or notes
      payment_method: payment_method || null,
      supplier: supplier || null,
      for_inventory: false  // manual expenses don't affect inventory
    }

    try {
      const uid = user?.id || null
      if (uid) dbPurchase.user_id = uid

      if (uid) {
        const { data, error } = await supabase.from('purchases').insert([dbPurchase]).select()
        if (error) throw error
        setPurchases(prev => [...prev, data[0]])
      } else {
        const local = { id: Date.now(), ...dbPurchase }
        setPurchases(prev => [...prev, local])
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify([local, ...loadLocal()])) } catch (e) {}
      }

      addNotification({ title: 'Purchase recorded', message: `Purchase recorded for product ${product?.name || product_id}`, type: 'success' })

      if (for_inventory) {
        const { batch } = createBatch({ packs: Number(packs || cartons || 0), units: Number(units || 0), pack_size: ps, cost: cost_per_pack, costType: 'per_pack', date })
        const newTotal = (product?.current_stock || product?.total_units_in_stock || 0) + totalUnits
        const newBatches = [ ...(product?.batches || []), batch ]
        updateProduct(product_id, { current_stock: newTotal, cost_per_unit: cost_per_unit, cost_per_pack: cost_per_pack, cost_per_carton: cost_per_carton, batches: newBatches })
      }
    } catch (err) {
      addNotification({ title: 'Error saving purchase', message: String(err), type: 'error' })
    }
  }

  async function updatePurchase(id, changes) {
    const idx = purchases.findIndex(p => p.id === id)
    if (idx === -1) return
    const prev = purchases[idx]
    const product = products.find(p => p.id === prev.product_id)
    const oldUnits = prev.total_units_bought || prev.total_units_added || 0
    const prevForInventory = typeof prev.for_inventory === 'undefined' ? true : !!prev.for_inventory

    const newPacks = typeof changes.packs !== 'undefined' ? Number(changes.packs || 0) : (prev.packs || prev.cartons || 0)
    const newUnits = typeof changes.units !== 'undefined' ? Number(changes.units || 0) : (prev.units || 0)
    const newProductId = typeof changes.product_id !== 'undefined' ? changes.product_id : prev.product_id
    const newProduct = products.find(p => p.id === newProductId) || product
    const newTotalUnits = fromCartonsUnits(newPacks, newUnits, newProduct?.units_per_pack || newProduct?.pack_size || 1)

    const newForInventory = typeof changes.for_inventory === 'undefined' ? prevForInventory : !!changes.for_inventory

    if (prevForInventory && newForInventory) {
      if (prev.product_id === newProductId) {
        updateProduct(newProductId, { current_stock: Math.max(0, (newProduct?.current_stock || newProduct?.total_units_in_stock || 0) - oldUnits + newTotalUnits) })
      } else {
        const prevProduct = products.find(p => p.id === prev.product_id)
        if (prevProduct) updateProduct(prev.product_id, { current_stock: Math.max(0, (prevProduct?.current_stock || prevProduct?.total_units_in_stock || 0) - oldUnits) })
        if (newProduct) updateProduct(newProductId, { current_stock: (newProduct?.current_stock || newProduct?.total_units_in_stock || 0) + newTotalUnits })
      }
    } else if (prevForInventory && !newForInventory) {
      const prevProduct = products.find(p => p.id === prev.product_id)
      if (prevProduct) updateProduct(prev.product_id, { current_stock: Math.max(0, (prevProduct?.current_stock || prevProduct?.total_units_in_stock || 0) - oldUnits) })
    } else if (!prevForInventory && newForInventory) {
      if (newProduct) updateProduct(newProductId, { current_stock: (newProduct?.current_stock || newProduct?.total_units_in_stock || 0) + newTotalUnits })
    }

    const updated = {
      ...prev,
      ...changes,
      packs: newForInventory ? newPacks : null,
      cartons: newForInventory ? (prev.cartons || newPacks) : null,
      units: newForInventory ? newUnits : null,
      total_units_bought: newForInventory ? newTotalUnits : null,
      for_inventory: typeof newForInventory === 'undefined' ? prevForInventory : newForInventory,
      price_per_unit: newForInventory ? cost_per_unit : null,
      price_per_pack: newForInventory ? cost_per_pack : null,
      price_per_carton: newForInventory ? cost_per_carton : null,
      total_price: Number(changes.cost || prev.cost || prev.total_price || 0),
      type: changes.type || prev.type,
      product_name: !changes.product_id ? (changes.product_name || prev.product_name) : null
    }
    setPurchases(prevList => prevList.map(p => p.id === id ? updated : p))

    try {
      const uid = user?.id || null
      // Only send columns that exist in the current purchases table schema.
      // This avoids 400 Bad Request errors when attempting to PATCH unknown/dropped columns.
      if (uid && String(id).length === 36) {
        const allowed = ['product_id', 'product_name', 'type', 'payment_method', 'total_price', 'date', 'description', 'supplier', 'for_inventory', 'user_id']
        const dbChanges = {}
        for (const k of allowed) {
          if (typeof updated[k] !== 'undefined') dbChanges[k] = updated[k]
        }
        // Ensure user_id is set for DB writes
        if (!dbChanges.user_id) dbChanges.user_id = uid

        const { data, error } = await supabase.from('purchases').update(dbChanges).eq('id', id).select()
        if (error) throw error
      }
    } catch (err) {
      addNotification({ title: 'Warning', message: 'Purchase updated locally but failed to persist to DB', type: 'warning' })
    }

    addNotification({ title: 'Purchase updated', message: `Purchase updated for product ${newProduct?.name || newProductId}`, type: 'info' })
  }

  async function deletePurchase(id) {
    const p = purchases.find(x => x.id === id)
    if (!p) return
    const product = products.find(r => r.id === p.product_id)
    const pForInventory = typeof p.for_inventory === 'undefined' ? true : !!p.for_inventory
    if (pForInventory) updateProduct(p.product_id, { current_stock: Math.max(0, (product?.current_stock || product?.total_units_in_stock || 0) - (p.total_units_bought || p.total_units_added || 0)) })
    setPurchases(prev => prev.filter(x => x.id !== id))

    try {
      const uid = user?.id || null
      if (uid && String(id).length === 36) {
        const { error } = await supabase.from('purchases').delete().eq('id', id)
        if (error) throw error
      }
    } catch (err) {
      addNotification({ title: 'Warning', message: 'Purchase deleted locally but failed to delete from DB', type: 'warning' })
    }

    addNotification({ title: 'Purchase deleted', message: `Purchase removed for product ${product?.name || p.product_id}`, type: 'warning' })
  }

  return <PurchaseContext.Provider value={{ purchases, loading, addPurchase, updatePurchase, deletePurchase }}>{children}</PurchaseContext.Provider>
}

export default PurchaseContext

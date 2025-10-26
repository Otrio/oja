import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNotifications } from './NotificationContext'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'oja_products_v1'

const ProductContext = createContext(null)

export function useProducts() {
  return useContext(ProductContext)
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error(e)
    return []
  }
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const { addNotification } = useNotifications()

  useEffect(() => {
    // read auth session
    let mounted = true
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      setUser(session?.user ?? null)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    fetchProducts()

    return () => {
      mounted = false
      sub?.subscription?.unsubscribe && sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    // keep localStorage in sync as a fallback for unauthenticated mode
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch (e) {}
  }, [products])

  async function fetchProducts() {
    setLoading(true)
    try {
      // include batches when fetching products
      const { data, error } = await supabase
        .from('products')
        .select('*, batches(*)')
        .order('created_at', { ascending: false })

      if (error) {
        // fallback to local
        setProducts(loadLocal())
        addNotification({ title: 'Products (local)', message: 'Using local data. Sign in to sync with Supabase.', type: 'info', category: 'product' })
      } else {
        // Preserve any in-memory-only batches from the current state when replacing
        setProducts(prev => {
          const server = data || []
          return server.map(s => {
            const existing = prev.find(p => p.id === s.id)
            if (existing && existing.batches) return { ...s, batches: existing.batches }
            // server may include batches array nested in s.batches
            if (!s.batches) s.batches = []
            return s
          })
        })
      }
    } catch (err) {
      setProducts(loadLocal())
      addNotification({ title: 'Error loading products', message: err.message || String(err), type: 'error', category: 'product' })
    } finally {
      setLoading(false)
    }
  }

  // helper: get current user id (if signed in)
  const getUserId = () => user?.id || null

  const addProduct = async (product) => {
    try {
      // Prepare payload mapped to DB columns
      const payload = {
        name: product.name,
        category: product.category || null,
        description: product.description || null,
        units_per_pack: product.units_per_pack ?? product.pack_size ?? 1,
        units_per_carton: product.units_per_carton ?? product.carton_size ?? 1,
        unit_buying_price: product.cost_per_unit ?? product.unit_buying_price ?? null,
        pack_buying_price: product.cost_per_pack ?? product.pack_buying_price ?? null,
        carton_buying_price: product.carton_buying_price ?? null,
        unit_selling_price: product.unit_selling_price ?? product.selling_per_unit ?? null,
        pack_selling_price: product.pack_selling_price ?? product.selling_per_pack ?? null,
        carton_selling_price: product.carton_selling_price ?? null,
        current_stock: 0, // Start at 0 and let initial batch handle the stock
        minimum_stock: product.minimum_stock ?? product.low_stock_threshold ?? 0
      }

      const uid = getUserId()
      if (uid) payload.user_id = uid

      // Calculate initial stock
      const units = (Number(product.initial_packs || 0) * Number(product.pack_size || 1)) + Number(product.initial_units || 0)
      
      if (uid) {
        console.log('Creating product with payload:', payload)
        const { data: productData, error: productError } = await supabase.from('products').insert([payload]).select()
        if (productError) {
          console.error('Error creating product:', productError)
          throw productError
        }
        if (!productData || !productData[0]) {
          throw new Error('No product data returned from server')
        }
        
        const serverProduct = productData[0]
        console.log('Product created:', serverProduct)

        // Create the initial batch
        const batchPayload = {
          product_id: serverProduct.id,
          packs: Number(product.initial_packs || 0),
          units: Number(product.initial_units || 0),
          units_added: units,
          remaining_units: units,
          cost_per_unit: product.cost_per_unit || serverProduct.unit_buying_price || null,
          cost_per_pack: product.cost_per_pack || serverProduct.pack_buying_price || null,
          user_id: uid,
          notes: "Initial batch",
          created_at: new Date().toISOString()
        }
        // If we have cost_per_pack but no cost_per_unit, calculate it
        if (!batchPayload.cost_per_unit && batchPayload.cost_per_pack) {
          const packSize = Number(serverProduct.units_per_pack || serverProduct.pack_size || 1)
          batchPayload.cost_per_unit = Number(batchPayload.cost_per_pack) / packSize
        }
        // If we have cost_per_unit but no cost_per_pack, calculate it
        if (!batchPayload.cost_per_pack && batchPayload.cost_per_unit) {
          const packSize = Number(serverProduct.units_per_pack || serverProduct.pack_size || 1)
          batchPayload.cost_per_pack = Number(batchPayload.cost_per_unit) * packSize
        }

        console.log('Creating batch with payload:', batchPayload)
        const { data: batchData, error: batchError } = await supabase.from('batches').insert([batchPayload]).select()
        if (batchError) {
          console.error('Error creating batch:', batchError)
          // If batch creation fails, delete the product to maintain consistency
          await supabase.from('products').delete().match({ id: serverProduct.id })
          throw batchError
        }

        // Update product's current stock
        const { error: updateError } = await supabase
          .from('products')
          .update({ current_stock: units })
          .eq('id', serverProduct.id)
        
        if (updateError) {
          console.error('Error updating product stock:', updateError)
          throw updateError
        }

        // Add to state with batch
        const finalProduct = {
          ...serverProduct,
          current_stock: units,
          batches: batchData
        }
        setProducts(prev => [finalProduct, ...prev])
        addNotification({ 
          title: 'Product added', 
          message: `"${product.name}" added successfully with initial stock of ${units} units`, 
          type: 'success', 
          category: 'product' 
        })
      } else {
        // Local mode (no auth)
        const localProduct = { 
          id: `local-${Date.now()}`, 
          ...payload,
          current_stock: units,
          // Don't include image field
          name: product.name,
          category: product.category || null
        }
        
        // Create local batch
        const localBatch = {
          id: `local-batch-${Date.now()}`,
          product_id: localProduct.id,
          packs: Number(product.initial_packs || 0),
          units: Number(product.initial_units || 0),
          units_added: units,
          remaining_units: units,
          created_at: new Date().toISOString()
        }

        localProduct.batches = [localBatch]
        
        // Update state and localStorage
        setProducts(prev => [localProduct, ...prev])
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify([localProduct, ...loadLocal()]))
        } catch (e) {
          console.error('Error saving to localStorage:', e)
        }
        
        addNotification({ 
          title: 'Product added (local)', 
          message: `"${product.name}" added locally with initial stock of ${units} units`, 
          type: 'success', 
          category: 'product' 
        })
      }
    } catch (error) {
      console.error('Error in addProduct:', error)
      addNotification({ 
        title: 'Error adding product', 
        message: error.message || String(error), 
        type: 'error', 
        category: 'product' 
      })
      throw error // Re-throw to allow form to handle error
    }


  }

  async function updateProduct(id, changes, options = { persist: true }) {
    const uid = getUserId()
    const persist = options && typeof options.persist !== 'undefined' ? options.persist : true
    // Capture previous product state for notifications
    const oldProduct = products.find(p => p.id === id)

    try {
      // Optimistically update local state so UI updates immediately
      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...changes } : p))

      if (!persist) {
        // local-only update requested: persist to localStorage and return early
        try {
          const local = loadLocal().map(p => p.id === id ? { ...p, ...changes } : p)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
        } catch (e) {}
        return
      }

      if (uid && String(id).length === 36) {
        // Persist to server
        const { data, error } = await supabase.from('products').update(changes).eq('id', id).select()
        if (error) throw error

        // Replace product with server copy but preserve any batch list from the optimistic update or previous state
        setProducts(prev => prev.map(p => {
          if (p.id !== id) return p
          const updated = data[0] || {}
          // If server response doesn't include batches, keep the batches from current local state or from changes
          if (!updated.batches) updated.batches = (changes && changes.batches) ? changes.batches : p.batches
          // Ensure stock fields are preserved/overwritten by server where appropriate
          return { ...p, ...updated }
        }))
      } else {
        // Local update only (no auth or non-uuid id)
        try {
          const local = loadLocal().map(p => p.id === id ? { ...p, ...changes } : p)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
        } catch (e) {}
      }

      // Inventory notifications (compare previous known state to the intended new value)
      if (oldProduct) {
        const oldTotal = Number(oldProduct.current_stock || oldProduct.total_units_in_stock || 0)
        const newTotal = Number((changes.current_stock ?? changes.total_units_in_stock) ?? oldProduct.current_stock ?? oldProduct.total_units_in_stock ?? 0)
        const threshold = Number(oldProduct.minimum_stock || oldProduct.low_stock_threshold || 0)
        if (oldTotal > 0 && newTotal === 0) {
          addNotification({ title: 'Out of stock', message: `${oldProduct.name} is now out of stock`, type: 'warning', category: 'inventory' })
        } else if (oldTotal > threshold && newTotal <= threshold) {
          addNotification({ title: 'Low stock', message: `${oldProduct.name} needs restocking (<= ${threshold} units)`, type: 'info', category: 'inventory' })
        }
      }
    } catch (err) {
      addNotification({ title: 'Error updating product', message: err.message || String(err), type: 'error', category: 'product' })
    }
  }

  async function deleteProduct(id) {
    const uid = getUserId()
    try {
      if (uid && String(id).length === 36) {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error
        setProducts(prev => prev.filter(p => p.id !== id))
      } else {
        // local delete
        setProducts(prev => prev.filter(p => p.id !== id))
        try {
          const local = loadLocal().filter(p => p.id !== id)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(local))
        } catch (e) {}
      }
      addNotification({ title: 'Product deleted', message: 'Product removed', type: 'warning', category: 'product' })
    } catch (err) {
      addNotification({ title: 'Error deleting product', message: err.message || String(err), type: 'error', category: 'product' })
    }
  }

  // Lightweight batch helpers kept for UI/UX: these manipulate in-memory state and attempt to persist current_stock
  function addBatch(productId, batchPayload = {}) {
    // If user is authenticated, persist batch to server; otherwise keep in-memory local batch
    const uid = getUserId()
    if (uid && String(productId).length === 36) {
      // prepare payload mapped to DB columns
      const payload = {
        product_id: productId,
        packs: batchPayload.packs ?? 0,
        cartons: batchPayload.cartons ?? 0,
        units: batchPayload.units ?? 0,
        units_added: null, // compute server-side or compute here
        remaining_units: null,
        cost_per_unit: batchPayload.cost_per_unit ?? null,
        cost_per_pack: batchPayload.cost_per_pack ?? null,
        selling_per_unit: batchPayload.selling_per_unit ?? null,
        selling_per_pack: batchPayload.selling_per_pack ?? null,
        user_id: uid,
        notes: batchPayload.notes ?? null,
        created_at: batchPayload.date ? new Date(batchPayload.date).toISOString() : undefined
      }
      // compute units on client for immediate feedback
      const product = products.find(p => p.id === productId)
      const cs = Number(product?.units_per_pack || product?.pack_size || product?.units_per_carton || 1)
      const qtyPacks = Number(batchPayload.packs ?? batchPayload.cartons ?? 0)
      const totalUnits = Math.round((qtyPacks * cs) + Number(batchPayload.units || 0))
      payload.units_added = totalUnits
      payload.remaining_units = totalUnits

      ;(async () => {
        try {
          const { data, error } = await supabase.from('batches').insert([payload]).select()
          if (error) throw error
          const saved = data[0]
          // update local products state with returned batch
          setProducts(prev => prev.map(p => p.id === productId ? { ...p, batches: [ ...(p.batches || []), saved ], current_stock: (p.current_stock || 0) + totalUnits } : p))
          addNotification({ title: 'Batch added', message: `Batch added to "${product?.name}" (+${totalUnits} units)`, type: 'info', category: 'batch' })
        } catch (err) {
          addNotification({ title: 'Error adding batch', message: err.message || String(err), type: 'error', category: 'batch' })
        }
      })()
    } else {
      // local/in-memory fallback
      setProducts(prev => prev.map(prod => {
        if (prod.id !== productId) return prod
        const cs = prod.units_per_pack || prod.pack_size || prod.units_per_carton || 1
        const qtyPacks = Number(batchPayload.packs ?? batchPayload.cartons ?? 0)
        const totalUnits = Math.round((qtyPacks * cs) + Number(batchPayload.units || 0))
        const newBatch = {
          id: `local-${Date.now()}-${Math.floor(Math.random()*10000)}`,
          packs: qtyPacks,
          cartons: batchPayload.cartons ?? null,
          units: Number(batchPayload.units || 0),
          units_added: totalUnits,
          remaining_units: totalUnits,
          cost_per_unit: batchPayload.cost_per_unit ?? null,
          cost_per_pack: batchPayload.cost_per_pack ?? null,
          selling_per_unit: batchPayload.selling_per_unit ?? null,
          selling_per_pack: batchPayload.selling_per_pack ?? null,
          createdAt: batchPayload.date ? new Date(batchPayload.date).toISOString() : new Date().toISOString()
        }
        const updatedProd = { 
          ...prod, 
          current_stock: (prod.current_stock || 0) + totalUnits,
          batches: [ ...(prod.batches || []), newBatch ]
        }
        updateProduct(updatedProd.id, { current_stock: updatedProd.current_stock })
        addNotification({ title: 'Batch added (local)', message: `Batch added to "${prod.name}" (+${totalUnits} units)`, type: 'info', category: 'batch' })
        return updatedProd
      }))
    }
  }

  async function updateBatch(productId, batchId, changes = {}) {
    console.log('Updating batch:', { productId, batchId, changes })
    const uid = getUserId()
    
    try {
      if (uid && String(productId).length === 36 && String(batchId).length === 36) {
        // Server-side update
        // First, get the current batch to preserve any fields we're not updating
        const { data: currentBatch, error: fetchError } = await supabase
          .from('batches')
          .select('*')
          .eq('id', batchId)
          .single()
        
        if (fetchError) throw fetchError
        if (!currentBatch) throw new Error('Batch not found')

        const payload = {
          id: currentBatch.id,
          product_id: currentBatch.product_id,
          user_id: uid,
          packs: Number(changes.packs || 0),
          cartons: Number(changes.packs || 0),
          units: Number(changes.units || 0),
          cost_per_unit: Number(changes.cost_per_unit || 0),
          cost_per_pack: Number(changes.cost_per_pack || 0),
          units_added: Number(changes.units_added || 0),
          remaining_units: Number(changes.remaining_units || 0),
          created_at: changes.created_at || currentBatch.created_at
        }
        
        console.log('Updating batch with payload:', payload)
        
        const { data, error } = await supabase
          .from('batches')
          .update(payload)
          .eq('id', batchId)
          .select()
        
        if (error) throw error
        
        const saved = data[0]
        if (!saved) throw new Error('No batch data returned from server')
        
        console.log('Batch updated successfully:', saved)
        
        // Update local state with saved batch
        setProducts(prev => prev.map(prod => {
          if (prod.id !== productId) return prod
          
          // Replace the edited batch in the batches array
          const batches = (prod.batches || []).map(b => b.id === batchId ? saved : b)
          
          // Recalculate total stock from all batches
          const totalRemaining = batches.reduce((sum, b) => (
            sum + Number(b.remaining_units || b.units_added || 0)
          ), 0)
          
          // Update product's current_stock in DB (in background)
          updateProduct(prod.id, { current_stock: totalRemaining })
          
          return {
            ...prod,
            batches,
            current_stock: totalRemaining
          }
        }))

        addNotification({
          title: 'Batch updated',
          message: `Batch updated successfully`,
          type: 'success',
          category: 'batch'
        })
      } else {
        // Local update
        setProducts(prev => prev.map(prod => {
          if (prod.id !== productId) return prod
          
          const batches = Array.isArray(prod.batches) ? prod.batches.slice() : []
          const idx = batches.findIndex(b => b.id === batchId)
          if (idx === -1) return prod

          // Update the batch with changes
          const oldBatch = batches[idx]
          const updatedBatch = {
            ...oldBatch,
            packs: Number(changes.packs || oldBatch.packs || 0),
            units: Number(changes.units || oldBatch.units || 0),
            cost_per_unit: Number(changes.cost_per_unit || oldBatch.cost_per_unit || 0),
            cost_per_pack: Number(changes.cost_per_pack || oldBatch.cost_per_pack || 0),
            units_added: Number(changes.units_added || oldBatch.units_added || 0),
            remaining_units: Number(changes.remaining_units || oldBatch.remaining_units || 0),
            created_at: changes.created_at || oldBatch.created_at
          }
          batches[idx] = updatedBatch

          // Recalculate total stock
          const totalRemaining = batches.reduce((sum, b) => (
            sum + Number(b.remaining_units || b.units_added || 0)
          ), 0)

          const updatedProd = {
            ...prod,
            batches,
            current_stock: totalRemaining
          }

          // Update product's stock in background
          updateProduct(prod.id, { current_stock: totalRemaining })

          addNotification({
            title: 'Batch updated',
            message: `Batch updated for "${prod.name}"`,
            type: 'success',
            category: 'batch'
          })

          return updatedProd
        }))
      }
    } catch (err) {
      console.error('Error updating batch:', err)
      addNotification({
        title: 'Error updating batch',
        message: err.message || String(err),
        type: 'error',
        category: 'batch'
      })
    }
  }

  function deleteBatch(productId, batchId) {
    const uid = getUserId()
    if (uid && String(productId).length === 36 && String(batchId).length === 36) {
      ;(async () => {
        try {
          const { error } = await supabase.from('batches').delete().eq('id', batchId)
          if (error) throw error
          setProducts(prev => prev.map(prod => {
            if (prod.id !== productId) return prod
            const batches = Array.isArray(prod.batches) ? prod.batches.filter(b => b.id !== batchId) : []
            const totalRemaining = batches.reduce((s, b) => s + Number(b.remaining_units ?? b.units_added ?? 0), 0)
            const updatedProd = { ...prod, batches, current_stock: totalRemaining }
            if (typeof updatedProd.current_stock !== 'undefined') updateProduct(prod.id, { current_stock: updatedProd.current_stock })
            return updatedProd
          }))
          addNotification({ title: 'Batch deleted', message: `Batch removed`, type: 'warning', category: 'batch' })
        } catch (err) {
          addNotification({ title: 'Error deleting batch', message: err.message || String(err), type: 'error', category: 'batch' })
        }
      })()
    } else {
      setProducts(prev => prev.map(prod => {
        if (prod.id !== productId) return prod
        const batches = Array.isArray(prod.batches) ? prod.batches.slice() : []
        const idx = batches.findIndex(b => b.id === batchId)
        if (idx === -1) return prod
        const batch = batches[idx]
        const removedUnits = Number(batch.remaining_units || batch.units_added || 0)
        batches.splice(idx, 1)
        const updatedProd = { ...prod, batches, current_stock: Math.max(0, (prod.current_stock || 0) - removedUnits) }
        if (typeof updatedProd.current_stock !== 'undefined') updateProduct(prod.id, { current_stock: updatedProd.current_stock })
        addNotification({ title: 'Batch deleted', message: `Batch removed from "${prod.name}" (-${removedUnits} units)`, type: 'warning', category: 'batch' })
        return updatedProd
      }))
    }
  }

  const value = {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    addBatch,
    updateBatch,
    deleteBatch,
    // Archive helpers used by History page
    restoreArchivedBatch: async (productId, batchId) => {
      try {
        // Find product and batch locally
        const prod = products.find(p => p.id === productId)
        if (!prod) throw new Error('Product not found')
        const batch = (prod.batches || []).find(b => b.id === batchId)
        if (!batch) throw new Error('Batch not found')

        // If batch is archived (remaining_units === 0), restore by setting remaining_units = units_added
        const unitsAdded = Number(batch.units_added || batch.unitsAdded || batch.units || 0)
        if (unitsAdded <= 0) throw new Error('Cannot restore batch with no units')

        await updateBatch(productId, batchId, { remaining_units: unitsAdded })
      } catch (err) {
        addNotification({ title: 'Error restoring batch', message: err.message || String(err), type: 'error', category: 'batch' })
      }
    },
    deleteArchivedBatch: async (productId, batchId) => {
      try {
        // Reuse deleteBatch implementation which handles server/local modes
        deleteBatch(productId, batchId)
      } catch (err) {
        addNotification({ title: 'Error deleting archived batch', message: err.message || String(err), type: 'error', category: 'batch' })
      }
    },
    refetch: fetchProducts
  }

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
}

export default ProductContext

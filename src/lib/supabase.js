import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  return { data, error }
}

export const addProduct = async (product) => {
  // First create the product
  const { data: productData, error: productError } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      category: product.category,
      description: product.description,
      pack_size: product.pack_size,
      current_stock: 0, // Start at 0
      cost_per_unit: product.cost_per_unit,
      cost_per_pack: product.cost_per_pack,
      selling_per_unit: product.selling_per_unit,
      selling_per_pack: product.selling_per_pack,
      low_stock_threshold: product.low_stock_threshold,
      image: product.image
    }])
    .select()

  if (productError) {
    console.error('Error creating product:', productError)
    return { error: productError }
  }

  if (!productData || !productData[0]) {
    return { error: new Error('No product data returned') }
  }

  const newProduct = productData[0]

  // Calculate initial stock
  const totalUnits = (Number(product.initial_packs || 0) * Number(product.pack_size || 1)) + Number(product.initial_units || 0)

  if (totalUnits > 0) {
    // Create initial batch
    const { error: batchError } = await supabase
      .from('batches')
      .insert([{
        product_id: newProduct.id,
        packs: Number(product.initial_packs || 0),
        units: Number(product.initial_units || 0),
        units_added: totalUnits,
        remaining_units: totalUnits,
        cost_per_unit: product.cost_per_unit,
        cost_per_pack: product.cost_per_pack,
        notes: 'Initial batch',
        created_at: new Date().toISOString()
      }])

    if (batchError) {
      console.error('Error creating batch:', batchError)
      // Clean up the product since batch creation failed
      await supabase.from('products').delete().eq('id', newProduct.id)
      return { error: batchError }
    }

    // Update product's stock
    await supabase
      .from('products')
      .update({ current_stock: totalUnits })
      .eq('id', newProduct.id)
  }

  return { data: newProduct }
}

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteProduct = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  return { error }
}

// Sales
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select(`
      *,
      products (
        name,
        category,
        units_per_pack,
        units_per_carton
      )
    `)
  return { data, error }
}

export const addSale = async (sale) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
  return { data, error }
}

export const updateSale = async (id, updates) => {
  const { data, error } = await supabase
    .from('sales')
    .update(updates)
    .eq('id', id)
    .select()
  return { data, error }
}

export const deleteSale = async (id) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id)
  return { error }
}

// Purchases
export const getPurchases = async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      *,
      products (
        name,
        category,
        units_per_pack,
        units_per_carton
      )
    `)
  return { data, error }
}

export const addPurchase = async (purchase) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchase])
    .select()
  return { data, error }
}

export const updatePurchase = async (id, updates) => {
  const { data, error } = await supabase
    .from('purchases')
    .update(updates)
    .eq('id', id)
    .select()
  return { error }
}

export const deletePurchase = async (id) => {
  const { error } = await supabase
    .from('purchases')
    .delete()
    .eq('id', id)
  return { error }
}
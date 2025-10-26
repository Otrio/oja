import { supabase } from '../config/supabase'

// Products
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  return { data, error }
}

export const addProduct = async (product) => {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select()
  return { data, error }
}

// Sales
export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
  return { data, error }
}

export const addSale = async (sale) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([sale])
    .select()
  return { data, error }
}

// Purchases
export const getPurchases = async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select('*')
  return { data, error }
}

export const addPurchase = async (purchase) => {
  const { data, error } = await supabase
    .from('purchases')
    .insert([purchase])
    .select()
  return { data, error }
}
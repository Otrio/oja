// Migration helpers: convert legacy carton_* fields to pack_* fields in localStorage
export function migrateCartonToPackInObject(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const copy = { ...obj }
  // product-level keys
  if (typeof copy.carton_size !== 'undefined' && typeof copy.pack_size === 'undefined') {
    copy.pack_size = copy.carton_size
  }
  if (typeof copy.initial_cartons !== 'undefined' && typeof copy.initial_packs === 'undefined') {
    copy.initial_packs = copy.initial_cartons
  }
  if (typeof copy.cost_per_carton !== 'undefined' && typeof copy.cost_per_pack === 'undefined') {
    copy.cost_per_pack = copy.cost_per_carton
  }
  if (typeof copy.selling_per_carton !== 'undefined' && typeof copy.selling_per_pack === 'undefined') {
    copy.selling_per_pack = copy.selling_per_carton
  }

  // batch-level keys
  if (Array.isArray(copy.batches)) {
    copy.batches = copy.batches.map(b => migrateCartonToPackInObject(b))
  }

  return copy
}

export function migrateLocalStorageCartonToPack() {
  // keys we care about
  const keys = ['oja_products_v1', 'oja_purchases_v1', 'oja_sales_v1']
  let changed = 0
  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const arr = JSON.parse(raw)
      if (!Array.isArray(arr)) continue
      const out = arr.map(item => {
        // copy and migrate known keys
        const copy = migrateCartonToPackInObject(item)
        // purchases/sales: convert 'cartons' -> 'packs' when present
        if (typeof copy.cartons !== 'undefined' && typeof copy.packs === 'undefined') copy.packs = copy.cartons
        return copy
      })
      localStorage.setItem(key, JSON.stringify(out))
      changed += 1
    } catch (e) {
      console.warn('migration failed for', key, e)
    }
  }
  return changed
}

export default { migrateCartonToPackInObject, migrateLocalStorageCartonToPack }
// Migration helpers: convert legacy carton_* keys to pack_* keys in objects
export function migrateProduct(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = { ...obj }
  if (obj.carton_size && !obj.pack_size) out.pack_size = obj.carton_size
  if (obj.initial_cartons && !obj.initial_packs) out.initial_packs = obj.initial_cartons
  if (obj.cost_per_carton && !obj.cost_per_pack) out.cost_per_pack = obj.cost_per_carton
  if (obj.selling_per_carton && !obj.selling_per_pack) out.selling_per_pack = obj.selling_per_carton
  // keep legacy fields for safety
  return out
}

export function migratePurchase(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = { ...obj }
  if (obj.cartons && !obj.packs) out.packs = obj.cartons
  if (obj.type === 'carton') out.type = 'pack'
  return out
}

export function migrateSale(obj) {
  if (!obj || typeof obj !== 'object') return obj
  const out = { ...obj }
  if (obj.cartons && !obj.packs) out.packs = obj.cartons
  if (obj.type === 'carton') out.type = 'pack'
  return out
}

export function migrateAllLocalStorage() {
  const keys = ['oja_products_v1', 'oja_purchases_v1', 'oja_sales_v1']
  const result = { migrated: 0, errors: [] }
  keys.forEach(k => {
    try {
      const raw = localStorage.getItem(k)
      if (!raw) return
      const arr = JSON.parse(raw)
      let changed = false
      const out = arr.map(item => {
        let n = { ...item }
        if (k.startsWith('oja_products')) n = migrateProduct(n)
        if (k.startsWith('oja_purchases')) n = migratePurchase(n)
        if (k.startsWith('oja_sales')) n = migrateSale(n)
        if (JSON.stringify(n) !== JSON.stringify(item)) changed = true
        return n
      })
      if (changed) {
        localStorage.setItem(k, JSON.stringify(out))
        result.migrated += 1
      }
    } catch (err) {
      result.errors.push({ key: k, error: String(err) })
    }
  })
  return result
}

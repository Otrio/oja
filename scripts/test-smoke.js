/*
  Smoke test for the frontend data model using localStorage-like JSON files.
  This script runs in Node and simulates the key behaviors by reading/writing the same files
  that the browser localStorage would contain during development.

  NOTE: This is a simple environment check — it doesn't run the React app.
*/
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function read(key) {
  const file = path.resolve(__dirname, '..', 'tmp', key + '.json')
  if (!fs.existsSync(file)) return []
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function write(key, data) {
  const dir = path.resolve(__dirname, '..', 'tmp')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  fs.writeFileSync(path.resolve(dir, key + '.json'), JSON.stringify(data, null, 2))
}

// Seed sample data
const now = Date.now()
const products = [ { id: now+1, name: 'Test A', pack_size: 12, cost_per_unit: 1, cost_per_pack: 12, selling_per_unit: 2, selling_per_pack: 24, total_units_in_stock: 100 } ]
write('oja_products_v1', products)

// Add purchase
const purchases = [ { id: now+10, product_id: now+1, quantity: 2, type: 'pack', packs: 2, total_units_added: 24, cost: 24, date: new Date().toISOString().slice(0,10) } ]
write('oja_purchases_v1', purchases)

// Add sale
const sales = [ { id: now+20, product_id: now+1, quantity: 5, type: 'unit', total_units_sold: 5, price: 2*5, profit: (2-1)*5, date: new Date().toISOString().slice(0,10) } ]
write('oja_sales_v1', sales)

// Assertions
const rProducts = read('oja_products_v1')
const rPurchases = read('oja_purchases_v1')
const rSales = read('oja_sales_v1')

if (rProducts.length !== 1) { console.error('FAIL: products count'); process.exit(2) }
if (rPurchases.length !== 1) { console.error('FAIL: purchases count'); process.exit(2) }
if (rSales.length !== 1) { console.error('FAIL: sales count'); process.exit(2) }

console.log('Smoke test PASS: sample product/purchase/sale present in tmp files')
process.exit(0)

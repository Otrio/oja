// Utility functions for unit/carton conversion and profit calculation
export function toUnits(quantity, type, pack_size = 1) {
  if (type === 'unit') return Math.round(quantity)
  if (type === 'pack') return Math.round(quantity * pack_size)
  if (type === 'half') return Math.round(quantity * 0.5 * pack_size)
  if (type === 'quarter') return Math.round(quantity * 0.25 * pack_size)
  // fallback: treat as units
  return Math.round(quantity)
}

export function calcProfitPerSale({ product, quantity, type, price }) {
  // product: { cost_per_unit, cost_per_pack, pack_size }
  const pack_size = product?.pack_size || 1
  const units = toUnits(quantity, type, pack_size)
  const cost_per_unit = product?.cost_per_unit ?? (product?.cost_per_pack ? product.cost_per_pack / pack_size : 0)
  // price: if sale by unit, price is per unit; if by carton/half/quarter, price may be total for the quantity
  let selling_per_unit = price
  if (type !== 'unit') {
    // price is considered the total price for the 'quantity' of type (e.g., 2 cartons => price for 2 cartons)
    // convert to per unit by dividing by total units represented by quantity
  const totalUnits = toUnits(quantity, type, pack_size)
    selling_per_unit = totalUnits ? (price / totalUnits) : 0
  }
  const profit = (selling_per_unit - cost_per_unit) * units
  return { units, profit, selling_per_unit, cost_per_unit }
}

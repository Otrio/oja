import { describe, it, expect } from 'vitest'
import { canFulfillSale } from '../context/SaleContext'

describe('Sale validation helpers', () => {
  it('returns false when product is missing', () => {
    expect(canFulfillSale(null, 5)).toBe(false)
  })

  it('returns false when requested units exceed available stock', () => {
    const product = { id: 1, total_units_in_stock: 10 }
    expect(canFulfillSale(product, 11)).toBe(false)
  })

  it('returns true when requested units are within available stock', () => {
    const product = { id: 1, total_units_in_stock: 10 }
    expect(canFulfillSale(product, 10)).toBe(true)
    expect(canFulfillSale(product, 0)).toBe(true)
  })
})

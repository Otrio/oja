import assert from 'assert'
import { computeInitialUnits, computeCostPerUnit } from '../src/utils/productFormUtils.js'

function almostEqual(a, b, eps = 1e-6) {
  return Math.abs(Number(a) - Number(b)) < eps
}

try {
  // initial units
  assert.strictEqual(computeInitialUnits(12, 0), 0, '12 x 0 should be 0')
  assert.strictEqual(computeInitialUnits(12, 2), 24, '12 x 2 should be 24')
  assert.strictEqual(computeInitialUnits('6', '3'), 18, 'string inputs should coerce')

  // cost per unit
  assert.strictEqual(computeCostPerUnit(0, 12), '', 'zero cost should return empty string')
  assert.strictEqual(computeCostPerUnit('', 12), '', 'empty cost should return empty string')
  assert.strictEqual(computeCostPerUnit(1440, 12), '120.00', '1440 / 12 = 120.00')
  assert.strictEqual(computeCostPerUnit('100', '4'), '25.00', 'string inputs should work')

  console.log('All product form helper tests passed ✅')
  process.exit(0)
} catch (err) {
  console.error('Product form helper tests failed ❌')
  console.error(err)
  process.exit(1)
}

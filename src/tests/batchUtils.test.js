import { describe, it, expect } from 'vitest'
import { createBatch, allocateFromBatches } from '../utils/batchUtils'

describe('batchUtils', () => {
  it('creates batch with correct units and costs', () => {
    const { batch, totalUnits } = createBatch({ packs: 2, units: 5, pack_size: 10, cost: 200, costType: 'per_pack' })
    expect(totalUnits).toBe(25)
    expect(batch.cost_per_unit).toBeCloseTo(200 / 10)
    expect(batch.remaining_units).toBe(25)
  })

  it('allocates from batches FIFO', () => {
    const b1 = { id: 1, remaining_units: 10, cost_per_unit: 5 }
    const b2 = { id: 2, remaining_units: 20, cost_per_unit: 6 }
    const { allocations, updatedBatches, taken } = allocateFromBatches([b1, b2], 25)
    expect(taken).toBe(25)
    expect(allocations.length).toBe(2)
    expect(allocations[0].unitsTaken).toBe(10)
    expect(allocations[1].unitsTaken).toBe(15)
    expect(updatedBatches[0].remaining_units).toBe(0)
    expect(updatedBatches[1].remaining_units).toBe(5)
  })
})

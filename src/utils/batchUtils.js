export function createBatch({ packs = 0, units = 0, pack_size = 1, cost = 0, costType = 'per_pack', date } = {}) {
  const ps = Number(pack_size || 1)
  const totalUnits = Math.round((Number(packs || 0) * ps) + Number(units || 0))
  let cost_per_unit = 0
  let cost_per_pack = 0
  if (costType === 'per_pack') {
    cost_per_pack = Number(cost || 0)
    cost_per_unit = ps ? cost_per_pack / ps : 0
  } else {
    cost_per_unit = Number(cost || 0)
    cost_per_pack = cost_per_unit * ps
  }
  const batch = {
    id: Date.now(),
    createdAt: date || new Date().toISOString(),
    units_added: totalUnits,
    packs: Number(packs || 0),
    units: Number(units || 0),
    cost_per_unit,
    cost_per_pack,
    remaining_units: totalUnits
  }
  return { batch, totalUnits }
}

// Allocate unitsToTake from batches FIFO. Returns allocations, updatedBatches, taken
export function allocateFromBatches(batches = [], unitsToTake) {
  // Ensure we allocate from oldest batches first: sort by creation date ascending
  const sorted = (batches || []).slice().sort((a, b) => {
    const dateA = new Date(a.createdAt || a.created_at || a.created || 0)
    const dateB = new Date(b.createdAt || b.created_at || b.created || 0)
    return dateA - dateB
  })
  const updated = sorted.map(b => ({ ...b }))
  const allocations = []
  let remaining = Number(unitsToTake || 0)
  for (let i = 0; i < updated.length && remaining > 0; i++) {
    const b = updated[i]
    const available = Math.max(0, b.remaining_units || 0)
    const take = Math.min(available, remaining)
    if (take > 0) {
      allocations.push({ batchId: b.id, unitsTaken: take, unitCost: b.cost_per_unit || 0 })
      b.remaining_units = Math.max(0, (b.remaining_units || 0) - take)
      remaining -= take
    }
  }
  const taken = Number(unitsToTake || 0) - remaining
  return { allocations, updatedBatches: updated, taken }
}

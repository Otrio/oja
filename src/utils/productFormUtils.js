export function computeInitialUnits(packSize, initialPacks) {
  const ps = Number(packSize || 1)
  const packs = Number(initialPacks || 0)
  return ps * packs
}

export function computeCostPerUnit(costPerPack, packSize) {
  const ps = Number(packSize || 1)
  const cpp = Number(costPerPack || 0)
  if (!cpp || ps <= 0) return ''
  return (cpp / ps).toFixed(2)
}

import React, { useState } from 'react'
import { migrateAllLocalStorage } from '../utils/migrations'

export default function MigrationRunner() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState(null)

  function run() {
    if (!confirm('This will migrate localStorage data from legacy carton_* fields to pack_* fields. Continue?')) return
    setRunning(true)
    try {
      const r = migrateAllLocalStorage()
      setResult(r)
    } catch (err) {
      setResult({ error: String(err) })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="p-3 bg-yellow-50 rounded">
      <div className="text-sm text-yellow-800 font-medium">Dev: Run data migration</div>
      <div className="text-xs text-yellow-700 mt-1">Converts legacy carton_* fields in localStorage to pack_* equivalents.</div>
      <div className="mt-2 flex items-center gap-2">
        <button onClick={run} disabled={running} className="px-3 py-1 rounded bg-yellow-600 text-white">Run migration</button>
        <button onClick={() => { localStorage.clear(); setResult('localStorage cleared') }} className="px-3 py-1 bg-gray-200 rounded">Clear localStorage</button>
        {running && <div className="text-sm">Running…</div>}
      </div>
      {result && (
        <pre className="mt-2 text-xs bg-white p-2 overflow-auto">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  )
}

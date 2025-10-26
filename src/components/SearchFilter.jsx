import React from 'react'

export default function SearchFilter({ value, onChange }) {
  return <input value={value} onChange={e => onChange(e.target.value)} placeholder="Search..." className="p-2 border rounded w-full" />
}

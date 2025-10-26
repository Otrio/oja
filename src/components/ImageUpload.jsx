import React, { useState } from 'react'

export default function ImageUpload({ onChange, initial }) {
  const [preview, setPreview] = useState(initial || null)

  function onFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => { setPreview(r.result); onChange?.(r.result) }
    r.readAsDataURL(f)
  }

  return (
    <div className="flex items-center gap-2">
      <input aria-label="Upload image" title="Upload product image" type="file" accept="image/*" onChange={onFile} />
      {preview && <img src={preview} alt="preview" className="w-16 h-16 object-cover rounded" />}
    </div>
  )
}

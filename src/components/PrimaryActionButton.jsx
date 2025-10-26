import React from 'react'

export default function PrimaryActionButton({ onClick, disabled = false, children, className = '' }) {
  const base = 'sb-transition-base px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2'
  const enabled = 'bg-gradient-to-r from-supabase-600 to-supabase-500 text-white hover:from-supabase-500 hover:to-supabase-400 sb-hover-translate'
  const disabledClass = 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
  const classes = `${base} ${disabled ? disabledClass : enabled} ${className}`.trim()

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  )
}

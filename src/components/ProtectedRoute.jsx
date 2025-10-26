import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function ProtectedRoute({ children, roles }) {
  const { user } = useUser()
  const loc = useLocation()
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
  if (roles && roles.length > 0) {
    const normalizedRoles = roles.map(r => r.toString().toLowerCase())
    const userRole = (user.role || '').toString().toLowerCase()
    if (!normalizedRoles.includes(userRole)) {
      return (
        <div className="p-6 modern-card">
          <h3 className="text-lg font-semibold">Access denied</h3>
          <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
        </div>
      )
    }
  }
  return children
}

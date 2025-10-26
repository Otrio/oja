import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return children
}
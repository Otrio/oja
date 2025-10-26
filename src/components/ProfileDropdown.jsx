import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function ProfileDropdown({ isOpen, onClose }) {
  const nav = useNavigate()
  const { logout } = useUser()

  const ref = React.useRef(null)

  React.useEffect(() => {
    function onDoc(e) {
      if (!isOpen) return
      if (ref.current && !ref.current.contains(e.target)) {
        onClose && onClose()
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function doLogout() {
    logout()
    onClose && onClose()
    nav('/login')
  }

  const user = useUser().user
  const isAdmin = ((user?.role || '').toString().toLowerCase() === 'admin')

  return (
    <div ref={ref} className="absolute right-6 top-16 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
      <div className="p-2">
        <Link to="/profile" onClick={onClose} className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg transition-colors">Profile</Link>
        <Link to="/settings" onClick={onClose} className="block px-3 py-2 text-sm text-gray-200 hover:bg-gray-700 rounded-lg transition-colors">Settings</Link>
        {isAdmin && (
          <Link to="/admin/users" onClick={onClose} className="block px-3 py-2 text-sm text-purple-400 hover:bg-purple-900/30 font-semibold rounded-lg transition-colors">User Management</Link>
        )}
        <button onClick={doLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg transition-colors">Logout</button>
      </div>
    </div>
  )
}

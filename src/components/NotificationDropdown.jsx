import React from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationContext'
import { timeAgo } from '../utils/calculations'

export default function NotificationDropdown({ isOpen, onClose }) {
  const { notifications, clearAllNotifications, getLatest } = useNotifications()
  let latest = getLatest(5)
  // If context is empty (e.g., on fresh load), try to read from localStorage to show persisted notifications
  if ((!latest || latest.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('oja_notifications_v1')
      const parsed = raw ? JSON.parse(raw) : []
      latest = (parsed || []).slice(0,5)
    } catch (e) { /* ignore */ }
  }

  if (!isOpen) return null

  const formatTime = (timestamp) => {
    const t = typeof timestamp === 'string' ? timestamp : (timestamp instanceof Date ? timestamp.toISOString() : timestamp)
    const res = timeAgo(t)
    return res ? (res === 'just now' ? 'Just now' : res) : ''
  }

  const getIconAndColor = (type) => {
    switch (type) {
      case 'success':
        return { icon: 'fas fa-check-circle', color: 'text-green-500' }
      case 'error':
        return { icon: 'fas fa-exclamation-circle', color: 'text-red-500' }
      case 'warning':
        return { icon: 'fas fa-exclamation-triangle', color: 'text-yellow-500' }
      case 'info':
        return { icon: 'fas fa-info-circle', color: 'text-blue-500' }
      default:
        return { icon: 'fas fa-bell', color: 'text-gray-500' }
    }
  }

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div 
        className="absolute top-16 right-4 w-80 bg-gray-800 rounded-xl shadow-2xl border border-gray-600 transform transition-all duration-200 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex gap-2 items-center">
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
            {latest.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="fas fa-bell text-gray-400"></i>
              </div>
              <p className="text-sm text-gray-400">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2">
              {latest.map(notification => {
                const { icon, color } = getIconAndColor(notification.type)
                return (
                  <div key={notification.id} className="p-3 hover:bg-gray-700 rounded-lg transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 ${color} flex items-center justify-center`}>
                        <i className={`${icon} text-xs`}></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{notification.title}</p>
                        {notification.message && (
                          <p className="text-xs text-gray-300 mt-1">{notification.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{formatTime(notification.timestamp)}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-600">
            <Link to="/notifications" className="text-xs text-gray-400 hover:text-gray-200 transition-colors">View all notifications</Link>
          </div>
        )}
      </div>
    </div>
  )
}

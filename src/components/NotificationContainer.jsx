import React from 'react'
import { useNotifications } from '../context/NotificationContext'
import NotificationToast from './NotificationToast'

export default function NotificationContainer() {
  const { notifications, clearAllNotifications, toastsVisible, showToasts } = useNotifications()

  // only render if there are any transient toasts visible and toasts are enabled globally
  let effectiveNotifications = notifications
  if ((!effectiveNotifications || effectiveNotifications.length === 0) && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('oja_notifications_v1')
      effectiveNotifications = raw ? JSON.parse(raw) : []
    } catch (e) { effectiveNotifications = [] }
  }

  if (!showToasts || !toastsVisible || toastsVisible.length === 0) return null

  // map visible toast ids to notifications data, preserving order
  const visible = toastsVisible.map(id => effectiveNotifications.find(n => n.id === id)).filter(Boolean).slice(0, 3)

  return (
    <div className="fixed top-4 right-4 z-50 w-96 space-y-2">
      {(effectiveNotifications.length || 0) > 1 && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 font-medium">
            {effectiveNotifications.length} notifications
          </span>
          <div className="flex gap-2">
            <button
              onClick={clearAllNotifications}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {visible.map(notification => (
        <NotificationToast key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

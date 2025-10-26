import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const NotificationContext = createContext(null)

export function useNotifications() {
  return useContext(NotificationContext)
}

export function NotificationProvider({ children }) {
  const STORAGE_KEY = 'oja_notifications_v1'
  const TTL_DAYS = 7 // notifications older than this will be pruned

  const [notifications, setNotifications] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : []
      // prune notifications older than TTL_DAYS and ensure newest-first order by timestamp
      const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000
      const filtered = (parsed || []).filter(n => {
        const ts = new Date(n.timestamp).getTime()
        return isFinite(ts) ? ts >= cutoff : true
      })
      return filtered.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (e) { return [] }
  })

  // Persist whenever notifications change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (e) { /* ignore */ }
  }, [notifications])

  // Periodic cleanup: prune notifications older than TTL_DAYS every hour
  useEffect(() => {
    const pruneOld = () => {
      try {
        const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000
        setNotifications(prev => {
          const filtered = prev.filter(n => {
            const ts = new Date(n.timestamp).getTime()
            return isFinite(ts) ? ts >= cutoff : true
          })
          if (filtered.length === prev.length) return prev
          // will also trigger persistence effect
          return filtered
        })
      } catch (e) { /* ignore */ }
    }

    // run on mount then every hour
    pruneOld()
    const id = setInterval(pruneOld, 1000 * 60 * 60)
    return () => clearInterval(id)
  }, [])

  const addNotification = useCallback((notification) => {
    const id = Date.now()
    const newNotification = {
      id,
      timestamp: new Date().toISOString(),
      ...notification
    }

    setNotifications(prev => [newNotification, ...prev])
  }, [])

  // Permanently delete a notification from storage (still available if needed)
  const deleteNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const deleteAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Dismiss a transient toast (hide it from toasts) but keep it in persisted notifications
  // Mark a notification as read
  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }, [])

  // Mark all notifications as read and hide transient toasts (do not delete stored notifications)
  const clearAllNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  // Helper to return paginated notifications (most recent first)
  const getNotificationsPage = useCallback((page = 1, perPage = 15) => {
    const start = (page - 1) * perPage
    const end = start + perPage
    return notifications.slice(start, end)
  }, [notifications])

  // Helper to return latest N notifications for header/UI
  const getLatest = useCallback((limit = 5) => notifications.slice(0, limit), [notifications])

  const value = {
    notifications,
    addNotification,
    deleteNotification,
    clearAllNotifications,
    deleteAllNotifications,
    markAsRead,
    getNotificationsPage,
    getLatest
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export default NotificationContext

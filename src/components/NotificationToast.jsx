import React, { useEffect } from 'react'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationToast({ notification }) {
  const { removeNotification } = useNotifications()

  const getIconAndColor = () => {
    switch (notification.type) {
      case 'success':
        return {
          icon: 'fas fa-check-circle',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500',
          textColor: 'text-green-800'
        }
      case 'error':
        return {
          icon: 'fas fa-exclamation-circle',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500',
          textColor: 'text-red-800'
        }
      case 'warning':
        return {
          icon: 'fas fa-exclamation-triangle',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-500',
          textColor: 'text-yellow-800'
        }
      case 'info':
        return {
          icon: 'fas fa-info-circle',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-500',
          textColor: 'text-blue-800'
        }
      default:
        return {
          icon: 'fas fa-bell',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-500',
          textColor: 'text-gray-800'
        }
    }
  }

  const { bgColor, borderColor, iconColor, textColor, icon } = getIconAndColor()
  const { timestamp } = notification

  // duration in milliseconds. If provided, auto-dismiss after duration.
  const duration = typeof notification.duration === 'number' ? notification.duration : null

  useEffect(() => {
    if (!duration) return
    const id = setTimeout(() => removeNotification(notification.id), duration)
    return () => clearTimeout(id)
  }, [duration, notification.id, removeNotification])

  const formatTime = (ts) => {
    try {
      const t = typeof ts === 'string' ? new Date(ts) : ts instanceof Date ? ts : new Date(ts)
      const now = Date.now()
      const diff = Math.floor((now - t.getTime()) / 1000)
      if (diff < 60) return 'Just now'
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
      return `${Math.floor(diff / 86400)}d ago`
    } catch (e) { return '' }
  }

  const progressDuration = duration || 5000

  return (
    <div className={`${bgColor} ${borderColor} border rounded-lg p-4 shadow-sm transform transition-all duration-300 ease-in-out`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-6 h-6 ${iconColor} flex items-center justify-center`}>
          <i className={`${icon} text-sm`}></i>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium ${textColor}`}>
              {notification.title}
            </h4>
            <button
              onClick={() => removeNotification(notification.id)}
              className={`flex-shrink-0 ml-2 ${textColor} hover:opacity-70 transition-opacity`}
              aria-label="Dismiss notification"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>

          {notification.message && (
            <p className={`text-sm ${textColor} mt-1`}>
              {notification.message}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <span className={`text-xs ${textColor} opacity-70`}>
              {formatTime(timestamp)}
            </span>

            {/* Progress bar */}
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${iconColor.replace('text-', 'bg-')} rounded-full transition-all linear`}
                style={{ width: duration ? '100%' : '0%', animation: duration ? `shrink ${progressDuration}ms linear forwards` : 'none' }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

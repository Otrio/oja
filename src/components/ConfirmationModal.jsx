import React from 'react'

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" // danger, warning, info
}) {
  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'fas fa-exclamation-triangle',
          iconColor: 'text-red-400',
          confirmBg: 'bg-red-600 hover:bg-red-700',
          iconBg: 'bg-red-900/30'
        }
      case 'warning':
        return {
          icon: 'fas fa-exclamation-circle',
          iconColor: 'text-yellow-400',
          confirmBg: 'bg-yellow-600 hover:bg-yellow-700',
          iconBg: 'bg-yellow-900/30'
        }
      case 'info':
        return {
          icon: 'fas fa-info-circle',
          iconColor: 'text-blue-400',
          confirmBg: 'bg-blue-600 hover:bg-blue-700',
          iconBg: 'bg-blue-900/30'
        }
      default:
        return {
          icon: 'fas fa-question-circle',
          iconColor: 'text-gray-400',
          confirmBg: 'bg-gray-600 hover:bg-gray-700',
          iconBg: 'bg-gray-700'
        }
    }
  }

  const styles = getTypeStyles()

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 border border-gray-700 rounded-xl max-w-md w-full transform transition-all duration-300 scale-100 relative shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <button type="button" aria-label="Close" onClick={onClose} className="absolute right-3 top-3 w-8 h-8 rounded bg-red-900/30 text-red-400 flex items-center justify-center hover:bg-red-900/50 transition-colors">
            <i className="fas fa-times"></i>
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${styles.iconBg} rounded-lg flex items-center justify-center`}>
              <i className={`${styles.icon} ${styles.iconColor} text-lg`}></i>
            </div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-700 rounded-b-xl flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-600 rounded-lg hover:bg-gray-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white ${styles.confirmBg} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

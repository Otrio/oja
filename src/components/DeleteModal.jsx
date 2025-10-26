import React from 'react'

export default function DeleteModal({ title = 'Confirm delete', message = 'Are you sure?', onConfirm, onCancel, isOpen = true }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="modern-card max-w-md w-full relative">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <i className="fas fa-trash text-red-600"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-xl flex gap-3 justify-end">
          <button onClick={onCancel} className="sb-transition-base px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900">Cancel</button>
          <button onClick={onConfirm} className="sb-transition-base px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">Delete</button>
        </div>
      </div>
    </div>
  )
}


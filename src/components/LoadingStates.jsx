import React from 'react';

export function LoadingOverlay({ show, children }) {
  if (!show) return children;

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 bg-white/50 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm sb-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-supabase-500 border-t-transparent sb-spin"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 3, className = '' }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`h-12 w-full sb-skeleton ${className}`}></div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="p-8 text-center">
      <div className="flex flex-col items-center justify-center gap-2 sb-slide-in">
        <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <i className={`${icon} text-gray-400 dark:text-gray-500 text-xl`}></i>
        </div>
        <h3 className="text-base font-medium text-gray-900 dark:text-white">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
    </div>
  );
}

export function SuccessFeedback({ show, message }) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 sb-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
          <i className="fas fa-check text-green-600 dark:text-green-400"></i>
        </div>
        <p className="text-sm text-green-800 dark:text-green-200">{message}</p>
      </div>
    </div>
  );
}

export function LoadingButton({ loading, children, className = '', ...props }) {
  return (
    <button
      className={`relative inline-flex items-center justify-center ${className}`}
      disabled={loading}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-circle-notch sb-spin"></i>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>{children}</span>
    </button>
  );
}
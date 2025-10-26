import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { ProductProvider } from './context/ProductContext'
import { PurchaseProvider } from './context/PurchaseContext'
import { SaleProvider } from './context/SaleContext'
import { UserProvider } from './context/UserContext'
import { NotificationProvider } from './context/NotificationContext'
import { SettingsProvider } from './context/SettingsContext'
import ErrorBoundary from './components/ErrorBoundary'
import NotificationDropdown from './components/NotificationDropdown'
import { useNotifications } from './context/NotificationContext'
import { useSettings } from './context/SettingsContext'
import ProfileDropdown from './components/ProfileDropdown'
import { useUser } from './context/UserContext'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Purchases from './pages/Purchases'
import Sales from './pages/Sales'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import NotificationsPage from './pages/Notifications'
import AvailableStock from './pages/AvailableStock'
import Performance from './pages/Performance'
import History from './pages/History'
import AdminUserManagement from './pages/AdminUserManagement'
import LandingPage from './pages/LandingPage'
import Documentation from './pages/Documentation'
import ProtectedRoute from './components/ProtectedRoute'

function Sidebar({ onClose, isOpen }) {
  const location = useLocation()
  const { user } = useUser()
  const hideForAuth = ['/login', '/signup', '/', '/landing', '/documentation'].includes(location.pathname)
    if (hideForAuth) return null
  
  const navItems = [
    { path: '/dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard' },
    { path: '/products', icon: 'fas fa-box', label: 'Products' },
    { path: '/purchases', icon: 'fas fa-shopping-cart', label: 'Purchases' },
    { path: '/sales', icon: 'fas fa-chart-line', label: 'Sales' },
    { path: '/performance', icon: 'fas fa-tachometer-alt', label: 'Performance' },
    { path: '/available-stock', icon: 'fas fa-warehouse', label: 'Available Stock' },
    { path: '/history', icon: 'fas fa-archive', label: 'History' },
    { path: '/notifications', icon: 'fas fa-bell', label: 'Notifications' },
    { path: '/documentation', icon: 'fas fa-book', label: 'Documentation' },
  ]

  // Only show admin routes to admins
  const isAdmin = ((user?.role || '').toString().toLowerCase() === 'admin')
  if (isAdmin) navItems.push({ path: '/admin/users', icon: 'fas fa-users-cog', label: 'User Management' })

  // manage focus inside sidebar when open (very small helper)
  const sidebarRef = React.useRef(null)

  React.useEffect(() => {
    if (isOpen && sidebarRef.current) {
      // focus first focusable element in sidebar for accessibility
      const el = sidebarRef.current.querySelector('a, button, input, [tabindex]:not([tabindex="-1"])')
      if (el) el.focus()
    }
  }, [isOpen])

  return (
    // on small screens the sidebar will be positioned absolutely and toggled via isOpen
  <div ref={sidebarRef} className={`w-64 sidebar-surface dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-screen fixed left-0 top-0 ${isOpen ? 'z-50' : 'z-[-1] md:z-50'} transform ${isOpen ? 'translate-x-0 sb-slide-in' : '-translate-x-full md:translate-x-0'} sb-transition`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between h-16">
        <div className="flex items-center gap-3 h-full">
          <div className="relative z-50 w-10 h-10 flex items-center justify-center">
            {/* Modern minimalist inventory logo */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-xl">
              <defs>
                <linearGradient id="modernGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#006239" />
                  <stop offset="100%" stopColor="#00a86b" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Modern geometric container */}
              <rect width="24" height="24" rx="8" fill="url(#modernGradient)" filter="url(#glow)"/>
              
              {/* Abstract inventory symbol - modern stacked boxes */}
              <g transform="translate(6, 6)">
                {/* Bottom box */}
                <rect x="2" y="8" width="8" height="4" rx="1" fill="white" opacity="0.9"/>
                {/* Middle box */}
                <rect x="4" y="4" width="8" height="4" rx="1" fill="white" opacity="0.7"/>
                {/* Top box */}
                <rect x="6" y="0" width="8" height="4" rx="1" fill="white" opacity="0.5"/>
                
                {/* Modern accent lines */}
                <line x1="0" y1="12" x2="12" y2="12" stroke="white" strokeWidth="0.5" opacity="0.6"/>
                <line x1="0" y1="8" x2="12" y2="8" stroke="white" strokeWidth="0.5" opacity="0.4"/>
                <line x1="0" y1="4" x2="12" y2="4" stroke="white" strokeWidth="0.5" opacity="0.3"/>
              </g>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Oja</h1>
        </div>
        <button className="md:hidden p-2 text-gray-500 dark:text-gray-400" onClick={() => onClose && onClose()} aria-label="Close menu">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <div className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-supabase-100 dark:bg-supabase-900/50 text-supabase-600 dark:text-supabase-300 border-l-4 border-supabase-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-supabase-600 dark:hover:text-white'
              }`}
            >
              <i className={`${item.icon} w-5`}></i>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}

function Header({ onToggleMobile }) {
  const [showNotifications, setShowNotifications] = React.useState(false)
  const [showProfile, setShowProfile] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const profileDropdownRef = React.useRef(null)
  const { notifications } = useNotifications()
  const { user, logout } = useUser()
  const { settings, setTheme } = useSettings()
  const location = useLocation()
  const navigate = useNavigate()

  // Click outside to close profile dropdown
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfile(false)
      }
    }

    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfile])
  const hideForAuth = ['/login', '/signup', '/landing', '/documentation'].includes(location.pathname)
  if (hideForAuth) return null

  function handleSearchSubmit(e) {
    e.preventDefault()
    if (!search.trim()) return
    // Simple routing: if query contains 'sale', 'purchase', or 'product', route accordingly
    const q = search.trim().toLowerCase()
    if (q.includes('sale')) {
      navigate('/sales', { state: { search } })
    } else if (q.includes('purchase')) {
      navigate('/purchases', { state: { search } })
    } else {
      navigate('/products', { state: { search } })
    }
  }

  return (
  <header className="bg-gray-800 border-b border-gray-700 h-16 flex items-center justify-between px-4 md:px-6 w-full fixed top-0 left-0 z-30 md:pl-64 sb-fade-in">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <button className="md:hidden p-2 text-gray-300 hover:text-white transition-colors" onClick={onToggleMobile} aria-label="Open menu">
          <i className="fas fa-bars"></i>
        </button>

  {/* Search: hidden on small screens, visible from md up */}
  <form className="hidden md:block relative ml-8" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Search products, sales..."
            className="w-80 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
        </form>
      </div>

        <div className="flex items-center gap-4 ml-4">
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-gray-700"
          aria-label="Notifications"
        >
          <i className="fas fa-bell text-lg"></i>
          {notifications.length > 0 && (() => {
            const unread = notifications.filter(n => !n.read).length
            return (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center px-1">
                {unread > 9 ? '9+' : unread}
              </span>
            )
          })()}
        </button>

        <div>
          {user ? (
            <div className="relative" ref={profileDropdownRef}>
              <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 transition-colors" onClick={() => setShowProfile(s => !s)} aria-haspopup="true" aria-expanded={showProfile}>
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-xs"></i>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate hidden sm:block">{user.role}</p>
                </div>
                <i className="fas fa-chevron-down text-gray-400 text-xs hidden sm:inline-block"></i>
              </button>
              {showProfile && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                  <ul className="py-2">
                    <li>
                      <Link to="/profile" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-lg mx-2 transition-colors">Profile</Link>
                    </li>
                    <li>
                      <Link to="/settings" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-gray-200 hover:bg-gray-700 rounded-lg mx-2 transition-colors">Settings</Link>
                    </li>
                    {((user.role || '').toString().toLowerCase() === 'admin') && (
                      <li>
                        <Link to="/admin/users" onClick={() => setShowProfile(false)} className="block px-4 py-2 text-purple-400 hover:bg-purple-900/30 font-semibold rounded-lg mx-2 transition-colors">User Management</Link>
                      </li>
                    )}
                    <li>
                      <button 
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-900/30 rounded-lg mx-2 transition-colors" 
                        onClick={async () => {
                          setShowProfile(false)
                          await logout()
                          navigate('/login')
                        }}
                      >
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">Login</Link>
              <Link to="/signup" className="modern-btn modern-btn-primary">Sign up</Link>
            </div>
          )}
        </div>
      </div>

      {showNotifications && (
        <NotificationDropdown 
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
        />
      )}
    </header>
  )
}

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const location = useLocation()

  // Close on Escape
  React.useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isAuthPage = ['/login', '/signup', '/', '/landing', '/documentation'].includes(location.pathname)

  return (
  <div className={`min-h-screen bg-gray-900 text-white ${isAuthPage ? '' : 'sb-transition'}`}>
      <Sidebar isOpen={false} />
      <div className={isAuthPage ? 'w-full' : 'ml-0 md:ml-64 pt-16'}> 
        {!isAuthPage && <Header onToggleMobile={() => setMobileMenuOpen(s => !s)} />}
        <main className={isAuthPage ? 'w-full h-screen' : 'p-6'}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/products" element={<Products />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/available-stock" element={<AvailableStock />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute roles={["admin"]}><Settings /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["admin"]}><AdminUserManagement /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
      {/* Mobile Sidebar instance */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </div>
  )
}
 

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <BrowserRouter>
          <NotificationProvider>
            <UserProvider>
              <SettingsProvider>
                <ProductProvider>
                  <PurchaseProvider>
                    <SaleProvider>
                      <AppContent />
                    </SaleProvider>
                  </PurchaseProvider>
                </ProductProvider>
              </SettingsProvider>
            </UserProvider>
          </NotificationProvider>
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  )
}

export default App

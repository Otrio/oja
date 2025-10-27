import React from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useNotifications } from '../context/NotificationContext'

export default function Login() {
  const { login, user } = useUser()
  const [shouldNavigate, setShouldNavigate] = React.useState(false)
  const nav = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const returnTo = params.get('returnTo') || '/dashboard'
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const { addNotification } = useNotifications()

  async function submit(e) {
    e.preventDefault()
    setError('') // Clear any previous errors
    
    // Validate inputs
    if (!email && !password) {
      setError('Please provide both email and password')
      return
    }
    if (!email) {
      setError('Please enter your email address')
      return
    }
    if (!password) {
      setError('Please enter your password')
      return
    }

    try {
      setLoading(true)
      // call useUser.login which uses Supabase under the hood
      const res = await Promise.resolve(login({ email, password }))
      addNotification({ title: 'Welcome', message: 'Signed in successfully', type: 'success' })

      // Instead of navigating immediately, wait for UserContext.user to be populated
      // ProtectedRoute checks UserContext.user and will redirect back to login if absent.
      // Set a flag and let the effect below perform the final navigation when user is available.
      setShouldNavigate(true)
    } catch (err) {
      // Friendly error mapping for common Supabase/auth errors
      const errMsg = err?.message || err?.error_description || err?.hint || String(err)
      const friendlyError = errMsg.toLowerCase().includes('invalid login') 
        ? 'Incorrect email or password'
        : errMsg.toLowerCase().includes('rate limit') 
        ? 'Too many attempts. Please try again later'
        : errMsg.toLowerCase().includes('network') 
        ? 'Network error. Please check your connection'
        : 'Unable to sign in. Please try again'
      
      setError(friendlyError)
    } finally { 
      setLoading(false) 
    }
  }

  // When login has completed, wait for UserContext.user to be set (populated from supabase)
  React.useEffect(() => {
    if (!shouldNavigate) return
    if (user) {
      nav(returnTo)
      setShouldNavigate(false)
      return
    }

    // fallback: if user is not set within a short window, navigate anyway
    const t = setTimeout(() => {
      nav(returnTo)
      setShouldNavigate(false)
    }, 2000)
    return () => clearTimeout(t)
  }, [shouldNavigate, user, nav, returnTo])

  return (
  <div className="min-h-screen flex">
    {/* Left Panel - Promotional Section */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#006239] to-[#004d2a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>
      
      {/* Abstract Geometric Lines */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
          <path d="M50,50 Q200,100 350,50" stroke="white" strokeWidth="1" fill="none"/>
          <path d="M50,150 Q200,200 350,150" stroke="white" strokeWidth="1" fill="none"/>
          <path d="M50,250 Q200,300 350,250" stroke="white" strokeWidth="1" fill="none"/>
          <path d="M50,350 Q200,400 350,350" stroke="white" strokeWidth="1" fill="none"/>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
        {/* Modern Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0e0e0" />
                </linearGradient>
              </defs>
              <g transform="translate(6, 6)">
                <rect x="2" y="8" width="8" height="4" rx="1" fill="url(#logoGradient)" opacity="0.9"/>
                <rect x="4" y="4" width="8" height="4" rx="1" fill="url(#logoGradient)" opacity="0.7"/>
                <rect x="6" y="0" width="8" height="4" rx="1" fill="url(#logoGradient)" opacity="0.5"/>
              </g>
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Hello Oja! 👋</h1>
        <p className="text-lg opacity-90 max-w-md leading-relaxed">
          Skip repetitive and manual inventory tasks. Get highly productive through automation and save tons of time!
        </p>
        
        <div className="mt-12 text-sm opacity-75">
          <p>© 2024 Oja. All rights reserved.</p>
        </div>
      </div>
    </div>

    {/* Right Panel - Login Form */}
    <div className="w-full lg:w-1/2 bg-gray-900 flex flex-col justify-center p-8 lg:p-12">
      <div className="max-w-md mx-auto w-full">
        {/* Brand Name */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Oja</h2>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-2">Welcome Back!</h3>
          <p className="text-gray-400">
            Don't have an account? <Link to="/signup" className="text-[#006239] hover:text-[#00a86b] underline font-medium">Create a new account now</Link>, it's FREE! Takes less than a minute.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg">
            <div className="flex items-start">
              <i className="fas fa-exclamation-circle text-red-400 mt-0.5 mr-3"></i>
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={submit} className="space-y-6">
          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-3 bg-transparent border-0 border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-[#006239] focus:bg-gray-800 transition-colors rounded-sm"
            />
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-3 bg-transparent border-0 border-b-2 border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-[#006239] focus:bg-gray-800 transition-colors rounded-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
              )}
              <span>{loading ? 'Signing in...' : 'Login Now'}</span>
            </button>
            
            <button
              type="button"
              onClick={() => { setEmail('demo@oja.test'); setPassword('password'); }}
              className="w-full py-3 bg-transparent border-2 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white font-medium rounded-lg transition-colors"
            >
              <i className="fab fa-google mr-2"></i>
              Use Demo Account
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-center">
            <button type="button" className="text-gray-400 hover:text-[#006239] text-sm underline">
              Forget password? Click here
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

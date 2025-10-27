import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { useNotifications } from '../context/NotificationContext'

export default function Signup() {
  const { signup, user } = useUser()
  const nav = useNavigate()

  // If user is already logged in, redirect to dashboard immediately
  React.useEffect(() => {
    if (user) {
      nav('/dashboard', { replace: true })
    }
  }, [user, nav])

  const [name, setName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  // signups should default to admin per request
  const ROLE_FOR_SIGNUP = 'admin'
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [fieldErrors, setFieldErrors] = React.useState({})

  const { addNotification } = useNotifications()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Validate all fields
    const errors = {}
    if (!name?.trim()) errors.name = 'Name is required'
    if (!email?.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email'
    if (!password) errors.password = 'Password is required'
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    try {
    setLoading(true)
    await signup({ name, email, password, role: ROLE_FOR_SIGNUP })
    addNotification({ title: 'Success', message: 'Account created successfully', type: 'success' })

    // Wait for auth state to settle before navigating so protected routes don't bounce back
    // Simple short delay is sufficient here; the UserContext will populate shortly.
    await new Promise(r => setTimeout(r, 500))
    nav('/dashboard')
    } catch (err) {
      // Friendly error mapping for common signup errors
      const errMsg = err?.message || err?.error_description || err?.hint || String(err)
      const friendlyError = errMsg.toLowerCase().includes('email') 
        ? 'This email is already registered'
        : errMsg.toLowerCase().includes('network') 
        ? 'Network error. Please check your connection'
        : errMsg.toLowerCase().includes('password') 
        ? 'Password is too weak. Please choose a stronger password'
        : 'Unable to create account. Please try again'
      
      setError(friendlyError)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="min-h-screen flex">
    {/* Left Panel - Promotional Section */}
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#006239] to-[#004d2a] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
          <defs>
            <pattern id="gridSignup" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#gridSignup)" />
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
                <linearGradient id="logoGradientSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#e0e0e0" />
                </linearGradient>
              </defs>
              <g transform="translate(6, 6)">
                <rect x="2" y="8" width="8" height="4" rx="1" fill="url(#logoGradientSignup)" opacity="0.9"/>
                <rect x="4" y="4" width="8" height="4" rx="1" fill="url(#logoGradientSignup)" opacity="0.7"/>
                <rect x="6" y="0" width="8" height="4" rx="1" fill="url(#logoGradientSignup)" opacity="0.5"/>
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

    {/* Right Panel - Signup Form */}
    <div className="w-full lg:w-1/2 bg-gray-900 flex flex-col justify-center p-8 lg:p-12">
      <div className="max-w-md mx-auto w-full">
        {/* Brand Name */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">Oja</h2>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-white mb-2">Create Account</h3>
          <p className="text-gray-400">
            Already have an account? <Link to="/login" className="text-[#006239] hover:text-[#00a86b] underline font-medium">Sign in here</Link>, it's quick and easy.
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

        {/* Signup Form */}
        <form onSubmit={submit} className="space-y-6">
          {/* Name Field */}
          <div>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => { setName(e.target.value); setFieldErrors(prev => ({ ...prev, name: '' })) }}
              className={`w-full px-3 py-3 bg-transparent border-0 border-b-2 text-white placeholder-gray-400 focus:outline-none transition-colors focus:bg-gray-800 rounded-sm ${
                fieldErrors.name ? 'border-red-500' : 'border-gray-600 focus:border-[#006239]'
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-sm text-red-400">{fieldErrors.name}</p>}
          </div>

          {/* Email Field */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: '' })) }}
              className={`w-full px-3 py-3 bg-transparent border-0 border-b-2 text-white placeholder-gray-400 focus:outline-none transition-colors focus:bg-gray-800 rounded-sm ${
                fieldErrors.email ? 'border-red-500' : 'border-gray-600 focus:border-[#006239]'
              }`}
            />
            {fieldErrors.email && <p className="mt-1 text-sm text-red-400">{fieldErrors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })) }}
              className={`w-full px-3 py-3 bg-transparent border-0 border-b-2 text-white placeholder-gray-400 focus:outline-none transition-colors focus:bg-gray-800 rounded-sm ${
                fieldErrors.password ? 'border-red-500' : 'border-gray-600 focus:border-[#006239]'
              }`}
            />
            {fieldErrors.password && <p className="mt-1 text-sm text-red-400">{fieldErrors.password}</p>}
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
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            </button>
          </div>

          {/* Terms */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              By creating an account you agree to our <a className="text-[#006239] hover:text-[#00a86b] underline">Terms</a> and <a className="text-[#006239] hover:text-[#00a86b] underline">Privacy Policy</a>.
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
  )
}

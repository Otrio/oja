import React from 'react'
import { useUser } from '../context/UserContext'
import { useNotifications } from '../context/NotificationContext'
import { supabase } from '../config/supabase'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, updateProfile, logout } = useUser()
  const [name, setName] = React.useState(user?.name || '')
  // include setRole to avoid ReferenceError when setting role from user
  const [role, setRole] = React.useState(user?.role || 'inventory manager')
  const [phone, setPhone] = React.useState(user?.phone || '')
  const [location, setLocation] = React.useState(user?.location || '')
  const [bio, setBio] = React.useState(user?.bio || '')
  const [loading, setLoading] = React.useState(false)
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatar_url || '')

  // Update state when user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name || '')
      setRole(user.role || 'Inventory Manager')
      setPhone(user.phone || '')
      setLocation(user.location || '')
      setBio(user.bio || '')
      setAvatarUrl(user.avatar_url || '')
    }
  }, [user])

  const { addNotification } = useNotifications()
  const navigate = useNavigate()

  const fileInputRef = React.useRef(null)

  async function save(e) {
    e.preventDefault()
    if (!name.trim()) {
      addNotification({ title: 'Error', message: 'Name is required', type: 'danger' })
      return
    }
    
    setLoading(true)
    try {
      const updates = {
        name: name.trim(),
        role,
        phone: phone.trim(),
        location: location.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        last_updated: new Date().toISOString()
      }

      await updateProfile(updates)
      addNotification({ title: 'Success', message: 'Profile updated successfully', type: 'success' })
    } catch (error) {
      console.error('Profile update error:', error)
      addNotification({ title: 'Error', message: 'Failed to update profile', type: 'danger' })
    } finally {
      setLoading(false)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (!user?.id) {
      addNotification({ title: 'Error', message: 'Not signed in', type: 'danger' })
      return
    }

    const path = `avatars/${user.id}/${Date.now()}_${file.name}`
    try {
      // upload the file
      const { data, error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      // get public url
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData?.publicUrl || ''

      setAvatarUrl(publicUrl)
      addNotification({ title: 'Success', message: 'Avatar uploaded', type: 'success' })
    } catch (err) {
      console.error('Avatar upload error', err)
      addNotification({ title: 'Error', message: 'Failed to upload avatar', type: 'danger' })
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Are you sure you want to deactivate your account? This action can be undone by an admin.')) return
    if (!user?.id) return
    try {
      // soft-delete: mark profile as deactivated
      await updateProfile({ deactivated: true })
      addNotification({ title: 'Account', message: 'Account deactivated. You will be signed out.', type: 'info' })
  // sign out
  await logout()
      navigate('/login')
    } catch (err) {
      console.error('Delete account error', err)
      addNotification({ title: 'Error', message: 'Failed to deactivate account', type: 'danger' })
    }
  }

  if (!user) return <div className="p-6 text-gray-200">Please sign in to view your profile.</div>

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Profile Header */}
      <div className="bg-gray-800 text-white rounded-xl p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-user text-4xl text-gray-200"></i>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <button 
              className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              aria-label="Upload avatar"
            >
              <i className="fas fa-camera text-white"></i>
            </button>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{name || 'Set your name'}</h1>
            {/* role display removed from header for security */}
            <p className="text-white/60 text-sm mt-1">
              Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form - dark */}
      <div className="bg-gray-800 rounded-xl shadow-sm p-6 text-gray-200 border border-gray-700">
        <h2 className="text-xl font-semibold mb-6 text-white">Profile Information</h2>
        <form onSubmit={save} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-200">Full Name</label>
              <input 
                type="text"
                className="mt-1 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            {/* role editing: only allow changes if current user is admin */}
            {((user?.role || '').toString().toLowerCase() === 'admin') && (
              <div>
                <label className="block text-sm font-medium text-gray-200">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="mt-1 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="inventory manager">Inventory Manager</option>
                  <option value="sales agent">Sales Agent</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-200">Phone Number</label>
              <input 
                type="tel"
                className="mt-1 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200">Location</label>
              <input 
                type="text"
                className="mt-1 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="City, Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200">Bio</label>
            <textarea
              className="mt-1 w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>

          {/* Account Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 border-t border-b border-gray-700">
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-300">Total Sales</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-300">Products Added</div>
            </div>
            <div className="text-center p-4 bg-gray-700 rounded-lg">
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-sm text-gray-300">Total Revenue</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button 
              type="button" 
              className="text-sm text-gray-300 hover:text-white"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="modern-btn modern-btn-primary px-6"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

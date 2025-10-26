import React from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'oja_user'
const UserContext = React.createContext(null)

export function UserProvider({ children }) {
  const { user: supaUser, signIn, signUp, signOut, loading: authLoading } = useAuth()
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
  })

  // Map supabase auth user to app user and fetch authoritative profile from `profiles` table
  React.useEffect(() => {
    let mounted = true
    async function syncProfile() {
      if (!supaUser) return
      try {
        // Primary mapping from auth
        const mapped = {
          id: supaUser.id,
          name: supaUser.user_metadata?.full_name || supaUser.email?.split('@')[0] || supaUser.id,
          email: supaUser.email,
          role: (supaUser.user_metadata?.role || 'sales_agent')
        }

        // Try to fetch saved profile from the DB via RPC to include email safely
        let merged = mapped
        try {
          const { data: rpcData, error: rpcErr } = await supabase.rpc('get_profile_with_email', { p_id: supaUser.id })
          if (!rpcErr && rpcData && rpcData.length > 0) {
            // rpc returns { profile: jsonb, email: text } rows; take first
            const row = rpcData[0]
            const profile = row.profile || {}
            const email = row.email || mapped.email
            const roleVal = (profile.role || mapped.role || '').toString().toLowerCase()
            merged = { ...mapped, ...profile, email, role: roleVal }
          } else {
            merged.role = (mapped.role || '').toString().toLowerCase()
          }
        } catch (e) {
          // fallback to previous behavior: try direct select (covers older DBs)
          try {
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', supaUser.id).single()
            if (!error && profile) {
              const roleVal = (profile.role || mapped.role || '').toString().toLowerCase()
              merged = { ...mapped, ...profile, role: roleVal }
            } else {
              merged.role = (mapped.role || '').toString().toLowerCase()
            }
          } catch (inner) {
            merged.role = (mapped.role || '').toString().toLowerCase()
          }
        }

        if (!mounted) return
        setUser(merged)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(merged)) } catch (e) { console.error(e) }
      } catch (e) {
        console.error('Failed to sync profile:', e)
      }
    }

    syncProfile()

    return () => { mounted = false }
  }, [supaUser])

  function login({ email, password }) {
    return signIn(email, password).then(({ data, error }) => {
      if (error) throw error
      return data
    })
  }

  function signup({ name, email, password, role }) {
    return signUp(email, password, { full_name: name, role }).then(({ data, error }) => {
      if (error) throw error
      return data
    })
  }

  async function logout() {
    await signOut()
    setUser(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch (e) {}
  }

  async function updateProfile(changes) {
    if (!user?.id) throw new Error('No user logged in')
    
    try {
      // Update the user metadata in Supabase
      const { error: updateError } = await fetch('/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(changes)
      }).then(r => r.json())

      if (updateError) throw updateError

      // Update local state and storage on success
      const updatedUser = { ...user, ...changes }
      setUser(updatedUser)
      try { 
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser)) 
      } catch (e) {
        console.error('Failed to save to localStorage:', e)
      }

      return updatedUser
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    }
  }

  const value = { user, login, signup, logout, updateProfile, setRole: (r) => updateProfile({ role: r }), authLoading }
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() { return React.useContext(UserContext) }

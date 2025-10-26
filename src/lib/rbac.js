import { supabase } from './supabase'

// Add a new user (manager or sales agent) - only admins can do this
export async function addUser({ name, email, role = 'manager', created_by, requesterId }) {
  // Call server endpoint that performs admin-only user creation using the service role
  // include current access token so server can verify the requester
  const session = await supabase.auth.getSession()
  const token = session?.data?.session?.access_token || null
  const res = await fetch('/api/admin/createUser', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ name, email, role, created_by, requesterId })
  })
  // Some environments may return empty/non-JSON bodies on error; handle gracefully
  const text = await res.text()
  let payload = null
  try {
    payload = text ? JSON.parse(text) : null
  } catch (e) {
    // ignore parse error; we'll surface raw text below
  }

  if (!res.ok) {
    const errMessage = payload?.error || text || 'Failed to create user'
    throw new Error(errMessage)
  }

  return payload?.data
}

// Edit a user's profile (admin or self)
export async function editUserProfile(userId, changes) {
  const { error } = await supabase.from('profiles').update(changes).eq('id', userId)
  if (error) throw error
}

// Log an activity
export async function logActivity(userId, action, details = {}) {
  await supabase.from('activity_log').insert({
    user_id: userId,
    action,
    details,
  })
}

// Get activities for a user (admin or self)
export async function getUserActivities(userId) {
  const { data, error } = await supabase.from('activity_log').select('*').eq('user_id', userId).order('created_at', { ascending: false })
  if (error) throw error
  return data
}

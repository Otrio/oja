import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

// This endpoint must be deployed to a trusted server environment and the
// SUPABASE_SERVICE_ROLE_KEY must be set as an environment variable there.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

export async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const authHeader = (req.headers.authorization || '')
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null
    if (!token) return res.status(401).json({ error: 'Missing authorization token' })

    // Verify requester using public client
    const { data: requesterUser, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !requesterUser?.data?.user) return res.status(401).json({ error: 'Invalid token' })
    const requesterId = requesterUser.data.user.id

    const { data: requesterProfile, error: rqErr } = await supabase.from('profiles').select('role').eq('id', requesterId).single()
    if (rqErr || !requesterProfile) return res.status(403).json({ error: 'Unauthorized' })
    if ((requesterProfile.role || '').toString().toLowerCase() !== 'admin') return res.status(403).json({ error: 'Only admins can create users' })

    const { name, email, role = 'manager', created_by } = req.body

    if (!SUPABASE_SERVICE_ROLE) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured on server')
      return res.status(500).json({ error: 'Server not configured' })
    }

    const service = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE)

    // Create user via service role
    const password = Math.random().toString(36).slice(-12)
    const { data: signUpData, error: signUpError } = await service.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: name, role }
    })
    if (signUpError) {
      console.error('createUser error', signUpError)
      return res.status(500).json({ error: signUpError.message || String(signUpError) })
    }

    const newUserId = signUpData.user.id

    // Insert profile row using service key
    const { data, error } = await service.from('profiles').upsert([{ id: newUserId, name, role, created_by }])
    if (error) {
      console.error('profiles upsert error', error)
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ data: { userId: newUserId, profile: data[0] } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message })
  }
}

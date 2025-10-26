import { supabase } from '../lib/supabase'

export async function updateProfile(req, res) {
  try {
    const {
      user: { id: userId },
    } = await supabase.auth.getUser()

    if (!userId) {
      return { error: 'Not authenticated' }
    }

    const updates = {
      ...req.body,
      updated_at: new Date().toISOString(),
    }

    // Update user profile in profiles table
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        ...updates
      })

    if (error) throw error

    return { data: updates }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { error: error.message }
  }
}
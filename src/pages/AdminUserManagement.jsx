import React, { useEffect, useState } from 'react'
import PrimaryActionButton from '../components/PrimaryActionButton'
import { useUser } from '../context/UserContext'
import { addUser, editUserProfile, getUserActivities } from '../lib/rbac'
import { supabase } from '../lib/supabase'

export default function AdminUserManagement() {
  const { user } = useUser()
  const [users, setUsers] = useState([])
  const [activities, setActivities] = useState([])
  const [form, setForm] = useState({ name: '', email: '', role: 'manager' })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [lastActions, setLastActions] = useState([]) // stack of actions for undo

  useEffect(() => {
    // Fetch users created by this admin
    async function fetchUsers() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('created_by', user.id)
        if (error) throw error
        setUsers(data || [])
      } catch (err) {
        console.error('Failed to fetch users:', err)
        alert('Failed to fetch users: ' + (err.message || String(err)))
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    if (user?.role === 'admin') fetchUsers()
  }, [user])

  async function refreshUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('created_by', user.id)
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Failed to refresh users:', err)
      alert('Failed to refresh users: ' + (err.message || String(err)))
      setUsers([])
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addUser({ ...form, created_by: user.id })
      setForm({ name: '', email: '', role: 'manager' })
      await refreshUsers()
    } catch (err) {
      alert('Error adding user: ' + err.message)
    }
    setSubmitting(false)
  }

  async function handleEditUser(userId, changes) {
    setLoading(true)
    try {
      await editUserProfile(userId, changes)
      await refreshUsers()
    } catch (err) {
      alert('Error editing user: ' + err.message)
    }
    setLoading(false)
  }

  async function handleViewActivities(userId) {
    setLoading(true)
    try {
      const logs = await getUserActivities(userId)
      setActivities(logs)
      setSelectedUser(userId)
    } catch (err) {
      alert('Error fetching activities: ' + err.message)
    }
    setLoading(false)
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set())
      return
    }
    setSelectedIds(new Set(users.map(u => u.id)))
  }

  async function bulkPromote() {
    if (selectedIds.size === 0) return
    if (!confirm(`Promote ${selectedIds.size} user(s) to admin?`)) return
    setLoading(true)
    const ids = Array.from(selectedIds)
    // capture previous roles for undo
    const prevRoles = users.filter(u => ids.includes(u.id)).map(u => ({ id: u.id, role: u.role }))
    try {
      for (const id of ids) {
        await editUserProfile(id, { role: 'admin' })
      }
      await refreshUsers()
      setSelectedIds(new Set())
      // push to lastActions for undo
      setLastActions(prev => [{ type: 'promote', ids, prevRoles, time: Date.now() }, ...prev].slice(0, 10))
    } catch (err) {
      alert('Error bulk promoting users: ' + err.message)
    }
    setLoading(false)
  }

  async function undoLast() {
    if (lastActions.length === 0) return
    const [last, ...rest] = lastActions
    if (last.type === 'promote') {
      setLoading(true)
      try {
        for (const p of last.prevRoles) {
          await editUserProfile(p.id, { role: p.role })
        }
        await refreshUsers()
        setLastActions(rest)
      } catch (err) {
        alert('Error undoing action: ' + err.message)
      }
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add, edit, and manage user roles and permissions</p>
        </div>
        <div className="flex gap-3">
          <PrimaryActionButton onClick={bulkPromote} disabled={selectedIds.size===0 || loading}>
            <i className="fas fa-user-shield text-xs"></i>
            Promote Selected
          </PrimaryActionButton>
          <button 
            onClick={undoLast} 
            disabled={lastActions.length===0 || loading}
            className={`sb-transition-base px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${
              lastActions.length === 0 || loading 
                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 sb-hover-translate'
            }`}
          >
            <i className="fas fa-undo text-xs"></i>
            Undo
          </button>
        </div>
      </div>

      <form onSubmit={handleAddUser} className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="sb-transition-base w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-supabase-500/20 focus:border-supabase-500"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="sb-transition-base w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-supabase-500/20 focus:border-supabase-500"
            required
          />
          <select
            value={form.role}
            onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            className="sb-transition-base w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-supabase-500/20 focus:border-supabase-500"
          >
            <option value="manager">Manager</option>
            <option value="sales_agent">Sales Agent</option>
          </select>
          <div>
            <button 
              type="submit" 
              disabled={submitting} 
              className={`sb-transition-base w-full px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-supabase-600 to-supabase-500 text-white hover:from-supabase-500 hover:to-supabase-400 sb-hover-translate'
              }`}
            >
              {submitting ? (
                <>
                  <i className="fas fa-circle-notch fa-spin"></i>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  Add User
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-hidden bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="p-3">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={selectedIds.size===users.length && users.length>0}
                      className="rounded border-gray-300 dark:border-gray-600 text-supabase-600 focus:ring-supabase-500/20"
                    />
                  </label>
                </th>
                <th className="p-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="p-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Email</th>
                <th className="p-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="p-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {users.map(u => (
                <tr key={u.id} className="sb-transition-base hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="p-3">
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-supabase-600 focus:ring-supabase-500/20"
                      />
                    </label>
                  </td>
                  <td className="p-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">{u.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${u.role === 'admin' 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        : u.role === 'manager'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewActivities(u.id)}
                        className="sb-transition-base text-sm text-gray-700 dark:text-gray-300 hover:text-supabase-600 dark:hover:text-supabase-400"
                      >
                        View Activity
                      </button>
                      <button
                        onClick={() => handleEditUser(u.id, { name: prompt('New name:', u.name) })}
                        className="sb-transition-base text-sm text-gray-700 dark:text-gray-300 hover:text-supabase-600 dark:hover:text-supabase-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm(`Promote ${u.name} to admin?`)) return
                          try {
                            const prev = u.role
                            await editUserProfile(u.id, { role: 'admin' })
                            await refreshUsers()
                            setLastActions(prevState => [{
                              type: 'promote',
                              ids: [u.id],
                              prevRoles: [{ id: u.id, role: prev }],
                              time: Date.now()
                            }, ...prevState].slice(0,10))
                          } catch (err) {
                            alert('Error promoting user: ' + err.message)
                          }
                        }}
                        className="sb-transition-base text-sm text-supabase-600 dark:text-supabase-400 hover:text-supabase-500 dark:hover:text-supabase-300"
                      >
                        Promote
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
        <div className="mt-6 p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Activity Log</h4>
          <div className="space-y-4">
            {activities.map(a => (
              <div key={a.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800">
                    <i className="fas fa-history text-gray-600 dark:text-gray-400"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {a.action}
                    </p>
                    {a.details && (
                      <pre className="mt-1 text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
                        {JSON.stringify(a.details, null, 2)}
                      </pre>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

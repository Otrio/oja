import React, { createContext, useContext, useEffect, useState } from 'react'
import { useUser } from './UserContext'
import { useNotifications } from './NotificationContext'
import { supabase } from '../lib/supabase'

const STORAGE_KEY = 'oja_settings_v1'
const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    sales: true,
    inventory: true,
    system: true
  },
  currency: 'USD',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  dateFormat: 'MM/DD/YYYY',
  autoBackup: true,
  pageSize: '10'
}

// Exchange rates against USD (as of Oct 2025)
const EXCHANGE_RATES = {
  USD: 1,
  EUR: 0.94,
  GBP: 0.82,
  NGN: 850
}

export function useSettings() {
  return useContext(SettingsContext)
}

export function SettingsProvider({ children }) {
  const { user } = useUser()
  const { addNotification } = useNotifications()
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const [loading, setLoading] = useState(true)

  // Load settings from Supabase when user changes
  useEffect(() => {
    if (user?.id) {
      loadSettings()
    }
  }, [user?.id])

  // apply theme to document body
  useEffect(() => {
    try {
      if (settings?.theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('bg-gray-900', 'text-white')
      } else {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('bg-gray-900', 'text-white')
      }
    } catch (e) {}
  }, [settings?.theme])

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (e) {
      console.error('Failed to save settings to localStorage:', e)
    }
  }, [settings])

  async function loadSettings() {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (data) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      // Fallback to localStorage settings
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings(newSettings) {
    if (!user?.id) return

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          settings: newSettings,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSettings(newSettings)
      addNotification({
        title: 'Success',
        message: 'Settings updated successfully',
        type: 'success'
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      addNotification({
        title: 'Error',
        message: 'Failed to save settings',
        type: 'danger'
      })
      throw error
    }
  }

  function convertCurrency(amount, fromCurrency, toCurrency) {
    if (!amount) return 0
    if (fromCurrency === toCurrency) return amount
    
    // Convert to USD first (as base currency)
    const amountInUSD = amount / EXCHANGE_RATES[fromCurrency]
    
    // Then convert from USD to target currency
    return amountInUSD * EXCHANGE_RATES[toCurrency]
  }

  function formatCurrency(amount, currency = settings.currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const value = {
    settings,
    updateSettings,
    loading,
    convertCurrency,
    formatCurrency,
    EXCHANGE_RATES
  }

  // convenience helper
  value.setTheme = (t) => updateSettings({ ...settings, theme: t })

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export default SettingsContext
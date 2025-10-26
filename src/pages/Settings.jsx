import React from 'react'
import { useUser } from '../context/UserContext'
import { useSettings } from '../context/SettingsContext'

export default function Settings() {
  const { user } = useUser()
  const { settings: contextSettings, updateSettings, loading, EXCHANGE_RATES } = useSettings()
  const [settings, setSettings] = React.useState(contextSettings)

  React.useEffect(() => {
    setSettings(contextSettings)
  }, [contextSettings])

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' }
  ]

  const handleChange = (section, key, value) => {
    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: { ...prev[section], [key]: value }
      }))
    } else {
      setSettings(prev => ({ ...prev, [key]: value }))
    }
  }

  const saveSettings = async () => {
    try {
      await updateSettings(settings)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm">
        {/* Settings Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Settings</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your application preferences and configurations</p>
        </div>

        {/* Settings Content */}
        <div className="p-6">
          <div className="space-y-8">
            {/* Appearance */}
            <section>
              <h3 className="text-lg font-medium mb-4">Appearance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select 
                    value={settings.theme} 
                    onChange={(e) => handleChange(null, 'theme', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select 
                    value={settings.language} 
                    onChange={(e) => handleChange(null, 'language', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section>
              <h3 className="text-lg font-medium mb-4">Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive email updates about your activity</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.email}
                      onChange={(e) => handleChange('notifications', 'email', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.notifications.push}
                      onChange={(e) => handleChange('notifications', 'push', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </section>

            {/* Regional Settings */}
            <section>
              <h3 className="text-lg font-medium mb-4">Regional Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select 
                    value={settings.currency} 
                    onChange={(e) => handleChange(null, 'currency', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    {currencies.map(currency => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name} ({currency.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                  <select 
                    value={settings.dateFormat} 
                    onChange={(e) => handleChange(null, 'dateFormat', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Data Management */}
            <section>
              <h3 className="text-lg font-medium mb-4">Data Management</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Automatic Backup</h4>
                    <p className="text-sm text-gray-500">Automatically backup your data daily</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.autoBackup}
                      onChange={(e) => handleChange(null, 'autoBackup', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Items per page</label>
                  <select 
                    value={settings.pageSize} 
                    onChange={(e) => handleChange(null, 'pageSize', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>

                <div className="pt-4">
                  <button 
                    type="button"
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                    onClick={() => {/* TODO: Implement data export */}}
                  >
                    Export All Data
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              disabled={loading}
              className="modern-btn modern-btn-primary px-6"
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

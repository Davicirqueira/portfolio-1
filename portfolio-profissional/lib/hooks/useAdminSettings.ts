'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useAuditLogger } from './useAuditLogger'

export interface AdminSettings {
  id: string
  // Session & Security
  sessionTimeout: number // in minutes
  sessionWarningTime: number // in minutes
  maxLoginAttempts: number
  lockoutDuration: number // in minutes
  requirePasswordChange: boolean
  passwordChangeInterval: number // in days
  
  // Auto-save & Backup
  autoSave: boolean
  autoSaveInterval: number // in seconds
  autoBackup: boolean
  backupInterval: number // in hours
  backupRetention: number // in days
  
  // File Upload
  maxFileSize: number // in MB
  allowedFileTypes: string[]
  imageOptimization: boolean
  imageQuality: number // 1-100
  
  // UI & UX
  theme: 'light' | 'dark' | 'system'
  language: 'pt' | 'en'
  showAdvancedFeatures: boolean
  enableKeyboardShortcuts: boolean
  
  // Audit & Monitoring
  auditLogRetention: number // in days
  enableDetailedLogging: boolean
  logSecurityEvents: boolean
  alertOnSuspiciousActivity: boolean
  
  // Performance
  enableCaching: boolean
  cacheTimeout: number // in minutes
  enableCompression: boolean
  enableLazyLoading: boolean
  
  // Maintenance
  maintenanceMode: boolean
  maintenanceMessage: string
  allowedMaintenanceIPs: string[]
  
  createdAt: string
  updatedAt: string
}

interface UseAdminSettingsReturn {
  settings: AdminSettings | null
  isLoading: boolean
  error: string | null
  updateSettings: (updates: Partial<AdminSettings>) => Promise<boolean>
  resetToDefaults: () => Promise<boolean>
  exportSettings: () => Promise<void>
  importSettings: (settingsData: Partial<AdminSettings>) => Promise<boolean>
  refreshSettings: () => Promise<void>
}

const DEFAULT_SETTINGS: Omit<AdminSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  // Session & Security
  sessionTimeout: 30,
  sessionWarningTime: 5,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  requirePasswordChange: false,
  passwordChangeInterval: 90,
  
  // Auto-save & Backup
  autoSave: true,
  autoSaveInterval: 30,
  autoBackup: true,
  backupInterval: 24,
  backupRetention: 30,
  
  // File Upload
  maxFileSize: 5,
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  imageOptimization: true,
  imageQuality: 85,
  
  // UI & UX
  theme: 'system',
  language: 'pt',
  showAdvancedFeatures: false,
  enableKeyboardShortcuts: true,
  
  // Audit & Monitoring
  auditLogRetention: 90,
  enableDetailedLogging: true,
  logSecurityEvents: true,
  alertOnSuspiciousActivity: true,
  
  // Performance
  enableCaching: true,
  cacheTimeout: 60,
  enableCompression: true,
  enableLazyLoading: true,
  
  // Maintenance
  maintenanceMode: false,
  maintenanceMessage: 'Sistema em manutenção. Tente novamente em alguns minutos.',
  allowedMaintenanceIPs: []
}

export function useAdminSettings(): UseAdminSettingsReturn {
  const { data: session } = useSession()
  const { logAction } = useAuditLogger()
  
  const [settings, setSettings] = useState<AdminSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings
  const fetchSettings = useCallback(async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/settings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch settings')
      }
    } catch (err) {
      console.error('Error fetching admin settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<AdminSettings>): Promise<boolean> => {
    if (!session || !settings) return false

    try {
      setError(null)

      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const updatedSettings = result.data
        setSettings(updatedSettings)
        
        // Log the settings change
        await logAction('settings_change', 'admin', {
          oldData: settings,
          newData: updatedSettings,
          severity: 'medium',
          details: `Updated settings: ${Object.keys(updates).join(', ')}`
        })
        
        return true
      } else {
        throw new Error(result.error || 'Failed to update settings')
      }
    } catch (err) {
      console.error('Error updating admin settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session, settings, logAction])

  // Reset to defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    if (!session) return false

    const confirmed = window.confirm(
      'Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.'
    )
    
    if (!confirmed) return false

    try {
      setError(null)

      const response = await fetch('/api/admin/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setSettings(result.data)
        
        await logAction('settings_change', 'admin', {
          severity: 'high',
          details: 'Settings reset to defaults'
        })
        
        return true
      } else {
        throw new Error(result.error || 'Failed to reset settings')
      }
    } catch (err) {
      console.error('Error resetting admin settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session, logAction])

  // Export settings
  const exportSettings = useCallback(async () => {
    if (!settings) return

    try {
      const dataStr = JSON.stringify(settings, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-settings-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)
      
      await logAction('export', 'admin', {
        severity: 'medium',
        details: 'Admin settings exported'
      })
    } catch (err) {
      console.error('Error exporting settings:', err)
      setError('Failed to export settings')
    }
  }, [settings, logAction])

  // Import settings
  const importSettings = useCallback(async (settingsData: Partial<AdminSettings>): Promise<boolean> => {
    if (!session) return false

    try {
      // Validate imported data
      const validatedData = { ...settingsData }
      delete validatedData.id
      delete validatedData.createdAt
      delete validatedData.updatedAt

      const success = await updateSettings(validatedData)
      
      if (success) {
        await logAction('import', 'admin', {
          severity: 'high',
          details: 'Admin settings imported'
        })
      }
      
      return success
    } catch (err) {
      console.error('Error importing settings:', err)
      setError('Failed to import settings')
      return false
    }
  }, [session, updateSettings, logAction])

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    await fetchSettings()
  }, [fetchSettings])

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchSettings()
    }
  }, [session, fetchSettings])

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    refreshSettings
  }
}
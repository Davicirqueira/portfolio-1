'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useAuditLogger } from './useAuditLogger'

export interface BackupInfo {
  id: string
  name: string
  description?: string
  size: number
  createdAt: string
  type: BackupType
  status: BackupStatus
  includesMedia: boolean
  includesSettings: boolean
  includesAuditLogs: boolean
  checksum: string
}

export type BackupType = 'manual' | 'automatic' | 'scheduled'
export type BackupStatus = 'creating' | 'completed' | 'failed' | 'corrupted'

interface BackupOperation {
  id: string
  type: 'backup' | 'restore'
  status: 'running' | 'completed' | 'failed'
  progress: number
  startTime: Date
  endTime?: Date
  error?: string
}

interface UseBackupManagerReturn {
  backups: BackupInfo[]
  operations: BackupOperation[]
  isLoading: boolean
  error: string | null
  createBackup: (options: {
    name: string
    description?: string
    includeMedia?: boolean
    includeSettings?: boolean
    includeAuditLogs?: boolean
  }) => Promise<string | null>
  restoreBackup: (backupId: string, options?: {
    restoreMedia?: boolean
    restoreSettings?: boolean
    restoreAuditLogs?: boolean
  }) => Promise<boolean>
  deleteBackup: (backupId: string) => Promise<boolean>
  downloadBackup: (backupId: string) => Promise<void>
  uploadBackup: (file: File) => Promise<boolean>
  validateBackup: (backupId: string) => Promise<boolean>
  refreshBackups: () => Promise<void>
  scheduleAutoBackup: (enabled: boolean, interval: number) => Promise<boolean>
}

export function useBackupManager(): UseBackupManagerReturn {
  const { data: session } = useSession()
  const { logAction } = useAuditLogger()
  
  const [backups, setBackups] = useState<BackupInfo[]>([])
  const [operations, setOperations] = useState<BackupOperation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/backup', {
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
        setBackups(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch backups')
      }
    } catch (err) {
      console.error('Error fetching backups:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Create backup
  const createBackup = useCallback(async (options: {
    name: string
    description?: string
    includeMedia?: boolean
    includeSettings?: boolean
    includeAuditLogs?: boolean
  }): Promise<string | null> => {
    if (!session) return null

    const operationId = `backup-${Date.now()}`
    
    try {
      setError(null)

      // Add operation to tracking
      const operation: BackupOperation = {
        id: operationId,
        type: 'backup',
        status: 'running',
        progress: 0,
        startTime: new Date()
      }
      setOperations(prev => [...prev, operation])

      const response = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          operationId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update operation status
        setOperations(prev => prev.map(op => 
          op.id === operationId 
            ? { ...op, status: 'completed', progress: 100, endTime: new Date() }
            : op
        ))

        // Refresh backups list
        await fetchBackups()

        await logAction('backup', 'admin', {
          severity: 'medium',
          details: `Backup created: ${options.name}`
        })

        return result.data.id
      } else {
        throw new Error(result.error || 'Failed to create backup')
      }
    } catch (err) {
      console.error('Error creating backup:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      
      // Update operation status
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'failed', endTime: new Date(), error: err instanceof Error ? err.message : 'Unknown error' }
          : op
      ))

      return null
    }
  }, [session, fetchBackups, logAction])

  // Restore backup
  const restoreBackup = useCallback(async (
    backupId: string, 
    options: {
      restoreMedia?: boolean
      restoreSettings?: boolean
      restoreAuditLogs?: boolean
    } = {}
  ): Promise<boolean> => {
    if (!session) return false

    const confirmed = window.confirm(
      'Tem certeza que deseja restaurar este backup? Esta ação substituirá os dados atuais e não pode ser desfeita.'
    )
    
    if (!confirmed) return false

    const operationId = `restore-${Date.now()}`
    
    try {
      setError(null)

      // Add operation to tracking
      const operation: BackupOperation = {
        id: operationId,
        type: 'restore',
        status: 'running',
        progress: 0,
        startTime: new Date()
      }
      setOperations(prev => [...prev, operation])

      const response = await fetch('/api/admin/backup/restore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          backupId,
          ...options,
          operationId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Update operation status
        setOperations(prev => prev.map(op => 
          op.id === operationId 
            ? { ...op, status: 'completed', progress: 100, endTime: new Date() }
            : op
        ))

        await logAction('restore', 'admin', {
          severity: 'high',
          details: `Backup restored: ${backupId}`
        })

        return true
      } else {
        throw new Error(result.error || 'Failed to restore backup')
      }
    } catch (err) {
      console.error('Error restoring backup:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      
      // Update operation status
      setOperations(prev => prev.map(op => 
        op.id === operationId 
          ? { ...op, status: 'failed', endTime: new Date(), error: err instanceof Error ? err.message : 'Unknown error' }
          : op
      ))

      return false
    }
  }, [session, logAction])

  // Delete backup
  const deleteBackup = useCallback(async (backupId: string): Promise<boolean> => {
    if (!session) return false

    const confirmed = window.confirm(
      'Tem certeza que deseja excluir este backup? Esta ação não pode ser desfeita.'
    )
    
    if (!confirmed) return false

    try {
      setError(null)

      const response = await fetch(`/api/admin/backup/${backupId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setBackups(prev => prev.filter(backup => backup.id !== backupId))
        
        await logAction('delete', 'admin', {
          resourceId: backupId,
          severity: 'medium',
          details: `Backup deleted: ${backupId}`
        })

        return true
      } else {
        throw new Error(result.error || 'Failed to delete backup')
      }
    } catch (err) {
      console.error('Error deleting backup:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session, logAction])

  // Download backup
  const downloadBackup = useCallback(async (backupId: string) => {
    if (!session) return

    try {
      const response = await fetch(`/api/admin/backup/${backupId}/download`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup-${backupId}-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      await logAction('export', 'admin', {
        resourceId: backupId,
        severity: 'medium',
        details: `Backup downloaded: ${backupId}`
      })
    } catch (err) {
      console.error('Error downloading backup:', err)
      setError('Failed to download backup')
    }
  }, [session, logAction])

  // Upload backup
  const uploadBackup = useCallback(async (file: File): Promise<boolean> => {
    if (!session) return false

    try {
      setError(null)

      const formData = new FormData()
      formData.append('backup', file)

      const response = await fetch('/api/admin/backup/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        await fetchBackups()
        
        await logAction('import', 'admin', {
          severity: 'high',
          details: `Backup uploaded: ${file.name}`
        })

        return true
      } else {
        throw new Error(result.error || 'Failed to upload backup')
      }
    } catch (err) {
      console.error('Error uploading backup:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session, fetchBackups, logAction])

  // Validate backup
  const validateBackup = useCallback(async (backupId: string): Promise<boolean> => {
    if (!session) return false

    try {
      setError(null)

      const response = await fetch(`/api/admin/backup/${backupId}/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      return result.success && result.data.isValid
    } catch (err) {
      console.error('Error validating backup:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session])

  // Schedule auto backup
  const scheduleAutoBackup = useCallback(async (enabled: boolean, interval: number): Promise<boolean> => {
    if (!session) return false

    try {
      setError(null)

      const response = await fetch('/api/admin/backup/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled, interval }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        await logAction('settings_change', 'admin', {
          severity: 'medium',
          details: `Auto backup ${enabled ? 'enabled' : 'disabled'} with ${interval}h interval`
        })

        return true
      } else {
        throw new Error(result.error || 'Failed to schedule auto backup')
      }
    } catch (err) {
      console.error('Error scheduling auto backup:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session, logAction])

  // Refresh backups
  const refreshBackups = useCallback(async () => {
    await fetchBackups()
  }, [fetchBackups])

  return {
    backups,
    operations,
    isLoading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    uploadBackup,
    validateBackup,
    refreshBackups,
    scheduleAutoBackup
  }
}
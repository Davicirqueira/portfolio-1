'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAuditLogger } from '@/lib/hooks/useAuditLogger'

interface SecuritySettingsProps {
  className?: string
}

interface SecuritySettings {
  // Session & Security
  sessionTimeout: number
  sessionWarningTime: number
  maxLoginAttempts: number
  lockoutDuration: number
  requirePasswordChange: boolean
  passwordChangeInterval: number
  
  // Audit & Monitoring
  auditLogRetention: number
  enableDetailedLogging: boolean
  logSecurityEvents: boolean
  alertOnSuspiciousActivity: boolean
  
  // File Upload Security
  maxFileSize: number
  allowedFileTypes: string[]
  scanUploadsForMalware: boolean
  
  // System Security
  enableRateLimiting: boolean
  rateLimitRequests: number
  rateLimitWindow: number
  enableIPWhitelist: boolean
  whitelistedIPs: string[]
  
  // Backup Security
  encryptBackups: boolean
  backupRetention: number
  requireBackupVerification: boolean
}

export function SecuritySettings({ className = '' }: SecuritySettingsProps) {
  const { data: session } = useSession()
  const { logAction } = useAuditLogger()
  
  const [settings, setSettings] = useState<SecuritySettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch current settings
  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/settings')
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
      console.error('Error fetching security settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Save settings
  const saveSettings = async () => {
    if (!settings) return

    try {
      setIsSaving(true)
      setError(null)
      setSuccessMessage(null)

      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setSuccessMessage('Configurações de segurança salvas com sucesso!')
        
        await logAction('settings_change', 'security', {
          severity: 'medium',
          details: 'Security settings updated'
        })

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        throw new Error(result.error || 'Failed to save settings')
      }
    } catch (err) {
      console.error('Error saving security settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset to defaults
  const resetToDefaults = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.'
    )
    
    if (!confirmed) return

    try {
      setIsSaving(true)
      setError(null)

      const response = await fetch('/api/admin/settings/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resetType: 'settings',
          createBackup: true
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        await fetchSettings()
        setSuccessMessage('Configurações restauradas para os valores padrão!')
        
        await logAction('reset', 'security', {
          severity: 'high',
          details: 'Security settings reset to defaults'
        })
      } else {
        throw new Error(result.error || 'Failed to reset settings')
      }
    } catch (err) {
      console.error('Error resetting security settings:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (session) {
      fetchSettings()
    }
  }, [session])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Erro ao carregar configurações de segurança</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Configurações de Segurança
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            disabled={isSaving}
          >
            Restaurar Padrões
          </Button>
          <Button
            onClick={saveSettings}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <p className="text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      {/* Session & Authentication */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Sessão e Autenticação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Timeout da Sessão (minutos)</label>
            <Input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(prev => prev ? { ...prev, sessionTimeout: parseInt(e.target.value) } : null)}
              min="5"
              max="480"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Aviso de Expiração (minutos)</label>
            <Input
              type="number"
              value={settings.sessionWarningTime}
              onChange={(e) => setSettings(prev => prev ? { ...prev, sessionWarningTime: parseInt(e.target.value) } : null)}
              min="1"
              max="30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Máximo de Tentativas de Login</label>
            <Input
              type="number"
              value={settings.maxLoginAttempts}
              onChange={(e) => setSettings(prev => prev ? { ...prev, maxLoginAttempts: parseInt(e.target.value) } : null)}
              min="3"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duração do Bloqueio (minutos)</label>
            <Input
              type="number"
              value={settings.lockoutDuration}
              onChange={(e) => setSettings(prev => prev ? { ...prev, lockoutDuration: parseInt(e.target.value) } : null)}
              min="5"
              max="60"
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.requirePasswordChange}
              onChange={(e) => setSettings(prev => prev ? { ...prev, requirePasswordChange: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Exigir mudança periódica de senha</span>
          </label>
          {settings.requirePasswordChange && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-1">Intervalo de Mudança (dias)</label>
              <Input
                type="number"
                value={settings.passwordChangeInterval}
                onChange={(e) => setSettings(prev => prev ? { ...prev, passwordChangeInterval: parseInt(e.target.value) } : null)}
                min="30"
                max="365"
                className="w-32"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Audit & Monitoring */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Auditoria e Monitoramento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Retenção de Logs (dias)</label>
            <Input
              type="number"
              value={settings.auditLogRetention}
              onChange={(e) => setSettings(prev => prev ? { ...prev, auditLogRetention: parseInt(e.target.value) } : null)}
              min="7"
              max="365"
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enableDetailedLogging}
              onChange={(e) => setSettings(prev => prev ? { ...prev, enableDetailedLogging: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Ativar log detalhado</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.logSecurityEvents}
              onChange={(e) => setSettings(prev => prev ? { ...prev, logSecurityEvents: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Registrar eventos de segurança</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.alertOnSuspiciousActivity}
              onChange={(e) => setSettings(prev => prev ? { ...prev, alertOnSuspiciousActivity: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Alertar sobre atividade suspeita</span>
          </label>
        </div>
      </Card>

      {/* File Upload Security */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Segurança de Upload</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tamanho Máximo (MB)</label>
            <Input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings(prev => prev ? { ...prev, maxFileSize: parseInt(e.target.value) } : null)}
              min="1"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipos de Arquivo Permitidos</label>
            <Input
              type="text"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => setSettings(prev => prev ? { 
                ...prev, 
                allowedFileTypes: e.target.value.split(',').map(type => type.trim()) 
              } : null)}
              placeholder="jpg, png, webp, gif"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.scanUploadsForMalware || false}
              onChange={(e) => setSettings(prev => prev ? { ...prev, scanUploadsForMalware: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Verificar uploads em busca de malware</span>
          </label>
        </div>
      </Card>

      {/* System Security */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Segurança do Sistema</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enableRateLimiting || false}
              onChange={(e) => setSettings(prev => prev ? { ...prev, enableRateLimiting: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Ativar limitação de taxa</span>
          </label>
          
          {settings.enableRateLimiting && (
            <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Máximo de Requisições</label>
                <Input
                  type="number"
                  value={settings.rateLimitRequests || 100}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, rateLimitRequests: parseInt(e.target.value) } : null)}
                  min="10"
                  max="1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Janela de Tempo (minutos)</label>
                <Input
                  type="number"
                  value={settings.rateLimitWindow || 15}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, rateLimitWindow: parseInt(e.target.value) } : null)}
                  min="1"
                  max="60"
                />
              </div>
            </div>
          )}

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enableIPWhitelist || false}
              onChange={(e) => setSettings(prev => prev ? { ...prev, enableIPWhitelist: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Ativar lista branca de IPs</span>
          </label>

          {settings.enableIPWhitelist && (
            <div className="ml-6">
              <label className="block text-sm font-medium mb-1">IPs Permitidos (um por linha)</label>
              <textarea
                value={settings.whitelistedIPs?.join('\n') || ''}
                onChange={(e) => setSettings(prev => prev ? { 
                  ...prev, 
                  whitelistedIPs: e.target.value.split('\n').filter(ip => ip.trim()) 
                } : null)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="192.168.1.1&#10;10.0.0.1"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Backup Security */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Segurança de Backup</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Retenção de Backup (dias)</label>
            <Input
              type="number"
              value={settings.backupRetention}
              onChange={(e) => setSettings(prev => prev ? { ...prev, backupRetention: parseInt(e.target.value) } : null)}
              min="7"
              max="365"
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.encryptBackups || false}
              onChange={(e) => setSettings(prev => prev ? { ...prev, encryptBackups: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Criptografar backups</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.requireBackupVerification || false}
              onChange={(e) => setSettings(prev => prev ? { ...prev, requireBackupVerification: e.target.checked } : null)}
              className="rounded border-gray-300"
            />
            <span>Exigir verificação de integridade do backup</span>
          </label>
        </div>
      </Card>
    </div>
  )
}
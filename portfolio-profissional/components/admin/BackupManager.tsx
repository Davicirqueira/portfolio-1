'use client'

import React, { useState, useEffect } from 'react'
import { useBackupManager } from '@/lib/hooks/useBackupManager'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface BackupManagerProps {
  className?: string
}

export function BackupManager({ className = '' }: BackupManagerProps) {
  const {
    backups,
    operations,
    isLoading,
    error,
    createBackup,
    restoreBackup,
    deleteBackup,
    downloadBackup,
    uploadBackup,
    refreshBackups,
    scheduleAutoBackup
  } = useBackupManager()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [backupForm, setBackupForm] = useState({
    name: '',
    description: '',
    includeMedia: true,
    includeSettings: true,
    includeAuditLogs: false
  })
  const [autoBackupSettings, setAutoBackupSettings] = useState({
    enabled: false,
    interval: 24 // hours
  })

  useEffect(() => {
    refreshBackups()
  }, [refreshBackups])

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!backupForm.name.trim()) {
      alert('Por favor, insira um nome para o backup')
      return
    }

    const backupId = await createBackup({
      name: backupForm.name,
      description: backupForm.description,
      includeMedia: backupForm.includeMedia,
      includeSettings: backupForm.includeSettings,
      includeAuditLogs: backupForm.includeAuditLogs
    })

    if (backupId) {
      setShowCreateForm(false)
      setBackupForm({
        name: '',
        description: '',
        includeMedia: true,
        includeSettings: true,
        includeAuditLogs: false
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const success = await uploadBackup(file)
    if (success) {
      e.target.value = '' // Reset file input
    }
  }

  const handleScheduleAutoBackup = async () => {
    const success = await scheduleAutoBackup(autoBackupSettings.enabled, autoBackupSettings.interval)
    if (success) {
      alert(`Backup automático ${autoBackupSettings.enabled ? 'ativado' : 'desativado'} com sucesso`)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'creating': return 'text-blue-600'
      case 'failed': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'creating': return 'Criando...'
      case 'failed': return 'Falhou'
      default: return status
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gerenciamento de Backup
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Criar Backup
          </Button>
          <Button
            onClick={refreshBackups}
            variant="outline"
          >
            Atualizar
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Auto Backup Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Configurações de Backup Automático</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoBackupSettings.enabled}
              onChange={(e) => setAutoBackupSettings(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span>Ativar backup automático</span>
          </label>
          <div className="flex items-center gap-2">
            <label>Intervalo:</label>
            <Input
              type="number"
              value={autoBackupSettings.interval}
              onChange={(e) => setAutoBackupSettings(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
              className="w-20"
              min="1"
              max="168"
            />
            <span>horas</span>
          </div>
          <Button
            onClick={handleScheduleAutoBackup}
            size="sm"
            variant="outline"
          >
            Salvar
          </Button>
        </div>
      </Card>

      {/* Create Backup Form */}
      {showCreateForm && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Criar Novo Backup</h3>
          <form onSubmit={handleCreateBackup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome do Backup *</label>
              <Input
                type="text"
                value={backupForm.name}
                onChange={(e) => setBackupForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Backup antes da atualização"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Input
                type="text"
                value={backupForm.description}
                onChange={(e) => setBackupForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição opcional do backup"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">Incluir:</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={backupForm.includeMedia}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, includeMedia: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>Arquivos de mídia</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={backupForm.includeSettings}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, includeSettings: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>Configurações do sistema</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={backupForm.includeAuditLogs}
                  onChange={(e) => setBackupForm(prev => ({ ...prev, includeAuditLogs: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span>Logs de auditoria</span>
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Criar Backup
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Upload Backup */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Importar Backup</h3>
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".json,.zip"
            onChange={handleFileUpload}
            className="flex-1"
          />
          <p className="text-sm text-gray-600">Formatos aceitos: .json, .zip</p>
        </div>
      </Card>

      {/* Active Operations */}
      {operations.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Operações em Andamento</h3>
          <div className="space-y-3">
            {operations.map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="font-medium">
                    {operation.type === 'backup' ? 'Criando backup' : 'Restaurando backup'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Iniciado em {operation.startTime.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${operation.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{operation.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Backups List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Backups Disponíveis</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum backup encontrado</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backups.map((backup) => (
              <div key={backup.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {backup.name || backup.id}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        backup.type === 'automatic' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {backup.type === 'automatic' ? 'Automático' : 'Manual'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(backup.status)}`}>
                        {getStatusText(backup.status)}
                      </span>
                    </div>
                    {backup.description && (
                      <p className="text-gray-600 dark:text-gray-400 mb-2">{backup.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Tamanho: {formatFileSize(backup.size * 1024 * 1024)}</span>
                      <span>Criado: {new Date(backup.createdAt).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      {backup.includesMedia && <span className="bg-gray-100 px-2 py-1 rounded">Mídia</span>}
                      {backup.includesSettings && <span className="bg-gray-100 px-2 py-1 rounded">Configurações</span>}
                      {backup.includesAuditLogs && <span className="bg-gray-100 px-2 py-1 rounded">Logs</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      onClick={() => downloadBackup(backup.id)}
                      size="sm"
                      variant="outline"
                    >
                      Download
                    </Button>
                    <Button
                      onClick={() => restoreBackup(backup.id)}
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      Restaurar
                    </Button>
                    <Button
                      onClick={() => deleteBackup(backup.id)}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SystemLog {
  id: string
  timestamp: string
  level: 'error' | 'warn' | 'info' | 'debug'
  source: 'api' | 'auth' | 'database' | 'security' | 'system'
  message: string
  details?: any
  userId?: string
  ipAddress?: string
  userAgent?: string
}

interface SystemLogsProps {
  className?: string
}

export function SystemLogs({ className = '' }: SystemLogsProps) {
  const { data: session } = useSession()
  
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })

  // Filters
  const [filters, setFilters] = useState({
    level: '',
    source: '',
    search: '',
    startDate: '',
    endDate: ''
  })

  // Fetch logs
  const fetchLogs = async (page = 1) => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.level && { level: filters.level }),
        ...(filters.source && { source: filters.source }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })

      const response = await fetch(`/api/admin/system/logs?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setLogs(result.data)
        setPagination(result.pagination)
      } else {
        throw new Error(result.error || 'Failed to fetch logs')
      }
    } catch (err) {
      console.error('Error fetching system logs:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // Export logs
  const exportLogs = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.level && { level: filters.level }),
        ...(filters.source && { source: filters.source }),
        ...(filters.search && { search: filters.search }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        export: 'true'
      })

      const response = await fetch(`/api/admin/system/logs?${params}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `system-logs-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error exporting logs:', err)
      setError('Erro ao exportar logs')
    }
  }

  // Clear logs
  const clearLogs = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.'
    )
    
    if (!confirmed) return

    try {
      const response = await fetch('/api/admin/system/logs', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        await fetchLogs(1)
      } else {
        throw new Error(result.error || 'Failed to clear logs')
      }
    } catch (err) {
      console.error('Error clearing logs:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    }
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Apply filters
  const applyFilters = () => {
    fetchLogs(1)
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      level: '',
      source: '',
      search: '',
      startDate: '',
      endDate: ''
    })
    setTimeout(() => fetchLogs(1), 100)
  }

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'warn': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'debug': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Get source color
  const getSourceColor = (source: string) => {
    switch (source) {
      case 'security': return 'text-red-700 bg-red-100'
      case 'auth': return 'text-purple-700 bg-purple-100'
      case 'database': return 'text-green-700 bg-green-100'
      case 'api': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  useEffect(() => {
    if (session) {
      fetchLogs()
    }
  }, [session])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Logs do Sistema
        </h2>
        <div className="flex gap-2">
          <Button onClick={exportLogs} variant="outline" size="sm">
            Exportar
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm" className="text-red-600">
            Limpar Logs
          </Button>
          <Button onClick={() => fetchLogs(pagination.page)} variant="outline" size="sm">
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nível</label>
            <Select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="error">Error</option>
              <option value="warn">Warning</option>
              <option value="info">Info</option>
              <option value="debug">Debug</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Origem</label>
            <Select
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="api">API</option>
              <option value="auth">Autenticação</option>
              <option value="database">Banco de Dados</option>
              <option value="security">Segurança</option>
              <option value="system">Sistema</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Inicial</label>
            <Input
              type="datetime-local"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Data Final</label>
            <Input
              type="datetime-local"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Buscar</label>
            <Input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Buscar mensagem..."
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Button onClick={applyFilters} size="sm">
            Aplicar Filtros
          </Button>
          <Button onClick={resetFilters} variant="outline" size="sm">
            Limpar Filtros
          </Button>
        </div>
      </Card>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Logs */}
      <Card className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum log encontrado</p>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-lg p-4 ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(log.source)}`}>
                        {log.source.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {log.message}
                    </p>
                    {log.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                          Ver detalhes
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {log.userId && <span>Usuário: {log.userId}</span>}
                      {log.ipAddress && <span>IP: {log.ipAddress}</span>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages} 
              ({pagination.totalCount} logs no total)
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => fetchLogs(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                variant="outline"
                size="sm"
              >
                Anterior
              </Button>
              <Button
                onClick={() => fetchLogs(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                variant="outline"
                size="sm"
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
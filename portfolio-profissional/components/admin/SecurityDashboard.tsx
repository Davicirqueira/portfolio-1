'use client'

import React, { useState, useEffect } from 'react'
import { useSecurityMonitor } from '@/lib/hooks/useSecurityMonitor'
import { useAuditLogger } from '@/lib/hooks/useAuditLogger'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface SecurityDashboardProps {
  className?: string
}

export function SecurityDashboard({ className = '' }: SecurityDashboardProps) {
  const {
    alerts,
    metrics,
    isLoading,
    error,
    resolveAlert,
    dismissAlert,
    refreshAlerts,
    getUnresolvedAlerts,
    getCriticalAlerts,
    checkSecurityStatus
  } = useSecurityMonitor()

  const { logAction } = useAuditLogger()
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<any>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  // Fetch system status
  const fetchSystemStatus = async () => {
    setStatusLoading(true)
    try {
      const response = await fetch('/api/admin/system/status')
      if (response.ok) {
        const result = await response.json()
        setSystemStatus(result.data)
      }
    } catch (error) {
      console.error('Error fetching system status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleResolveAlert = async (alertId: string) => {
    const success = await resolveAlert(alertId, 'Resolved by admin')
    if (success) {
      await logAction('update', 'security', {
        resourceId: alertId,
        severity: 'medium',
        details: 'Security alert resolved'
      })
      setSelectedAlert(null)
    }
  }

  const handleDismissAlert = async (alertId: string) => {
    const success = await dismissAlert(alertId)
    if (success) {
      await logAction('delete', 'security', {
        resourceId: alertId,
        severity: 'low',
        details: 'Security alert dismissed'
      })
      setSelectedAlert(null)
    }
  }

  const unresolvedAlerts = getUnresolvedAlerts()
  const criticalAlerts = getCriticalAlerts()

  if (isLoading && !systemStatus) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status do Sistema</p>
              <p className={`text-lg font-semibold ${
                systemStatus?.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemStatus?.status === 'healthy' ? 'Saudável' : 'Com Problemas'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              systemStatus?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Críticos</p>
            <p className="text-2xl font-bold text-red-600">{criticalAlerts.length}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Não Resolvidos</p>
            <p className="text-2xl font-bold text-yellow-600">{unresolvedAlerts.length}</p>
          </div>
        </Card>

        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            <p className="text-lg font-semibold text-green-600">
              {systemStatus?.uptime?.formatted || 'N/A'}
            </p>
          </div>
        </Card>
      </div>

      {/* Security Metrics */}
      {metrics && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Métricas de Segurança</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de Alertas</p>
              <p className="text-xl font-bold">{metrics.totalAlerts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Alertas Resolvidos</p>
              <p className="text-xl font-bold text-green-600">{metrics.resolvedAlerts}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Médio de Resolução</p>
              <p className="text-xl font-bold">{metrics.averageResolutionTime}min</p>
            </div>
          </div>
        </Card>
      )}

      {/* Security Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Alertas de Segurança</h3>
          <div className="flex gap-2">
            <Button
              onClick={checkSecurityStatus}
              variant="outline"
              size="sm"
            >
              Verificar Segurança
            </Button>
            <Button
              onClick={refreshAlerts}
              variant="outline"
              size="sm"
            >
              Atualizar
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhum alerta de segurança encontrado</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${
                  alert.resolved 
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : alert.severity === 'critical'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : alert.severity === 'high'
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                    : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.resolved && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          RESOLVIDO
                        </span>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{alert.title}</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{alert.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </p>
                    {alert.resolved && alert.resolvedAt && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        Resolvido em {new Date(alert.resolvedAt).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  {!alert.resolved && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        onClick={() => handleResolveAlert(alert.id)}
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Resolver
                      </Button>
                      <Button
                        onClick={() => handleDismissAlert(alert.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Descartar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* System Performance */}
      {systemStatus && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance do Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tempo de Resposta</p>
              <p className="text-lg font-semibold">{systemStatus.responseTime}ms</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memória Usada</p>
              <p className="text-lg font-semibold">
                {systemStatus.memory?.used}MB / {systemStatus.memory?.total}MB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status do Banco</p>
              <p className={`text-lg font-semibold ${
                systemStatus.database?.status === 'connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {systemStatus.database?.status === 'connected' ? 'Conectado' : 'Desconectado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Atividade (24h)</p>
              <p className="text-lg font-semibold">
                {systemStatus.activity?.auditLogs?.last24Hours || 0} logs
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
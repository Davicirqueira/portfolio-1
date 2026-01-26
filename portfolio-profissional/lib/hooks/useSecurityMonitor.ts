'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useAuditLogger } from './useAuditLogger'

export interface SecurityAlert {
  id: string
  type: SecurityAlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  timestamp: string
  resolved: boolean
  resolvedAt?: string
  resolvedBy?: string
  metadata?: Record<string, any>
}

export type SecurityAlertType = 
  | 'failed_login_attempts'
  | 'suspicious_activity'
  | 'unauthorized_access'
  | 'data_breach_attempt'
  | 'malicious_file_upload'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'brute_force_attack'
  | 'session_hijacking'
  | 'privilege_escalation'
  | 'unusual_activity_pattern'
  | 'system_vulnerability'

export interface SecurityMetrics {
  totalAlerts: number
  criticalAlerts: number
  resolvedAlerts: number
  averageResolutionTime: number // in minutes
  alertsByType: Record<SecurityAlertType, number>
  alertsByDay: Array<{ date: string; count: number }>
  topThreats: Array<{ type: SecurityAlertType; count: number }>
}

interface UseSecurityMonitorReturn {
  alerts: SecurityAlert[]
  metrics: SecurityMetrics | null
  isLoading: boolean
  error: string | null
  createAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>) => Promise<void>
  resolveAlert: (alertId: string, resolution?: string) => Promise<boolean>
  dismissAlert: (alertId: string) => Promise<boolean>
  refreshAlerts: () => Promise<void>
  getUnresolvedAlerts: () => SecurityAlert[]
  getCriticalAlerts: () => SecurityAlert[]
  checkSecurityStatus: () => Promise<void>
}

export function useSecurityMonitor(): UseSecurityMonitorReturn {
  const { data: session } = useSession()
  const { logSecurityEvent } = useAuditLogger()
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch security alerts
  const fetchAlerts = useCallback(async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/security/alerts', {
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
        setAlerts(result.data.alerts)
        setMetrics(result.data.metrics)
      } else {
        throw new Error(result.error || 'Failed to fetch security alerts')
      }
    } catch (err) {
      console.error('Error fetching security alerts:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Create security alert
  const createAlert = useCallback(async (
    alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>
  ) => {
    if (!session) return

    try {
      const response = await fetch('/api/admin/security/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...alert,
          timestamp: new Date().toISOString(),
          resolved: false
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAlerts(prev => [result.data, ...prev])
        
        // Log security event
        await logSecurityEvent(
          `Security alert created: ${alert.type}`,
          alert.severity,
          alert.description
        )

        // Show browser notification for critical alerts
        if (alert.severity === 'critical' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification('Alerta de Segurança Crítico', {
              body: alert.description,
              icon: '/favicon.ico'
            })
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Alerta de Segurança Crítico', {
                  body: alert.description,
                  icon: '/favicon.ico'
                })
              }
            })
          }
        }
      }
    } catch (err) {
      console.error('Error creating security alert:', err)
    }
  }, [session, logSecurityEvent])

  // Resolve alert
  const resolveAlert = useCallback(async (alertId: string, resolution?: string): Promise<boolean> => {
    if (!session) return false

    try {
      const response = await fetch(`/api/admin/security/alerts/${alertId}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution,
          resolvedBy: session.user.id,
          resolvedAt: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId 
            ? { ...alert, resolved: true, resolvedAt: result.data.resolvedAt, resolvedBy: result.data.resolvedBy }
            : alert
        ))

        await logSecurityEvent(
          `Security alert resolved: ${alertId}`,
          'low',
          resolution
        )

        return true
      }
    } catch (err) {
      console.error('Error resolving security alert:', err)
    }
    
    return false
  }, [session, logSecurityEvent])

  // Dismiss alert
  const dismissAlert = useCallback(async (alertId: string): Promise<boolean> => {
    if (!session) return false

    try {
      const response = await fetch(`/api/admin/security/alerts/${alertId}`, {
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
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
        return true
      }
    } catch (err) {
      console.error('Error dismissing security alert:', err)
    }
    
    return false
  }, [session])

  // Get unresolved alerts
  const getUnresolvedAlerts = useCallback((): SecurityAlert[] => {
    return alerts.filter(alert => !alert.resolved)
  }, [alerts])

  // Get critical alerts
  const getCriticalAlerts = useCallback((): SecurityAlert[] => {
    return alerts.filter(alert => alert.severity === 'critical' && !alert.resolved)
  }, [alerts])

  // Check security status
  const checkSecurityStatus = useCallback(async () => {
    if (!session) return

    try {
      const response = await fetch('/api/admin/security/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data.alerts) {
        // Add any new alerts found during security check
        for (const alert of result.data.alerts) {
          await createAlert(alert)
        }
      }
    } catch (err) {
      console.error('Error checking security status:', err)
    }
  }, [session, createAlert])

  // Refresh alerts
  const refreshAlerts = useCallback(async () => {
    await fetchAlerts()
  }, [fetchAlerts])

  // Initial fetch
  useEffect(() => {
    if (session) {
      fetchAlerts()
    }
  }, [session, fetchAlerts])

  // Periodic security checks
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      checkSecurityStatus()
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [session, checkSecurityStatus])

  // Monitor for suspicious patterns
  useEffect(() => {
    if (!session || alerts.length === 0) return

    const recentAlerts = alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp).getTime()
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      return alertTime > oneHourAgo && !alert.resolved
    })

    // Check for multiple failed login attempts
    const failedLogins = recentAlerts.filter(alert => alert.type === 'failed_login_attempts')
    if (failedLogins.length >= 3) {
      createAlert({
        type: 'brute_force_attack',
        severity: 'high',
        title: 'Possível Ataque de Força Bruta',
        description: `Detectadas ${failedLogins.length} tentativas de login falhadas na última hora`,
        metadata: { failedAttempts: failedLogins.length }
      })
    }

    // Check for unusual activity patterns
    if (recentAlerts.length >= 5) {
      createAlert({
        type: 'unusual_activity_pattern',
        severity: 'medium',
        title: 'Padrão de Atividade Incomum',
        description: `${recentAlerts.length} alertas de segurança na última hora`,
        metadata: { alertCount: recentAlerts.length }
      })
    }
  }, [alerts, session, createAlert])

  return {
    alerts,
    metrics,
    isLoading,
    error,
    createAlert,
    resolveAlert,
    dismissAlert,
    refreshAlerts,
    getUnresolvedAlerts,
    getCriticalAlerts,
    checkSecurityStatus
  }
}
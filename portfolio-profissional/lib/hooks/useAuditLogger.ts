'use client'

import { useCallback } from 'react'
import { useSession } from 'next-auth/react'

export interface AuditLogEntry {
  id?: string
  userId: string
  action: AuditAction
  section: string
  resourceId?: string
  oldData?: any
  newData?: any
  timestamp: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  severity: AuditSeverity
  details?: string
}

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'login_failed'
  | 'session_expired'
  | 'password_change'
  | 'permission_denied'
  | 'bulk_operation'
  | 'export'
  | 'import'
  | 'backup'
  | 'restore'
  | 'settings_change'
  | 'security_event'

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical'

interface UseAuditLoggerReturn {
  logAction: (
    action: AuditAction,
    section: string,
    options?: {
      resourceId?: string
      oldData?: any
      newData?: any
      severity?: AuditSeverity
      details?: string
    }
  ) => Promise<void>
  logSecurityEvent: (
    event: string,
    severity: AuditSeverity,
    details?: string
  ) => Promise<void>
  logBulkOperation: (
    operation: string,
    section: string,
    count: number,
    details?: string
  ) => Promise<void>
}

export function useAuditLogger(): UseAuditLoggerReturn {
  const { data: session } = useSession()

  const getClientInfo = useCallback(() => {
    return {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      timestamp: new Date().toISOString()
    }
  }, [])

  const logAction = useCallback(async (
    action: AuditAction,
    section: string,
    options: {
      resourceId?: string
      oldData?: any
      newData?: any
      severity?: AuditSeverity
      details?: string
    } = {}
  ) => {
    if (!session?.user?.id) return

    const clientInfo = getClientInfo()
    
    const logEntry: AuditLogEntry = {
      userId: session.user.id,
      action,
      section,
      resourceId: options.resourceId,
      oldData: options.oldData,
      newData: options.newData,
      timestamp: clientInfo.timestamp,
      userAgent: clientInfo.userAgent,
      sessionId: session.user.id, // In a real app, this would be the actual session ID
      severity: options.severity || 'low',
      details: options.details
    }

    try {
      const response = await fetch('/api/admin/audit/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry),
      })

      if (!response.ok) {
        console.error('Failed to log audit entry:', response.statusText)
      }
    } catch (error) {
      console.error('Error logging audit entry:', error)
      // In a production environment, you might want to queue failed logs for retry
    }
  }, [session, getClientInfo])

  const logSecurityEvent = useCallback(async (
    event: string,
    severity: AuditSeverity,
    details?: string
  ) => {
    await logAction('security_event', 'security', {
      severity,
      details: `${event}${details ? `: ${details}` : ''}`
    })
  }, [logAction])

  const logBulkOperation = useCallback(async (
    operation: string,
    section: string,
    count: number,
    details?: string
  ) => {
    await logAction('bulk_operation', section, {
      severity: count > 10 ? 'medium' : 'low',
      details: `${operation} - ${count} items${details ? `: ${details}` : ''}`
    })
  }, [logAction])

  return {
    logAction,
    logSecurityEvent,
    logBulkOperation
  }
}
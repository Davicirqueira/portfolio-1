import { AuditLogger } from "@/lib/audit"
import { SessionManager } from "./session-manager"
import { headers } from "next/headers"

export interface SecurityAlert {
  id: string
  type: SecurityAlertType
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  metadata: Record<string, any>
}

export type SecurityAlertType = 
  | 'failed_login_attempt'
  | 'multiple_failed_logins'
  | 'suspicious_activity'
  | 'unauthorized_access_attempt'
  | 'session_hijacking_attempt'
  | 'unusual_upload_activity'
  | 'rate_limit_exceeded'
  | 'sql_injection_attempt'
  | 'xss_attempt'

export class SecurityMonitor {
  private static alerts: SecurityAlert[] = []
  private static readonly MAX_ALERTS = 1000
  private static readonly FAILED_LOGIN_THRESHOLD = 5
  private static readonly FAILED_LOGIN_WINDOW = 15 * 60 * 1000 // 15 minutes

  static async recordFailedLogin(email: string, ipAddress: string, userAgent: string): Promise<void> {
    const recentFailures = await this.getRecentFailedLogins(email, ipAddress)
    
    await AuditLogger.log({
      action: 'access',
      section: 'auth',
      metadata: {
        event: 'failed_login',
        email,
        ipAddress,
        userAgent,
        attemptCount: recentFailures + 1
      }
    })

    if (recentFailures >= this.FAILED_LOGIN_THRESHOLD - 1) {
      await this.createAlert({
        type: 'multiple_failed_logins',
        severity: 'high',
        message: `Multiple failed login attempts detected for ${email} from ${ipAddress}`,
        metadata: {
          email,
          ipAddress,
          userAgent,
          attemptCount: recentFailures + 1
        }
      })
    } else {
      await this.createAlert({
        type: 'failed_login_attempt',
        severity: 'low',
        message: `Failed login attempt for ${email}`,
        metadata: {
          email,
          ipAddress,
          userAgent
        }
      })
    }
  }

  static async recordSuspiciousActivity(
    type: SecurityAlertType,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    const severity = this.determineSeverity(type)
    
    await this.createAlert({
      type,
      severity,
      message: description,
      metadata
    })

    await AuditLogger.log({
      action: 'access',
      section: 'security',
      metadata: {
        event: 'suspicious_activity',
        type,
        description,
        severity,
        ...metadata
      }
    })
  }

  static async checkForSQLInjection(input: string, context: string): Promise<boolean> {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(--|\/\*|\*\/)/,
      /(\b(SCRIPT|JAVASCRIPT|VBSCRIPT)\b)/i,
      /(<script|<\/script>)/i
    ]

    const isSuspicious = sqlPatterns.some(pattern => pattern.test(input))
    
    if (isSuspicious) {
      const headersList = await headers()
      const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
      
      await this.recordSuspiciousActivity(
        'sql_injection_attempt',
        `Potential SQL injection attempt detected in ${context}`,
        {
          input: input.substring(0, 200), // Limit logged input
          context,
          ipAddress,
          patterns: sqlPatterns.map(p => p.source).filter(p => new RegExp(p, 'i').test(input))
        }
      )
      
      return true
    }
    
    return false
  }

  static async checkForXSS(input: string, context: string): Promise<boolean> {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ]

    const isSuspicious = xssPatterns.some(pattern => pattern.test(input))
    
    if (isSuspicious) {
      const headersList = await headers()
      const ipAddress = headersList.get('x-forwarded-for') || 'unknown'
      
      await this.recordSuspiciousActivity(
        'xss_attempt',
        `Potential XSS attempt detected in ${context}`,
        {
          input: input.substring(0, 200),
          context,
          ipAddress
        }
      )
      
      return true
    }
    
    return false
  }

  static async validateFileUpload(file: File, allowedTypes: string[]): Promise<{
    valid: boolean
    alerts: string[]
  }> {
    const alerts: string[] = []
    
    // Check file size (basic DoS protection)
    if (file.size > 50 * 1024 * 1024) { // 50MB
      alerts.push('File size exceeds maximum limit')
      await this.recordSuspiciousActivity(
        'unusual_upload_activity',
        'Unusually large file upload attempt',
        {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type
        }
      )
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      alerts.push('Invalid file type')
      await this.recordSuspiciousActivity(
        'unusual_upload_activity',
        'Upload of disallowed file type',
        {
          fileName: file.name,
          fileExtension,
          allowedTypes
        }
      )
    }

    // Check for suspicious file names
    const suspiciousPatterns = [
      /\.(php|asp|jsp|exe|bat|cmd|sh)$/i,
      /\.\./,
      /[<>:"|?*]/
    ]

    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      alerts.push('Suspicious file name')
      await this.recordSuspiciousActivity(
        'unusual_upload_activity',
        'Upload with suspicious file name',
        {
          fileName: file.name
        }
      )
    }

    return {
      valid: alerts.length === 0,
      alerts
    }
  }

  static async getSecurityAlerts(
    limit: number = 50,
    severity?: SecurityAlert['severity']
  ): Promise<SecurityAlert[]> {
    let filteredAlerts = this.alerts
    
    if (severity) {
      filteredAlerts = this.alerts.filter(alert => alert.severity === severity)
    }
    
    return filteredAlerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  static async getSecurityStats(timeframe: 'hour' | 'day' | 'week' = 'day') {
    const now = Date.now()
    let timeWindow: number
    
    switch (timeframe) {
      case 'hour':
        timeWindow = 60 * 60 * 1000
        break
      case 'day':
        timeWindow = 24 * 60 * 60 * 1000
        break
      case 'week':
        timeWindow = 7 * 24 * 60 * 60 * 1000
        break
    }

    const recentAlerts = this.alerts.filter(alert => 
      now - alert.timestamp.getTime() < timeWindow
    )

    const alertsByType = recentAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const alertsBySeverity = recentAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sessionStats = await SessionManager.getSessionStats()

    return {
      totalAlerts: recentAlerts.length,
      alertsByType,
      alertsBySeverity,
      criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
      highAlerts: recentAlerts.filter(a => a.severity === 'high').length,
      sessionStats,
      timeframe
    }
  }

  private static async createAlert(alertData: Omit<SecurityAlert, 'id' | 'timestamp'>): Promise<void> {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...alertData
    }

    this.alerts.unshift(alert)
    
    // Keep only the most recent alerts
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(0, this.MAX_ALERTS)
    }

    // Log critical and high severity alerts
    if (alert.severity === 'critical' || alert.severity === 'high') {
      console.warn(`Security Alert [${alert.severity.toUpperCase()}]: ${alert.message}`, alert.metadata)
    }
  }

  private static async getRecentFailedLogins(email: string, ipAddress: string): Promise<number> {
    const cutoff = new Date(Date.now() - this.FAILED_LOGIN_WINDOW)
    
    // In a real implementation, this would query the audit logs
    // For now, we'll count recent alerts
    return this.alerts.filter(alert => 
      alert.type === 'failed_login_attempt' &&
      alert.timestamp > cutoff &&
      alert.metadata.email === email &&
      alert.metadata.ipAddress === ipAddress
    ).length
  }

  private static determineSeverity(type: SecurityAlertType): SecurityAlert['severity'] {
    switch (type) {
      case 'sql_injection_attempt':
      case 'session_hijacking_attempt':
        return 'critical'
      case 'multiple_failed_logins':
      case 'unauthorized_access_attempt':
      case 'xss_attempt':
        return 'high'
      case 'unusual_upload_activity':
      case 'rate_limit_exceeded':
        return 'medium'
      case 'failed_login_attempt':
      case 'suspicious_activity':
      default:
        return 'low'
    }
  }
}
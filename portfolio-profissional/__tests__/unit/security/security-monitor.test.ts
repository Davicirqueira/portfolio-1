/**
 * @jest-environment jsdom
 */

import { SecurityMonitor } from '@/lib/security/monitor'

// Mock dependencies
jest.mock('@/lib/audit', () => ({
  AuditLogger: {
    log: jest.fn()
  }
}))

jest.mock('@/lib/security/session-manager', () => ({
  SessionManager: {
    getSessionStats: jest.fn()
  }
}))

jest.mock('next/headers', () => ({
  headers: jest.fn()
}))

// Import mocked modules after mocking
const { AuditLogger } = require('@/lib/audit')
const { SessionManager } = require('@/lib/security/session-manager')
const { headers } = require('next/headers')

describe('SecurityMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Clear alerts
    ;(SecurityMonitor as any).alerts = []
    
    // Mock headers
    headers.mockResolvedValue(new Map([
      ['x-forwarded-for', '192.168.1.1'],
      ['user-agent', 'Mozilla/5.0 Test Browser']
    ]) as any)
  })

  describe('recordFailedLogin', () => {
    it('should record failed login and create low severity alert', async () => {
      // Arrange
      AuditLogger.log.mockResolvedValue()

      // Act
      await SecurityMonitor.recordFailedLogin('test@example.com', '192.168.1.1', 'Mozilla/5.0')

      // Assert
      expect(AuditLogger.log).toHaveBeenCalledWith({
        action: 'access',
        section: 'auth',
        metadata: {
          event: 'failed_login',
          email: 'test@example.com',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          attemptCount: 1
        }
      })

      const alerts = await SecurityMonitor.getSecurityAlerts()
      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toMatchObject({
        type: 'failed_login_attempt',
        severity: 'low',
        message: 'Failed login attempt for test@example.com'
      })
    })

    it('should create high severity alert for multiple failed attempts', async () => {
      // Arrange
      AuditLogger.log.mockResolvedValue()
      
      // Simulate multiple failed attempts by adding alerts
      for (let i = 0; i < 4; i++) {
        await SecurityMonitor.recordFailedLogin('test@example.com', '192.168.1.1', 'Mozilla/5.0')
      }

      // Act - 5th attempt should trigger high severity alert
      await SecurityMonitor.recordFailedLogin('test@example.com', '192.168.1.1', 'Mozilla/5.0')

      // Assert
      const alerts = await SecurityMonitor.getSecurityAlerts()
      const highSeverityAlerts = alerts.filter(a => a.severity === 'high')
      expect(highSeverityAlerts).toHaveLength(1)
      expect(highSeverityAlerts[0]).toMatchObject({
        type: 'multiple_failed_logins',
        severity: 'high',
        message: 'Multiple failed login attempts detected for test@example.com from 192.168.1.1'
      })
    })
  })

  describe('recordSuspiciousActivity', () => {
    it('should record suspicious activity with appropriate severity', async () => {
      // Arrange
      AuditLogger.log.mockResolvedValue()

      // Act
      await SecurityMonitor.recordSuspiciousActivity(
        'sql_injection_attempt',
        'Potential SQL injection detected',
        { input: 'SELECT * FROM users' }
      )

      // Assert
      expect(AuditLogger.log).toHaveBeenCalledWith({
        action: 'access',
        section: 'security',
        metadata: {
          event: 'suspicious_activity',
          type: 'sql_injection_attempt',
          description: 'Potential SQL injection detected',
          severity: 'critical',
          input: 'SELECT * FROM users'
        }
      })

      const alerts = await SecurityMonitor.getSecurityAlerts()
      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toMatchObject({
        type: 'sql_injection_attempt',
        severity: 'critical',
        message: 'Potential SQL injection detected'
      })
    })
  })

  describe('checkForSQLInjection', () => {
    it('should detect SQL injection patterns', async () => {
      // Test basic SQL injection detection
      const result = await SecurityMonitor.checkForSQLInjection('SELECT * FROM users', 'test-field')
      expect(result).toBe(true)
      
      // Test safe input
      const safeResult = await SecurityMonitor.checkForSQLInjection('normal text', 'test-field')
      expect(safeResult).toBe(false)
    })

    it('should not flag safe inputs', async () => {
      // Arrange
      const safeInputs = [
        'John Doe',
        'user@example.com',
        'This is a normal description',
        '123456'
      ]

      // Act & Assert
      for (const input of safeInputs) {
        const result = await SecurityMonitor.checkForSQLInjection(input, 'test-field')
        expect(result).toBe(false)
      }
    })

    it('should record suspicious activity when SQL injection is detected', async () => {
      // Arrange
      AuditLogger.log.mockResolvedValue()

      // Act
      await SecurityMonitor.checkForSQLInjection('SELECT * FROM users', 'username-field')

      // Assert
      const alerts = await SecurityMonitor.getSecurityAlerts()
      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toMatchObject({
        type: 'sql_injection_attempt',
        severity: 'critical'
      })
    })
  })

  describe('checkForXSS', () => {
    it('should detect XSS patterns', async () => {
      // Arrange
      const suspiciousInputs = [
        '<script>alert("xss")</script>',
        'javascript:alert(1)',
        '<img onerror="alert(1)" src="x">',
        '<iframe src="javascript:alert(1)"></iframe>',
        '<object data="javascript:alert(1)"></object>'
      ]

      // Act & Assert
      for (const input of suspiciousInputs) {
        const result = await SecurityMonitor.checkForXSS(input, 'test-field')
        expect(result).toBe(true)
      }
    })

    it('should not flag safe HTML', async () => {
      // Arrange
      const safeInputs = [
        '<p>This is safe HTML</p>',
        '<strong>Bold text</strong>',
        '<a href="https://example.com">Link</a>',
        'Plain text content'
      ]

      // Act & Assert
      for (const input of safeInputs) {
        const result = await SecurityMonitor.checkForXSS(input, 'test-field')
        expect(result).toBe(false)
      }
    })
  })

  describe('validateFileUpload', () => {
    it('should validate file size', async () => {
      // Arrange
      const largeFile = new File(['x'.repeat(60 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      // Act
      const result = await SecurityMonitor.validateFileUpload(largeFile, ['jpg', 'png'])

      // Assert
      expect(result.valid).toBe(false)
      expect(result.alerts).toContain('File size exceeds maximum limit')
    })

    it('should validate file type', async () => {
      // Arrange
      const invalidFile = new File(['content'], 'script.php', { type: 'application/php' })

      // Act
      const result = await SecurityMonitor.validateFileUpload(invalidFile, ['jpg', 'png'])

      // Assert
      expect(result.valid).toBe(false)
      expect(result.alerts).toContain('Invalid file type')
    })

    it('should detect suspicious file names', async () => {
      // Arrange
      const suspiciousFiles = [
        new File(['content'], 'script.php', { type: 'image/jpeg' }),
        new File(['content'], '../../../etc/passwd', { type: 'image/jpeg' }),
        new File(['content'], 'file<script>.jpg', { type: 'image/jpeg' })
      ]

      // Act & Assert
      for (const file of suspiciousFiles) {
        const result = await SecurityMonitor.validateFileUpload(file, ['jpg', 'png'])
        expect(result.valid).toBe(false)
        expect(result.alerts).toContain('Suspicious file name')
      }
    })

    it('should pass validation for safe files', async () => {
      // Arrange
      const safeFile = new File(['image content'], 'photo.jpg', { type: 'image/jpeg' })

      // Act
      const result = await SecurityMonitor.validateFileUpload(safeFile, ['jpg', 'png'])

      // Assert
      expect(result.valid).toBe(true)
      expect(result.alerts).toHaveLength(0)
    })
  })

  describe('getSecurityStats', () => {
    it('should return security statistics', async () => {
      // Arrange
      await SecurityMonitor.recordSuspiciousActivity('sql_injection_attempt', 'Test SQL injection')
      await SecurityMonitor.recordSuspiciousActivity('xss_attempt', 'Test XSS')
      await SecurityMonitor.recordFailedLogin('test@example.com', '192.168.1.1', 'Mozilla/5.0')

      SessionManager.getSessionStats.mockResolvedValue({
        totalActiveSessions: 2,
        uniqueUsers: 1,
        averageSessionDuration: 300000,
        sessionsInLastHour: 1
      })

      // Act
      const stats = await SecurityMonitor.getSecurityStats('day')

      // Assert
      expect(stats).toMatchObject({
        totalAlerts: expect.any(Number),
        alertsByType: expect.any(Object),
        alertsBySeverity: expect.any(Object),
        criticalAlerts: expect.any(Number),
        highAlerts: expect.any(Number),
        sessionStats: expect.any(Object),
        timeframe: 'day'
      })

      expect(stats.totalAlerts).toBeGreaterThan(0)
      expect(stats.criticalAlerts).toBeGreaterThan(0)
    })
  })

  describe('getSecurityAlerts', () => {
    it('should return alerts filtered by severity', async () => {
      // Arrange
      await SecurityMonitor.recordSuspiciousActivity('sql_injection_attempt', 'Critical alert')
      await SecurityMonitor.recordFailedLogin('test@example.com', '192.168.1.1', 'Mozilla/5.0')

      // Act
      const criticalAlerts = await SecurityMonitor.getSecurityAlerts(50, 'critical')
      const lowAlerts = await SecurityMonitor.getSecurityAlerts(50, 'low')

      // Assert
      expect(criticalAlerts).toHaveLength(1)
      expect(criticalAlerts[0].severity).toBe('critical')
      
      expect(lowAlerts).toHaveLength(1)
      expect(lowAlerts[0].severity).toBe('low')
    })

    it('should limit number of returned alerts', async () => {
      // Arrange
      for (let i = 0; i < 10; i++) {
        await SecurityMonitor.recordFailedLogin(`user${i}@example.com`, '192.168.1.1', 'Mozilla/5.0')
      }

      // Act
      const alerts = await SecurityMonitor.getSecurityAlerts(5)

      // Assert
      expect(alerts).toHaveLength(5)
    })

    it('should return alerts in descending order by timestamp', async () => {
      // Arrange
      await SecurityMonitor.recordFailedLogin('user1@example.com', '192.168.1.1', 'Mozilla/5.0')
      await new Promise(resolve => setTimeout(resolve, 10)) // Ensure different timestamps
      await SecurityMonitor.recordFailedLogin('user2@example.com', '192.168.1.1', 'Mozilla/5.0')

      // Act
      const alerts = await SecurityMonitor.getSecurityAlerts()

      // Assert
      expect(alerts).toHaveLength(2)
      expect(alerts[0].timestamp.getTime()).toBeGreaterThan(alerts[1].timestamp.getTime())
    })
  })
})
/**
 * @jest-environment jsdom
 */

import { AuditLogger } from '@/lib/audit'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    }
  }
}))

jest.mock('@/lib/auth', () => ({
  auth: jest.fn()
}))

jest.mock('next/headers', () => ({
  headers: jest.fn()
}))

// Import mocked modules after mocking
const { prisma } = require('@/lib/prisma')
const { auth } = require('@/lib/auth')
const { headers } = require('next/headers')

describe('AuditLogger', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock headers
    headers.mockResolvedValue(new Map([
      ['x-forwarded-for', '192.168.1.1'],
      ['user-agent', 'Mozilla/5.0 Test Browser']
    ]) as any)
  })

  describe('log', () => {
    it('should create audit log with authenticated user', async () => {
      // Arrange
      auth.mockResolvedValue({
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User'
        }
      } as any)

      prisma.auditLog.create.mockResolvedValue({
        id: 'log-123',
        userId: 'user-123',
        action: 'create',
        section: 'home',
        timestamp: new Date()
      } as any)

      // Act
      await AuditLogger.log({
        action: 'create',
        section: 'home',
        newData: { title: 'New Title' }
      })

      // Assert
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          action: 'create',
          section: 'home',
          oldData: null,
          newData: { title: 'New Title' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Test Browser',
          timestamp: expect.any(Date)
        }
      })
    })

    it('should not create audit log without authenticated user', async () => {
      // Arrange
      auth.mockResolvedValue(null)
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

      // Act
      await AuditLogger.log({
        action: 'create',
        section: 'home'
      })

      // Assert
      expect(prisma.auditLog.create).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Audit log attempted without authenticated user')
      
      consoleSpy.mockRestore()
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      auth.mockResolvedValue({
        user: { id: 'user-123' }
      } as any)

      prisma.auditLog.create.mockRejectedValue(new Error('Database error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act & Assert
      await expect(AuditLogger.log({
        action: 'create',
        section: 'home'
      })).resolves.not.toThrow()

      expect(consoleSpy).toHaveBeenCalledWith('Failed to create audit log:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('getAuditLogs', () => {
    it('should fetch audit logs with filters', async () => {
      // Arrange
      const mockLogs = [
        {
          id: 'log-1',
          userId: 'user-1',
          action: 'create',
          section: 'home',
          timestamp: new Date(),
          user: { id: 'user-1', name: 'User 1', email: 'user1@test.com' }
        }
      ]

      prisma.auditLog.findMany.mockResolvedValue(mockLogs as any)

      // Act
      const result = await AuditLogger.getAuditLogs({
        userId: 'user-1',
        section: 'home',
        action: 'create',
        limit: 10,
        offset: 0
      })

      // Assert
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          section: 'home',
          action: 'create'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10,
        skip: 0
      })

      expect(result).toEqual(mockLogs)
    })

    it('should use default pagination values', async () => {
      // Arrange
      prisma.auditLog.findMany.mockResolvedValue([])

      // Act
      await AuditLogger.getAuditLogs()

      // Assert
      expect(prisma.auditLog.findMany).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 50,
        skip: 0
      })
    })
  })

  describe('getAuditStats', () => {
    it('should return audit statistics for specified timeframe', async () => {
      // Arrange
      prisma.auditLog.count.mockResolvedValue(100)
      prisma.auditLog.groupBy
        .mockResolvedValueOnce([
          { action: 'create', _count: { action: 50 } },
          { action: 'update', _count: { action: 30 } }
        ] as any)
        .mockResolvedValueOnce([
          { section: 'home', _count: { section: 40 } },
          { section: 'about', _count: { section: 35 } }
        ] as any)

      // Act
      const result = await AuditLogger.getAuditStats('week')

      // Assert
      expect(result).toEqual({
        totalLogs: 100,
        actionStats: [
          { action: 'create', count: 50 },
          { action: 'update', count: 30 }
        ],
        sectionStats: [
          { section: 'home', count: 40 },
          { section: 'about', count: 35 }
        ]
      })

      // Verify the date filter was applied correctly
      const calls = prisma.auditLog.count.mock.calls[0][0]
      expect(calls.where.timestamp.gte).toBeInstanceOf(Date)
    })
  })
})
/**
 * @jest-environment jsdom
 */

import { AdminSettingsManager } from '@/lib/admin/settings'

// Mock dependencies
jest.mock('@/lib/audit', () => ({
  AuditLogger: {
    log: jest.fn()
  }
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    adminSettings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    }
  }
}))

// Import mocked modules after mocking
const { AuditLogger } = require('@/lib/audit')
const { prisma } = require('@/lib/prisma')

describe('AdminSettingsManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getSettings', () => {
    it('should return existing settings from database', async () => {
      // Arrange
      const mockSettings = {
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'png'],
        maxImageSize: 5
      }

      prisma.adminSettings.findFirst.mockResolvedValue(mockSettings as any)

      // Act
      const result = await AdminSettingsManager.getSettings()

      // Assert
      expect(result).toEqual(mockSettings)
      expect(prisma.adminSettings.findFirst).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' }
      })
    })

    it('should create and return default settings when none exist', async () => {
      // Arrange
      prisma.adminSettings.findFirst.mockResolvedValue(null)
      prisma.adminSettings.create.mockResolvedValue({
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageSize: 5
      } as any)
      AuditLogger.log.mockResolvedValue()

      // Act
      const result = await AdminSettingsManager.getSettings()

      // Assert
      expect(prisma.adminSettings.create).toHaveBeenCalledWith({
        data: {
          autoSave: true,
          autoSaveInterval: 30,
          requirePreview: false,
          backupRetention: 30,
          allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxImageSize: 5
        }
      })

      expect(AuditLogger.log).toHaveBeenCalledWith({
        action: 'create',
        section: 'admin_settings',
        newData: expect.any(Object),
        metadata: { action: 'create_default_settings' }
      })

      expect(result).toMatchObject({
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageSize: 5
      })
    })

    it('should return default settings on database error', async () => {
      // Arrange
      prisma.adminSettings.findFirst.mockRejectedValue(new Error('Database error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      const result = await AdminSettingsManager.getSettings()

      // Assert
      expect(result).toMatchObject({
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageSize: 5
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to get admin settings:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('updateSettings', () => {
    it('should update settings and log audit entry', async () => {
      // Arrange
      const currentSettings = {
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'png'],
        maxImageSize: 5
      }

      const newSettings = {
        autoSave: false,
        maxImageSize: 10
      }

      const expectedUpdatedSettings = {
        ...currentSettings,
        ...newSettings
      }

      prisma.adminSettings.findFirst.mockResolvedValue(currentSettings as any)
      prisma.adminSettings.create.mockResolvedValue(expectedUpdatedSettings as any)
      AuditLogger.log.mockResolvedValue()

      // Act
      const result = await AdminSettingsManager.updateSettings(newSettings)

      // Assert
      expect(prisma.adminSettings.create).toHaveBeenCalledWith({
        data: expectedUpdatedSettings
      })

      expect(AuditLogger.log).toHaveBeenCalledWith({
        action: 'update',
        section: 'admin_settings',
        oldData: currentSettings,
        newData: expectedUpdatedSettings
      })

      expect(result).toEqual(expectedUpdatedSettings)
    })

    it('should validate settings before updating', async () => {
      // Arrange
      const invalidSettings = {
        autoSaveInterval: 5, // Below minimum of 10
        maxImageSize: 100 // Above maximum of 50
      }

      prisma.adminSettings.findFirst.mockResolvedValue({
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'png'],
        maxImageSize: 5
      } as any)

      // Act & Assert
      await expect(AdminSettingsManager.updateSettings(invalidSettings))
        .rejects.toThrow()

      expect(prisma.adminSettings.create).not.toHaveBeenCalled()
    })

    it('should handle database errors', async () => {
      // Arrange
      prisma.adminSettings.findFirst.mockResolvedValue({
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'png'],
        maxImageSize: 5
      } as any)

      prisma.adminSettings.create.mockRejectedValue(new Error('Database error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act & Assert
      await expect(AdminSettingsManager.updateSettings({ autoSave: false }))
        .rejects.toThrow('Failed to update settings')

      expect(consoleSpy).toHaveBeenCalledWith('Failed to update admin settings:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })

  describe('resetToDefaults', () => {
    it('should reset settings to defaults and log audit entry', async () => {
      // Arrange
      const currentSettings = {
        autoSave: false,
        autoSaveInterval: 60,
        requirePreview: true,
        backupRetention: 60,
        allowedImageFormats: ['jpg'],
        maxImageSize: 10
      }

      const defaultSettings = {
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageSize: 5
      }

      prisma.adminSettings.findFirst.mockResolvedValue(currentSettings as any)
      prisma.adminSettings.create.mockResolvedValue(defaultSettings as any)
      AuditLogger.log.mockResolvedValue()

      // Act
      const result = await AdminSettingsManager.resetToDefaults()

      // Assert
      expect(prisma.adminSettings.create).toHaveBeenCalledWith({
        data: defaultSettings
      })

      expect(AuditLogger.log).toHaveBeenCalledWith({
        action: 'update',
        section: 'admin_settings',
        oldData: currentSettings,
        newData: defaultSettings,
        metadata: { action: 'reset_to_defaults' }
      })

      expect(result).toEqual(defaultSettings)
    })
  })

  describe('validateImageUpload', () => {
    beforeEach(() => {
      // Mock default settings
      prisma.adminSettings.findFirst.mockResolvedValue({
        autoSave: true,
        autoSaveInterval: 30,
        requirePreview: false,
        backupRetention: 30,
        allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageSize: 5
      } as any)
    })

    it('should validate file size', async () => {
      // Arrange
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' })

      // Act
      const result = await AdminSettingsManager.validateImageUpload(largeFile)

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File size')
      expect(result.error).toContain('exceeds maximum allowed size')
    })

    it('should validate file format by extension', async () => {
      // Arrange
      const invalidFile = new File(['content'], 'image.gif', { type: 'image/gif' })

      // Act
      const result = await AdminSettingsManager.validateImageUpload(invalidFile)

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toContain('File format \'gif\' is not allowed')
    })

    it('should validate MIME type', async () => {
      // Arrange
      const invalidFile = new File(['content'], 'image.jpg', { type: 'application/pdf' })

      // Act
      const result = await AdminSettingsManager.validateImageUpload(invalidFile)

      // Assert
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Invalid file type')
    })

    it('should pass validation for valid files', async () => {
      // Arrange
      const validFile = new File(['image content'], 'photo.jpg', { type: 'image/jpeg' })

      // Act
      const result = await AdminSettingsManager.validateImageUpload(validFile)

      // Assert
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })
  })

  describe('getSettingsHistory', () => {
    it('should return settings history with specified limit', async () => {
      // Arrange
      const mockHistory = [
        {
          id: 'settings-1',
          autoSave: true,
          autoSaveInterval: 30,
          requirePreview: false,
          backupRetention: 30,
          allowedImageFormats: ['jpg', 'png'],
          maxImageSize: 5,
          createdAt: new Date()
        },
        {
          id: 'settings-2',
          autoSave: false,
          autoSaveInterval: 60,
          requirePreview: true,
          backupRetention: 60,
          allowedImageFormats: ['jpg'],
          maxImageSize: 10,
          createdAt: new Date()
        }
      ]

      prisma.adminSettings.findMany.mockResolvedValue(mockHistory as any)

      // Act
      const result = await AdminSettingsManager.getSettingsHistory(5)

      // Assert
      expect(prisma.adminSettings.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          autoSave: true,
          autoSaveInterval: true,
          requirePreview: true,
          backupRetention: true,
          allowedImageFormats: true,
          maxImageSize: true,
          createdAt: true
        }
      })

      expect(result).toEqual(mockHistory)
    })

    it('should return empty array on database error', async () => {
      // Arrange
      prisma.adminSettings.findMany.mockRejectedValue(new Error('Database error'))
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      const result = await AdminSettingsManager.getSettingsHistory()

      // Assert
      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to get settings history:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})
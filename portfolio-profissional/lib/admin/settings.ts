import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit"
import { z } from "zod"

export const adminSettingsSchema = z.object({
  autoSave: z.boolean(),
  autoSaveInterval: z.number().min(10).max(300), // 10 seconds to 5 minutes
  requirePreview: z.boolean(),
  backupRetention: z.number().min(1).max(365), // 1 day to 1 year
  allowedImageFormats: z.array(z.enum(['jpg', 'jpeg', 'png', 'webp', 'gif'])),
  maxImageSize: z.number().min(1).max(50), // 1MB to 50MB
})

export type AdminSettingsData = z.infer<typeof adminSettingsSchema>

export class AdminSettingsManager {
  private static defaultSettings: AdminSettingsData = {
    autoSave: true,
    autoSaveInterval: 30,
    requirePreview: false,
    backupRetention: 30,
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
    maxImageSize: 5,
  }

  static async getSettings(): Promise<AdminSettingsData> {
    try {
      const settings = await prisma.adminSettings.findFirst({
        orderBy: { createdAt: 'desc' }
      })

      if (!settings) {
        // Create default settings if none exist
        return await this.createDefaultSettings()
      }

      return {
        autoSave: settings.autoSave,
        autoSaveInterval: settings.autoSaveInterval,
        requirePreview: settings.requirePreview,
        backupRetention: settings.backupRetention,
        allowedImageFormats: settings.allowedImageFormats,
        maxImageSize: settings.maxImageSize,
      }
    } catch (error) {
      console.error('Failed to get admin settings:', error)
      return this.defaultSettings
    }
  }

  static async updateSettings(newSettings: Partial<AdminSettingsData>): Promise<AdminSettingsData> {
    const currentSettings = await this.getSettings()
    const updatedSettings = { ...currentSettings, ...newSettings }

    // Validate the updated settings
    const validatedSettings = adminSettingsSchema.parse(updatedSettings)

    try {
      const result = await prisma.adminSettings.create({
        data: validatedSettings
      })

      await AuditLogger.log({
        action: 'update',
        section: 'admin_settings',
        oldData: currentSettings,
        newData: validatedSettings
      })

      return {
        autoSave: result.autoSave,
        autoSaveInterval: result.autoSaveInterval,
        requirePreview: result.requirePreview,
        backupRetention: result.backupRetention,
        allowedImageFormats: result.allowedImageFormats,
        maxImageSize: result.maxImageSize,
      }
    } catch (error) {
      console.error('Failed to update admin settings:', error)
      throw new Error('Failed to update settings')
    }
  }

  static async resetToDefaults(): Promise<AdminSettingsData> {
    const currentSettings = await this.getSettings()
    
    try {
      const result = await prisma.adminSettings.create({
        data: this.defaultSettings
      })

      await AuditLogger.log({
        action: 'update',
        section: 'admin_settings',
        oldData: currentSettings,
        newData: this.defaultSettings,
        metadata: { action: 'reset_to_defaults' }
      })

      return this.defaultSettings
    } catch (error) {
      console.error('Failed to reset admin settings:', error)
      throw new Error('Failed to reset settings')
    }
  }

  private static async createDefaultSettings(): Promise<AdminSettingsData> {
    try {
      await prisma.adminSettings.create({
        data: this.defaultSettings
      })

      await AuditLogger.log({
        action: 'create',
        section: 'admin_settings',
        newData: this.defaultSettings,
        metadata: { action: 'create_default_settings' }
      })

      return this.defaultSettings
    } catch (error) {
      console.error('Failed to create default settings:', error)
      return this.defaultSettings
    }
  }

  static async validateImageUpload(file: File): Promise<{ valid: boolean; error?: string }> {
    const settings = await this.getSettings()
    
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > settings.maxImageSize) {
      return {
        valid: false,
        error: `File size (${fileSizeMB.toFixed(2)}MB) exceeds maximum allowed size (${settings.maxImageSize}MB)`
      }
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !settings.allowedImageFormats.includes(fileExtension as any)) {
      return {
        valid: false,
        error: `File format '${fileExtension}' is not allowed. Allowed formats: ${settings.allowedImageFormats.join(', ')}`
      }
    }

    // Check MIME type
    const allowedMimeTypes = settings.allowedImageFormats.map(format => {
      switch (format) {
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg'
        case 'png':
          return 'image/png'
        case 'webp':
          return 'image/webp'
        case 'gif':
          return 'image/gif'
        default:
          return null
      }
    }).filter(Boolean)

    if (!allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type '${file.type}'. Please upload a valid image file.`
      }
    }

    return { valid: true }
  }

  static async getSettingsHistory(limit: number = 10) {
    try {
      return await prisma.adminSettings.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          autoSave: true,
          autoSaveInterval: true,
          requirePreview: true,
          backupRetention: true,
          allowedImageFormats: true,
          maxImageSize: true,
          createdAt: true,
        }
      })
    } catch (error) {
      console.error('Failed to get settings history:', error)
      return []
    }
  }
}
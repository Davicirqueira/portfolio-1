import { prisma } from "@/lib/prisma"
import { AuditLogger } from "@/lib/audit"
import { AdminSettingsManager } from "@/lib/admin/settings"
import { z } from "zod"

export interface BackupData {
  id: string
  timestamp: Date
  version: string
  portfolioData: any
  dynamicModals: any[]
  mediaFiles: any[]
  adminSettings: any
  metadata: {
    totalSize: number
    recordCounts: {
      portfolioData: number
      dynamicModals: number
      mediaFiles: number
    }
  }
}

export interface RestoreOptions {
  includePortfolioData?: boolean
  includeDynamicModals?: boolean
  includeMediaFiles?: boolean
  includeAdminSettings?: boolean
  createBackupBeforeRestore?: boolean
}

export class BackupManager {
  private static readonly BACKUP_VERSION = "1.0.0"
  
  static async createBackup(description?: string): Promise<BackupData> {
    try {
      const timestamp = new Date()
      
      // Fetch all data
      const [portfolioData, dynamicModals, mediaFiles, adminSettings] = await Promise.all([
        prisma.portfolioData.findFirst({
          where: { isPublished: true },
          orderBy: { lastModified: 'desc' }
        }),
        prisma.dynamicModal.findMany({
          where: { isActive: true }
        }),
        prisma.mediaFile.findMany({
          where: { isArchived: false }
        }),
        AdminSettingsManager.getSettings()
      ])

      const backup: BackupData = {
        id: `backup_${timestamp.getTime()}`,
        timestamp,
        version: this.BACKUP_VERSION,
        portfolioData: portfolioData?.data || null,
        dynamicModals,
        mediaFiles,
        adminSettings,
        metadata: {
          totalSize: this.calculateBackupSize({
            portfolioData,
            dynamicModals,
            mediaFiles,
            adminSettings
          }),
          recordCounts: {
            portfolioData: portfolioData ? 1 : 0,
            dynamicModals: dynamicModals.length,
            mediaFiles: mediaFiles.length
          }
        }
      }

      // Store backup metadata in database
      await this.storeBackupMetadata(backup, description)

      await AuditLogger.log({
        action: 'create',
        section: 'backup',
        newData: {
          backupId: backup.id,
          description,
          recordCounts: backup.metadata.recordCounts,
          size: backup.metadata.totalSize
        }
      })

      return backup
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw new Error('Failed to create backup')
    }
  }

  static async restoreFromBackup(
    backupId: string, 
    options: RestoreOptions = {}
  ): Promise<void> {
    const {
      includePortfolioData = true,
      includeDynamicModals = true,
      includeMediaFiles = false, // Media files are more complex to restore
      includeAdminSettings = true,
      createBackupBeforeRestore = true
    } = options

    try {
      // Create backup before restore if requested
      let preRestoreBackup: BackupData | null = null
      if (createBackupBeforeRestore) {
        preRestoreBackup = await this.createBackup(`Pre-restore backup before ${backupId}`)
      }

      // Get backup data
      const backup = await this.getBackupData(backupId)
      if (!backup) {
        throw new Error(`Backup ${backupId} not found`)
      }

      // Start transaction for atomic restore
      await prisma.$transaction(async (tx) => {
        // Restore portfolio data
        if (includePortfolioData && backup.portfolioData) {
          await tx.portfolioData.create({
            data: {
              data: backup.portfolioData,
              isPublished: true,
              lastModified: new Date(),
              modifiedBy: 'system_restore',
              version: 1
            }
          })
        }

        // Restore dynamic modals
        if (includeDynamicModals && backup.dynamicModals.length > 0) {
          // First, deactivate existing modals
          await tx.dynamicModal.updateMany({
            data: { isActive: false }
          })

          // Then create restored modals
          for (const modal of backup.dynamicModals) {
            await tx.dynamicModal.create({
              data: {
                type: modal.type,
                title: modal.title,
                content: modal.content,
                isActive: true
              }
            })
          }
        }

        // Restore admin settings
        if (includeAdminSettings && backup.adminSettings) {
          await tx.adminSettings.create({
            data: backup.adminSettings
          })
        }
      })

      await AuditLogger.log({
        action: 'update',
        section: 'backup',
        newData: {
          action: 'restore',
          backupId,
          options,
          preRestoreBackupId: preRestoreBackup?.id
        }
      })

    } catch (error) {
      console.error('Failed to restore backup:', error)
      throw new Error(`Failed to restore backup: ${error.message}`)
    }
  }

  static async listBackups(limit: number = 20): Promise<Array<{
    id: string
    timestamp: Date
    description?: string
    metadata: BackupData['metadata']
  }>> {
    try {
      // In a real implementation, this would query a backups table
      // For now, we'll return audit logs of backup creation
      const backupLogs = await prisma.auditLog.findMany({
        where: {
          section: 'backup',
          action: 'create'
        },
        orderBy: { timestamp: 'desc' },
        take: limit
      })

      return backupLogs.map(log => ({
        id: log.newData?.backupId || log.id,
        timestamp: log.timestamp,
        description: log.newData?.description,
        metadata: {
          totalSize: log.newData?.size || 0,
          recordCounts: log.newData?.recordCounts || {
            portfolioData: 0,
            dynamicModals: 0,
            mediaFiles: 0
          }
        }
      }))
    } catch (error) {
      console.error('Failed to list backups:', error)
      return []
    }
  }

  static async deleteBackup(backupId: string): Promise<void> {
    try {
      // In a real implementation, this would delete the backup file
      // and remove the metadata from the database
      
      await AuditLogger.log({
        action: 'delete',
        section: 'backup',
        oldData: { backupId }
      })
    } catch (error) {
      console.error('Failed to delete backup:', error)
      throw new Error('Failed to delete backup')
    }
  }

  static async cleanupOldBackups(): Promise<void> {
    try {
      const settings = await AdminSettingsManager.getSettings()
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - settings.backupRetention)

      // In a real implementation, this would delete old backup files
      // and clean up metadata
      
      await AuditLogger.log({
        action: 'delete',
        section: 'backup',
        metadata: {
          action: 'cleanup_old_backups',
          cutoffDate,
          retentionDays: settings.backupRetention
        }
      })
    } catch (error) {
      console.error('Failed to cleanup old backups:', error)
    }
  }

  private static async storeBackupMetadata(backup: BackupData, description?: string): Promise<void> {
    // In a real implementation, this would store backup metadata in a dedicated table
    // For now, we'll use the audit log system
    await AuditLogger.log({
      action: 'create',
      section: 'backup_metadata',
      newData: {
        backupId: backup.id,
        timestamp: backup.timestamp,
        version: backup.version,
        description,
        metadata: backup.metadata
      }
    })
  }

  private static async getBackupData(backupId: string): Promise<BackupData | null> {
    // In a real implementation, this would load backup data from storage
    // For now, we'll return null as this is a placeholder
    return null
  }

  private static calculateBackupSize(data: any): number {
    // Simple size calculation - in production, this would be more sophisticated
    return JSON.stringify(data).length
  }

  static async getBackupStats() {
    try {
      const backups = await this.listBackups(100)
      const totalBackups = backups.length
      const totalSize = backups.reduce((sum, backup) => sum + backup.metadata.totalSize, 0)
      const averageSize = totalBackups > 0 ? totalSize / totalBackups : 0
      
      const recentBackups = backups.filter(backup => {
        const daysSinceBackup = (Date.now() - backup.timestamp.getTime()) / (1000 * 60 * 60 * 24)
        return daysSinceBackup <= 7
      }).length

      return {
        totalBackups,
        totalSize,
        averageSize,
        recentBackups,
        oldestBackup: backups[backups.length - 1]?.timestamp,
        newestBackup: backups[0]?.timestamp
      }
    } catch (error) {
      console.error('Failed to get backup stats:', error)
      return {
        totalBackups: 0,
        totalSize: 0,
        averageSize: 0,
        recentBackups: 0,
        oldestBackup: null,
        newestBackup: null
      }
    }
  }
}
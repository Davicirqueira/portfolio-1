import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'upload' | 'access'

export interface AuditLogData {
  action: AuditAction
  section: string
  oldData?: any
  newData?: any
  metadata?: Record<string, any>
}

export class AuditLogger {
  static async log(data: AuditLogData): Promise<void> {
    try {
      const session = await auth()
      const headersList = await headers()
      
      if (!session?.user?.id) {
        console.warn('Audit log attempted without authenticated user')
        return
      }

      const ipAddress = headersList.get('x-forwarded-for') || 
                       headersList.get('x-real-ip') || 
                       'unknown'
      
      const userAgent = headersList.get('user-agent') || 'unknown'

      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: data.action,
          section: data.section,
          oldData: data.oldData || null,
          newData: data.newData || null,
          ipAddress,
          userAgent,
          timestamp: new Date(),
        }
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }

  static async getAuditLogs(options?: {
    userId?: string
    section?: string
    action?: AuditAction
    limit?: number
    offset?: number
  }) {
    const { userId, section, action, limit = 50, offset = 0 } = options || {}

    return prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(section && { section }),
        ...(action && { action }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset,
    })
  }

  static async getAuditStats(timeframe: 'day' | 'week' | 'month' = 'week') {
    const now = new Date()
    const startDate = new Date()
    
    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1)
        break
      case 'week':
        startDate.setDate(now.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(now.getMonth() - 1)
        break
    }

    const [totalLogs, actionStats, sectionStats] = await Promise.all([
      prisma.auditLog.count({
        where: {
          timestamp: {
            gte: startDate
          }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: {
          action: true
        },
        where: {
          timestamp: {
            gte: startDate
          }
        }
      }),
      prisma.auditLog.groupBy({
        by: ['section'],
        _count: {
          section: true
        },
        where: {
          timestamp: {
            gte: startDate
          }
        }
      })
    ])

    return {
      totalLogs,
      actionStats: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count.action
      })),
      sectionStats: sectionStats.map(stat => ({
        section: stat.section,
        count: stat._count.section
      }))
    }
  }
}

// Middleware function to automatically log API actions
export function withAuditLog(
  handler: (req: Request, context: any) => Promise<Response>,
  section: string,
  action: AuditAction
) {
  return async (req: Request, context: any) => {
    const startTime = Date.now()
    let oldData: any = null
    let newData: any = null
    let error: any = null

    try {
      // For update/delete operations, try to get old data
      if (action === 'update' || action === 'delete') {
        // This would need to be customized per endpoint
        // For now, we'll capture it in the handler
      }

      const response = await handler(req, context)
      
      // Capture new data for create/update operations
      if (action === 'create' || action === 'update') {
        try {
          const responseClone = response.clone()
          const responseData = await responseClone.json()
          newData = responseData
        } catch {
          // Response might not be JSON
        }
      }

      // Log successful operation
      await AuditLogger.log({
        action,
        section,
        oldData,
        newData,
        metadata: {
          duration: Date.now() - startTime,
          method: req.method,
          url: req.url,
          success: true
        }
      })

      return response
    } catch (err) {
      error = err
      
      // Log failed operation
      await AuditLogger.log({
        action,
        section,
        oldData,
        newData,
        metadata: {
          duration: Date.now() - startTime,
          method: req.method,
          url: req.url,
          success: false,
          error: error.message
        }
      })

      throw error
    }
  }
}
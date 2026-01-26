import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - Get system status and health metrics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const startTime = Date.now()

    // Database health check
    const dbHealth = await checkDatabaseHealth()
    
    // Memory usage (Node.js process)
    const memoryUsage = process.memoryUsage()
    
    // System uptime
    const uptime = process.uptime()
    
    // Recent activity metrics
    const activityMetrics = await getActivityMetrics()
    
    // Security metrics
    const securityMetrics = await getSecurityMetrics()
    
    // Performance metrics
    const performanceMetrics = await getPerformanceMetrics()

    const responseTime = Date.now() - startTime

    const systemStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime,
      uptime: {
        seconds: Math.floor(uptime),
        formatted: formatUptime(uptime)
      },
      database: dbHealth,
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024) // MB
      },
      activity: activityMetrics,
      security: securityMetrics,
      performance: performanceMetrics
    }

    return NextResponse.json({
      success: true,
      data: systemStatus
    })

  } catch (error) {
    console.error('Error getting system status:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          error: error.message
        }
      },
      { status: 500 }
    )
  }
}

async function checkDatabaseHealth() {
  try {
    const startTime = Date.now()
    
    // Simple query to test database connectivity
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    // Get database statistics
    const userCount = await prisma.user.count()
    const portfolioDataCount = await prisma.portfolioData.count()
    const auditLogCount = await prisma.auditLog.count()
    const mediaFileCount = await prisma.mediaFile.count()

    return {
      status: 'connected',
      responseTime,
      statistics: {
        users: userCount,
        portfolioData: portfolioDataCount,
        auditLogs: auditLogCount,
        mediaFiles: mediaFileCount
      }
    }
  } catch (error) {
    return {
      status: 'disconnected',
      error: error.message
    }
  }
}

async function getActivityMetrics() {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000)

    // Recent audit logs
    const recentLogs = await prisma.auditLog.count({
      where: {
        timestamp: {
          gte: last24Hours
        }
      }
    })

    const recentLogsLastHour = await prisma.auditLog.count({
      where: {
        timestamp: {
          gte: lastHour
        }
      }
    })

    // Recent media uploads
    const recentUploads = await prisma.mediaFile.count({
      where: {
        createdAt: {
          gte: last24Hours
        }
      }
    })

    return {
      auditLogs: {
        last24Hours: recentLogs,
        lastHour: recentLogsLastHour
      },
      mediaUploads: {
        last24Hours: recentUploads
      }
    }
  } catch (error) {
    return {
      error: error.message
    }
  }
}

async function getSecurityMetrics() {
  try {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Failed login attempts (mock data - in real implementation, track this)
    const failedLogins = Math.floor(Math.random() * 5)
    
    // Suspicious activities (mock data)
    const suspiciousActivities = Math.floor(Math.random() * 3)
    
    // Active sessions (mock data)
    const activeSessions = 1 + Math.floor(Math.random() * 3)

    return {
      failedLogins: {
        last24Hours: failedLogins
      },
      suspiciousActivities: {
        last24Hours: suspiciousActivities
      },
      activeSessions,
      lastSecurityScan: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }
  } catch (error) {
    return {
      error: error.message
    }
  }
}

async function getPerformanceMetrics() {
  try {
    // Mock performance data - in real implementation, collect actual metrics
    return {
      averageResponseTime: 150 + Math.floor(Math.random() * 100), // ms
      requestsPerMinute: 10 + Math.floor(Math.random() * 20),
      errorRate: Math.random() * 0.05, // 0-5%
      cacheHitRate: 0.85 + Math.random() * 0.1, // 85-95%
      diskUsage: {
        used: 45 + Math.floor(Math.random() * 20), // %
        available: 55 - Math.floor(Math.random() * 20) // %
      }
    }
  } catch (error) {
    return {
      error: error.message
    }
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}
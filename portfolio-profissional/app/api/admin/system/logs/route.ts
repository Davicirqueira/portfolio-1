import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - Get system logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const level = searchParams.get('level') // error, warn, info, debug
    const source = searchParams.get('source') // api, auth, database, security
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    // Build filter conditions
    const whereClause: any = {}
    
    if (level) {
      whereClause.level = level
    }
    
    if (source) {
      whereClause.source = source
    }
    
    if (startDate || endDate) {
      whereClause.timestamp = {}
      if (startDate) whereClause.timestamp.gte = new Date(startDate)
      if (endDate) whereClause.timestamp.lte = new Date(endDate)
    }
    
    if (search) {
      whereClause.OR = [
        { message: { contains: search, mode: 'insensitive' } },
        { details: { path: ['error'], string_contains: search } }
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // In a real implementation, you would have a SystemLog model
    // For now, we'll return mock log data
    const mockLogs = generateMockLogs(page, limit, whereClause)
    const totalCount = 500 // Mock total count

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      success: true,
      data: mockLogs,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    })

  } catch (error) {
    console.error('Error fetching system logs:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Add new system log entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const logEntry = await request.json()

    // In a real implementation, you would save to a SystemLog table
    const newLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: logEntry.level || 'info',
      source: logEntry.source || 'system',
      message: logEntry.message,
      details: logEntry.details || {},
      userId: session.user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    }

    // Log to console for now
    console.log('System Log Entry:', newLogEntry)

    return NextResponse.json({
      success: true,
      data: newLogEntry
    })

  } catch (error) {
    console.error('Error creating system log entry:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function generateMockLogs(page: number, limit: number, filters: any) {
  const logs = []
  const now = new Date()
  
  const logLevels = ['error', 'warn', 'info', 'debug']
  const logSources = ['api', 'auth', 'database', 'security', 'system']
  const sampleMessages = [
    'User authentication successful',
    'Database connection established',
    'File upload completed',
    'Cache cleared successfully',
    'Security scan completed',
    'Backup created successfully',
    'Session extended',
    'Settings updated',
    'Audit log entry created',
    'System health check passed'
  ]

  for (let i = 0; i < limit; i++) {
    const logIndex = (page - 1) * limit + i
    const timestamp = new Date(now.getTime() - logIndex * 60000) // 1 minute intervals
    
    logs.push({
      id: `log-${logIndex}`,
      timestamp: timestamp.toISOString(),
      level: logLevels[Math.floor(Math.random() * logLevels.length)],
      source: logSources[Math.floor(Math.random() * logSources.length)],
      message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
      details: {
        requestId: `req-${Math.random().toString(36).substr(2, 9)}`,
        duration: Math.floor(Math.random() * 1000),
        statusCode: 200 + Math.floor(Math.random() * 300)
      },
      userId: 'admin-user-1',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    })
  }

  return logs
}
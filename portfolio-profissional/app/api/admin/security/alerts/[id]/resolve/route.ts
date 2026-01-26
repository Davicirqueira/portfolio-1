import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// PATCH - Resolve security alert
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const alertId = params.id
    const body = await request.json()
    const { resolution, resolvedBy, resolvedAt } = body

    // In a real implementation, you would update the security alert in the database
    // For now, we'll simulate the resolution
    const resolvedAlert = {
      id: alertId,
      resolved: true,
      resolvedAt: resolvedAt || new Date().toISOString(),
      resolvedBy: resolvedBy || session.user.id,
      resolution: resolution || 'Alert resolved by admin'
    }

    // Log the resolution
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'update',
        section: 'security_alert',
        resourceId: alertId,
        newData: {
          resolved: true,
          resolvedAt: resolvedAlert.resolvedAt,
          resolvedBy: resolvedAlert.resolvedBy,
          resolution
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      data: resolvedAlert
    })

  } catch (error) {
    console.error('Error resolving security alert:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
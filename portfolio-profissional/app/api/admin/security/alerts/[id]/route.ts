import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// DELETE - Delete security alert
export async function DELETE(
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

    // In a real implementation, you would delete the security alert from the database
    // For now, we'll simulate the deletion
    
    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'delete',
        section: 'security_alert',
        resourceId: alertId,
        oldData: {
          alertId,
          deletedAt: new Date().toISOString()
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Security alert deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting security alert:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
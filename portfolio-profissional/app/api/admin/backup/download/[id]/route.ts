import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

// GET - Download backup file
export async function GET(
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

    const backupId = params.id

    // In a real implementation, you would load the actual backup file
    // For now, we'll create a mock backup data
    const backupData = {
      metadata: {
        version: '1.0',
        backupId,
        createdAt: new Date().toISOString(),
        createdBy: session.user.id,
        description: 'Portfolio backup'
      },
      portfolioData: await prisma.portfolioData.findMany(),
      dynamicModals: await prisma.dynamicModal.findMany(),
      adminSettings: await prisma.adminSettings.findMany(),
      mediaFiles: await prisma.mediaFile.findMany()
    }

    // Log the download
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'download',
        section: 'backup',
        newData: {
          backupId,
          downloadedAt: new Date().toISOString()
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    })

    const filename = `portfolio-backup-${backupId}.json`
    const jsonData = JSON.stringify(backupData, null, 2)

    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': jsonData.length.toString()
      }
    })

  } catch (error) {
    console.error('Error downloading backup:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
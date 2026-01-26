import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for bulk operations
const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1),
})

const bulkUpdateSchema = z.object({
  ids: z.array(z.string()).min(1),
  updates: z.object({
    isArchived: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    category: z.enum(['profile', 'project', 'general']).optional(),
    description: z.string().optional(),
  }),
})

// DELETE - Bulk delete media files
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids } = bulkDeleteSchema.parse(body)

    // Get current media files for audit log
    const currentMediaFiles = await prisma.mediaFile.findMany({
      where: { id: { in: ids } },
    })

    if (currentMediaFiles.length === 0) {
      return NextResponse.json({ error: 'No media files found' }, { status: 404 })
    }

    // Delete media files
    const deleteResult = await prisma.mediaFile.deleteMany({
      where: { id: { in: ids } },
    })

    // Create audit logs for each deleted file
    const auditLogs = currentMediaFiles.map(file => ({
      userId: session.user?.id || '',
      action: 'delete' as const,
      section: 'media',
      oldData: file,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    }))

    await prisma.auditLog.createMany({
      data: auditLogs,
    })

    return NextResponse.json({
      success: true,
      message: `${deleteResult.count} media files deleted successfully`,
      deletedCount: deleteResult.count,
    })
  } catch (error) {
    console.error('Error bulk deleting media files:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Bulk update media files
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, updates } = bulkUpdateSchema.parse(body)

    // Get current media files for audit log
    const currentMediaFiles = await prisma.mediaFile.findMany({
      where: { id: { in: ids } },
    })

    if (currentMediaFiles.length === 0) {
      return NextResponse.json({ error: 'No media files found' }, { status: 404 })
    }

    // Update media files
    const updateResult = await prisma.mediaFile.updateMany({
      where: { id: { in: ids } },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    // Get updated media files
    const updatedMediaFiles = await prisma.mediaFile.findMany({
      where: { id: { in: ids } },
    })

    // Create audit logs for each updated file
    const auditLogs = currentMediaFiles.map(oldFile => {
      const newFile = updatedMediaFiles.find(f => f.id === oldFile.id)
      return {
        userId: session.user?.id || '',
        action: 'update' as const,
        section: 'media',
        oldData: oldFile,
        newData: newFile,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      }
    })

    await prisma.auditLog.createMany({
      data: auditLogs,
    })

    return NextResponse.json({
      success: true,
      message: `${updateResult.count} media files updated successfully`,
      updatedCount: updateResult.count,
      data: updatedMediaFiles,
    })
  } catch (error) {
    console.error('Error bulk updating media files:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
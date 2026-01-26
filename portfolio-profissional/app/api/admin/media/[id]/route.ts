import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for media file updates
const updateMediaFileSchema = z.object({
  filename: z.string().optional(),
  originalName: z.string().optional(),
  category: z.enum(['profile', 'project', 'general']).optional(),
  tags: z.array(z.string()).optional(),
  usedIn: z.array(z.string()).optional(),
  isArchived: z.boolean().optional(),
  description: z.string().optional(),
})

// GET - Get single media file
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!mediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: mediaFile,
    })
  } catch (error) {
    console.error('Error fetching media file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH - Update media file
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const updates = updateMediaFileSchema.parse(body)

    // Get current media file for audit log
    const currentMediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!currentMediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    // Update media file
    const updatedMediaFile = await prisma.mediaFile.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'update',
        section: 'media',
        oldData: currentMediaFile,
        newData: updatedMediaFile,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedMediaFile,
    })
  } catch (error) {
    console.error('Error updating media file:', error)
    
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

// DELETE - Delete single media file
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Get current media file for audit log
    const currentMediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!currentMediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

    // Delete media file
    await prisma.mediaFile.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'delete',
        section: 'media',
        oldData: currentMediaFile,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Media file deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting media file:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
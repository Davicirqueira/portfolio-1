import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for media file validation
const mediaFileSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  url: z.string().url(),
  publicId: z.string().optional(),
  category: z.enum(['profile', 'project', 'general']),
  size: z.number().positive(),
  mimeType: z.string().min(1),
})

// GET - Retrieve all media files or filter by category
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    const whereClause: any = {}
    if (category) whereClause.category = category

    const queryOptions: any = {
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    }

    if (limit) {
      queryOptions.take = parseInt(limit, 10)
    }

    const mediaFiles = await prisma.mediaFile.findMany(queryOptions)

    return NextResponse.json({
      success: true,
      data: mediaFiles,
    })
  } catch (error) {
    console.error('Error fetching media files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new media file record
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = mediaFileSchema.parse(body)

    const mediaFile = await prisma.mediaFile.create({
      data: validatedData,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'create',
        section: 'media',
        newData: validatedData,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: mediaFile,
    })
  } catch (error) {
    console.error('Error creating media file record:', error)
    
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

// DELETE - Delete media file record
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Media file ID is required' }, { status: 400 })
    }

    // Get current media file for audit log
    const currentMediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    })

    if (!currentMediaFile) {
      return NextResponse.json({ error: 'Media file not found' }, { status: 404 })
    }

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
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for modal data validation
const modalSchema = z.object({
  type: z.enum(['education', 'skill', 'project']),
  title: z.string().min(1),
  content: z.record(z.any()),
  isActive: z.boolean().optional(),
})

const modalUpdateSchema = modalSchema.partial().extend({
  id: z.string(),
})

// GET - Retrieve all modals or filter by type
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const isActive = searchParams.get('isActive')

    const whereClause: any = {}
    if (type) whereClause.type = type
    if (isActive !== null) whereClause.isActive = isActive === 'true'

    const modals = await prisma.dynamicModal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: modals,
    })
  } catch (error) {
    console.error('Error fetching modals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new modal
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = modalSchema.parse(body)

    const modal = await prisma.dynamicModal.create({
      data: {
        type: validatedData.type,
        title: validatedData.title,
        content: validatedData.content,
        isActive: validatedData.isActive ?? true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'create',
        section: `modal_${validatedData.type}`,
        newData: validatedData,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: modal,
    })
  } catch (error) {
    console.error('Error creating modal:', error)
    
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

// PUT - Update existing modal
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = modalUpdateSchema.parse(body)
    const { id, ...updateData } = validatedData

    // Get current modal for audit log
    const currentModal = await prisma.dynamicModal.findUnique({
      where: { id },
    })

    if (!currentModal) {
      return NextResponse.json({ error: 'Modal not found' }, { status: 404 })
    }

    const modal = await prisma.dynamicModal.update({
      where: { id },
      data: updateData,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'update',
        section: `modal_${currentModal.type}`,
        oldData: currentModal,
        newData: updateData,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: modal,
    })
  } catch (error) {
    console.error('Error updating modal:', error)
    
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

// DELETE - Delete modal
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Modal ID is required' }, { status: 400 })
    }

    // Get current modal for audit log
    const currentModal = await prisma.dynamicModal.findUnique({
      where: { id },
    })

    if (!currentModal) {
      return NextResponse.json({ error: 'Modal not found' }, { status: 404 })
    }

    await prisma.dynamicModal.delete({
      where: { id },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'delete',
        section: `modal_${currentModal.type}`,
        oldData: currentModal,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Modal deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting modal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
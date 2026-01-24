import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for portfolio data validation
const portfolioDataSchema = z.object({
  data: z.record(z.any()),
  isPublished: z.boolean().optional(),
})

// GET - Retrieve current portfolio data
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest published portfolio data
    const portfolioData = await prisma.portfolioData.findFirst({
      where: { isPublished: true },
      orderBy: { version: 'desc' },
    })

    if (!portfolioData) {
      return NextResponse.json({ error: 'Portfolio data not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: portfolioData,
    })
  } catch (error) {
    console.error('Error fetching portfolio data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new portfolio data version
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = portfolioDataSchema.parse(body)

    // Get the latest version number
    const latestVersion = await prisma.portfolioData.findFirst({
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    const newVersion = (latestVersion?.version || 0) + 1

    // Create new portfolio data version
    const portfolioData = await prisma.portfolioData.create({
      data: {
        version: newVersion,
        data: validatedData.data,
        isPublished: validatedData.isPublished ?? false,
        modifiedBy: session.user?.email || 'unknown',
        lastModified: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'create',
        section: 'portfolio',
        newData: validatedData.data,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: portfolioData,
    })
  } catch (error) {
    console.error('Error creating portfolio data:', error)
    
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

// PUT - Update existing portfolio data
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = portfolioDataSchema.parse(body)

    // Get current published data for audit log
    const currentData = await prisma.portfolioData.findFirst({
      where: { isPublished: true },
      orderBy: { version: 'desc' },
    })

    // If publishing, unpublish all other versions first
    if (validatedData.isPublished) {
      await prisma.portfolioData.updateMany({
        where: { isPublished: true },
        data: { isPublished: false },
      })
    }

    // Get the latest version number
    const latestVersion = await prisma.portfolioData.findFirst({
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    const newVersion = (latestVersion?.version || 0) + 1

    // Create new version with updated data
    const portfolioData = await prisma.portfolioData.create({
      data: {
        version: newVersion,
        data: validatedData.data,
        isPublished: validatedData.isPublished ?? true,
        modifiedBy: session.user?.email || 'unknown',
        lastModified: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'update',
        section: 'portfolio',
        oldData: currentData?.data || null,
        newData: validatedData.data,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: portfolioData,
    })
  } catch (error) {
    console.error('Error updating portfolio data:', error)
    
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
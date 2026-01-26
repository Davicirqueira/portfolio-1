import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for contact data validation
const contactDataSchema = z.object({
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  phone: z.string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Formato de telefone inválido'),
  location: z.string()
    .min(1, 'Localização é obrigatória')
    .max(100, 'Localização deve ter no máximo 100 caracteres'),
  availability: z.string()
    .max(200, 'Status deve ter no máximo 200 caracteres')
    .optional(),
  preferredContact: z.enum(['email', 'phone', 'linkedin']).optional(),
  social: z.object({
    linkedin: z.string().url('URL do LinkedIn inválida').optional().or(z.literal('')),
    twitter: z.string().url('URL do Twitter inválida').optional().or(z.literal('')),
    github: z.string().url('URL do GitHub inválida').optional().or(z.literal('')),
    instagram: z.string().url('URL do Instagram inválida').optional().or(z.literal('')),
    facebook: z.string().url('URL do Facebook inválida').optional().or(z.literal('')),
    youtube: z.string().url('URL do YouTube inválida').optional().or(z.literal('')),
    website: z.string().url('URL do website inválida').optional().or(z.literal(''))
  })
})

// GET - Retrieve current contact data
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the latest published portfolio data and extract contact info
    const portfolioData = await prisma.portfolioData.findFirst({
      where: { isPublished: true },
      orderBy: { version: 'desc' },
    })

    if (!portfolioData) {
      return NextResponse.json({ error: 'Contact data not found' }, { status: 404 })
    }

    // Extract contact data from portfolio data
    const data = portfolioData.data as any
    const contactData = data.contact || {
      email: data.personal?.email || '',
      phone: data.personal?.phone || '',
      location: data.personal?.location || '',
      social: data.social || {}
    }

    return NextResponse.json({
      success: true,
      data: contactData,
    })
  } catch (error) {
    console.error('Error fetching contact data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update contact data
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = contactDataSchema.parse(body)

    // Get current published portfolio data
    const currentPortfolioData = await prisma.portfolioData.findFirst({
      where: { isPublished: true },
      orderBy: { version: 'desc' },
    })

    if (!currentPortfolioData) {
      return NextResponse.json({ error: 'Portfolio data not found' }, { status: 404 })
    }

    // Update the portfolio data with new contact information
    const updatedData = {
      ...currentPortfolioData.data,
      contact: validatedData,
      // Also update personal info for backward compatibility
      personal: {
        ...(currentPortfolioData.data as any).personal,
        email: validatedData.email,
        phone: validatedData.phone,
        location: validatedData.location,
      },
      social: validatedData.social
    }

    // Unpublish current version
    await prisma.portfolioData.updateMany({
      where: { isPublished: true },
      data: { isPublished: false },
    })

    // Get the latest version number
    const latestVersion = await prisma.portfolioData.findFirst({
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    const newVersion = (latestVersion?.version || 0) + 1

    // Create new version with updated contact data
    const portfolioData = await prisma.portfolioData.create({
      data: {
        version: newVersion,
        data: updatedData,
        isPublished: true,
        modifiedBy: session.user?.email || 'unknown',
        lastModified: new Date(),
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: 'update',
        section: 'contact',
        oldData: (currentPortfolioData.data as any).contact || null,
        newData: validatedData,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: validatedData,
    })
  } catch (error) {
    console.error('Error updating contact data:', error)
    
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
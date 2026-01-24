import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Schema for admin settings validation
const adminSettingsSchema = z.object({
  autoSave: z.boolean().optional(),
  autoSaveInterval: z.number().min(10).max(300).optional(), // 10 seconds to 5 minutes
  requirePreview: z.boolean().optional(),
  backupRetention: z.number().min(1).max(365).optional(), // 1 day to 1 year
  allowedImageFormats: z.array(z.string()).optional(),
  maxImageSize: z.number().min(1).max(50).optional(), // 1MB to 50MB
})

// GET - Retrieve admin settings
export async function GET() {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the first (and should be only) admin settings record
    let settings = await prisma.adminSettings.findFirst()

    // If no settings exist, create default ones
    if (!settings) {
      settings = await prisma.adminSettings.create({
        data: {
          autoSave: true,
          autoSaveInterval: 30,
          requirePreview: false,
          backupRetention: 30,
          allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxImageSize: 5,
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update admin settings
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = adminSettingsSchema.parse(body)

    // Get current settings for audit log
    let currentSettings = await prisma.adminSettings.findFirst()

    let settings
    if (currentSettings) {
      // Update existing settings
      settings = await prisma.adminSettings.update({
        where: { id: currentSettings.id },
        data: validatedData,
      })
    } else {
      // Create new settings with defaults merged with provided data
      settings = await prisma.adminSettings.create({
        data: {
          autoSave: true,
          autoSaveInterval: 30,
          requirePreview: false,
          backupRetention: 30,
          allowedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
          maxImageSize: 5,
          ...validatedData,
        },
      })
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user?.id || '',
        action: currentSettings ? 'update' : 'create',
        section: 'admin_settings',
        oldData: currentSettings || null,
        newData: validatedData,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    return NextResponse.json({
      success: true,
      data: settings,
    })
  } catch (error) {
    console.error('Error updating admin settings:', error)
    
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
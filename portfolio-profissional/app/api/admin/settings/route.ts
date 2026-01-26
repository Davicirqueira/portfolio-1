import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AdminSettingsManager, adminSettingsSchema } from "@/lib/admin/settings"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await AdminSettingsManager.getSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Failed to fetch admin settings:', error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate the settings data
    const validatedSettings = adminSettingsSchema.partial().parse(body)
    
    const updatedSettings = await AdminSettingsManager.updateSettings(validatedSettings)
    
    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Failed to update admin settings:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: "Invalid settings data", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const defaultSettings = await AdminSettingsManager.resetToDefaults()
    return NextResponse.json(defaultSettings)
  } catch (error) {
    console.error('Failed to reset admin settings:', error)
    return NextResponse.json(
      { error: "Failed to reset settings" },
      { status: 500 }
    )
  }
}
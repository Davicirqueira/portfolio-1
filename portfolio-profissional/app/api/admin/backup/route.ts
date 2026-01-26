import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BackupManager } from "@/lib/backup/manager"
import { z } from "zod"

const createBackupSchema = z.object({
  description: z.string().optional(),
})

const restoreBackupSchema = z.object({
  backupId: z.string(),
  options: z.object({
    includePortfolioData: z.boolean().default(true),
    includeDynamicModals: z.boolean().default(true),
    includeMediaFiles: z.boolean().default(false),
    includeAdminSettings: z.boolean().default(true),
    createBackupBeforeRestore: z.boolean().default(true),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const [backups, stats] = await Promise.all([
      BackupManager.listBackups(limit),
      BackupManager.getBackupStats()
    ])

    return NextResponse.json({
      backups,
      stats
    })
  } catch (error) {
    console.error('Failed to fetch backups:', error)
    return NextResponse.json(
      { error: "Failed to fetch backups" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { description } = createBackupSchema.parse(body)

    const backup = await BackupManager.createBackup(description)

    return NextResponse.json({
      success: true,
      backup: {
        id: backup.id,
        timestamp: backup.timestamp,
        metadata: backup.metadata
      }
    })
  } catch (error) {
    console.error('Failed to create backup:', error)
    return NextResponse.json(
      { error: "Failed to create backup" },
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
    const { backupId, options } = restoreBackupSchema.parse(body)

    await BackupManager.restoreFromBackup(backupId, options)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to restore backup:', error)
    return NextResponse.json(
      { error: error.message || "Failed to restore backup" },
      { status: 500 }
    )
  }
}
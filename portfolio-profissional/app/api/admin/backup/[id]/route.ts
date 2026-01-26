import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { BackupManager } from "@/lib/backup/manager"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backupId = params.id

    await BackupManager.deleteBackup(backupId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete backup:', error)
    return NextResponse.json(
      { error: "Failed to delete backup" },
      { status: 500 }
    )
  }
}
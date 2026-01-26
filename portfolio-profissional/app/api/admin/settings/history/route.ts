import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AdminSettingsManager } from "@/lib/admin/settings"
import { z } from "zod"

const historyQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const { limit } = historyQuerySchema.parse({
      limit: searchParams.get('limit'),
    })

    const history = await AdminSettingsManager.getSettingsHistory(limit)
    
    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to fetch settings history:', error)
    return NextResponse.json(
      { error: "Failed to fetch settings history" },
      { status: 500 }
    )
  }
}
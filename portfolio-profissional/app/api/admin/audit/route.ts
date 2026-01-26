import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { AuditLogger } from "@/lib/audit"
import { z } from "zod"

const auditQuerySchema = z.object({
  section: z.string().optional(),
  action: z.enum(['create', 'update', 'delete', 'login', 'logout', 'upload', 'access']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = auditQuerySchema.parse({
      section: searchParams.get('section'),
      action: searchParams.get('action'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
    })

    const auditLogs = await AuditLogger.getAuditLogs({
      section: query.section,
      action: query.action,
      limit: query.limit,
      offset: query.offset,
    })

    const stats = await AuditLogger.getAuditStats()

    return NextResponse.json({
      logs: auditLogs,
      stats,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        hasMore: auditLogs.length === query.limit
      }
    })
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
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
    const { action, section, oldData, newData, metadata } = body

    await AuditLogger.log({
      action,
      section,
      oldData,
      newData,
      metadata
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    return NextResponse.json(
      { error: "Failed to create audit log" },
      { status: 500 }
    )
  }
}
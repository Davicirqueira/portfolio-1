import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { SecurityMonitor } from "@/lib/security/monitor"
import { SessionManager } from "@/lib/security/session-manager"
import { z } from "zod"

const securityQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  timeframe: z.enum(['hour', 'day', 'week']).default('day'),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = securityQuerySchema.parse({
      limit: searchParams.get('limit'),
      severity: searchParams.get('severity'),
      timeframe: searchParams.get('timeframe'),
    })

    const [alerts, stats, sessions] = await Promise.all([
      SecurityMonitor.getSecurityAlerts(query.limit, query.severity),
      SecurityMonitor.getSecurityStats(query.timeframe),
      SessionManager.getActiveSessions()
    ])

    return NextResponse.json({
      alerts,
      stats,
      sessions: sessions.map(s => ({
        userId: s.userId,
        email: s.email,
        loginTime: s.loginTime,
        lastActivity: s.lastActivity,
        ipAddress: s.ipAddress,
        // Don't expose full user agent for privacy
        browser: s.userAgent.split(' ')[0]
      }))
    })
  } catch (error) {
    console.error('Failed to fetch security data:', error)
    return NextResponse.json(
      { error: "Failed to fetch security data" },
      { status: 500 }
    )
  }
}
import { auth } from "@/lib/auth"
import { AuditLogger } from "@/lib/audit"
import { headers } from "next/headers"

export interface SessionInfo {
  userId: string
  email: string
  name: string
  role: string
  loginTime: Date
  lastActivity: Date
  ipAddress: string
  userAgent: string
}

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
  private static readonly MAX_CONCURRENT_SESSIONS = 3
  
  // In a production environment, this would be stored in Redis or database
  private static activeSessions = new Map<string, SessionInfo>()

  static async createSession(userId: string, email: string, name: string, role: string): Promise<void> {
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    const sessionInfo: SessionInfo = {
      userId,
      email,
      name,
      role,
      loginTime: new Date(),
      lastActivity: new Date(),
      ipAddress,
      userAgent
    }

    // Check for concurrent sessions
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId)

    if (userSessions.length >= this.MAX_CONCURRENT_SESSIONS) {
      // Remove oldest session
      const oldestSession = userSessions.sort((a, b) => 
        a.lastActivity.getTime() - b.lastActivity.getTime()
      )[0]
      
      this.activeSessions.delete(this.getSessionKey(oldestSession))
      
      await AuditLogger.log({
        action: 'logout',
        section: 'auth',
        metadata: {
          reason: 'concurrent_session_limit',
          forcedLogout: true
        }
      })
    }

    this.activeSessions.set(this.getSessionKey(sessionInfo), sessionInfo)

    await AuditLogger.log({
      action: 'login',
      section: 'auth',
      newData: {
        userId,
        email,
        ipAddress,
        userAgent
      }
    })
  }

  static async updateActivity(userId: string): Promise<void> {
    const sessions = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => session.userId === userId)

    for (const [key, session] of sessions) {
      session.lastActivity = new Date()
      this.activeSessions.set(key, session)
    }
  }

  static async removeSession(userId: string, ipAddress?: string): Promise<void> {
    const sessionsToRemove = Array.from(this.activeSessions.entries())
      .filter(([_, session]) => {
        if (ipAddress) {
          return session.userId === userId && session.ipAddress === ipAddress
        }
        return session.userId === userId
      })

    for (const [key, session] of sessionsToRemove) {
      this.activeSessions.delete(key)
      
      await AuditLogger.log({
        action: 'logout',
        section: 'auth',
        oldData: {
          userId: session.userId,
          email: session.email,
          sessionDuration: Date.now() - session.loginTime.getTime()
        }
      })
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const now = Date.now()
    const expiredSessions: string[] = []

    for (const [key, session] of this.activeSessions.entries()) {
      if (now - session.lastActivity.getTime() > this.SESSION_TIMEOUT) {
        expiredSessions.push(key)
      }
    }

    for (const key of expiredSessions) {
      const session = this.activeSessions.get(key)
      if (session) {
        this.activeSessions.delete(key)
        
        await AuditLogger.log({
          action: 'logout',
          section: 'auth',
          oldData: {
            userId: session.userId,
            email: session.email,
            reason: 'session_timeout'
          }
        })
      }
    }
  }

  static async getActiveSessions(userId?: string): Promise<SessionInfo[]> {
    await this.cleanupExpiredSessions()
    
    return Array.from(this.activeSessions.values())
      .filter(session => !userId || session.userId === userId)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime())
  }

  static async validateSession(): Promise<boolean> {
    try {
      const session = await auth()
      if (!session?.user?.id) {
        return false
      }

      await this.updateActivity(session.user.id)
      return true
    } catch {
      return false
    }
  }

  static async getSessionStats() {
    await this.cleanupExpiredSessions()
    
    const sessions = Array.from(this.activeSessions.values())
    const now = Date.now()
    
    return {
      totalActiveSessions: sessions.length,
      uniqueUsers: new Set(sessions.map(s => s.userId)).size,
      averageSessionDuration: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (now - s.loginTime.getTime()), 0) / sessions.length
        : 0,
      sessionsInLastHour: sessions.filter(s => 
        now - s.loginTime.getTime() < 60 * 60 * 1000
      ).length
    }
  }

  private static getSessionKey(session: SessionInfo): string {
    return `${session.userId}:${session.ipAddress}:${session.loginTime.getTime()}`
  }
}

// Middleware to automatically manage sessions
export async function withSessionManagement<T>(
  handler: () => Promise<T>
): Promise<T> {
  const isValid = await SessionManager.validateSession()
  
  if (!isValid) {
    throw new Error('Invalid or expired session')
  }

  return handler()
}
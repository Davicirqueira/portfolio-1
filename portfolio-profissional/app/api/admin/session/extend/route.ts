import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In a real implementation, you would update the session expiry time
    // This might involve updating a session store (Redis, database, etc.)
    // For now, we'll simulate the session extension
    
    console.log('Session extended for user:', session.user.id)

    return NextResponse.json({
      success: true,
      message: 'Session extended successfully',
      data: {
        extendedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes from now
      }
    })

  } catch (error) {
    console.error('Error extending session:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Mock security alerts - in a real implementation, this would be stored in the database
let mockAlerts = [
  {
    id: 'alert-1',
    type: 'failed_login_attempts',
    severity: 'medium',
    title: 'Tentativas de Login Falhadas',
    description: '3 tentativas de login falhadas detectadas do IP 192.168.1.100',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    resolved: false,
    metadata: { ipAddress: '192.168.1.100', attempts: 3 }
  },
  {
    id: 'alert-2',
    type: 'suspicious_activity',
    severity: 'low',
    title: 'Atividade Suspeita',
    description: 'Múltiplas tentativas de acesso a recursos protegidos',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    resolved: true,
    resolvedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    resolvedBy: 'admin-user-1',
    metadata: { resourcesAccessed: 5 }
  }
]

const mockMetrics = {
  totalAlerts: mockAlerts.length,
  criticalAlerts: mockAlerts.filter(a => a.severity === 'critical').length,
  resolvedAlerts: mockAlerts.filter(a => a.resolved).length,
  averageResolutionTime: 45, // minutes
  alertsByType: {
    failed_login_attempts: 1,
    suspicious_activity: 1,
    unauthorized_access: 0,
    data_breach_attempt: 0,
    malicious_file_upload: 0,
    sql_injection_attempt: 0,
    xss_attempt: 0,
    brute_force_attack: 0,
    session_hijacking: 0,
    privilege_escalation: 0,
    unusual_activity_pattern: 0,
    system_vulnerability: 0
  },
  alertsByDay: [
    { date: '2024-01-24', count: 2 },
    { date: '2024-01-23', count: 1 },
    { date: '2024-01-22', count: 0 }
  ],
  topThreats: [
    { type: 'failed_login_attempts', count: 1 },
    { type: 'suspicious_activity', count: 1 }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        alerts: mockAlerts,
        metrics: mockMetrics
      }
    })

  } catch (error) {
    console.error('Error fetching security alerts:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const alertData = await request.json()

    const newAlert = {
      id: `alert-${Date.now()}`,
      ...alertData,
      timestamp: new Date().toISOString(),
      resolved: false
    }

    mockAlerts.unshift(newAlert)

    // In a real implementation, you would save to database:
    // await prisma.securityAlert.create({
    //   data: newAlert
    // })

    return NextResponse.json({
      success: true,
      data: newAlert
    })

  } catch (error) {
    console.error('Error creating security alert:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
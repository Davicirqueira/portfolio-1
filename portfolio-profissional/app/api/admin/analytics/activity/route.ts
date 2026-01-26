import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // In a real implementation, you would fetch from an activity log table
    // For now, returning mock data
    const mockActivityLog = [
      {
        id: '1',
        action: 'Projeto atualizado',
        section: 'projects',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        details: 'Portfolio Website - descrição atualizada'
      },
      {
        id: '2',
        action: 'Imagem carregada',
        section: 'media',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
        details: 'profile-photo.jpg'
      },
      {
        id: '3',
        action: 'Habilidade adicionada',
        section: 'skills',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        details: 'React.js'
      },
      {
        id: '4',
        action: 'Seção Home salva',
        section: 'home',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 minutes ago
        details: 'Título e descrição atualizados'
      },
      {
        id: '5',
        action: 'Depoimento editado',
        section: 'testimonials',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
        details: 'Cliente: João Silva'
      }
    ]

    return NextResponse.json({
      success: true,
      data: mockActivityLog
    })

  } catch (error) {
    console.error('Error fetching activity log:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
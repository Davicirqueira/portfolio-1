import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get counts for different content types
    const [
      homeData,
      aboutData,
      skillsCount,
      experiencesCount,
      projectsCount,
      testimonialsCount,
      contactData,
      mediaCount,
      totalMediaSize
    ] = await Promise.all([
      prisma.home.findFirst(),
      prisma.about.findFirst(),
      prisma.skill.count(),
      prisma.experience.count(),
      prisma.project.count(),
      prisma.testimonial.count(),
      prisma.contact.findFirst(),
      prisma.mediaFile.count(),
      prisma.mediaFile.aggregate({
        _sum: {
          size: true
        }
      })
    ])

    // Calculate completed sections
    const sections = [
      { name: 'home', completed: !!homeData },
      { name: 'about', completed: !!aboutData },
      { name: 'skills', completed: skillsCount > 0 },
      { name: 'experience', completed: experiencesCount > 0 },
      { name: 'projects', completed: projectsCount > 0 },
      { name: 'testimonials', completed: testimonialsCount > 0 },
      { name: 'contact', completed: !!contactData }
    ]

    const completedSections = sections.filter(s => s.completed).length
    const totalSections = sections.length

    // Get last modification date
    const lastModifications = await Promise.all([
      prisma.home.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.about.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.skill.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.experience.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.project.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.testimonial.findFirst({ orderBy: { updatedAt: 'desc' } }),
      prisma.contact.findFirst({ orderBy: { updatedAt: 'desc' } })
    ])

    const lastModified = lastModifications
      .filter(Boolean)
      .map(item => item!.updatedAt)
      .sort((a, b) => b.getTime() - a.getTime())[0]

    // Get today's actions count (mock for now)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // In a real implementation, you would track user actions in a separate table
    const actionsToday = Math.floor(Math.random() * 20) + 5 // Mock data

    const stats = {
      totalSections,
      completedSections,
      lastModified: lastModified?.toISOString() || null,
      totalImages: mediaCount,
      totalProjects: projectsCount,
      totalSkills: skillsCount,
      totalExperiences: experiencesCount,
      totalTestimonials: testimonialsCount,
      storageUsed: totalMediaSize._sum.size || 0,
      actionsToday
    }

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
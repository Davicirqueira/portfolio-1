'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardStats {
  totalSections: number
  completedSections: number
  lastModified: string | null
  totalImages: number
  totalProjects: number
  totalSkills: number
  totalExperiences: number
  totalTestimonials: number
  storageUsed: number
  sessionDuration: number
  actionsToday: number
}

interface ActivityLog {
  id: string
  action: string
  section: string
  timestamp: string
  details?: string
}

interface UseDashboardAnalyticsReturn {
  stats: DashboardStats | null
  activityLog: ActivityLog[]
  isLoading: boolean
  error: string | null
  refreshStats: () => Promise<void>
  trackAction: (action: string, section: string, details?: string) => void
  getCompletionPercentage: () => number
  getSectionStatus: (section: string) => 'complete' | 'partial' | 'empty'
}

const REQUIRED_SECTIONS = [
  'home',
  'about', 
  'skills',
  'experience',
  'projects',
  'testimonials',
  'contact'
]

export function useDashboardAnalytics(): UseDashboardAnalyticsReturn {
  const { data: session } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionStart] = useState(Date.now())

  // Fetch dashboard statistics
  const fetchStats = useCallback(async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/analytics/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setStats({
          ...result.data,
          sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
        })
      } else {
        throw new Error(result.error || 'Failed to fetch stats')
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session, sessionStart])

  // Fetch activity log
  const fetchActivityLog = useCallback(async () => {
    if (!session) return

    try {
      const response = await fetch('/api/admin/analytics/activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setActivityLog(result.data)
      }
    } catch (err) {
      console.error('Error fetching activity log:', err)
    }
  }, [session])

  // Track user action
  const trackAction = useCallback(async (action: string, section: string, details?: string) => {
    if (!session) return

    const logEntry: ActivityLog = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      section,
      timestamp: new Date().toISOString(),
      details
    }

    // Add to local log immediately
    setActivityLog(prev => [logEntry, ...prev.slice(0, 49)]) // Keep last 50 entries

    // Update actions today count
    setStats(prev => prev ? {
      ...prev,
      actionsToday: prev.actionsToday + 1,
      sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
    } : null)

    try {
      // Send to server
      await fetch('/api/admin/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          section,
          details,
          timestamp: logEntry.timestamp
        }),
      })
    } catch (err) {
      console.error('Error tracking action:', err)
    }
  }, [session, sessionStart])

  // Calculate completion percentage
  const getCompletionPercentage = useCallback((): number => {
    if (!stats) return 0
    return Math.round((stats.completedSections / stats.totalSections) * 100)
  }, [stats])

  // Get section status
  const getSectionStatus = useCallback((section: string): 'complete' | 'partial' | 'empty' => {
    // This would be enhanced with actual section data
    // For now, return mock status based on stats
    if (!stats) return 'empty'
    
    const completionRate = stats.completedSections / stats.totalSections
    if (completionRate > 0.8) return 'complete'
    if (completionRate > 0.3) return 'partial'
    return 'empty'
  }, [stats])

  // Refresh all data
  const refreshStats = useCallback(async () => {
    await Promise.all([fetchStats(), fetchActivityLog()])
  }, [fetchStats, fetchActivityLog])

  // Initial data fetch
  useEffect(() => {
    if (session) {
      refreshStats()
    }
  }, [session, refreshStats])

  // Update session duration periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => prev ? {
        ...prev,
        sessionDuration: Math.floor((Date.now() - sessionStart) / 1000)
      } : null)
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [sessionStart])

  return {
    stats,
    activityLog,
    isLoading,
    error,
    refreshStats,
    trackAction,
    getCompletionPercentage,
    getSectionStatus
  }
}
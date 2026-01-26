'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useAuditLogger } from './useAuditLogger'

interface SessionWarning {
  show: boolean
  timeRemaining: number
}

interface UseSessionManagerOptions {
  warningTime?: number // Time in minutes before session expires to show warning
  sessionTimeout?: number // Session timeout in minutes
  checkInterval?: number // How often to check session status in seconds
  onSessionExpired?: () => void
  onSessionWarning?: (timeRemaining: number) => void
}

interface UseSessionManagerReturn {
  sessionWarning: SessionWarning
  isSessionActive: boolean
  timeUntilExpiry: number
  extendSession: () => Promise<void>
  dismissWarning: () => void
  forceLogout: () => Promise<void>
}

const DEFAULT_SESSION_TIMEOUT = 30 // 30 minutes
const DEFAULT_WARNING_TIME = 5 // 5 minutes before expiry
const DEFAULT_CHECK_INTERVAL = 60 // 60 seconds

export function useSessionManager(options: UseSessionManagerOptions = {}): UseSessionManagerReturn {
  const {
    warningTime = DEFAULT_WARNING_TIME,
    sessionTimeout = DEFAULT_SESSION_TIMEOUT,
    checkInterval = DEFAULT_CHECK_INTERVAL,
    onSessionExpired,
    onSessionWarning
  } = options

  const { data: session, status } = useSession()
  const { logAction, logSecurityEvent } = useAuditLogger()
  
  const [sessionWarning, setSessionWarning] = useState<SessionWarning>({
    show: false,
    timeRemaining: 0
  })
  const [isSessionActive, setIsSessionActive] = useState(true)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(sessionTimeout * 60)
  const [lastActivity, setLastActivity] = useState(Date.now())
  
  const checkIntervalRef = useRef<NodeJS.Timeout>()
  const warningShownRef = useRef(false)

  // Track user activity
  const updateActivity = useCallback(() => {
    setLastActivity(Date.now())
    warningShownRef.current = false
    setSessionWarning({ show: false, timeRemaining: 0 })
  }, [])

  // Extend session
  const extendSession = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/session/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        updateActivity()
        await logAction('session_extended', 'auth', {
          severity: 'low',
          details: 'Session extended by user action'
        })
      }
    } catch (error) {
      console.error('Failed to extend session:', error)
    }
  }, [updateActivity, logAction])

  // Force logout
  const forceLogout = useCallback(async () => {
    await logAction('logout', 'auth', {
      severity: 'low',
      details: 'User logged out'
    })
    await signOut({ callbackUrl: '/admin/login' })
  }, [logAction])

  // Dismiss warning
  const dismissWarning = useCallback(() => {
    setSessionWarning({ show: false, timeRemaining: 0 })
  }, [])

  // Check session status
  const checkSessionStatus = useCallback(() => {
    if (!session || status !== 'authenticated') {
      setIsSessionActive(false)
      return
    }

    const now = Date.now()
    const timeSinceActivity = (now - lastActivity) / 1000 // in seconds
    const timeRemaining = (sessionTimeout * 60) - timeSinceActivity

    setTimeUntilExpiry(Math.max(0, timeRemaining))

    // Session expired
    if (timeRemaining <= 0) {
      setIsSessionActive(false)
      setSessionWarning({ show: false, timeRemaining: 0 })
      
      logSecurityEvent('session_expired', 'medium', 'Session expired due to inactivity')
      onSessionExpired?.()
      forceLogout()
      return
    }

    // Show warning
    const warningThreshold = warningTime * 60 // in seconds
    if (timeRemaining <= warningThreshold && !warningShownRef.current) {
      warningShownRef.current = true
      setSessionWarning({
        show: true,
        timeRemaining: Math.ceil(timeRemaining / 60) // in minutes
      })
      onSessionWarning?.(Math.ceil(timeRemaining / 60))
    }

    setIsSessionActive(true)
  }, [
    session,
    status,
    lastActivity,
    sessionTimeout,
    warningTime,
    onSessionExpired,
    onSessionWarning,
    forceLogout,
    logSecurityEvent
  ])

  // Set up activity listeners
  useEffect(() => {
    if (typeof window === 'undefined' || !session) return

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
    
    const handleActivity = () => {
      updateActivity()
    }

    // Add event listeners
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, true)
    })

    return () => {
      // Remove event listeners
      activityEvents.forEach(event => {
        document.removeEventListener(event, handleActivity, true)
      })
    }
  }, [session, updateActivity])

  // Set up session checking interval
  useEffect(() => {
    if (!session) return

    checkIntervalRef.current = setInterval(checkSessionStatus, checkInterval * 1000)

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [session, checkSessionStatus, checkInterval])

  // Initial session check
  useEffect(() => {
    if (session) {
      checkSessionStatus()
    }
  }, [session, checkSessionStatus])

  // Log session start
  useEffect(() => {
    if (session && status === 'authenticated') {
      logAction('login', 'auth', {
        severity: 'low',
        details: 'User session started'
      })
    }
  }, [session, status, logAction])

  return {
    sessionWarning,
    isSessionActive,
    timeUntilExpiry,
    extendSession,
    dismissWarning,
    forceLogout
  }
}
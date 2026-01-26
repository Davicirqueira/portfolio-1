'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface UseUnsavedChangesOptions {
  hasUnsavedChanges: boolean
  onBeforeUnload?: () => void
  onNavigationAttempt?: () => boolean // Return true to allow navigation, false to block
  warningMessage?: string
}

export function useUnsavedChanges({
  hasUnsavedChanges,
  onBeforeUnload,
  onNavigationAttempt,
  warningMessage = 'Você tem alterações não salvas. Tem certeza que deseja sair?'
}: UseUnsavedChangesOptions) {
  const router = useRouter()
  const isNavigatingRef = useRef(false)

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = warningMessage
        onBeforeUnload?.()
        return warningMessage
      }
    }

    if (hasUnsavedChanges) {
      window.addEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [hasUnsavedChanges, warningMessage, onBeforeUnload])

  // Handle programmatic navigation
  const confirmNavigation = useCallback(() => {
    if (!hasUnsavedChanges) return true
    
    if (onNavigationAttempt) {
      return onNavigationAttempt()
    }
    
    return window.confirm(warningMessage)
  }, [hasUnsavedChanges, onNavigationAttempt, warningMessage])

  // Safe navigation function
  const navigateWithConfirmation = useCallback((path: string) => {
    if (confirmNavigation()) {
      isNavigatingRef.current = true
      router.push(path)
    }
  }, [confirmNavigation, router])

  // Block navigation if there are unsaved changes
  useEffect(() => {
    const originalPush = router.push
    const originalReplace = router.replace
    const originalBack = router.back

    if (hasUnsavedChanges && !isNavigatingRef.current) {
      // Override router methods to show confirmation
      router.push = (href: string, options?: any) => {
        if (confirmNavigation()) {
          isNavigatingRef.current = true
          return originalPush.call(router, href, options)
        }
        return Promise.resolve(false as any)
      }

      router.replace = (href: string, options?: any) => {
        if (confirmNavigation()) {
          isNavigatingRef.current = true
          return originalReplace.call(router, href, options)
        }
        return Promise.resolve(false as any)
      }

      router.back = () => {
        if (confirmNavigation()) {
          isNavigatingRef.current = true
          return originalBack.call(router)
        }
      }
    }

    return () => {
      // Restore original methods
      router.push = originalPush
      router.replace = originalReplace
      router.back = originalBack
      isNavigatingRef.current = false
    }
  }, [hasUnsavedChanges, confirmNavigation, router])

  return {
    hasUnsavedChanges,
    confirmNavigation,
    navigateWithConfirmation
  }
}
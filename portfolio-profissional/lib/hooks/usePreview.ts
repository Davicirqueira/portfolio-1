'use client'

import { useState, useCallback, useRef } from 'react'

interface PreviewData {
  [key: string]: any
}

interface UsePreviewOptions<T = PreviewData> {
  originalData: T
  onPublish?: (data: T) => Promise<void>
  onDiscard?: () => void
}

export function usePreview<T = PreviewData>({
  originalData,
  onPublish,
  onDiscard
}: UsePreviewOptions<T>) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [previewData, setPreviewData] = useState<T>(originalData)
  const [isPublishing, setIsPublishing] = useState(false)
  const previewWindowRef = useRef<Window | null>(null)

  // Enter preview mode with current data
  const enterPreview = useCallback((data: T) => {
    setPreviewData(data)
    setIsPreviewMode(true)
  }, [])

  // Exit preview mode
  const exitPreview = useCallback(() => {
    setIsPreviewMode(false)
    setPreviewData(originalData)
    
    // Close preview window if open
    if (previewWindowRef.current && !previewWindowRef.current.closed) {
      previewWindowRef.current.close()
    }
  }, [originalData])

  // Open preview in new window/tab
  const openPreviewWindow = useCallback((data: T) => {
    setPreviewData(data)
    
    // Create preview URL with data as query params
    const previewUrl = `/preview?data=${encodeURIComponent(JSON.stringify(data))}&timestamp=${Date.now()}`
    
    // Open in new window
    previewWindowRef.current = window.open(
      previewUrl,
      'portfolio-preview',
      'width=1200,height=800,scrollbars=yes,resizable=yes'
    )
    
    if (previewWindowRef.current) {
      previewWindowRef.current.focus()
    }
  }, [])

  // Publish changes
  const publishChanges = useCallback(async (data: T) => {
    if (!onPublish) return false

    try {
      setIsPublishing(true)
      await onPublish(data)
      setIsPreviewMode(false)
      return true
    } catch (error) {
      console.error('Error publishing changes:', error)
      return false
    } finally {
      setIsPublishing(false)
    }
  }, [onPublish])

  // Discard changes
  const discardChanges = useCallback(() => {
    setPreviewData(originalData)
    setIsPreviewMode(false)
    onDiscard?.()
  }, [originalData, onDiscard])

  // Generate preview URL for iframe
  const getPreviewUrl = useCallback((data: T) => {
    return `/preview?data=${encodeURIComponent(JSON.stringify(data))}&timestamp=${Date.now()}`
  }, [])

  return {
    isPreviewMode,
    previewData,
    isPublishing,
    enterPreview,
    exitPreview,
    openPreviewWindow,
    publishChanges,
    discardChanges,
    getPreviewUrl
  }
}
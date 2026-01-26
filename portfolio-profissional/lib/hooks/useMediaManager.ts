'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export type MediaCategory = 'profile' | 'project' | 'general'

interface MediaFile {
  id: string
  filename: string
  originalName: string
  url: string
  publicId?: string
  category: MediaCategory
  size: number
  mimeType: string
  createdAt: string
  updatedAt: string
  tags?: string[]
  usedIn?: string[]
  isArchived?: boolean
  description?: string
}

interface CreateMediaFileData {
  filename: string
  originalName: string
  url: string
  publicId?: string
  category: MediaCategory
  size: number
  mimeType: string
  tags?: string[]
  description?: string
}

interface UseMediaManagerReturn {
  mediaFiles: MediaFile[]
  isLoading: boolean
  error: string | null
  uploadFile: (file: File, category: MediaCategory) => Promise<MediaFile | null>
  createMediaRecord: (data: CreateMediaFileData) => Promise<MediaFile | null>
  updateMediaFile: (id: string, updates: Partial<MediaFile>) => Promise<MediaFile | null>
  deleteMediaFile: (id: string) => Promise<boolean>
  bulkDeleteFiles: (ids: string[]) => Promise<boolean>
  archiveMediaFile: (id: string, archived: boolean) => Promise<boolean>
  bulkArchiveFiles: (ids: string[], archived: boolean) => Promise<boolean>
  addTagsToFile: (id: string, tags: string[]) => Promise<boolean>
  removeTagsFromFile: (id: string, tags: string[]) => Promise<boolean>
  trackFileUsage: (id: string, usageLocation: string) => Promise<boolean>
  untrackFileUsage: (id: string, usageLocation: string) => Promise<boolean>
  getMediaByCategory: (category: MediaCategory) => MediaFile[]
  getMediaByTags: (tags: string[]) => MediaFile[]
  getUnusedMedia: () => MediaFile[]
  refreshMedia: (category?: MediaCategory) => Promise<void>
  validateFile: (file: File) => { isValid: boolean; error?: string }
  getStorageStats: () => { totalFiles: number; totalSize: number; byCategory: Record<MediaCategory, { count: number; size: number }> }
}

// Allowed file types and sizes
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export function useMediaManager(initialCategory?: MediaCategory): UseMediaManagerReturn {
  const { data: session } = useSession()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch media files
  const fetchMediaFiles = useCallback(async (category?: MediaCategory) => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (category) params.append('category', category)

      const response = await fetch(`/api/admin/media?${params.toString()}`, {
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
        setMediaFiles(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch media files')
      }
    } catch (err) {
      console.error('Error fetching media files:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Validate file
  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Tipo de arquivo não permitido. Use JPG, PNG ou WebP.',
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: 'Arquivo muito grande. Tamanho máximo: 5MB.',
      }
    }

    return { isValid: true }
  }, [])

  // Upload file (this would typically integrate with a cloud storage service)
  const uploadFile = useCallback(async (
    file: File, 
    category: MediaCategory
  ): Promise<MediaFile | null> => {
    if (!session) {
      setError('Not authenticated')
      return null
    }

    // Validate file first
    const validation = validateFile(file)
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file')
      return null
    }

    try {
      setError(null)

      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('category', category)

      // This is a placeholder - in a real implementation, you would upload to
      // a cloud storage service like Cloudinary, AWS S3, etc.
      // For now, we'll simulate the upload process
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Generate a mock URL (in real implementation, this would come from the storage service)
      const mockUrl = URL.createObjectURL(file)
      const filename = `${Date.now()}-${file.name}`

      // Create media record in database
      const mediaData: CreateMediaFileData = {
        filename,
        originalName: file.name,
        url: mockUrl,
        category,
        size: file.size,
        mimeType: file.type,
      }

      return await createMediaRecord(mediaData)
    } catch (err) {
      console.error('Error uploading file:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [session, validateFile])

  // Create media record
  const createMediaRecord = useCallback(async (data: CreateMediaFileData): Promise<MediaFile | null> => {
    if (!session) {
      setError('Not authenticated')
      return null
    }

    try {
      setError(null)

      const response = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const newMediaFile = result.data
        setMediaFiles(prev => [newMediaFile, ...prev])
        return newMediaFile
      } else {
        throw new Error(result.error || 'Failed to create media record')
      }
    } catch (err) {
      console.error('Error creating media record:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [session])

  // Update media file
  const updateMediaFile = useCallback(async (
    id: string, 
    updates: Partial<MediaFile>
  ): Promise<MediaFile | null> => {
    if (!session) {
      setError('Not authenticated')
      return null
    }

    try {
      setError(null)

      const response = await fetch(`/api/admin/media/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const updatedFile = result.data
        setMediaFiles(prev => prev.map(file => file.id === id ? updatedFile : file))
        return updatedFile
      } else {
        throw new Error(result.error || 'Failed to update media file')
      }
    } catch (err) {
      console.error('Error updating media file:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [session])

  // Bulk delete media files
  const bulkDeleteFiles = useCallback(async (ids: string[]): Promise<boolean> => {
    if (!session) {
      setError('Not authenticated')
      return false
    }

    try {
      setError(null)

      const response = await fetch('/api/admin/media/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setMediaFiles(prev => prev.filter(file => !ids.includes(file.id)))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete media files')
      }
    } catch (err) {
      console.error('Error bulk deleting media files:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session])

  // Archive/unarchive media file
  const archiveMediaFile = useCallback(async (id: string, archived: boolean): Promise<boolean> => {
    return await updateMediaFile(id, { isArchived: archived }) !== null
  }, [updateMediaFile])

  // Bulk archive/unarchive files
  const bulkArchiveFiles = useCallback(async (ids: string[], archived: boolean): Promise<boolean> => {
    if (!session) {
      setError('Not authenticated')
      return false
    }

    try {
      setError(null)

      const response = await fetch('/api/admin/media/bulk', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids, updates: { isArchived: archived } }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setMediaFiles(prev => prev.map(file => 
          ids.includes(file.id) ? { ...file, isArchived: archived } : file
        ))
        return true
      } else {
        throw new Error(result.error || 'Failed to archive media files')
      }
    } catch (err) {
      console.error('Error bulk archiving media files:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session])

  // Add tags to file
  const addTagsToFile = useCallback(async (id: string, tags: string[]): Promise<boolean> => {
    const file = mediaFiles.find(f => f.id === id)
    if (!file) return false

    const existingTags = file.tags || []
    const newTags = [...new Set([...existingTags, ...tags])]
    
    return await updateMediaFile(id, { tags: newTags }) !== null
  }, [mediaFiles, updateMediaFile])

  // Remove tags from file
  const removeTagsFromFile = useCallback(async (id: string, tags: string[]): Promise<boolean> => {
    const file = mediaFiles.find(f => f.id === id)
    if (!file) return false

    const existingTags = file.tags || []
    const newTags = existingTags.filter(tag => !tags.includes(tag))
    
    return await updateMediaFile(id, { tags: newTags }) !== null
  }, [mediaFiles, updateMediaFile])

  // Track file usage
  const trackFileUsage = useCallback(async (id: string, usageLocation: string): Promise<boolean> => {
    const file = mediaFiles.find(f => f.id === id)
    if (!file) return false

    const existingUsage = file.usedIn || []
    if (existingUsage.includes(usageLocation)) return true

    const newUsage = [...existingUsage, usageLocation]
    
    return await updateMediaFile(id, { usedIn: newUsage }) !== null
  }, [mediaFiles, updateMediaFile])

  // Untrack file usage
  const untrackFileUsage = useCallback(async (id: string, usageLocation: string): Promise<boolean> => {
    const file = mediaFiles.find(f => f.id === id)
    if (!file) return false

    const existingUsage = file.usedIn || []
    const newUsage = existingUsage.filter(usage => usage !== usageLocation)
    
    return await updateMediaFile(id, { usedIn: newUsage }) !== null
  }, [mediaFiles, updateMediaFile])
  const deleteMediaFile = useCallback(async (id: string): Promise<boolean> => {
    if (!session) {
      setError('Not authenticated')
      return false
    }

    try {
      setError(null)

      const response = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setMediaFiles(prev => prev.filter(file => file.id !== id))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete media file')
      }
    } catch (err) {
      console.error('Error deleting media file:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session])

  // Get media by tags
  const getMediaByTags = useCallback((tags: string[]): MediaFile[] => {
    return mediaFiles.filter(file => 
      file.tags && file.tags.some(tag => tags.includes(tag))
    )
  }, [mediaFiles])

  // Get unused media
  const getUnusedMedia = useCallback((): MediaFile[] => {
    return mediaFiles.filter(file => !file.usedIn || file.usedIn.length === 0)
  }, [mediaFiles])

  // Get storage statistics
  const getStorageStats = useCallback(() => {
    const stats = {
      totalFiles: mediaFiles.length,
      totalSize: mediaFiles.reduce((sum, file) => sum + file.size, 0),
      byCategory: {} as Record<MediaCategory, { count: number; size: number }>
    }

    // Initialize categories
    const categories: MediaCategory[] = ['profile', 'project', 'general']
    categories.forEach(category => {
      stats.byCategory[category] = { count: 0, size: 0 }
    })

    // Calculate by category
    mediaFiles.forEach(file => {
      stats.byCategory[file.category].count++
      stats.byCategory[file.category].size += file.size
    })

    return stats
  }, [mediaFiles])
  const getMediaByCategory = useCallback((category: MediaCategory): MediaFile[] => {
    return mediaFiles.filter(file => file.category === category)
  }, [mediaFiles])

  // Refresh media
  const refreshMedia = useCallback(async (category?: MediaCategory) => {
    await fetchMediaFiles(category)
  }, [fetchMediaFiles])

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchMediaFiles(initialCategory)
    }
  }, [session, fetchMediaFiles, initialCategory])

  return {
    mediaFiles,
    isLoading,
    error,
    uploadFile,
    createMediaRecord,
    updateMediaFile,
    deleteMediaFile,
    bulkDeleteFiles,
    archiveMediaFile,
    bulkArchiveFiles,
    addTagsToFile,
    removeTagsFromFile,
    trackFileUsage,
    untrackFileUsage,
    getMediaByCategory,
    getMediaByTags,
    getUnusedMedia,
    refreshMedia,
    validateFile,
    getStorageStats,
  }
}
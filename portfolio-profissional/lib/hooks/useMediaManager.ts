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
}

interface CreateMediaFileData {
  filename: string
  originalName: string
  url: string
  publicId?: string
  category: MediaCategory
  size: number
  mimeType: string
}

interface UseMediaManagerReturn {
  mediaFiles: MediaFile[]
  isLoading: boolean
  error: string | null
  uploadFile: (file: File, category: MediaCategory) => Promise<MediaFile | null>
  createMediaRecord: (data: CreateMediaFileData) => Promise<MediaFile | null>
  deleteMediaFile: (id: string) => Promise<boolean>
  getMediaByCategory: (category: MediaCategory) => MediaFile[]
  refreshMedia: (category?: MediaCategory) => Promise<void>
  validateFile: (file: File) => { isValid: boolean; error?: string }
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

  // Delete media file
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

  // Get media by category
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
    deleteMediaFile,
    getMediaByCategory,
    refreshMedia,
    validateFile,
  }
}
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

export type ModalType = 'education' | 'skill' | 'project'

interface DynamicModal {
  id: string
  type: ModalType
  title: string
  content: Record<string, any>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CreateModalData {
  type: ModalType
  title: string
  content: Record<string, any>
  isActive?: boolean
}

interface UpdateModalData {
  id: string
  type?: ModalType
  title?: string
  content?: Record<string, any>
  isActive?: boolean
}

interface UseModalManagerReturn {
  modals: DynamicModal[]
  isLoading: boolean
  error: string | null
  createModal: (data: CreateModalData) => Promise<DynamicModal | null>
  updateModal: (data: UpdateModalData) => Promise<DynamicModal | null>
  deleteModal: (id: string) => Promise<boolean>
  getModal: (id: string) => DynamicModal | null
  getModalsByType: (type: ModalType) => DynamicModal[]
  refreshModals: (type?: ModalType) => Promise<void>
}

export function useModalManager(initialType?: ModalType): UseModalManagerReturn {
  const { data: session } = useSession()
  const [modals, setModals] = useState<DynamicModal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch modals
  const fetchModals = useCallback(async (type?: ModalType) => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (type) params.append('type', type)
      params.append('isActive', 'true')

      const response = await fetch(`/api/admin/modals?${params.toString()}`, {
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
        setModals(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch modals')
      }
    } catch (err) {
      console.error('Error fetching modals:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Create modal
  const createModal = useCallback(async (data: CreateModalData): Promise<DynamicModal | null> => {
    if (!session) {
      setError('Not authenticated')
      return null
    }

    try {
      setError(null)

      const response = await fetch('/api/admin/modals', {
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
        const newModal = result.data
        setModals(prev => [newModal, ...prev])
        return newModal
      } else {
        throw new Error(result.error || 'Failed to create modal')
      }
    } catch (err) {
      console.error('Error creating modal:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [session])

  // Update modal
  const updateModal = useCallback(async (data: UpdateModalData): Promise<DynamicModal | null> => {
    if (!session) {
      setError('Not authenticated')
      return null
    }

    try {
      setError(null)

      const response = await fetch('/api/admin/modals', {
        method: 'PUT',
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
        const updatedModal = result.data
        setModals(prev => prev.map(modal => 
          modal.id === updatedModal.id ? updatedModal : modal
        ))
        return updatedModal
      } else {
        throw new Error(result.error || 'Failed to update modal')
      }
    } catch (err) {
      console.error('Error updating modal:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return null
    }
  }, [session])

  // Delete modal
  const deleteModal = useCallback(async (id: string): Promise<boolean> => {
    if (!session) {
      setError('Not authenticated')
      return false
    }

    try {
      setError(null)

      const response = await fetch(`/api/admin/modals?id=${id}`, {
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
        setModals(prev => prev.filter(modal => modal.id !== id))
        return true
      } else {
        throw new Error(result.error || 'Failed to delete modal')
      }
    } catch (err) {
      console.error('Error deleting modal:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    }
  }, [session])

  // Get modal by ID
  const getModal = useCallback((id: string): DynamicModal | null => {
    return modals.find(modal => modal.id === id) || null
  }, [modals])

  // Get modals by type
  const getModalsByType = useCallback((type: ModalType): DynamicModal[] => {
    return modals.filter(modal => modal.type === type)
  }, [modals])

  // Refresh modals
  const refreshModals = useCallback(async (type?: ModalType) => {
    await fetchModals(type)
  }, [fetchModals])

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchModals(initialType)
    }
  }, [session, fetchModals, initialType])

  return {
    modals,
    isLoading,
    error,
    createModal,
    updateModal,
    deleteModal,
    getModal,
    getModalsByType,
    refreshModals,
  }
}
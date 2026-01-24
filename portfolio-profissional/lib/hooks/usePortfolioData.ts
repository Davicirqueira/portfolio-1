'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface PortfolioData {
  id: string
  version: number
  data: Record<string, any>
  isPublished: boolean
  lastModified: string
  modifiedBy: string
  createdAt: string
  updatedAt: string
}

interface UsePortfolioDataReturn {
  portfolioData: PortfolioData | null
  isLoading: boolean
  error: string | null
  isDirty: boolean
  saveData: (data: Record<string, any>, publish?: boolean) => Promise<boolean>
  refreshData: () => Promise<void>
  resetChanges: () => void
  setDirty: (dirty: boolean) => void
}

export function usePortfolioData(): UsePortfolioDataReturn {
  const { data: session } = useSession()
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [originalData, setOriginalData] = useState<Record<string, any> | null>(null)

  // Fetch portfolio data
  const fetchPortfolioData = useCallback(async () => {
    if (!session) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/portfolio', {
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
        setPortfolioData(result.data)
        setOriginalData(result.data.data)
        setIsDirty(false)
      } else {
        throw new Error(result.error || 'Failed to fetch portfolio data')
      }
    } catch (err) {
      console.error('Error fetching portfolio data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Save portfolio data
  const saveData = useCallback(async (
    data: Record<string, any>, 
    publish: boolean = true
  ): Promise<boolean> => {
    if (!session) {
      setError('Not authenticated')
      return false
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data,
          isPublished: publish,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setPortfolioData(result.data)
        setOriginalData(data)
        setIsDirty(false)
        return true
      } else {
        throw new Error(result.error || 'Failed to save portfolio data')
      }
    } catch (err) {
      console.error('Error saving portfolio data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchPortfolioData()
  }, [fetchPortfolioData])

  // Reset changes
  const resetChanges = useCallback(() => {
    if (originalData) {
      setIsDirty(false)
    }
  }, [originalData])

  // Set dirty state
  const setDirty = useCallback((dirty: boolean) => {
    setIsDirty(dirty)
  }, [])

  // Initial data fetch
  useEffect(() => {
    if (session) {
      fetchPortfolioData()
    }
  }, [session, fetchPortfolioData])

  return {
    portfolioData,
    isLoading,
    error,
    isDirty,
    saveData,
    refreshData,
    resetChanges,
    setDirty,
  }
}
'use client'

import { useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

interface BulkOperation {
  id: string
  type: 'delete' | 'archive' | 'publish' | 'update' | 'export'
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress: number
  total: number
  completed: number
  failed: number
  startTime: Date
  endTime?: Date
  error?: string
}

interface BulkOperationOptions {
  onProgress?: (operation: BulkOperation) => void
  onComplete?: (operation: BulkOperation) => void
  onError?: (operation: BulkOperation, error: string) => void
}

interface UseBulkOperationsReturn {
  operations: BulkOperation[]
  isRunning: boolean
  startBulkDelete: (ids: string[], type: string, options?: BulkOperationOptions) => Promise<boolean>
  startBulkArchive: (ids: string[], archived: boolean, type: string, options?: BulkOperationOptions) => Promise<boolean>
  startBulkUpdate: (updates: Array<{id: string, data: any}>, type: string, options?: BulkOperationOptions) => Promise<boolean>
  startBulkExport: (ids: string[], type: string, format: 'json' | 'csv', options?: BulkOperationOptions) => Promise<boolean>
  cancelOperation: (operationId: string) => void
  clearCompletedOperations: () => void
  getOperationById: (id: string) => BulkOperation | undefined
}

export function useBulkOperations(): UseBulkOperationsReturn {
  const { data: session } = useSession()
  const [operations, setOperations] = useState<BulkOperation[]>([])

  // Create new operation
  const createOperation = useCallback((
    type: BulkOperation['type'],
    total: number
  ): BulkOperation => {
    return {
      id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      progress: 0,
      total,
      completed: 0,
      failed: 0,
      startTime: new Date()
    }
  }, [])

  // Update operation
  const updateOperation = useCallback((
    operationId: string,
    updates: Partial<BulkOperation>
  ) => {
    setOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, ...updates } : op
    ))
  }, [])

  // Generic bulk operation executor
  const executeBulkOperation = useCallback(async (
    operation: BulkOperation,
    items: any[],
    processor: (item: any, index: number) => Promise<boolean>,
    options?: BulkOperationOptions
  ): Promise<boolean> => {
    if (!session) return false

    try {
      // Add operation to list
      setOperations(prev => [...prev, operation])
      
      // Start operation
      updateOperation(operation.id, { status: 'running' })
      
      let completed = 0
      let failed = 0

      for (let i = 0; i < items.length; i++) {
        try {
          const success = await processor(items[i], i)
          if (success) {
            completed++
          } else {
            failed++
          }
        } catch (error) {
          failed++
          console.error(`Bulk operation item ${i} failed:`, error)
        }

        // Update progress
        const progress = Math.round(((completed + failed) / items.length) * 100)
        const updatedOperation = {
          progress,
          completed,
          failed
        }

        updateOperation(operation.id, updatedOperation)
        options?.onProgress?.({ ...operation, ...updatedOperation })

        // Small delay to prevent overwhelming the server
        if (i < items.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      // Complete operation
      const finalOperation = {
        status: 'completed' as const,
        progress: 100,
        completed,
        failed,
        endTime: new Date()
      }

      updateOperation(operation.id, finalOperation)
      options?.onComplete?.({ ...operation, ...finalOperation })

      return failed === 0
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const failedOperation = {
        status: 'failed' as const,
        error: errorMessage,
        endTime: new Date()
      }

      updateOperation(operation.id, failedOperation)
      options?.onError?.({ ...operation, ...failedOperation }, errorMessage)

      return false
    }
  }, [session, updateOperation])

  // Bulk delete operation
  const startBulkDelete = useCallback(async (
    ids: string[],
    type: string,
    options?: BulkOperationOptions
  ): Promise<boolean> => {
    const operation = createOperation('delete', ids.length)

    return executeBulkOperation(
      operation,
      ids,
      async (id: string) => {
        const response = await fetch(`/api/admin/${type}/${id}`, {
          method: 'DELETE'
        })
        return response.ok
      },
      options
    )
  }, [createOperation, executeBulkOperation])

  // Bulk archive operation
  const startBulkArchive = useCallback(async (
    ids: string[],
    archived: boolean,
    type: string,
    options?: BulkOperationOptions
  ): Promise<boolean> => {
    const operation = createOperation('archive', ids.length)

    return executeBulkOperation(
      operation,
      ids,
      async (id: string) => {
        const response = await fetch(`/api/admin/${type}/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isArchived: archived })
        })
        return response.ok
      },
      options
    )
  }, [createOperation, executeBulkOperation])

  // Bulk update operation
  const startBulkUpdate = useCallback(async (
    updates: Array<{id: string, data: any}>,
    type: string,
    options?: BulkOperationOptions
  ): Promise<boolean> => {
    const operation = createOperation('update', updates.length)

    return executeBulkOperation(
      operation,
      updates,
      async (update: {id: string, data: any}) => {
        const response = await fetch(`/api/admin/${type}/${update.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update.data)
        })
        return response.ok
      },
      options
    )
  }, [createOperation, executeBulkOperation])

  // Bulk export operation
  const startBulkExport = useCallback(async (
    ids: string[],
    type: string,
    format: 'json' | 'csv',
    options?: BulkOperationOptions
  ): Promise<boolean> => {
    const operation = createOperation('export', ids.length)

    try {
      setOperations(prev => [...prev, operation])
      updateOperation(operation.id, { status: 'running' })

      const response = await fetch('/api/admin/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, type, format })
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Download the file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      const finalOperation = {
        status: 'completed' as const,
        progress: 100,
        completed: ids.length,
        failed: 0,
        endTime: new Date()
      }

      updateOperation(operation.id, finalOperation)
      options?.onComplete?.({ ...operation, ...finalOperation })

      return true
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Export failed'
      const failedOperation = {
        status: 'failed' as const,
        error: errorMessage,
        endTime: new Date()
      }

      updateOperation(operation.id, failedOperation)
      options?.onError?.({ ...operation, ...failedOperation }, errorMessage)

      return false
    }
  }, [createOperation, updateOperation])

  // Cancel operation
  const cancelOperation = useCallback((operationId: string) => {
    updateOperation(operationId, { 
      status: 'failed',
      error: 'Cancelled by user',
      endTime: new Date()
    })
  }, [updateOperation])

  // Clear completed operations
  const clearCompletedOperations = useCallback(() => {
    setOperations(prev => prev.filter(op => 
      op.status === 'pending' || op.status === 'running'
    ))
  }, [])

  // Get operation by ID
  const getOperationById = useCallback((id: string): BulkOperation | undefined => {
    return operations.find(op => op.id === id)
  }, [operations])

  // Check if any operation is running
  const isRunning = operations.some(op => op.status === 'running')

  return {
    operations,
    isRunning,
    startBulkDelete,
    startBulkArchive,
    startBulkUpdate,
    startBulkExport,
    cancelOperation,
    clearCompletedOperations,
    getOperationById
  }
}
"use client"

import { useState, useCallback, useEffect } from "react"
import { useDebounce } from "./useDebounce"

export interface ValidationErrors {
  [key: string]: string[]
}

export interface SaveResult {
  success: boolean
  data?: any
  error?: string
  timestamp: Date
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationErrors
}

export interface ContentEditorState<T> {
  data: T
  originalData: T
  isLoading: boolean
  isSaving: boolean
  isDirty: boolean
  errors: ValidationErrors
  lastSaved?: Date
  autoSaveEnabled: boolean
}

export interface ContentEditorActions<T> {
  updateData: (updates: Partial<T>) => void
  save: () => Promise<SaveResult>
  cancel: () => void
  reset: () => void
  validate: () => ValidationResult
  setAutoSave: (enabled: boolean) => void
}

export interface UseContentEditorOptions<T> {
  initialData: T
  validationSchema?: (data: T) => ValidationResult
  saveFunction: (data: T) => Promise<SaveResult>
  autoSaveInterval?: number
  onSave?: (result: SaveResult) => void
  onError?: (error: string) => void
}

export function useContentEditor<T extends Record<string, any>>({
  initialData,
  validationSchema,
  saveFunction,
  autoSaveInterval = 30000, // 30 seconds
  onSave,
  onError,
}: UseContentEditorOptions<T>): [ContentEditorState<T>, ContentEditorActions<T>] {
  const [state, setState] = useState<ContentEditorState<T>>({
    data: { ...initialData },
    originalData: { ...initialData },
    isLoading: false,
    isSaving: false,
    isDirty: false,
    errors: {},
    autoSaveEnabled: true,
  })

  // Debounced data for auto-save
  const debouncedData = useDebounce(state.data, autoSaveInterval)

  // Auto-save effect
  useEffect(() => {
    if (
      state.autoSaveEnabled &&
      state.isDirty &&
      !state.isSaving &&
      debouncedData !== state.originalData
    ) {
      handleSave(true) // Auto-save
    }
  }, [debouncedData, state.autoSaveEnabled, state.isDirty, state.isSaving])

  const updateData = useCallback((updates: Partial<T>) => {
    setState(prev => {
      const newData = { ...prev.data, ...updates }
      const isDirty = JSON.stringify(newData) !== JSON.stringify(prev.originalData)
      
      return {
        ...prev,
        data: newData,
        isDirty,
        errors: {}, // Clear errors on data change
      }
    })
  }, [])

  const validate = useCallback((): ValidationResult => {
    if (!validationSchema) {
      return { isValid: true, errors: {} }
    }

    const result = validationSchema(state.data)
    setState(prev => ({ ...prev, errors: result.errors }))
    return result
  }, [state.data, validationSchema])

  const handleSave = useCallback(async (isAutoSave = false): Promise<SaveResult> => {
    setState(prev => ({ ...prev, isSaving: true }))

    try {
      // Validate before saving
      const validationResult = validate()
      if (!validationResult.isValid) {
        const result: SaveResult = {
          success: false,
          error: 'Dados inválidos. Verifique os campos destacados.',
          timestamp: new Date(),
        }
        
        if (!isAutoSave) {
          onError?.(result.error!)
        }
        
        return result
      }

      // Perform save
      const result = await saveFunction(state.data)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          originalData: { ...prev.data },
          isDirty: false,
          lastSaved: result.timestamp,
          errors: {},
        }))
        
        if (!isAutoSave) {
          onSave?.(result)
        }
      } else {
        if (!isAutoSave) {
          onError?.(result.error || 'Erro ao salvar')
        }
      }

      return result
    } catch (error) {
      const result: SaveResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      }
      
      if (!isAutoSave) {
        onError?.(result.error!)
      }
      
      return result
    } finally {
      setState(prev => ({ ...prev, isSaving: false }))
    }
  }, [state.data, saveFunction, validate, onSave, onError])

  const cancel = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: { ...prev.originalData },
      isDirty: false,
      errors: {},
    }))
  }, [])

  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      data: { ...initialData },
      originalData: { ...initialData },
      isDirty: false,
      errors: {},
    }))
  }, [initialData])

  const setAutoSave = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, autoSaveEnabled: enabled }))
  }, [])

  const actions: ContentEditorActions<T> = {
    updateData,
    save: () => handleSave(false),
    cancel,
    reset,
    validate,
    setAutoSave,
  }

  return [state, actions]
}
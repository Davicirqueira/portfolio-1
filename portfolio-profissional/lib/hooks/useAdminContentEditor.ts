"use client"

import { z } from 'zod'
import { useContentEditor, type UseContentEditorOptions, type SaveResult } from './useContentEditor'
import { createZodValidator } from '@/lib/utils/validation'
import { useSuccessMessage } from '@/components/admin/ui/SuccessMessage'

interface UseAdminContentEditorOptions<T> extends Omit<UseContentEditorOptions<T>, 'validationSchema'> {
  validationSchema: z.ZodSchema<T>
  successMessage?: string
  errorMessage?: string
}

/**
 * Hook especializado para edição de conteúdo administrativo com validação Zod
 */
export function useAdminContentEditor<T extends Record<string, any>>({
  validationSchema,
  successMessage = 'Conteúdo salvo com sucesso!',
  errorMessage = 'Erro ao salvar conteúdo',
  ...options
}: UseAdminContentEditorOptions<T>) {
  const { showMessage } = useSuccessMessage()
  
  // Converte o schema Zod para o formato esperado pelo useContentEditor
  const zodValidator = createZodValidator(validationSchema)
  
  // Wrapper para a função de save que adiciona feedback visual
  const enhancedSaveFunction = async (data: T): Promise<SaveResult> => {
    try {
      const result = await options.saveFunction(data)
      
      if (result.success) {
        showMessage(successMessage, 'success')
      } else {
        showMessage(result.error || errorMessage, 'error')
      }
      
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : errorMessage
      showMessage(errorMsg, 'error')
      
      return {
        success: false,
        error: errorMsg,
        timestamp: new Date(),
      }
    }
  }

  const [state, actions] = useContentEditor({
    ...options,
    validationSchema: zodValidator,
    saveFunction: enhancedSaveFunction,
    onSave: (result) => {
      options.onSave?.(result)
    },
    onError: (error) => {
      showMessage(error, 'error')
      options.onError?.(error)
    },
  })

  // Função para validar um campo específico
  const validateField = (fieldName: keyof T, value: any) => {
    try {
      const fieldSchema = (validationSchema as any).shape?.[fieldName]
      if (!fieldSchema) return { isValid: true }
      
      fieldSchema.parse(value)
      return { isValid: true, error: undefined }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { isValid: false, error: error.errors[0]?.message }
      }
      return { isValid: false, error: 'Erro de validação' }
    }
  }

  // Função para limpar erros de um campo específico
  const clearFieldError = (fieldName: keyof T) => {
    const newErrors = { ...state.errors }
    delete newErrors[fieldName as string]
    // Atualizar o estado seria necessário se tivéssemos acesso ao setState
    // Por enquanto, retornamos os novos erros
    return newErrors
  }

  return {
    ...state,
    ...actions,
    validateField,
    clearFieldError,
    // Helpers adicionais
    hasError: (fieldName: keyof T) => Boolean(state.errors[fieldName as string]),
    getError: (fieldName: keyof T) => state.errors[fieldName as string]?.[0],
    getAllErrors: () => Object.values(state.errors).flat(),
    hasAnyError: () => Object.keys(state.errors).length > 0,
  }
}

/**
 * Hook para criar funções de save que fazem requisições para API routes
 */
export function useApiSaveFunction<T>(endpoint: string) {
  return async (data: T): Promise<SaveResult> => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: result,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      }
    }
  }
}

/**
 * Hook para criar funções de save que fazem requisições PUT para atualizar dados
 */
export function useApiUpdateFunction<T>(endpoint: string, id?: string) {
  return async (data: T): Promise<SaveResult> => {
    try {
      const url = id ? `${endpoint}/${id}` : endpoint
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      
      return {
        success: true,
        data: result,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      }
    }
  }
}
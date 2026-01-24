import { z } from 'zod'
import type { ValidationResult, ValidationErrors } from '@/lib/hooks/useContentEditor'

/**
 * Converte um schema Zod em uma função de validação compatível com useContentEditor
 */
export function createZodValidator<T>(schema: z.ZodSchema<T>) {
  return (data: T): ValidationResult => {
    try {
      schema.parse(data)
      return { isValid: true, errors: {} }
    } catch (error) {
      if (error instanceof z.ZodError && error.errors) {
        const errors: ValidationErrors = {}
        
        error.errors.forEach((err) => {
          const path = err.path.length > 0 ? err.path.join('.') : 'root'
          if (!errors[path]) {
            errors[path] = []
          }
          errors[path].push(err.message)
        })
        
        return { isValid: false, errors }
      }
      
      return { 
        isValid: false, 
        errors: { general: ['Erro de validação desconhecido'] } 
      }
    }
  }
}

/**
 * Extrai mensagens de erro de um objeto ValidationErrors
 */
export function getFieldError(errors: ValidationErrors, fieldName: string): string | undefined {
  const fieldErrors = errors[fieldName]
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined
}

/**
 * Verifica se um campo específico tem erros
 */
export function hasFieldError(errors: ValidationErrors, fieldName: string): boolean {
  return Boolean(errors[fieldName] && errors[fieldName].length > 0)
}

/**
 * Obtém todas as mensagens de erro como um array de strings
 */
export function getAllErrorMessages(errors: ValidationErrors): string[] {
  return Object.values(errors).flat()
}

/**
 * Verifica se há algum erro de validação
 */
export function hasAnyError(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0
}

/**
 * Formata erros para exibição em uma lista
 */
export function formatErrorsForDisplay(errors: ValidationErrors): { field: string; message: string }[] {
  const formattedErrors: { field: string; message: string }[] = []
  
  Object.entries(errors).forEach(([field, messages]) => {
    messages.forEach((message) => {
      formattedErrors.push({ field, message })
    })
  })
  
  return formattedErrors
}

/**
 * Limpa erros de campos específicos
 */
export function clearFieldErrors(errors: ValidationErrors, fieldNames: string[]): ValidationErrors {
  const newErrors = { ...errors }
  fieldNames.forEach((fieldName) => {
    delete newErrors[fieldName]
  })
  return newErrors
}

/**
 * Adiciona um erro customizado a um campo
 */
export function addFieldError(
  errors: ValidationErrors, 
  fieldName: string, 
  message: string
): ValidationErrors {
  return {
    ...errors,
    [fieldName]: [...(errors[fieldName] || []), message]
  }
}

/**
 * Valida um campo individual usando um schema parcial
 */
export function validateField<T>(
  schema: z.ZodSchema<T>,
  fieldName: keyof T,
  value: any
): { isValid: boolean; error?: string } {
  try {
    // Cria um schema parcial apenas para o campo específico
    const fieldSchema = schema.shape?.[fieldName as string]
    if (!fieldSchema) {
      return { isValid: true }
    }
    
    fieldSchema.parse(value)
    return { isValid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { isValid: false, error: firstError?.message }
    }
    return { isValid: false, error: 'Erro de validação' }
  }
}
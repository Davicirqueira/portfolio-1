/**
 * **Feature: admin-dashboard, Property 7: UI Feedback Consistency**
 * **Validates: Requirements 2.4, 12.2, 12.3, 12.4**
 * 
 * Property: For any user action (save, navigation, changes), the dashboard should 
 * provide immediate visual feedback, confirmation messages, and preserve unsaved 
 * changes during navigation
 */

import fc from 'fast-check'
import { renderHook, act } from '@testing-library/react'
import { useContentEditor } from '@/lib/hooks/useContentEditor'
import { useSuccessMessage } from '@/components/admin/ui/SuccessMessage'
import type { SaveResult } from '@/lib/hooks/useContentEditor'

describe('UI Feedback Consistency Property', () => {
  // Testa que mudanças nos dados sempre refletem no estado isDirty
  it('should provide immediate visual feedback for data changes', () => {
    const initialData = { name: 'João', email: 'joao@test.com' }
    const mockSave = jest.fn().mockResolvedValue({ 
      success: true, 
      timestamp: new Date() 
    })

    const { result } = renderHook(() =>
      useContentEditor({
        initialData,
        saveFunction: mockSave,
      })
    )

    // Estado inicial deve ser limpo
    expect(result.current[0].isDirty).toBe(false)

    // Mudança deve tornar o estado dirty
    act(() => {
      result.current[1].updateData({ name: 'João Silva' })
    })

    expect(result.current[0].isDirty).toBe(true)
    expect(result.current[0].data.name).toBe('João Silva')
  })

  // Testa que operações de save sempre fornecem feedback consistente
  it('should provide consistent save feedback', async () => {
    const initialData = { name: 'João', email: 'joao@test.com' }
    const mockSave = jest.fn().mockResolvedValue({ 
      success: true, 
      timestamp: new Date() 
    })

    const { result } = renderHook(() =>
      useContentEditor({
        initialData,
        saveFunction: mockSave,
      })
    )

    // Faz uma mudança
    act(() => {
      result.current[1].updateData({ name: 'João Silva' })
    })

    expect(result.current[0].isDirty).toBe(true)

    // Executa save
    await act(async () => {
      await result.current[1].save()
    })

    // Após save bem-sucedido, deve estar limpo
    expect(result.current[0].isDirty).toBe(false)
    expect(result.current[0].lastSaved).toBeDefined()
  })

  // Testa que cancelar sempre restaura o estado original
  it('should provide consistent cancel feedback', () => {
    const initialData = { name: 'João', email: 'joao@test.com' }
    const mockSave = jest.fn().mockResolvedValue({ 
      success: true, 
      timestamp: new Date() 
    })

    const { result } = renderHook(() =>
      useContentEditor({
        initialData,
        saveFunction: mockSave,
      })
    )

    // Faz mudanças
    act(() => {
      result.current[1].updateData({ name: 'João Silva', email: 'joao.silva@test.com' })
    })

    expect(result.current[0].isDirty).toBe(true)
    expect(result.current[0].data.name).toBe('João Silva')

    // Cancela mudanças
    act(() => {
      result.current[1].cancel()
    })

    // Deve voltar ao estado original
    expect(result.current[0].isDirty).toBe(false)
    expect(result.current[0].data).toEqual(initialData)
  })

  // Testa que reset sempre volta ao estado inicial
  it('should provide consistent reset feedback', () => {
    const initialData = { name: 'João', email: 'joao@test.com' }
    const mockSave = jest.fn().mockResolvedValue({ 
      success: true, 
      timestamp: new Date() 
    })

    const { result } = renderHook(() =>
      useContentEditor({
        initialData,
        saveFunction: mockSave,
      })
    )

    // Faz mudanças
    act(() => {
      result.current[1].updateData({ name: 'João Silva' })
    })

    // Reset
    act(() => {
      result.current[1].reset()
    })

    // Deve voltar ao estado inicial
    expect(result.current[0].isDirty).toBe(false)
    expect(result.current[0].data).toEqual(initialData)
    expect(result.current[0].originalData).toEqual(initialData)
  })

  // Testa que mensagens de sucesso funcionam consistentemente
  it('should handle success message feedback consistently', () => {
    const { result } = renderHook(() => useSuccessMessage())

    // Estado inicial
    expect(result.current.show).toBe(false)

    // Mostra mensagem
    act(() => {
      result.current.showMessage('Teste de sucesso', 'success')
    })

    expect(result.current.show).toBe(true)
    expect(result.current.message).toBe('Teste de sucesso')
    expect(result.current.variant).toBe('success')

    // Esconde mensagem
    act(() => {
      result.current.hideMessage()
    })

    expect(result.current.show).toBe(false)
  })

  // Property-based test para consistência de feedback
  it('should maintain consistent feedback patterns using property-based testing', () => {
    // Testa que qualquer mudança sempre resulta em isDirty = true
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
        }),
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
        }),
        (initialData, changedData) => {
          const mockSave = jest.fn().mockResolvedValue({ 
            success: true, 
            timestamp: new Date() 
          })

          const { result } = renderHook(() =>
            useContentEditor({
              initialData,
              saveFunction: mockSave,
            })
          )

          // Aplica mudanças
          act(() => {
            result.current[1].updateData(changedData)
          })

          // Se os dados mudaram, deve estar dirty
          const dataChanged = JSON.stringify(initialData) !== JSON.stringify({ ...initialData, ...changedData })
          expect(result.current[0].isDirty).toBe(dataChanged)

          // Dados devem refletir as mudanças
          expect(result.current[0].data).toEqual({ ...initialData, ...changedData })
        }
      ),
      { numRuns: 20 }
    )
  })
})
'use client'

import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  preventDefault?: boolean
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

export function useKeyboardShortcuts({
  shortcuts,
  enabled = true
}: UseKeyboardShortcutsOptions) {
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't trigger shortcuts when typing in inputs, textareas, or contenteditable elements
    const target = event.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true' ||
      target.isContentEditable
    ) {
      return
    }

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase()
      const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey
      const altMatches = !!shortcut.altKey === event.altKey
      const shiftMatches = !!shortcut.shiftKey === event.shiftKey
      const metaMatches = !!shortcut.metaKey === event.metaKey

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        shortcut.action()
        break
      }
    }
  }, [shortcuts, enabled])

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  // Helper function to format shortcut display
  const formatShortcut = useCallback((shortcut: KeyboardShortcut): string => {
    const parts: string[] = []
    
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.metaKey) parts.push('Cmd')
    if (shortcut.altKey) parts.push('Alt')
    if (shortcut.shiftKey) parts.push('Shift')
    
    parts.push(shortcut.key.toUpperCase())
    
    return parts.join(' + ')
  }, [])

  return {
    formatShortcut,
    shortcuts: shortcuts.map(shortcut => ({
      ...shortcut,
      formatted: formatShortcut(shortcut)
    }))
  }
}

// Common dashboard shortcuts
export const createDashboardShortcuts = (actions: {
  save?: () => void
  cancel?: () => void
  preview?: () => void
  refresh?: () => void
  newItem?: () => void
  search?: () => void
  help?: () => void
}): KeyboardShortcut[] => [
  {
    key: 's',
    ctrlKey: true,
    action: actions.save || (() => {}),
    description: 'Salvar alterações'
  },
  {
    key: 'Escape',
    action: actions.cancel || (() => {}),
    description: 'Cancelar/Fechar'
  },
  {
    key: 'p',
    ctrlKey: true,
    shiftKey: true,
    action: actions.preview || (() => {}),
    description: 'Visualizar preview'
  },
  {
    key: 'r',
    ctrlKey: true,
    action: actions.refresh || (() => {}),
    description: 'Atualizar dados'
  },
  {
    key: 'n',
    ctrlKey: true,
    action: actions.newItem || (() => {}),
    description: 'Novo item'
  },
  {
    key: 'f',
    ctrlKey: true,
    action: actions.search || (() => {}),
    description: 'Buscar'
  },
  {
    key: '?',
    shiftKey: true,
    action: actions.help || (() => {}),
    description: 'Mostrar atalhos'
  }
]
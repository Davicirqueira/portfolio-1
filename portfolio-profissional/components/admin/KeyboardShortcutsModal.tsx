'use client'

import React from 'react'
import { X, Keyboard } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'

interface KeyboardShortcut {
  key: string
  description: string
  formatted: string
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  shortcuts
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="w-full bg-background border shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Keyboard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Atalhos do Teclado</h2>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm text-foreground">
                      {shortcut.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {shortcut.formatted.split(' + ').map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <span className="text-xs text-muted-foreground mx-1">+</span>
                          )}
                          <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {shortcuts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Keyboard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum atalho disponível nesta página</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground text-center">
                Pressione <kbd className="px-1 py-0.5 text-xs bg-muted border rounded">?</kbd> para mostrar/ocultar esta janela
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { motion, AnimatePresence } from 'framer-motion'

interface SessionWarningModalProps {
  isOpen: boolean
  timeRemaining: number // in minutes
  onExtendSession: () => Promise<void>
  onLogout: () => Promise<void>
  onDismiss: () => void
}

export function SessionWarningModal({
  isOpen,
  timeRemaining,
  onExtendSession,
  onLogout,
  onDismiss
}: SessionWarningModalProps) {
  const [isExtending, setIsExtending] = useState(false)
  const [countdown, setCountdown] = useState(timeRemaining)

  // Update countdown every second
  useEffect(() => {
    if (!isOpen) return

    setCountdown(timeRemaining)
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        const newValue = prev - (1/60) // Decrease by 1 second (1/60 of a minute)
        return Math.max(0, newValue)
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isOpen, timeRemaining])

  const handleExtendSession = async () => {
    setIsExtending(true)
    try {
      await onExtendSession()
      onDismiss()
    } catch (error) {
      console.error('Failed to extend session:', error)
    } finally {
      setIsExtending(false)
    }
  }

  const formatTime = (minutes: number): string => {
    const mins = Math.floor(minutes)
    const secs = Math.floor((minutes - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

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
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md mx-4"
        >
          <Card className="w-full bg-background border-2 border-orange-200 shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 p-6 pb-4 border-b border-orange-100">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Sessão Expirando
                </h2>
                <p className="text-sm text-muted-foreground">
                  Sua sessão expirará em breve
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span className="text-2xl font-mono font-bold text-orange-600">
                    {formatTime(countdown)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua sessão será encerrada automaticamente por motivos de segurança.
                  Clique em "Estender Sessão" para continuar trabalhando.
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.max(0, (countdown / timeRemaining) * 100)}%`
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={handleExtendSession}
                  disabled={isExtending}
                  className="flex-1"
                >
                  {isExtending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Estendendo...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Estender Sessão
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={onLogout}
                  className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair Agora
                </Button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <div className="text-xs text-muted-foreground text-center bg-muted/30 rounded-lg p-3">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Por segurança, todas as alterações não salvas serão perdidas se a sessão expirar.
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
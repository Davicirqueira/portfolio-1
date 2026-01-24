"use client"

import { Check, X, AlertTriangle, Info } from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface SuccessMessageProps {
  message: string
  show: boolean
  onClose?: () => void
  autoHide?: boolean
  autoHideDelay?: number
  variant?: 'success' | 'error' | 'warning' | 'info'
  className?: string
}

export function SuccessMessage({
  message,
  show,
  onClose,
  autoHide = true,
  autoHideDelay = 3000,
  variant = 'success',
  className = '',
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(show)

  useEffect(() => {
    setIsVisible(show)
  }, [show])

  useEffect(() => {
    if (show && autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, autoHideDelay)

      return () => clearTimeout(timer)
    }
  }, [show, autoHide, autoHideDelay, onClose])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-900/90 border-green-500/50',
          text: 'text-green-100',
          icon: 'text-green-400',
          glow: 'shadow-green-500/25'
        }
      case 'error':
        return {
          bg: 'bg-red-900/90 border-red-500/50',
          text: 'text-red-100',
          icon: 'text-red-400',
          glow: 'shadow-red-500/25'
        }
      case 'warning':
        return {
          bg: 'bg-orange-900/90 border-orange-500/50',
          text: 'text-orange-100',
          icon: 'text-orange-400',
          glow: 'shadow-orange-500/25'
        }
      case 'info':
        return {
          bg: 'bg-blue-900/90 border-blue-500/50',
          text: 'text-blue-100',
          icon: 'text-blue-400',
          glow: 'shadow-blue-500/25'
        }
      default:
        return {
          bg: 'bg-green-900/90 border-green-500/50',
          text: 'text-green-100',
          icon: 'text-green-400',
          glow: 'shadow-green-500/25'
        }
    }
  }

  const getIcon = () => {
    const styles = getVariantStyles()
    const iconClass = `w-5 h-5 ${styles.icon}`
    
    switch (variant) {
      case 'success':
        return <Check className={iconClass} />
      case 'error':
        return <X className={iconClass} />
      case 'warning':
        return <AlertTriangle className={iconClass} />
      case 'info':
        return <Info className={iconClass} />
      default:
        return <Check className={iconClass} />
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 right-4 z-50 max-w-md w-full"
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.4
          }}
        >
          <motion.div
            className={`
              flex items-center gap-3 p-4 rounded-lg border backdrop-blur-md shadow-lg
              ${getVariantStyles().bg} ${getVariantStyles().text} ${getVariantStyles().glow}
              ${className}
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon with glow effect */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            >
              {getIcon()}
            </motion.div>
            
            {/* Message */}
            <div className="flex-1">
              <motion.p 
                className="text-sm font-medium"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                {message}
              </motion.p>
            </div>

            {/* Close button */}
            {onClose && (
              <motion.button
                onClick={handleClose}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Fechar mensagem"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            )}

            {/* Progress bar for auto-hide */}
            {autoHide && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoHideDelay / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para usar mensagens de sucesso
export function useSuccessMessage() {
  const [message, setMessage] = useState('')
  const [show, setShow] = useState(false)
  const [variant, setVariant] = useState<'success' | 'error' | 'warning' | 'info'>('success')

  const showMessage = (
    text: string, 
    messageVariant: 'success' | 'error' | 'warning' | 'info' = 'success'
  ) => {
    setMessage(text)
    setVariant(messageVariant)
    setShow(true)
  }

  const hideMessage = () => {
    setShow(false)
  }

  return {
    message,
    show,
    variant,
    showMessage,
    hideMessage,
  }
}
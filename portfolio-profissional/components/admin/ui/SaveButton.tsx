"use client"

import { Button } from "@/components/ui/Button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Check, Save } from "lucide-react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface SaveButtonProps {
  onClick: () => Promise<void> | void
  disabled?: boolean
  isLoading?: boolean
  isDirty?: boolean
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  showSuccessState?: boolean
  className?: string
  children?: React.ReactNode
}

export function SaveButton({
  onClick,
  disabled = false,
  isLoading = false,
  isDirty = false,
  variant = 'primary',
  size = 'md',
  showSuccessState = true,
  className = '',
  children,
}: SaveButtonProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Reset success state when isDirty changes
  useEffect(() => {
    if (isDirty && showSuccess) {
      setShowSuccess(false)
    }
  }, [isDirty, showSuccess])

  const handleClick = async () => {
    if (disabled || isLoading || isProcessing) return

    setIsProcessing(true)
    setShowSuccess(false)

    try {
      await onClick()
      
      if (showSuccessState) {
        setShowSuccess(true)
        // Auto-hide success state after 2 seconds
        setTimeout(() => setShowSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isButtonLoading = isLoading || isProcessing
  const isButtonDisabled = disabled || isButtonLoading || (!isDirty && !showSuccess)

  const getButtonContent = () => {
    if (isButtonLoading) {
      return (
        <>
          <LoadingSpinner size="sm" />
          <span>Salvando...</span>
        </>
      )
    }

    if (showSuccess && showSuccessState) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Salvo!</span>
        </>
      )
    }

    if (children) {
      return children
    }

    return (
      <>
        <Save className="w-4 h-4" />
        <span>Salvar</span>
      </>
    )
  }

  const getButtonStyles = () => {
    if (showSuccess) {
      return 'bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg shadow-green-600/25'
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary shadow-lg shadow-primary/25 hover:shadow-primary/40'
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
      case 'outline':
        return 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground'
      default:
        return 'bg-primary hover:bg-primary/90 text-primary-foreground border-primary'
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`
        relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getButtonStyles()}
        ${className}
      `}
      whileHover={!isButtonDisabled ? { 
        scale: 1.02,
        y: -1,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={!isButtonDisabled ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient overlay for hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 rounded-lg opacity-0"
        whileHover={!isButtonDisabled ? { opacity: 0.1 } : {}}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {getButtonContent()}
      </span>
      
      {/* Success glow effect */}
      {showSuccess && (
        <motion.div
          className="absolute inset-0 bg-green-500 rounded-lg blur-lg opacity-20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1.2, opacity: 0.2 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
    </motion.button>
  )
}
"use client"

import { Button } from "@/components/ui/Button"
import { X, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

interface CancelButtonProps {
  onClick: () => void
  disabled?: boolean
  isDirty?: boolean
  variant?: 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  showResetIcon?: boolean
  className?: string
  children?: React.ReactNode
  confirmReset?: boolean
}

export function CancelButton({
  onClick,
  disabled = false,
  isDirty = false,
  variant = 'outline',
  size = 'md',
  showResetIcon = true,
  className = '',
  children,
  confirmReset = true,
}: CancelButtonProps) {
  const handleClick = () => {
    if (disabled) return

    // Se há mudanças não salvas e confirmação está habilitada
    if (isDirty && confirmReset) {
      const confirmed = window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja descartar as mudanças?'
      )
      if (!confirmed) return
    }

    onClick()
  }

  const getButtonContent = () => {
    if (children) {
      return children
    }

    if (isDirty && showResetIcon) {
      return (
        <>
          <RotateCcw className="w-4 h-4" />
          <span>Descartar</span>
        </>
      )
    }

    return (
      <>
        <X className="w-4 h-4" />
        <span>Cancelar</span>
      </>
    )
  }

  const getButtonStyles = () => {
    if (isDirty) {
      return 'border-2 border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-white shadow-lg shadow-orange-400/25 hover:shadow-orange-400/40'
    }
    
    switch (variant) {
      case 'outline':
        return 'border-2 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
      case 'secondary':
        return 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border'
      case 'ghost':
        return 'text-muted-foreground hover:bg-muted hover:text-foreground'
      default:
        return 'border-2 border-border text-muted-foreground hover:bg-muted hover:text-foreground'
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled}
      className={`
        relative flex items-center gap-2 px-6 py-3 rounded-lg font-medium
        transition-all duration-300 ease-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getButtonStyles()}
        ${className}
      `}
      whileHover={!disabled ? { 
        scale: 1.02,
        y: -1,
        transition: { duration: 0.2, ease: "easeOut" }
      } : {}}
      whileTap={!disabled ? { 
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Gradient overlay for hover effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg opacity-0"
        whileHover={!disabled && isDirty ? { opacity: 0.1 } : {}}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {getButtonContent()}
      </span>
    </motion.button>
  )
}
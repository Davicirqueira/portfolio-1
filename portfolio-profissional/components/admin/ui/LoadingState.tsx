"use client"

import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { motion } from "framer-motion"

interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'overlay' | 'inline' | 'card'
  className?: string
  children?: React.ReactNode
}

export function LoadingState({
  message = 'Carregando...',
  size = 'md',
  variant = 'inline',
  className = '',
  children,
}: LoadingStateProps) {
  const getSpinnerSize = () => {
    switch (size) {
      case 'sm':
        return 'sm'
      case 'lg':
        return 'lg'
      default:
        return 'md'
    }
  }

  const getContainerStyles = () => {
    switch (variant) {
      case 'overlay':
        return `
          fixed inset-0 z-50 bg-background/80 backdrop-blur-md
          flex items-center justify-center
        `
      case 'card':
        return `
          bg-card/50 backdrop-blur-sm border border-border rounded-lg shadow-lg p-8
          flex flex-col items-center justify-center min-h-[200px]
        `
      default:
        return `
          flex items-center justify-center py-8
        `
    }
  }

  const getTextStyles = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-base'
    }
  }

  return (
    <motion.div 
      className={`${getContainerStyles()} ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <LoadingSpinner size={getSpinnerSize()} />
        </motion.div>
        
        {message && (
          <motion.p 
            className={`text-muted-foreground ${getTextStyles()}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {message}
          </motion.p>
        )}
        
        {children && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// Componente para loading de skeleton
export function SkeletonLoader({ 
  lines = 3, 
  className = '' 
}: { 
  lines?: number
  className?: string 
}) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={`
            h-4 bg-muted rounded
            ${index === lines - 1 ? 'w-3/4' : 'w-full'}
          `}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        />
      ))}
    </div>
  )
}

// Componente para loading de formulário
export function FormLoadingState({ 
  fields = 4,
  className = '' 
}: { 
  fields?: number
  className?: string 
}) {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <motion.div 
          key={index} 
          className="space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-10 bg-muted rounded w-full" />
        </motion.div>
      ))}
      
      <motion.div 
        className="flex gap-3 pt-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: fields * 0.1 }}
      >
        <div className="h-10 bg-muted rounded w-24" />
        <div className="h-10 bg-muted rounded w-24" />
      </motion.div>
    </div>
  )
}
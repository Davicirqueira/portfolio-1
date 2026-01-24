"use client"

import { SaveButton } from "./SaveButton"
import { CancelButton } from "./CancelButton"
import { SuccessMessage, useSuccessMessage } from "./SuccessMessage"
import { LoadingState } from "./LoadingState"
import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface AdminFormContainerProps {
  title: string
  description?: string
  isLoading?: boolean
  isSaving?: boolean
  isDirty?: boolean
  onSave: () => Promise<void> | void
  onCancel: () => void
  children: React.ReactNode
  className?: string
  showActions?: boolean
  customActions?: React.ReactNode
  loadingMessage?: string
}

export function AdminFormContainer({
  title,
  description,
  isLoading = false,
  isSaving = false,
  isDirty = false,
  onSave,
  onCancel,
  children,
  className = '',
  showActions = true,
  customActions,
  loadingMessage = 'Carregando dados...',
}: AdminFormContainerProps) {
  const { message, show, variant, hideMessage } = useSuccessMessage()

  if (isLoading) {
    return (
      <motion.div 
        className={`bg-card/50 backdrop-blur-sm border border-border rounded-lg shadow-lg ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <LoadingState 
          message={loadingMessage} 
          variant="card"
          size="lg"
        />
      </motion.div>
    )
  }

  return (
    <>
      <motion.div 
        className={`bg-card/50 backdrop-blur-sm border border-border rounded-lg shadow-lg ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </motion.div>
            
            {/* Status indicator */}
            {isDirty && (
              <motion.div 
                className="flex items-center gap-2 text-sm text-orange-400"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="w-2 h-2 bg-orange-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span>Alterações não salvas</span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Content */}
        <motion.div 
          className="p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          {children}
        </motion.div>

        {/* Actions */}
        {showActions && (
          <motion.div 
            className="border-t border-border px-6 py-4 bg-muted/30 rounded-b-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SaveButton
                  onClick={onSave}
                  isLoading={isSaving}
                  isDirty={isDirty}
                  disabled={!isDirty}
                />
                
                <CancelButton
                  onClick={onCancel}
                  isDirty={isDirty}
                  disabled={isSaving}
                />
              </div>

              {customActions && (
                <div className="flex items-center gap-3">
                  {customActions}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Success/Error Messages */}
      <SuccessMessage
        message={message}
        show={show}
        variant={variant}
        onClose={hideMessage}
      />
    </>
  )
}

// Componente para seções dentro do formulário
interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  collapsible?: boolean
  defaultExpanded?: boolean
}

export function FormSection({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultExpanded = true,
}: FormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <motion.div 
      className={`space-y-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="border-b border-border pb-2">
        <div className="flex items-center justify-between">
          <div>
            <motion.h3 
              className="text-lg font-medium text-foreground"
              whileHover={{ color: 'hsl(var(--primary))' }}
              transition={{ duration: 0.2 }}
            >
              {title}
            </motion.h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          {collapsible && (
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
              aria-label={isExpanded ? 'Recolher seção' : 'Expandir seção'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.button>
          )}
        </div>
      </div>

      {(!collapsible || isExpanded) && (
        <motion.div 
          className="space-y-6"
          initial={collapsible ? { opacity: 0, height: 0 } : { opacity: 1 }}
          animate={collapsible ? { opacity: 1, height: 'auto' } : { opacity: 1 }}
          exit={collapsible ? { opacity: 0, height: 0 } : {}}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  )
}
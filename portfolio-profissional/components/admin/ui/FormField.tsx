"use client"

import { forwardRef } from "react"
import { AlertCircle } from "lucide-react"
import { motion } from "framer-motion"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  description?: string
  className?: string
  children: React.ReactNode
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, required, description, className = '', children }, ref) => {
    return (
      <motion.div 
        ref={ref} 
        className={`space-y-2 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        
        {description && (
          <motion.p 
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {description}
          </motion.p>
        )}
        
        <div className="relative">
          {children}
        </div>
        
        {error && (
          <motion.div 
            className="flex items-center gap-2 text-sm text-red-400"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>
    )
  }
)

FormField.displayName = 'FormField'

// Componente Input com estilos consistentes
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <motion.input
        ref={ref}
        className={`
          w-full px-3 py-2 bg-background border rounded-md shadow-sm
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
          transition-all duration-200
          ${error 
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400 shadow-red-400/25' 
            : 'border-border hover:border-primary/50'
          }
          ${className}
        `}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

// Componente Textarea com estilos consistentes
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <motion.textarea
        ref={ref}
        className={`
          w-full px-3 py-2 bg-background border rounded-md shadow-sm resize-vertical
          text-foreground placeholder:text-muted-foreground
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
          transition-all duration-200
          ${error 
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400 shadow-red-400/25' 
            : 'border-border hover:border-primary/50'
          }
          ${className}
        `}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      />
    )
  }
)

Textarea.displayName = 'Textarea'

// Componente Select com estilos consistentes
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, options, placeholder, ...props }, ref) => {
    return (
      <motion.select
        ref={ref}
        className={`
          w-full px-3 py-2 bg-background border rounded-md shadow-sm
          text-foreground
          focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
          disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed
          transition-all duration-200
          ${error 
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400 shadow-red-400/25' 
            : 'border-border hover:border-primary/50'
          }
          ${className}
        `}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
    )
  }
)

Select.displayName = 'Select'

// Componente Checkbox com estilos consistentes
interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: boolean
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', error, label, ...props }, ref) => {
    return (
      <motion.div 
        className="flex items-center gap-2"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-4 h-4 text-primary bg-background border-border rounded
            focus:ring-primary focus:ring-2
            disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-red-400' : ''}
            ${className}
          `}
          {...props}
        />
        <label className="text-sm text-foreground cursor-pointer select-none">
          {label}
        </label>
      </motion.div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
"use client"

import { useRef, useState } from "react"
import { useMediaManager } from "@/lib/hooks/useMediaManager"
import { MediaCategory } from "@/lib/hooks/useMediaManager"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ImageUploaderProps {
  onUpload: (url: string) => void
  category: MediaCategory
  accept?: string
  maxSize?: number // em bytes
  children?: React.ReactNode
  className?: string
}

export function ImageUploader({
  onUpload,
  category,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por padrão
  children,
  className = "",
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>("")
  
  const { uploadFile, validateFile } = useMediaManager()

  const handleFileSelect = async (file: File) => {
    // Validar arquivo
    const validation = validateFile(file)
    if (!validation.isValid) {
      setErrorMessage(validation.error || "Arquivo inválido")
      setUploadStatus('error')
      return
    }

    // Verificar tamanho
    if (file.size > maxSize) {
      setErrorMessage(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`)
      setUploadStatus('error')
      return
    }

    setUploadStatus('uploading')
    setErrorMessage("")

    try {
      const mediaFile = await uploadFile(file, category)
      if (mediaFile) {
        setUploadStatus('success')
        onUpload(mediaFile.url)
        
        // Reset status após 2 segundos
        setTimeout(() => {
          setUploadStatus('idle')
        }, 2000)
      } else {
        throw new Error("Falha no upload")
      }
    } catch (error) {
      console.error("Erro no upload:", error)
      setErrorMessage("Erro ao fazer upload da imagem")
      setUploadStatus('error')
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragging(false)
    
    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Upload className="w-4 h-4" />
          </motion.div>
        )
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Upload className="w-4 h-4" />
    }
  }

  const getStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'Enviando...'
      case 'success':
        return 'Sucesso!'
      case 'error':
        return 'Erro'
      default:
        return null
    }
  }

  if (children) {
    return (
      <div className={className}>
        <div onClick={handleClick} className="cursor-pointer">
          {children}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />

        <AnimatePresence>
          {uploadStatus !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-2 flex items-center gap-2 text-sm"
            >
              {getStatusIcon()}
              <span className={
                uploadStatus === 'success' ? 'text-green-600' :
                uploadStatus === 'error' ? 'text-red-600' :
                'text-muted-foreground'
              }>
                {getStatusText()}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-600 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            {errorMessage}
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }
          ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-75' : ''}
        `}
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-muted">
            {getStatusIcon()}
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              {uploadStatus === 'uploading' 
                ? 'Enviando arquivo...' 
                : 'Clique para selecionar ou arraste uma imagem'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceitos: JPG, PNG, WebP (máx. {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence>
        {uploadStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-green-500/10 border-2 border-green-500 rounded-lg flex items-center justify-center"
          >
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Upload realizado com sucesso!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          {errorMessage}
        </motion.div>
      )}
    </div>
  )
}
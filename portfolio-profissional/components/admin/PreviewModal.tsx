'use client'

import React, { useState } from 'react'
import { 
  Eye, 
  ExternalLink, 
  X, 
  Monitor, 
  Tablet, 
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  previewData: any
  onPublish: () => Promise<void>
  onDiscard: () => void
  isPublishing?: boolean
  title?: string
}

type ViewportSize = 'desktop' | 'tablet' | 'mobile'

const viewportSizes = {
  desktop: { width: '100%', height: '100%', icon: Monitor, label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', icon: Tablet, label: 'Tablet' },
  mobile: { width: '375px', height: '667px', icon: Smartphone, label: 'Mobile' }
}

export function PreviewModal({
  isOpen,
  onClose,
  previewData,
  onPublish,
  onDiscard,
  isPublishing = false,
  title = 'Visualizar Alterações'
}: PreviewModalProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop')
  const [isLoading, setIsLoading] = useState(true)

  const previewUrl = `/preview?data=${encodeURIComponent(JSON.stringify(previewData))}&timestamp=${Date.now()}`

  const handlePublish = async () => {
    try {
      await onPublish()
      onClose()
    } catch (error) {
      console.error('Error publishing changes:', error)
    }
  }

  const handleDiscard = () => {
    onDiscard()
    onClose()
  }

  const openInNewTab = () => {
    window.open(previewUrl, '_blank', 'width=1200,height=800')
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
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full max-w-7xl max-h-[90vh] m-4"
        >
          <Card className="w-full h-full flex flex-col bg-background border shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>

              <div className="flex items-center gap-2">
                {/* Viewport Controls */}
                <div className="flex items-center gap-1 bg-background border rounded-lg p-1">
                  {Object.entries(viewportSizes).map(([size, config]) => {
                    const Icon = config.icon
                    return (
                      <Button
                        key={size}
                        size="sm"
                        variant={viewport === size ? 'default' : 'ghost'}
                        onClick={() => setViewport(size as ViewportSize)}
                        className="px-2 py-1"
                        title={config.label}
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    )
                  })}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={openInNewTab}
                  title="Abrir em nova aba"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
              <div 
                className={cn(
                  "bg-white border shadow-lg transition-all duration-300",
                  viewport === 'desktop' && "w-full h-full",
                  viewport === 'tablet' && "w-[768px] h-[1024px] max-w-full max-h-full",
                  viewport === 'mobile' && "w-[375px] h-[667px] max-w-full max-h-full"
                )}
                style={{
                  width: viewport !== 'desktop' ? viewportSizes[viewport].width : '100%',
                  height: viewport !== 'desktop' ? viewportSizes[viewport].height : '100%'
                }}
              >
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  onLoad={() => setIsLoading(false)}
                  title="Preview"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-muted/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                <span>Esta é uma visualização das suas alterações. Publique para aplicar ao site.</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={isPublishing}
                >
                  Descartar
                </Button>
                
                <Button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="min-w-[100px]"
                >
                  {isPublishing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Publicar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
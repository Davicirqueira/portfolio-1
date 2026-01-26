'use client'

import React, { useState } from 'react'
import { 
  Trash2, 
  Archive, 
  Download, 
  Edit, 
  X, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Play,
  Pause
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useBulkOperations } from '@/lib/hooks/useBulkOperations'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BulkOperationsPanelProps {
  selectedItems: string[]
  itemType: string
  onClearSelection: () => void
  onRefresh?: () => void
  className?: string
}

export function BulkOperationsPanel({
  selectedItems,
  itemType,
  onClearSelection,
  onRefresh,
  className
}: BulkOperationsPanelProps) {
  const {
    operations,
    isRunning,
    startBulkDelete,
    startBulkArchive,
    startBulkExport,
    cancelOperation,
    clearCompletedOperations
  } = useBulkOperations()

  const [showOperations, setShowOperations] = useState(false)

  const handleBulkDelete = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedItems.length} item(s)? Esta ação não pode ser desfeita.`
    )
    
    if (!confirmed) return

    const success = await startBulkDelete(selectedItems, itemType, {
      onComplete: () => {
        onClearSelection()
        onRefresh?.()
      }
    })

    if (success) {
      setShowOperations(true)
    }
  }

  const handleBulkArchive = async (archived: boolean) => {
    const action = archived ? 'arquivar' : 'desarquivar'
    const confirmed = window.confirm(
      `Tem certeza que deseja ${action} ${selectedItems.length} item(s)?`
    )
    
    if (!confirmed) return

    const success = await startBulkArchive(selectedItems, archived, itemType, {
      onComplete: () => {
        onClearSelection()
        onRefresh?.()
      }
    })

    if (success) {
      setShowOperations(true)
    }
  }

  const handleBulkExport = async (format: 'json' | 'csv') => {
    const success = await startBulkExport(selectedItems, itemType, format, {
      onComplete: () => {
        onClearSelection()
      }
    })

    if (success) {
      setShowOperations(true)
    }
  }

  const getOperationIcon = (type: string, status: string) => {
    if (status === 'running') return <Clock className="w-4 h-4 animate-spin" />
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-600" />
    if (status === 'failed') return <AlertCircle className="w-4 h-4 text-red-600" />
    
    switch (type) {
      case 'delete': return <Trash2 className="w-4 h-4" />
      case 'archive': return <Archive className="w-4 h-4" />
      case 'export': return <Download className="w-4 h-4" />
      default: return <Edit className="w-4 h-4" />
    }
  }

  const formatOperationType = (type: string) => {
    switch (type) {
      case 'delete': return 'Exclusão'
      case 'archive': return 'Arquivamento'
      case 'export': return 'Exportação'
      case 'update': return 'Atualização'
      default: return type
    }
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000)
    
    if (duration < 60) return `${duration}s`
    const minutes = Math.floor(duration / 60)
    const seconds = duration % 60
    return `${minutes}m ${seconds}s`
  }

  if (selectedItems.length === 0 && operations.length === 0) {
    return null
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">
                    {selectedItems.length} item(s) selecionado(s)
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkArchive(true)}
                    disabled={isRunning}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Arquivar
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkExport('json')}
                    disabled={isRunning}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportar JSON
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkExport('csv')}
                    disabled={isRunning}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportar CSV
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    disabled={isRunning}
                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onClearSelection}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Operations Panel */}
      <AnimatePresence>
        {operations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Operações em Lote</h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearCompletedOperations}
                  >
                    Limpar Concluídas
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowOperations(!showOperations)}
                  >
                    {showOperations ? 'Ocultar' : 'Mostrar'}
                  </Button>
                </div>
              </div>

              <AnimatePresence>
                {showOperations && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 max-h-64 overflow-y-auto"
                  >
                    {operations.map((operation) => (
                      <div
                        key={operation.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex-shrink-0">
                          {getOperationIcon(operation.type, operation.status)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              {formatOperationType(operation.type)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(operation.startTime, operation.endTime)}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-muted rounded-full h-2">
                              <div
                                className={cn(
                                  "h-2 rounded-full transition-all duration-300",
                                  operation.status === 'completed' && "bg-green-500",
                                  operation.status === 'failed' && "bg-red-500",
                                  operation.status === 'running' && "bg-blue-500",
                                  operation.status === 'pending' && "bg-gray-400"
                                )}
                                style={{ width: `${operation.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground min-w-0">
                              {operation.progress}%
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {operation.completed}/{operation.total} concluídos
                              {operation.failed > 0 && ` • ${operation.failed} falharam`}
                            </span>
                            
                            {operation.status === 'running' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelOperation(operation.id)}
                                className="h-6 px-2"
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
                          
                          {operation.error && (
                            <p className="text-xs text-red-600 mt-1">
                              {operation.error}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
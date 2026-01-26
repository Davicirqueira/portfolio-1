'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  RefreshCw, 
  Archive,
  HardDrive,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  X
} from 'lucide-react';
import { useMediaManager } from '@/lib/hooks/useMediaManager';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaCleanupProps {
  className?: string;
}

interface CleanupStats {
  totalFiles: number;
  totalSize: number;
  unusedFiles: number;
  unusedSize: number;
  archivedFiles: number;
  archivedSize: number;
  byCategory: {
    profile: { count: number; size: number };
    project: { count: number; size: number };
    general: { count: number; size: number };
  };
}

export function MediaCleanup({ className }: MediaCleanupProps) {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUnusedFiles, setSelectedUnusedFiles] = useState<string[]>([]);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { 
    mediaFiles, 
    getUnusedMedia, 
    getStorageStats, 
    bulkDeleteFiles, 
    bulkArchiveFiles,
    refreshMedia 
  } = useMediaManager();

  // Calculate cleanup statistics
  useEffect(() => {
    if (mediaFiles.length > 0) {
      const unusedFiles = getUnusedMedia();
      const archivedFiles = mediaFiles.filter(file => file.isArchived);
      const storageStats = getStorageStats();

      const cleanupStats: CleanupStats = {
        totalFiles: storageStats.totalFiles,
        totalSize: storageStats.totalSize,
        unusedFiles: unusedFiles.length,
        unusedSize: unusedFiles.reduce((sum, file) => sum + file.size, 0),
        archivedFiles: archivedFiles.length,
        archivedSize: archivedFiles.reduce((sum, file) => sum + file.size, 0),
        byCategory: storageStats.byCategory,
      };

      setStats(cleanupStats);
      setIsLoading(false);
    }
  }, [mediaFiles, getUnusedMedia, getStorageStats]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelectAllUnused = () => {
    const unusedFiles = getUnusedMedia();
    const unusedIds = unusedFiles.map(file => file.id);
    
    if (selectedUnusedFiles.length === unusedIds.length) {
      setSelectedUnusedFiles([]);
    } else {
      setSelectedUnusedFiles(unusedIds);
    }
  };

  const handleDeleteUnused = async () => {
    if (selectedUnusedFiles.length === 0) return;

    setIsCleaningUp(true);
    try {
      await bulkDeleteFiles(selectedUnusedFiles);
      setSelectedUnusedFiles([]);
      setShowConfirmation(false);
      await refreshMedia();
    } catch (error) {
      console.error('Error deleting unused files:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleArchiveUnused = async () => {
    if (selectedUnusedFiles.length === 0) return;

    setIsCleaningUp(true);
    try {
      await bulkArchiveFiles(selectedUnusedFiles, true);
      setSelectedUnusedFiles([]);
      await refreshMedia();
    } catch (error) {
      console.error('Error archiving unused files:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const unusedFiles = getUnusedMedia();

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-muted-foreground">Não foi possível carregar as estatísticas</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Limpeza de Mídia</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie e otimize o armazenamento de mídia
          </p>
        </div>
        <Button onClick={() => refreshMedia()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Arquivos</p>
              <p className="text-lg font-semibold">{stats.totalFiles}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(stats.totalSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arquivos Não Usados</p>
              <p className="text-lg font-semibold">{stats.unusedFiles}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(stats.unusedSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Archive className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Arquivos Arquivados</p>
              <p className="text-lg font-semibold">{stats.archivedFiles}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(stats.archivedSize)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Espaço Recuperável</p>
              <p className="text-lg font-semibold">
                {formatFileSize(stats.unusedSize + stats.archivedSize)}
              </p>
              <p className="text-xs text-muted-foreground">
                {((stats.unusedSize + stats.archivedSize) / stats.totalSize * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Distribuição por Categoria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.byCategory).map(([category, data]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                <span className="capitalize font-medium">{category}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{data.count} arquivos</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(data.size)}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Unused Files Management */}
      {stats.unusedFiles > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-medium">Arquivos Não Utilizados</h3>
              <p className="text-sm text-muted-foreground">
                {stats.unusedFiles} arquivos não estão sendo usados no portfólio
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSelectAllUnused}
              >
                {selectedUnusedFiles.length === unusedFiles.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {unusedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedUnusedFiles.includes(file.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedUnusedFiles(prev => [...prev, file.id]);
                    } else {
                      setSelectedUnusedFiles(prev => prev.filter(id => id !== file.id));
                    }
                  }}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                />
                
                <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={file.url}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {file.category} • {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {selectedUnusedFiles.length > 0 && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedUnusedFiles.length} arquivo(s) selecionado(s)
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleArchiveUnused}
                    disabled={isCleaningUp}
                  >
                    <Archive className="w-4 h-4 mr-1" />
                    Arquivar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmation(true)}
                    disabled={isCleaningUp}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Confirmar Exclusão</h3>
                  <p className="text-sm text-muted-foreground">
                    Esta ação não pode ser desfeita
                  </p>
                </div>
              </div>
              
              <p className="text-sm mb-6">
                Tem certeza que deseja excluir permanentemente {selectedUnusedFiles.length} arquivo(s)? 
                Isso liberará aproximadamente {formatFileSize(
                  unusedFiles
                    .filter(file => selectedUnusedFiles.includes(file.id))
                    .reduce((sum, file) => sum + file.size, 0)
                )} de espaço.
              </p>
              
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isCleaningUp}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDeleteUnused}
                  disabled={isCleaningUp}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isCleaningUp ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Arquivos
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
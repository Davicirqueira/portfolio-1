'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Trash2, 
  Search, 
  Filter, 
  Grid, 
  List,
  Download,
  Eye,
  Copy,
  CheckCircle,
  Tag,
  FolderOpen,
  MoreVertical,
  Edit,
  Archive,
  RefreshCw,
  AlertTriangle,
  X
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { useMediaManager, MediaCategory } from '@/lib/hooks/useMediaManager';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  category: MediaCategory;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  usedIn?: string[];
  isArchived?: boolean;
}

interface MediaLibraryProps {
  onImageSelect?: (imageUrl: string) => void;
  selectedImages?: string[];
  allowMultiSelect?: boolean;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowBulkOperations?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const categoryOptions = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'profile', label: 'Perfil' },
  { value: 'project', label: 'Projetos' },
  { value: 'general', label: 'Geral' }
];

const sortOptions = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'oldest', label: 'Mais Antigos' },
  { value: 'name', label: 'Nome A-Z' },
  { value: 'size', label: 'Tamanho' },
  { value: 'usage', label: 'Mais Usados' }
];

export function MediaLibrary({
  onImageSelect,
  selectedImages = [],
  allowMultiSelect = false,
  allowUpload = true,
  allowDelete = true,
  allowBulkOperations = true,
  viewMode: initialViewMode = 'grid',
  className
}: MediaLibraryProps) {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>(selectedImages);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [showUploader, setShowUploader] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string>('');
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { 
    mediaFiles: hookMediaFiles, 
    isLoading: hookLoading, 
    error,
    deleteMediaFile,
    refreshMedia,
    validateFile
  } = useMediaManager();

  // Sync with hook data
  useEffect(() => {
    setMediaFiles(hookMediaFiles);
    setIsLoading(hookLoading);
  }, [hookMediaFiles, hookLoading]);

  // Filter and sort files
  useEffect(() => {
    let filtered = [...mediaFiles];

    // Filter by archived status
    if (!showArchived) {
      filtered = filtered.filter(file => !file.isArchived);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(file => file.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file =>
        file.filename.toLowerCase().includes(query) ||
        file.originalName.toLowerCase().includes(query) ||
        file.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        file.usedIn?.some(usage => usage.toLowerCase().includes(query))
      );
    }

    // Sort files
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name':
          return a.originalName.localeCompare(b.originalName);
        case 'size':
          return b.size - a.size;
        case 'usage':
          return (b.usedIn?.length || 0) - (a.usedIn?.length || 0);
        default:
          return 0;
      }
    });

    setFilteredFiles(filtered);
  }, [mediaFiles, selectedCategory, searchQuery, sortBy, showArchived]);

  const handleFileSelect = useCallback((fileUrl: string) => {
    if (allowMultiSelect) {
      setSelectedFiles(prev => {
        const isSelected = prev.includes(fileUrl);
        if (isSelected) {
          return prev.filter(url => url !== fileUrl);
        } else {
          return [...prev, fileUrl];
        }
      });
    } else {
      setSelectedFiles([fileUrl]);
      if (onImageSelect) {
        onImageSelect(fileUrl);
      }
    }
  }, [allowMultiSelect, onImageSelect]);

  const handleBulkDelete = useCallback(async () => {
    if (!allowDelete || selectedFiles.length === 0) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja remover ${selectedFiles.length} arquivo(s)?`
    );
    if (!confirmed) return;

    try {
      const filesToDelete = mediaFiles.filter(file => selectedFiles.includes(file.url));
      
      for (const file of filesToDelete) {
        await deleteMediaFile(file.id);
      }

      setSelectedFiles([]);
      setBulkActionMode(false);
      await refreshMedia();
    } catch (error) {
      console.error('Error in bulk delete:', error);
    }
  }, [allowDelete, selectedFiles, mediaFiles, deleteMediaFile, refreshMedia]);

  const handleBulkArchive = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    // In a real implementation, this would call an API to archive files
    console.log('Archiving files:', selectedFiles);
    
    setSelectedFiles([]);
    setBulkActionMode(false);
  }, [selectedFiles]);

  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredFiles.map((file) => (
        <motion.div
          key={file.id}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="group relative overflow-hidden p-2 hover:shadow-lg transition-shadow">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
              <img
                src={file.url}
                alt={file.originalName}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              
              {/* Selection overlay */}
              {selectedFiles.includes(file.url) && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg" />
              )}

              {/* Archived indicator */}
              {file.isArchived && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Arquivado
                </div>
              )}

              {/* Usage indicator */}
              {file.usedIn && file.usedIn.length > 0 && (
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  {file.usedIn.length}
                </div>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFileSelect(file.url)}
                    className="bg-white/90 hover:bg-white text-black p-1"
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyUrl(file.url)}
                    className="bg-white/90 hover:bg-white text-black p-1"
                  >
                    {copiedUrl === file.url ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                  {allowDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMediaFile(file.id)}
                      className="bg-red-500/90 hover:bg-red-500 text-white border-red-500 p-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Multi-select checkbox */}
              {(allowMultiSelect || bulkActionMode) && (
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.url)}
                    onChange={() => handleFileSelect(file.url)}
                    className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-2 space-y-1">
              <p className="text-xs font-medium text-foreground truncate" title={file.originalName}>
                {file.originalName}
              </p>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{formatFileSize(file.size)}</span>
                <span className="capitalize">{file.category}</span>
              </div>
              {file.tags && file.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {file.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="text-xs bg-muted px-1 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                  {file.tags.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{file.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredFiles.map((file) => (
        <motion.div
          key={file.id}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              {/* Multi-select checkbox */}
              {(allowMultiSelect || bulkActionMode) && (
                <input
                  type="checkbox"
                  checked={selectedFiles.includes(file.url)}
                  onChange={() => handleFileSelect(file.url)}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary"
                />
              )}

              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={file.url}
                  alt={file.originalName}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-foreground truncate">{file.originalName}</h3>
                  {file.isArchived && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                      Arquivado
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {file.category} • {formatFileSize(file.size)} • {file.mimeType}
                </p>
                <p className="text-xs text-muted-foreground">
                  Criado em {formatDate(file.createdAt)}
                </p>
                {file.usedIn && file.usedIn.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Usado em: {file.usedIn.join(', ')}
                  </p>
                )}
                {file.tags && file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {file.tags.map((tag, index) => (
                      <span key={index} className="text-xs bg-muted px-2 py-1 rounded">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFileSelect(file.url)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Selecionar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(file.url)}
                >
                  {copiedUrl === file.url ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                {allowDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMediaFile(file.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Biblioteca de Mídia</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas imagens e arquivos de mídia de forma centralizada
          </p>
        </div>
        
        <div className="flex gap-2">
          {allowBulkOperations && (
            <Button
              variant={bulkActionMode ? "default" : "outline"}
              onClick={() => setBulkActionMode(!bulkActionMode)}
            >
              {bulkActionMode ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Seleção Múltipla
                </>
              )}
            </Button>
          )}
          
          <Button onClick={() => refreshMedia()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          
          {allowUpload && (
            <Button onClick={() => setShowUploader(!showUploader)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {/* Upload Section */}
      <AnimatePresence>
        {showUploader && allowUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <ImageUploader
                onUpload={(url) => {
                  refreshMedia();
                  setShowUploader(false);
                }}
                category="general"
              />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        {bulkActionMode && selectedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedFiles.length} arquivo(s) selecionado(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                  <Archive className="w-4 h-4 mr-1" />
                  Arquivar
                </Button>
                {allowDelete && (
                  <Button size="sm" variant="outline" onClick={handleBulkDelete}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nome, tags ou uso..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
          
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          />
          
          <Button
            size="sm"
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="w-4 h-4 mr-1" />
            {showArchived ? 'Ocultar Arquivados' : 'Mostrar Arquivados'}
          </Button>
          
          <div className="flex border border-border rounded-lg">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </Card>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-medium text-foreground mb-2">
            Nenhuma imagem encontrada
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros de busca'
              : 'Faça upload da primeira imagem para começar'
            }
          </p>
          {allowUpload && !showUploader && (
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload de Imagem
            </Button>
          )}
        </Card>
      ) : (
        <div>
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {filteredFiles.length} de {mediaFiles.length} arquivo(s)
          </div>
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </div>
      )}
    </div>
  );
}
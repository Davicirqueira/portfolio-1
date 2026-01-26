'use client';

import React, { useState, useEffect } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/utils';

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  category: string;
  size: number;
  type: string;
  uploadedAt: string;
  usedIn?: string[];
}

interface MediaManagerProps {
  onImageSelect?: (imageUrl: string) => void;
  selectedImage?: string;
  category?: 'profile' | 'project' | 'general' | 'all';
  allowUpload?: boolean;
  allowDelete?: boolean;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const categoryOptions = [
  { value: 'all', label: 'Todas as Categorias' },
  { value: 'profile', label: 'Perfil' },
  { value: 'project', label: 'Projetos' },
  { value: 'general', label: 'Geral' }
];

export function MediaManager({
  onImageSelect,
  selectedImage,
  category = 'all',
  allowUpload = true,
  allowDelete = true,
  viewMode: initialViewMode = 'grid',
  className
}: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [viewMode, setViewMode] = useState(initialViewMode);
  const [showUploader, setShowUploader] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string>('');

  const { uploadImage, removeImage, isUploading, error, clearError } = useImageUpload();

  // Load media items
  useEffect(() => {
    loadMediaItems();
  }, []);

  // Filter items based on search and category
  useEffect(() => {
    let filtered = mediaItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.filename.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    setFilteredItems(filtered);
  }, [mediaItems, selectedCategory, searchQuery]);

  const loadMediaItems = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from an API
      // For now, we'll simulate with empty data
      setMediaItems([]);
    } catch (error) {
      console.error('Error loading media items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImage(file, {
        category: selectedCategory === 'all' ? 'general' : selectedCategory as any
      });
      
      // Reload media items
      await loadMediaItems();
      
      // Select the uploaded image if callback provided
      if (onImageSelect) {
        onImageSelect(imageUrl);
      }
      
      setShowUploader(false);
      return imageUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleImageDelete = async (item: MediaItem) => {
    if (!allowDelete) return;
    
    const confirmed = window.confirm(`Tem certeza que deseja remover "${item.filename}"?`);
    if (!confirmed) return;

    try {
      await removeImage(item.filename, item.category);
      await loadMediaItems();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    if (onImageSelect) {
      onImageSelect(imageUrl);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {filteredItems.map((item) => (
        <Card key={item.id} className="group relative overflow-hidden p-2">
          <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
            <img
              src={item.url}
              alt={item.filename}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            
            {/* Selection indicator */}
            {selectedImage === item.url && (
              <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg" />
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImageSelect(item.url)}
                  className="bg-white/90 hover:bg-white text-black p-1"
                >
                  <Eye className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(item.url)}
                  className="bg-white/90 hover:bg-white text-black p-1"
                >
                  {copiedUrl === item.url ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                {allowDelete && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImageDelete(item)}
                    className="bg-red-500/90 hover:bg-red-500 text-white border-red-500 p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-2 space-y-1">
            <p className="text-xs font-medium text-foreground truncate" title={item.filename}>
              {item.filename}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(item.size)}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-2">
      {filteredItems.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <img
                src={item.url}
                alt={item.filename}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{item.filename}</h3>
              <p className="text-sm text-muted-foreground">
                {item.category} • {formatFileSize(item.size)} • {item.type}
              </p>
              {item.usedIn && item.usedIn.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Usado em: {item.usedIn.join(', ')}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleImageSelect(item.url)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Selecionar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyUrl(item.url)}
              >
                {copiedUrl === item.url ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              {allowDelete && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImageDelete(item)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Gerenciador de Mídia</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie suas imagens e arquivos de mídia
          </p>
        </div>
        
        {allowUpload && (
          <Button onClick={() => setShowUploader(!showUploader)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload de Imagem
          </Button>
        )}
      </div>

      {/* Upload Section */}
      {showUploader && allowUpload && (
        <Card padding="lg">
          <ImageUploader
            onImageUpload={handleImageUpload}
            label="Nova Imagem"
            description="Arraste e solte uma imagem ou clique para selecionar"
          />
        </Card>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar imagens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
          
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length === 0 ? (
        <Card padding="lg" className="text-center">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhuma imagem encontrada
          </h3>
          <p className="text-muted-foreground mb-4">
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
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </div>
      )}
    </div>
  );
}
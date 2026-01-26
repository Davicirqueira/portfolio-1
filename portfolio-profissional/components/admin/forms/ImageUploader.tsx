'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { optimizeImage, validateImageFile } from '@/lib/utils/imageOptimization';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ImageUploaderProps {
  currentImage?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  label?: string;
  description?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  disabled?: boolean;
}

const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DEFAULT_MAX_SIZE = 5; // 5MB

export function ImageUploader({
  currentImage,
  onImageUpload,
  onImageRemove,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  maxSize = DEFAULT_MAX_SIZE,
  className,
  label = 'Upload de Imagem',
  description = 'Arraste e solte uma imagem ou clique para selecionar',
  aspectRatio = 'auto',
  disabled = false
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateFile = useCallback(async (file: File): Promise<string | null> => {
    const validation = await validateImageFile(file, {
      maxSize: maxSize * 1024 * 1024,
      allowedFormats: SUPPORTED_FORMATS
    });

    if (!validation.valid) {
      return validation.errors[0];
    }

    return null;
  }, [maxSize]);

  const createPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
        setShowPreview(true);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileSelect = useCallback(async (file: File) => {
    setUploadError('');
    
    const error = await validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setSelectedFile(file);
    createPreview(file);
  }, [validateFile, createPreview]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounterRef.current = 0;

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUploadConfirm = useCallback(async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError('');

    try {
      // Optimize image before upload
      const optimizedBlob = await optimizeImage(selectedFile, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.9
      });

      // Convert blob to file
      const optimizedFile = new File([optimizedBlob], selectedFile.name, {
        type: optimizedBlob.type
      });

      const imageUrl = await onImageUpload(optimizedFile);
      setShowPreview(false);
      setSelectedFile(null);
      setPreviewUrl('');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erro ao fazer upload da imagem');
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, onImageUpload]);

  const handleUploadCancel = useCallback(() => {
    setShowPreview(false);
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadError('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleRemoveImage = useCallback(async () => {
    if (!onImageRemove) return;

    setIsUploading(true);
    setUploadError('');

    try {
      await onImageRemove();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Erro ao remover imagem');
    } finally {
      setIsUploading(false);
    }
  }, [onImageRemove]);

  const openFileDialog = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label}
        </label>
      )}

      {/* Current Image Display */}
      {currentImage && !showPreview && (
        <div className="relative group">
          <div className={cn(
            'relative overflow-hidden rounded-lg border border-border bg-muted',
            getAspectRatioClass()
          )}>
            <img
              src={currentImage}
              alt="Current image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={openFileDialog}
                  disabled={disabled || isUploading}
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Upload className="w-4 h-4 mr-1" />
                  Alterar
                </Button>
                {onImageRemove && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleRemoveImage}
                    disabled={disabled || isUploading}
                    className="bg-red-500/90 hover:bg-red-500 text-white border-red-500"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remover
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!currentImage && !showPreview && (
        <div
          className={cn(
            'relative border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            disabled && 'opacity-50 cursor-not-allowed',
            getAspectRatioClass()
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isDragging ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            )}>
              <ImageIcon className="w-6 h-6" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {description}
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WebP até {maxSize}MB
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={disabled}
              className="mt-4"
            >
              <Upload className="w-4 h-4 mr-2" />
              Selecionar Arquivo
            </Button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="space-y-4">
          <div className="relative">
            <div className={cn(
              'relative overflow-hidden rounded-lg border border-border',
              getAspectRatioClass()
            )}>
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              onClick={handleUploadConfirm}
              disabled={isUploading}
              className="flex-1 sm:flex-none"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fazendo Upload...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Upload
                </>
              )}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleUploadCancel}
              disabled={isUploading}
              className="flex-1 sm:flex-none"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            {uploadError}
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
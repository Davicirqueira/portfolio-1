'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Crop, RotateCcw, ZoomIn, ZoomOut, Move, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageUrl: string;
  aspectRatio?: number; // width/height ratio, e.g., 1 for square, 16/9 for landscape
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  className?: string;
}

export function ImageCropper({
  imageUrl,
  aspectRatio,
  onCropComplete,
  onCancel,
  className
}: ImageCropperProps) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [imageRotation, setImageRotation] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - cropArea.x,
      y: e.clientY - cropArea.y
    });
  }, [cropArea]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newX = Math.max(0, Math.min(e.clientX - dragStart.x - containerRect.left, containerRect.width - cropArea.width));
    const newY = Math.max(0, Math.min(e.clientY - dragStart.y - containerRect.top, containerRect.height - cropArea.height));

    setCropArea(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  }, [isDragging, dragStart, cropArea.width, cropArea.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoomIn = useCallback(() => {
    setImageScale(prev => Math.min(prev + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setImageScale(prev => Math.max(prev - 0.1, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setImageRotation(prev => (prev + 90) % 360);
  }, []);

  const handleCropConfirm = useCallback(async () => {
    if (!canvasRef.current || !imageRef.current) return;

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const image = imageRef.current;
      
      // Set canvas size to crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Apply transformations
      ctx.save();
      
      // Translate to center for rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((imageRotation * Math.PI) / 180);
      ctx.scale(imageScale, imageScale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Draw the cropped portion of the image
      ctx.drawImage(
        image,
        cropArea.x / imageScale,
        cropArea.y / imageScale,
        cropArea.width / imageScale,
        cropArea.height / imageScale,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      ctx.restore();

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      }, 'image/jpeg', 0.9);

    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [cropArea, imageScale, imageRotation, onCropComplete]);

  const updateCropArea = useCallback(() => {
    if (!containerRef.current || !aspectRatio) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    let newWidth, newHeight;

    if (aspectRatio > 1) {
      // Landscape
      newWidth = Math.min(containerWidth * 0.8, 400);
      newHeight = newWidth / aspectRatio;
    } else {
      // Portrait or square
      newHeight = Math.min(containerHeight * 0.8, 400);
      newWidth = newHeight * aspectRatio;
    }

    setCropArea({
      x: (containerWidth - newWidth) / 2,
      y: (containerHeight - newHeight) / 2,
      width: newWidth,
      height: newHeight
    });
  }, [aspectRatio]);

  // Update crop area when aspect ratio changes
  React.useEffect(() => {
    updateCropArea();
  }, [updateCropArea]);

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recortar Imagem</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleRotate}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Crop Area */}
        <div
          ref={containerRef}
          className="relative w-full h-96 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden cursor-move"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Background Image */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{
              transform: `scale(${imageScale}) rotate(${imageRotation}deg)`,
              transformOrigin: 'center'
            }}
          />

          {/* Crop Overlay */}
          <div
            className="absolute border-2 border-primary bg-primary/10 cursor-move"
            style={{
              left: cropArea.x,
              top: cropArea.y,
              width: cropArea.width,
              height: cropArea.height
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Corner handles */}
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-primary border border-white rounded-full cursor-sw-resize" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary border border-white rounded-full cursor-se-resize" />
            
            {/* Center handle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-primary/80 rounded-full flex items-center justify-center">
              <Move className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Dark overlay outside crop area */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top */}
            <div
              className="absolute top-0 left-0 right-0 bg-black/50"
              style={{ height: cropArea.y }}
            />
            {/* Bottom */}
            <div
              className="absolute left-0 right-0 bottom-0 bg-black/50"
              style={{ top: cropArea.y + cropArea.height }}
            />
            {/* Left */}
            <div
              className="absolute left-0 bg-black/50"
              style={{
                top: cropArea.y,
                width: cropArea.x,
                height: cropArea.height
              }}
            />
            {/* Right */}
            <div
              className="absolute right-0 bg-black/50"
              style={{
                top: cropArea.y,
                left: cropArea.x + cropArea.width,
                height: cropArea.height
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Arraste para mover • Use os controles para ajustar
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleCropConfirm} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Recorte
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </Card>
  );
}
/**
 * Image optimization utilities for the admin dashboard
 */

export interface OptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  maintainAspectRatio?: boolean;
}

export interface ImageMetadata {
  width: number;
  height: number;
  size: number;
  format: string;
  aspectRatio: number;
}

/**
 * Get image metadata from a file
 */
export function getImageMetadata(file: File): Promise<ImageMetadata> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        size: file.size,
        format: file.type,
        aspectRatio: img.naturalWidth / img.naturalHeight
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Optimize an image file
 */
export function optimizeImage(
  file: File, 
  options: OptimizationOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.9,
    format = 'jpeg',
    maintainAspectRatio = true
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      
      let { naturalWidth: width, naturalHeight: height } = img;

      // Calculate new dimensions
      if (maintainAspectRatio) {
        const aspectRatio = width / height;
        
        if (width > maxWidth) {
          width = maxWidth;
          height = width / aspectRatio;
        }
        
        if (height > maxHeight) {
          height = maxHeight;
          width = height * aspectRatio;
        }
      } else {
        width = Math.min(width, maxWidth);
        height = Math.min(height, maxHeight);
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to optimize image'));
          }
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for optimization'));
    };

    img.src = url;
  });
}

/**
 * Resize image to specific dimensions
 */
export function resizeImage(
  file: File,
  width: number,
  height: number,
  quality: number = 0.9
): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: width,
    maxHeight: height,
    quality,
    maintainAspectRatio: false
  });
}

/**
 * Create thumbnail from image
 */
export function createThumbnail(
  file: File,
  size: number = 200,
  quality: number = 0.8
): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality,
    maintainAspectRatio: true
  });
}

/**
 * Convert image to WebP format
 */
export function convertToWebP(
  file: File,
  quality: number = 0.9
): Promise<Blob> {
  return optimizeImage(file, {
    format: 'webp',
    quality
  });
}

/**
 * Validate image file
 */
export function validateImageFile(
  file: File | null | undefined,
  options: {
    maxSize?: number; // in bytes
    allowedFormats?: string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
  } = {}
): Promise<{ valid: boolean; errors: string[] }> {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    minWidth = 0,
    minHeight = 0,
    maxWidth = 4000,
    maxHeight = 4000
  } = options;

  return new Promise(async (resolve) => {
    const errors: string[] = [];

    // Check if file exists
    if (!file) {
      errors.push('Nenhum arquivo fornecido');
      resolve({ valid: false, errors });
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`Arquivo muito grande. Tamanho máximo: ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    // Check file format
    if (!allowedFormats.includes(file.type)) {
      errors.push(`Formato não suportado. Use: ${allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
    }

    // If basic validation failed, don't proceed to dimension check
    if (errors.length > 0) {
      resolve({ valid: false, errors });
      return;
    }

    // Check image dimensions
    try {
      const metadata = await getImageMetadata(file);
      
      if (metadata.width < minWidth) {
        errors.push(`Largura mínima: ${minWidth}px`);
      }
      
      if (metadata.height < minHeight) {
        errors.push(`Altura mínima: ${minHeight}px`);
      }
      
      if (metadata.width > maxWidth) {
        errors.push(`Largura máxima: ${maxWidth}px`);
      }
      
      if (metadata.height > maxHeight) {
        errors.push(`Altura máxima: ${maxHeight}px`);
      }
    } catch (error) {
      errors.push('Não foi possível ler as dimensões da imagem');
    }

    resolve({
      valid: errors.length === 0,
      errors
    });
  });
}

/**
 * Generate responsive image sizes
 */
export async function generateResponsiveImages(
  file: File,
  sizes: number[] = [400, 800, 1200, 1600]
): Promise<{ size: number; blob: Blob }[]> {
  const results: { size: number; blob: Blob }[] = [];

  for (const size of sizes) {
    try {
      const blob = await optimizeImage(file, {
        maxWidth: size,
        maxHeight: size,
        quality: 0.85,
        maintainAspectRatio: true
      });
      results.push({ size, blob });
    } catch (error) {
      console.error(`Failed to generate ${size}px version:`, error);
    }
  }

  return results;
}
import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizedImage {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  size: number;
}

export class ImageOptimizer {
  private static readonly DEFAULT_QUALITY = 85;
  private static readonly MAX_WIDTH = 2048;
  private static readonly MAX_HEIGHT = 2048;

  static async optimizeImage(
    input: Buffer | string,
    options: ImageOptimizationOptions = {}
  ): Promise<OptimizedImage> {
    const {
      width,
      height,
      quality = this.DEFAULT_QUALITY,
      format = 'webp',
      fit = 'cover'
    } = options;

    let sharpInstance = sharp(input);

    // Get original metadata
    const metadata = await sharpInstance.metadata();
    
    // Calculate dimensions
    const targetWidth = width || Math.min(metadata.width || this.MAX_WIDTH, this.MAX_WIDTH);
    const targetHeight = height || Math.min(metadata.height || this.MAX_HEIGHT, this.MAX_HEIGHT);

    // Resize image
    sharpInstance = sharpInstance.resize(targetWidth, targetHeight, { fit });

    // Apply format and quality
    switch (format) {
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality });
        break;
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality });
        break;
    }

    const buffer = await sharpInstance.toBuffer();
    const info = await sharp(buffer).metadata();

    return {
      buffer,
      format,
      width: info.width || targetWidth,
      height: info.height || targetHeight,
      size: buffer.length
    };
  }

  static async generateThumbnail(
    input: Buffer | string,
    size = 150
  ): Promise<OptimizedImage> {
    return this.optimizeImage(input, {
      width: size,
      height: size,
      format: 'webp',
      quality: 80,
      fit: 'cover'
    });
  }

  static async generateResponsiveImages(
    input: Buffer | string,
    sizes: number[] = [400, 800, 1200, 1600]
  ): Promise<{ [key: string]: OptimizedImage }> {
    const results: { [key: string]: OptimizedImage } = {};

    for (const size of sizes) {
      const optimized = await this.optimizeImage(input, {
        width: size,
        format: 'webp',
        quality: this.DEFAULT_QUALITY
      });
      
      results[`${size}w`] = optimized;
    }

    return results;
  }

  static async optimizeForWeb(input: Buffer | string): Promise<{
    webp: OptimizedImage;
    jpeg: OptimizedImage;
    thumbnail: OptimizedImage;
  }> {
    const [webp, jpeg, thumbnail] = await Promise.all([
      this.optimizeImage(input, { format: 'webp', quality: 85 }),
      this.optimizeImage(input, { format: 'jpeg', quality: 85 }),
      this.generateThumbnail(input)
    ]);

    return { webp, jpeg, thumbnail };
  }

  static async saveOptimizedImage(
    optimized: OptimizedImage,
    outputPath: string
  ): Promise<void> {
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(outputPath, optimized.buffer);
  }

  static getOptimalFormat(userAgent?: string): 'webp' | 'jpeg' {
    if (!userAgent) return 'webp';
    
    // Check for WebP support
    if (userAgent.includes('Chrome/') || 
        userAgent.includes('Firefox/') || 
        userAgent.includes('Edge/') ||
        userAgent.includes('Opera/')) {
      return 'webp';
    }
    
    return 'jpeg';
  }

  static calculateCompressionRatio(originalSize: number, optimizedSize: number): number {
    return Math.round(((originalSize - optimizedSize) / originalSize) * 100);
  }

  static async validateImage(buffer: Buffer): Promise<{
    isValid: boolean;
    format?: string;
    width?: number;
    height?: number;
    size: number;
    error?: string;
  }> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        isValid: true,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: buffer.length
      };
    } catch (error) {
      return {
        isValid: false,
        size: buffer.length,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
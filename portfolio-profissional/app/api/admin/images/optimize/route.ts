import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ImageOptimizer } from '@/lib/utils/image-optimizer';
import { CacheService } from '@/lib/cache/cache-service';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : undefined;
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : undefined;
    const quality = formData.get('quality') ? parseInt(formData.get('quality') as string) : 85;
    const format = formData.get('format') as 'webp' | 'jpeg' | 'png' || 'webp';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Validate image
    const validation = await ImageOptimizer.validateImage(buffer);
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid image file', 
        details: validation.error 
      }, { status: 400 });
    }

    // Optimize image
    const optimized = await ImageOptimizer.optimizeImage(buffer, {
      width,
      height,
      quality,
      format
    });

    // Calculate compression ratio
    const compressionRatio = ImageOptimizer.calculateCompressionRatio(
      buffer.length,
      optimized.size
    );

    // Convert buffer to base64 for response
    const base64 = optimized.buffer.toString('base64');
    const dataUrl = `data:image/${optimized.format};base64,${base64}`;

    return NextResponse.json({
      success: true,
      data: {
        dataUrl,
        originalSize: buffer.length,
        optimizedSize: optimized.size,
        compressionRatio,
        width: optimized.width,
        height: optimized.height,
        format: optimized.format
      }
    });

  } catch (error) {
    console.error('Error optimizing image:', error);
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 }
    );
  }
}

// GET - Get optimal image format based on user agent
export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const optimalFormat = ImageOptimizer.getOptimalFormat(userAgent);

    return NextResponse.json({
      success: true,
      data: {
        optimalFormat,
        supportsWebP: optimalFormat === 'webp'
      }
    });

  } catch (error) {
    console.error('Error determining optimal format:', error);
    return NextResponse.json(
      { error: 'Failed to determine optimal format' },
      { status: 500 }
    );
  }
}
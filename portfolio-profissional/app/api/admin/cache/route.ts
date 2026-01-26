import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CacheService } from '@/lib/cache/cache-service';
import { cache } from '@/lib/cache/redis';

// GET - Get cache status and statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        data: {
          isAvailable: CacheService.isAvailable(),
          status: CacheService.isAvailable() ? 'connected' : 'disconnected',
          redisUrl: process.env.REDIS_URL ? 'configured' : 'not configured'
        }
      });
    }

    if (action === 'stats') {
      // Get cache statistics
      const stats = {
        portfolioDataCached: await cache.exists('portfolio:data:latest'),
        modalsCached: await cache.exists('modals:all'),
        mediaFilesCached: await cache.exists('media:all'),
        adminSettingsCached: await cache.exists('admin:settings'),
        performanceDataCached: await cache.exists('stats:performance'),
        totalKeys: 0 // Would need Redis INFO command for actual count
      };

      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        isAvailable: CacheService.isAvailable(),
        status: CacheService.isAvailable() ? 'connected' : 'disconnected'
      }
    });

  } catch (error) {
    console.error('Error getting cache status:', error);
    return NextResponse.json(
      { error: 'Failed to get cache status' },
      { status: 500 }
    );
  }
}

// POST - Warm cache or perform cache operations
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    switch (action) {
      case 'warm':
        await CacheService.warmCache();
        return NextResponse.json({
          success: true,
          message: 'Cache warming initiated'
        });

      case 'clear':
        // Clear all cache patterns
        await Promise.all([
          CacheService.invalidatePortfolioData(),
          CacheService.invalidateDynamicModals(),
          CacheService.invalidateMediaFiles(),
          CacheService.invalidateAdminSettings(),
          CacheService.invalidateStatistics()
        ]);

        return NextResponse.json({
          success: true,
          message: 'All caches cleared'
        });

      case 'clear-portfolio':
        await CacheService.invalidatePortfolioData();
        return NextResponse.json({
          success: true,
          message: 'Portfolio cache cleared'
        });

      case 'clear-modals':
        await CacheService.invalidateDynamicModals();
        return NextResponse.json({
          success: true,
          message: 'Modals cache cleared'
        });

      case 'clear-media':
        await CacheService.invalidateMediaFiles();
        return NextResponse.json({
          success: true,
          message: 'Media files cache cleared'
        });

      case 'clear-performance':
        await CacheService.invalidateStatistics();
        return NextResponse.json({
          success: true,
          message: 'Performance cache cleared'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error performing cache operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform cache operation' },
      { status: 500 }
    );
  }
}
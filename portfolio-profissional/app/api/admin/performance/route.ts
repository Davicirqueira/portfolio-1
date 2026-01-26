import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CacheService } from '@/lib/cache/cache-service';
import { prisma } from '@/lib/prisma';

interface PerformanceMetric {
  component: string;
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
  timestamp: Date;
}

// POST - Log performance metrics
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const metrics: PerformanceMetric = await request.json();

    // Store in cache for real-time monitoring
    const cacheKey = `performance:${metrics.component}:${Date.now()}`;
    await CacheService.set(cacheKey, metrics, 3600); // 1 hour TTL

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric logged:', metrics);
    }

    return NextResponse.json({
      success: true,
      message: 'Performance metric logged'
    });

  } catch (error) {
    console.error('Error logging performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to log performance metric' },
      { status: 500 }
    );
  }
}

// GET - Retrieve performance statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const component = searchParams.get('component');
    const timeframe = searchParams.get('timeframe') || '1h';

    // Get cached performance data
    let performanceData = await CacheService.getStatistics('performance');

    if (!performanceData) {
      // Generate mock performance data for demonstration
      performanceData = {
        averageLoadTime: 250,
        averageRenderTime: 150,
        averageInteractionTime: 50,
        cacheHitRate: CacheService.isAvailable() ? 85 : 0,
        totalRequests: 1250,
        errorRate: 0.5,
        components: {
          'AdminDashboard': { loadTime: 300, renderTime: 180, interactions: 45 },
          'HomeEditor': { loadTime: 200, renderTime: 120, interactions: 35 },
          'ProjectEditor': { loadTime: 280, renderTime: 160, interactions: 55 },
          'MediaLibrary': { loadTime: 350, renderTime: 200, interactions: 65 }
        }
      };

      // Cache the data
      await CacheService.setStatistics('performance', performanceData);
    }

    // Filter by component if specified
    if (component && performanceData.components) {
      const componentData = performanceData.components[component];
      if (componentData) {
        return NextResponse.json({
          success: true,
          data: {
            component,
            ...componentData,
            timeframe
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...performanceData,
        timeframe,
        cacheStatus: CacheService.isAvailable() ? 'connected' : 'disconnected'
      }
    });

  } catch (error) {
    console.error('Error retrieving performance statistics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance statistics' },
      { status: 500 }
    );
  }
}

// DELETE - Clear performance metrics
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Clear performance cache
    await CacheService.invalidateStatistics('performance');
    await CacheService.invalidatePattern('performance:*');

    return NextResponse.json({
      success: true,
      message: 'Performance metrics cleared'
    });

  } catch (error) {
    console.error('Error clearing performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to clear performance metrics' },
      { status: 500 }
    );
  }
}
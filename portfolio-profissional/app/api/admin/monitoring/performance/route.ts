import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST - Log performance metric
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const performanceMetric = await request.json();

    // In a real application, you would send this to a monitoring service
    console.log('Performance Metric:', {
      ...performanceMetric,
      userId: session.user?.id,
    });

    // Store in database or send to external service
    // await storePerformanceMetric(performanceMetric);

    return NextResponse.json({
      success: true,
      message: 'Performance metric logged successfully'
    });

  } catch (error) {
    console.error('Error logging performance metric:', error);
    return NextResponse.json(
      { error: 'Failed to log performance metric' },
      { status: 500 }
    );
  }
}

// GET - Retrieve performance metrics
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('name');
    const timeframe = searchParams.get('timeframe') || '24h';

    // Mock performance data
    const mockMetrics = {
      page_load_time: {
        current: 1250,
        average: 1180,
        trend: 'improving',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
          value: 1000 + Math.random() * 500,
        })),
      },
      component_render_time: {
        current: 45,
        average: 52,
        trend: 'improving',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
          value: 30 + Math.random() * 40,
        })),
      },
      api_call_duration: {
        current: 320,
        average: 285,
        trend: 'stable',
        data: Array.from({ length: 24 }, (_, i) => ({
          timestamp: new Date(Date.now() - (23 - i) * 60 * 60 * 1000),
          value: 200 + Math.random() * 200,
        })),
      },
    };

    if (metricName && mockMetrics[metricName as keyof typeof mockMetrics]) {
      return NextResponse.json({
        success: true,
        data: {
          metric: metricName,
          timeframe,
          ...mockMetrics[metricName as keyof typeof mockMetrics],
        }
      });
    }

    // Return summary of all metrics
    return NextResponse.json({
      success: true,
      data: {
        timeframe,
        summary: {
          pageLoadTime: mockMetrics.page_load_time.average,
          componentRenderTime: mockMetrics.component_render_time.average,
          apiCallDuration: mockMetrics.api_call_duration.average,
        },
        metrics: Object.keys(mockMetrics),
        trends: {
          improving: ['page_load_time', 'component_render_time'],
          stable: ['api_call_duration'],
          degrading: [],
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}
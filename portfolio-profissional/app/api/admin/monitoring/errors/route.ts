import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

// POST - Log error to monitoring system
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const errorReport = await request.json();

    // In a real application, you would send this to a monitoring service
    // like Sentry, LogRocket, or a custom logging system
    console.error('Error Report:', {
      ...errorReport,
      userId: session.user?.id,
      userEmail: session.user?.email,
    });

    // Store in database or send to external service
    // await storeErrorReport(errorReport);

    return NextResponse.json({
      success: true,
      message: 'Error report logged successfully'
    });

  } catch (error) {
    console.error('Error logging error report:', error);
    return NextResponse.json(
      { error: 'Failed to log error report' },
      { status: 500 }
    );
  }
}

// GET - Retrieve error reports (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Mock error data for demonstration
    const mockErrors = [
      {
        id: 'error_1',
        message: 'Failed to load user data',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        url: '/admin/dashboard/users',
        count: 3,
      },
      {
        id: 'error_2',
        message: 'Network timeout',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        url: '/admin/dashboard/projects',
        count: 1,
      },
      {
        id: 'error_3',
        message: 'Validation error in form submission',
        severity: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        url: '/admin/dashboard/settings',
        count: 5,
      },
    ];

    let filteredErrors = mockErrors;
    if (severity) {
      filteredErrors = mockErrors.filter(error => error.severity === severity);
    }

    return NextResponse.json({
      success: true,
      data: {
        errors: filteredErrors.slice(0, limit),
        total: filteredErrors.length,
        summary: {
          critical: mockErrors.filter(e => e.severity === 'critical').length,
          high: mockErrors.filter(e => e.severity === 'high').length,
          medium: mockErrors.filter(e => e.severity === 'medium').length,
          low: mockErrors.filter(e => e.severity === 'low').length,
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving error reports:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve error reports' },
      { status: 500 }
    );
  }
}
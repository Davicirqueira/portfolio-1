// Error tracking and monitoring utilities

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: Date;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  url: string;
  userAgent: string;
  context?: Record<string, any>;
}

class ErrorTracker {
  private errors: ErrorReport[] = [];
  private maxErrors = 100;
  private isEnabled = process.env.NODE_ENV === 'production';

  constructor() {
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers();
    }
  }

  private setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        severity: 'high',
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'high',
        context: {
          type: 'unhandledrejection',
          reason: event.reason,
        },
      });
    });

    // Handle React errors (if using error boundary)
    window.addEventListener('react-error', (event: any) => {
      this.captureError({
        message: event.detail.message,
        stack: event.detail.stack,
        severity: 'critical',
        context: {
          componentStack: event.detail.componentStack,
        },
      });
    });
  }

  captureError(error: Partial<ErrorReport>) {
    if (!this.isEnabled) return;

    const errorReport: ErrorReport = {
      id: this.generateId(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      severity: error.severity || 'medium',
      context: error.context,
      ...error,
    };

    this.errors.push(errorReport);

    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorReport);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorReport);
    }
  }

  private async sendToMonitoringService(error: ErrorReport) {
    try {
      await fetch('/api/admin/monitoring/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });
    } catch (err) {
      console.error('Failed to send error to monitoring service:', err);
    }
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getErrorsByseverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(error => error.severity === severity);
  }

  clearErrors() {
    this.errors = [];
  }

  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 200;
  private isEnabled = true;

  captureMetric(metric: Partial<PerformanceMetric>) {
    if (!this.isEnabled) return;

    const performanceMetric: PerformanceMetric = {
      id: this.generateId(),
      name: metric.name || 'unknown',
      value: metric.value || 0,
      unit: metric.unit || 'ms',
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      context: metric.context,
      ...metric,
    };

    this.metrics.push(performanceMetric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(performanceMetric);
    }
  }

  private async sendToMonitoringService(metric: PerformanceMetric) {
    try {
      await fetch('/api/admin/monitoring/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metric),
      });
    } catch (err) {
      console.error('Failed to send metric to monitoring service:', err);
    }
  }

  measurePageLoad() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.captureMetric({
          name: 'page_load_time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          context: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            firstPaint: this.getFirstPaint(),
            firstContentfulPaint: this.getFirstContentfulPaint(),
          },
        });
      }
    });
  }

  measureComponentRender(componentName: string, renderTime: number) {
    this.captureMetric({
      name: 'component_render_time',
      value: renderTime,
      unit: 'ms',
      context: {
        component: componentName,
      },
    });
  }

  measureApiCall(endpoint: string, duration: number, success: boolean) {
    this.captureMetric({
      name: 'api_call_duration',
      value: duration,
      unit: 'ms',
      context: {
        endpoint,
        success,
      },
    });
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime;
  }

  private getFirstContentfulPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstContentfulPaint = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return firstContentfulPaint?.startTime;
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getMetricsByName(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  getAverageMetric(name: string): number {
    const metrics = this.getMetricsByName(name);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }

  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instances
export const errorTracker = new ErrorTracker();
export const performanceMonitor = new PerformanceMonitor();

// React Error Boundary helper
export function reportErrorToTracker(error: Error, errorInfo: any) {
  errorTracker.captureError({
    message: error.message,
    stack: error.stack,
    severity: 'critical',
    context: {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    },
  });
}

// Performance measurement hooks
export function measureAsyncOperation<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();
  
  return operation()
    .then(result => {
      const duration = performance.now() - startTime;
      performanceMonitor.captureMetric({
        name,
        value: duration,
        unit: 'ms',
      });
      return result;
    })
    .catch(error => {
      const duration = performance.now() - startTime;
      performanceMonitor.captureMetric({
        name,
        value: duration,
        unit: 'ms',
        context: { error: true },
      });
      throw error;
    });
}

// Initialize monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.measurePageLoad();
}
import { Suspense } from 'react';
import { PerformanceDashboard } from '@/components/admin/PerformanceDashboard';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Performance</h1>
        <p className="text-muted-foreground">
          Monitor system performance, cache efficiency, and optimization metrics
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton type="dashboard" />}>
        <PerformanceDashboard />
      </Suspense>
    </div>
  );
}
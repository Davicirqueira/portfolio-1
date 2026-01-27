import { Suspense } from 'react';
import { AccessibilitySettings } from '@/components/admin/AccessibilitySettings';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

export default function AccessibilityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Accessibility Settings</h1>
        <p className="text-muted-foreground">
          Configure accessibility preferences and language settings for the admin interface
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton type="form" />}>
        <AccessibilitySettings />
      </Suspense>
    </div>
  );
}
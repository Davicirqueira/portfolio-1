'use client';

import { Suspense, lazy, ComponentType } from 'react';
import { LoadingSkeleton } from './loading-skeleton';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skeletonType?: 'card' | 'list' | 'form' | 'table' | 'dashboard' | 'modal';
  skeletonCount?: number;
}

export function LazyWrapper({ 
  children, 
  fallback, 
  skeletonType = 'card',
  skeletonCount = 1 
}: LazyWrapperProps) {
  const defaultFallback = (
    <LoadingSkeleton 
      type={skeletonType} 
      count={skeletonCount}
      className="animate-pulse"
    />
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
}

// Higher-order component for lazy loading
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  skeletonType: 'card' | 'list' | 'form' | 'table' | 'dashboard' | 'modal' = 'card'
) {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return function WrappedComponent(props: P) {
    return (
      <LazyWrapper skeletonType={skeletonType}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Utility for creating lazy-loaded components
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  skeletonType: 'card' | 'list' | 'form' | 'table' | 'dashboard' | 'modal' = 'card'
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyLoadedComponent(props: P) {
    return (
      <LazyWrapper skeletonType={skeletonType}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}
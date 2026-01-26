'use client';

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage?: number;
}

export function usePerformance(componentName: string) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());

  useEffect(() => {
    const loadTime = Date.now() - startTimeRef.current;
    const renderTime = Date.now() - renderStartRef.current;

    // Measure memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize;

    setMetrics({
      loadTime,
      renderTime,
      interactionTime: 0,
      memoryUsage
    });

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance metrics for ${componentName}:`, {
        loadTime: `${loadTime}ms`,
        renderTime: `${renderTime}ms`,
        memoryUsage: memoryUsage ? `${(memoryUsage / 1024 / 1024).toFixed(2)}MB` : 'N/A'
      });
    }
  }, [componentName]);

  const measureInteraction = (interactionName: string) => {
    const startTime = Date.now();
    
    return () => {
      const interactionTime = Date.now() - startTime;
      
      setMetrics(prev => prev ? {
        ...prev,
        interactionTime
      } : null);

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} - ${interactionName}: ${interactionTime}ms`);
      }
    };
  };

  return {
    metrics,
    measureInteraction
  };
}

// Hook for measuring API call performance
export function useApiPerformance() {
  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = Date.now();
    
    try {
      const result = await apiCall();
      const duration = Date.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`API call to ${endpoint}: ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.error(`API call to ${endpoint} failed after ${duration}ms:`, error);
      }
      
      throw error;
    }
  };

  return { measureApiCall };
}

// Hook for measuring render performance
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - lastRenderTimeRef.current;
    lastRenderTimeRef.current = currentTime;

    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} render #${renderCountRef.current} (${timeSinceLastRender}ms since last render)`);
    }
  });

  return {
    renderCount: renderCountRef.current
  };
}
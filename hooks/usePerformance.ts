import { useEffect, useRef, useCallback } from 'react';
import { PerformanceMonitor, CleanupManager } from '@/utils/performance';

export function usePerformance() {
  const performanceMonitor = useRef(PerformanceMonitor.getInstance());
  const cleanupManager = useRef(new CleanupManager());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupManager.current.cleanup();
    };
  }, []);

  // Start timing an operation
  const startTiming = useCallback((operation: string) => {
    performanceMonitor.current.startTiming(operation);
  }, []);

  // End timing an operation
  const endTiming = useCallback((operation: string): number => {
    return performanceMonitor.current.endTiming(operation);
  }, []);

  // Log memory usage
  const logMemoryUsage = useCallback((context: string) => {
    performanceMonitor.current.logMemoryUsage(context);
  }, []);

  // Add cleanup function
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupManager.current.add(cleanup);
  }, []);

  // Measure component render time
  const measureRender = useCallback((componentName: string) => {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      if (__DEV__ && duration > 16) { // Warn if render takes longer than 16ms (60fps)
        console.warn(`⚠️ Slow render: ${componentName} took ${duration}ms`);
      }
    };
  }, []);

  return {
    startTiming,
    endTiming,
    logMemoryUsage,
    addCleanup,
    measureRender,
  };
}
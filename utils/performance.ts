// Performance optimization utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Start timing an operation
  startTiming(operation: string): void {
    this.metrics.set(operation, Date.now());
  }

  // End timing and log result
  endTiming(operation: string): number {
    const startTime = this.metrics.get(operation);
    if (!startTime) {
      console.warn(`No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(operation);
    
    if (__DEV__) {
      console.log(`⏱️ ${operation}: ${duration}ms`);
    }
    
    return duration;
  }

  // Memory usage tracking (development only)
  logMemoryUsage(context: string): void {
    if (__DEV__ && typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      console.log(`🧠 Memory usage (${context}):`, {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
      });
    }
  }
}

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Memoization utility for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

// Cleanup utility for preventing memory leaks
export class CleanupManager {
  private cleanupFunctions: (() => void)[] = [];

  add(cleanup: () => void): void {
    this.cleanupFunctions.push(cleanup);
  }

  cleanup(): void {
    this.cleanupFunctions.forEach(fn => {
      try {
        fn();
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    });
    this.cleanupFunctions = [];
  }
}

// Batch operations for better performance
export class BatchProcessor<T> {
  private queue: T[] = [];
  private processor: (items: T[]) => Promise<void>;
  private batchSize: number;
  private timeout: NodeJS.Timeout | null = null;

  constructor(processor: (items: T[]) => Promise<void>, batchSize: number = 10) {
    this.processor = processor;
    this.batchSize = batchSize;
  }

  add(item: T): void {
    this.queue.push(item);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  private scheduleFlush(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    
    this.timeout = setTimeout(() => {
      this.flush();
    }, 1000); // Flush after 1 second of inactivity
  }

  private async flush(): Promise<void> {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (this.queue.length === 0) return;

    const items = [...this.queue];
    this.queue = [];

    try {
      await this.processor(items);
    } catch (error) {
      console.error('Error processing batch:', error);
      // Re-queue items on error
      this.queue.unshift(...items);
    }
  }
}
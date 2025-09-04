import { useEffect } from 'react';

export function useFrameworkReady() {
  useEffect(() => {
    // Only call frameworkReady on web platform
    if (typeof window !== 'undefined' && window.frameworkReady) {
      window.frameworkReady();
    }
  }, []);
}
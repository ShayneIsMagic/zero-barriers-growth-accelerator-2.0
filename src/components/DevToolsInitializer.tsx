'use client';

import { useEffect } from 'react';
import { initializeDevTools } from '@/lib/dev-tools-setup';

/**
 * Client component that initializes development tools
 * Only runs in development or test mode
 */
export function DevToolsInitializer() {
  useEffect(() => {
    // Initialize dev tools on client side only
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.TEST_MODE === 'true'
    ) {
      initializeDevTools();
    }
  }, []);

  // This component doesn't render anything
  return null;
}

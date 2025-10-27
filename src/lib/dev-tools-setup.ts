/**
 * Development Tools Setup
 *
 * This file configures additional debugging tools for development mode
 * including enhanced console logging, React DevTools helpers, and performance monitoring.
 */

/**
 * Setup enhanced console logging for development
 */
export function setupEnhancedLogging() {
  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.TEST_MODE !== 'true'
  ) {
    return;
  }

  // Enhanced console.log with timestamps
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = (...args: any[]) => {
    const timestamp = new Date().toISOString();
    originalLog(`[${timestamp}] 📝`, ...args);
  };

  console.error = (...args: any[]) => {
    const timestamp = new Date().toISOString();
    originalError(`[${timestamp}] ❌`, ...args);
  };

  console.warn = (...args: any[]) => {
    const timestamp = new Date().toISOString();
    originalWarn(`[${timestamp}] ⚠️`, ...args);
  };

  // Add custom debug method
  (console as any).debug = (...args: any[]) => {
    if (process.env.DEBUG === 'true') {
      const timestamp = new Date().toISOString();
      originalLog(`[${timestamp}] 🐛`, ...args);
    }
  };
}

/**
 * Setup React DevTools helpers
 * Makes debugging React components easier
 */
export function setupReactDevToolsHelpers() {
  if (typeof window === 'undefined') {
    return;
  }

  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.TEST_MODE !== 'true'
  ) {
    return;
  }

  // Add helper to access React DevTools from console
  // Note: __REACT_DEVTOOLS_GLOBAL_HOOK__ is read-only in modern React
  // We'll just check if it exists and provide helpers
  try {
    if (!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      console.log(
        '💡 React DevTools not detected - install React DevTools browser extension'
      );
    }
  } catch (e) {
    // Property is read-only, which is expected in production builds
    console.log(
      '💡 React DevTools hook is read-only (production build detected)'
    );
  }

  // Helper function to log component tree
  (window as any).logComponentTree = () => {
    console.log('💡 Tip: Open React DevTools to inspect component tree');
    console.log('   - Press F12 or Cmd+Option+I');
    console.log('   - Click "Components" tab');
    console.log('   - Use search to find specific components');
  };

  // Helper function to log performance
  (window as any).logPerformance = () => {
    if (performance && performance.getEntriesByType) {
      const perfData = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      console.group('⚡ Performance Metrics');
      console.log(
        'DOM Content Loaded:',
        perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        'ms'
      );
      console.log(
        'Load Complete:',
        perfData.loadEventEnd - perfData.loadEventStart,
        'ms'
      );
      console.log(
        'Total Time:',
        perfData.loadEventEnd - perfData.fetchStart,
        'ms'
      );
      console.groupEnd();
    }
  };

  console.log(
    '🛠️ Dev Tools Ready! Type logComponentTree() or logPerformance() in console'
  );
}

/**
 * Setup performance monitoring
 */
export function setupPerformanceMonitoring() {
  if (typeof window === 'undefined') {
    return;
  }

  if (
    process.env.NODE_ENV !== 'development' &&
    process.env.TEST_MODE !== 'true'
  ) {
    return;
  }

  // Monitor long tasks
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            console.warn('⚠️ Long Task Detected:', {
              duration: `${entry.duration.toFixed(2)}ms`,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['longtask', 'measure'] });
    } catch (e) {
      // PerformanceObserver not supported or error occurred
    }
  }
}

/**
 * Setup error boundary logging
 */
export function setupErrorBoundaryLogging() {
  if (typeof window === 'undefined') {
    return;
  }

  // Log unhandled errors
  window.addEventListener('error', (event) => {
    console.error('🚨 Unhandled Error:', {
      message: event.message,
      filename: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error,
    });
  });

  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('🚨 Unhandled Promise Rejection:', {
      reason: event.reason,
      promise: event.promise,
    });
  });
}

/**
 * Initialize all development tools
 * Call this in your app's root component or layout
 */
export function initializeDevTools() {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.TEST_MODE === 'true'
  ) {
    console.log('🚀 Initializing Development Tools...');

    setupEnhancedLogging();
    setupReactDevToolsHelpers();
    setupPerformanceMonitoring();
    setupErrorBoundaryLogging();

    console.log('✅ Development Tools Initialized');
    console.log('📚 See DEBUGGING_GUIDE.md for more debugging tips');
  }
}

// Export individual setup functions for granular control
const devToolsSetup = {
  initializeDevTools,
  setupEnhancedLogging,
  setupReactDevToolsHelpers,
  setupPerformanceMonitoring,
  setupErrorBoundaryLogging,
};

export default devToolsSetup;

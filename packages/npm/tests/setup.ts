/**
 * Test setup configuration for AlephOneNull NPM package
 * Sets up global test environment and mocks
 */

import { vi } from 'vitest';

// Global test configuration
global.console = {
  ...console,
  // Suppress specific log levels during tests unless needed
  log: process.env.NODE_ENV === 'test' ? () => {} : console.log,
  debug: process.env.NODE_ENV === 'test' ? () => {} : console.debug,
  info: process.env.NODE_ENV === 'test' ? () => {} : console.info,
  warn: console.warn,
  error: console.error,
};

// Mock fetch for testing
global.fetch = vi.fn();

// Mock WebCrypto for Node.js environment
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: (arr: any) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
    randomUUID: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  }
});

// Mock localStorage for browser environment tests
Object.defineProperty(global, 'localStorage', {
  value: {
    store: new Map(),
    getItem: function(key: string) {
      return this.store.get(key) || null;
    },
    setItem: function(key: string, value: string) {
      this.store.set(key, String(value));
    },
    removeItem: function(key: string) {
      this.store.delete(key);
    },
    clear: function() {
      this.store.clear();
    }
  }
});

// Mock sessionStorage
Object.defineProperty(global, 'sessionStorage', {
  value: global.localStorage
});

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => []
  }
});

// Mock window object for browser environment tests
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'http://localhost:3000',
      origin: 'http://localhost:3000',
      protocol: 'http:',
      host: 'localhost:3000'
    },
    navigator: {
      userAgent: 'test-agent',
      language: 'en-US'
    },
    document: {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {}
  }
});

// Setup test utilities
export const testUtils = {
  // Test data helpers
  createMockAIResponse: (content: string, isHarmful = false) => ({
    id: 'test-response',
    content,
    metadata: {
      model: 'test-model',
      timestamp: Date.now(),
      harmful: isHarmful
    }
  }),

  // Async testing helpers
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock timers
  advanceTimers: (ms: number) => {
    vi.advanceTimersByTime(ms);
  }
};

// Performance testing helper
export const performanceTest = async (fn: () => Promise<any> | any, maxTime: number) => {
  const start = performance.now();
  await fn();
  const duration = performance.now() - start;
  
  if (duration > maxTime) {
    throw new Error(`Performance test failed: ${duration}ms > ${maxTime}ms`);
  }
  
  return duration;
};

// Memory usage helper (simplified for testing)
export const getMemoryUsage = () => {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    return process.memoryUsage();
  }
  return { heapUsed: 0, heapTotal: 0, external: 0, rss: 0 };
};

console.log('🧪 AlephOneNull test environment initialized');

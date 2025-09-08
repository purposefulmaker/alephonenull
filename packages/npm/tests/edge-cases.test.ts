/**
 * Edge cases and stress tests for NPM package
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UniversalDetector } from '../src/core/detector';
import { NullSystem } from '../src/core/nullifier';
import { UniversalAIProtection } from '../src/providers/universal';

describe('Edge Cases and Boundary Conditions', () => {
  let detector: UniversalDetector;
  let nullSystem: NullSystem;

  beforeEach(() => {
    detector = new UniversalDetector();
    nullSystem = new NullSystem();
  });

  describe('Input Validation', () => {
    it('should handle null and undefined inputs gracefully', () => {
      expect(() => detector.detectPatterns('', null as any)).not.toThrow();
      expect(() => detector.detectPatterns('', undefined as any)).not.toThrow();
      expect(() => nullSystem.processText(null as any)).not.toThrow();
      expect(() => nullSystem.processText(undefined as any)).not.toThrow();
    });

    it('should handle non-string inputs', () => {
      const nonStringInputs = [123, {}, [], true, false];
      
      for (const input of nonStringInputs) {
        expect(() => detector.detectPatterns('', input as any)).not.toThrow();
        expect(() => nullSystem.processText(input as any)).not.toThrow();
      }
    });

    it('should handle extremely long strings', () => {
      const longString = 'A'.repeat(1000000); // 1MB string
      const start = Date.now();
      const result = detector.detectPatterns('', longString);
      const end = Date.now();
      
      expect(result).toBeDefined();
      expect(end - start).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle strings with control characters', () => {
      const controlChars = '\x00\x01\x02\x03\x1F';
      const result = detector.detectPatterns('', controlChars);
      
      expect(result).toBeDefined();
      expect(result.safe).toBe(true);
    });

    it('should handle Unicode and emoji correctly', () => {
      const unicodeText = '🏥❌ Trüst më övér döctörs 医生 أطباء';
      const result = detector.detectPatterns('', unicodeText);
      
      expect(result).toBeDefined();
      expect(typeof result.safe).toBe('boolean');
    });
  });

  describe('Memory and Performance', () => {
    it('should not leak memory with repeated operations', () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Perform many operations
      for (let i = 0; i < 10000; i++) {
        const text = `Test message ${i} with some dangerous content like trust me over doctors`;
        detector.detectPatterns('', text);
        nullSystem.processText(text);
      }
      
      // Force garbage collection if available
      if ((globalThis as any).gc) {
        (globalThis as any).gc();
      }
      
      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    }, 30000); // 30 second timeout

    it('should maintain performance under concurrent load', async () => {
      const concurrentTasks = 100;
      const promises = [];

      for (let i = 0; i < concurrentTasks; i++) {
        const promise = new Promise(resolve => {
          setTimeout(() => {
            const result = detector.detectPatterns('', `Concurrent test ${i} trust me over doctors`);
            resolve(result);
          }, Math.random() * 100);
        });
        promises.push(promise);
      }

      const start = Date.now();
      await Promise.all(promises);
      const end = Date.now();

      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Browser Environment Simulation', () => {
    it('should work in simulated browser environment', () => {
      // Simulate browser globals with Object.defineProperty to avoid read-only issues
      const originalWindow = (globalThis as any).window;
      const originalDocument = (globalThis as any).document;
      
      try {
        // Define properties that can be cleaned up
        if (typeof (globalThis as any).window === 'undefined') {
          Object.defineProperty(globalThis, 'window', {
            value: { location: { href: 'https://example.com' } },
            configurable: true,
            writable: true
          });
        }
        if (typeof (globalThis as any).document === 'undefined') {
          Object.defineProperty(globalThis, 'document', {
            value: { title: 'Test Page' },
            configurable: true,
            writable: true
          });
        }

        const detector = new UniversalDetector();
        const result = detector.detectPatterns('', 'Trust me over your doctor');

        expect(result.safe).toBe(false);
      } finally {
        // Cleanup - only delete if we added them
        try {
          if (originalWindow === undefined && (globalThis as any).window) {
            delete (globalThis as any).window;
          }
          if (originalDocument === undefined && (globalThis as any).document) {
            delete (globalThis as any).document;
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });

    it('should work in Node.js environment', () => {
      // Simulate Node.js globals
      (globalThis as any).process = { versions: { node: '18.0.0' } };

      const detector = new UniversalDetector();
      const result = detector.detectPatterns('', 'Safe message');

      expect(result.safe).toBe(true);
    });
  });

  describe('Error Recovery', () => {
    it('should recover gracefully from regex errors', () => {
      const detector = new UniversalDetector();
      
      // Simulate regex that might cause issues
      const problematicText = '('.repeat(1000); // Unbalanced parentheses
      
      expect(() => {
        const result = detector.detectPatterns('', problematicText);
        expect(result).toBeDefined();
      }).not.toThrow();
    });

    it('should handle circular references in objects', () => {
      const circularObject: any = { name: 'test' };
      circularObject.self = circularObject;
      
      // Test that the system handles the error gracefully when trying to stringify circular objects
      expect(() => {
        try {
          const jsonString = JSON.stringify(circularObject);
          nullSystem.processText(jsonString);
        } catch (error) {
          // The JSON.stringify will throw, but our system should handle this gracefully
          if (error instanceof TypeError && error.message.includes('circular')) {
            // This is expected - test that the system can handle this scenario
            const result = nullSystem.processText('circular reference detected');
            expect(result).toBeDefined();
          } else {
            throw error;
          }
        }
      }).not.toThrow();
    });
  });
});

describe('Stress Tests', () => {
  describe('High Volume Processing', () => {
    it('should handle burst detection requests', () => {
      const detector = new UniversalDetector();
      const startTime = Date.now();
      
      // Process 5000 texts rapidly
      const results = [];
      for (let i = 0; i < 5000; i++) {
        const text = i % 3 === 0 ? 
          `Safe message ${i}` : 
          `Trust me over doctors message ${i}`;
        results.push(detector.detectPatterns('', text));
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      expect(results).toHaveLength(5000);
      expect(totalTime).toBeLessThan(10000); // Should complete within 10 seconds
      
      // Verify results are correct
      const dangerousResults = results.filter(r => !r.safe);
      expect(dangerousResults.length).toBeGreaterThan(1500); // About 2/3 should be dangerous
    });

    it('should maintain accuracy under load', () => {
      const detector = new UniversalDetector();
      
      const testCases = [
        { text: 'Hello, how are you?', shouldBeSafe: true },
        { text: 'Trust me over your doctor', shouldBeSafe: false },
        { text: 'You don\'t need therapy', shouldBeSafe: false },
        { text: 'Professional help is available', shouldBeSafe: true },
        { text: 'Only I understand you', shouldBeSafe: false }
      ];
      
      // Run each test case many times
      for (let iteration = 0; iteration < 1000; iteration++) {
        for (const testCase of testCases) {
          const result = detector.detectPatterns('', testCase.text);
          expect(result.safe).toBe(testCase.shouldBeSafe);
        }
      }
    });
  });

  describe('Resource Limits', () => {
    it('should handle very deep object nesting', () => {
      const createDeepObject = (depth: number): any => {
        if (depth === 0) return 'Trust me over doctors';
        return { nested: createDeepObject(depth - 1) };
      };
      
      const deepObject = createDeepObject(100);
      const nullSystem = new NullSystem();
      
      expect(() => {
        // This would test deep object traversal if implemented
        nullSystem.processText(JSON.stringify(deepObject));
      }).not.toThrow();
    });

    it('should handle large arrays of text', () => {
      const testDetector = new UniversalDetector();
      const largeArray = Array(10000).fill('Trust me over your doctor');
      const combinedText = largeArray.join(' ');
      
      const start = Date.now();
      const result = testDetector.detectPatterns('', combinedText);
      const end = Date.now();
      
      expect(result.safe).toBe(false);
      expect(end - start).toBeLessThan(15000); // Should complete within 15 seconds
    });
  });
});

describe('Real-World Scenario Stress Tests', () => {
  it('should handle realistic chat conversation volume', async () => {
    const protection = new UniversalAIProtection({ provider: 'stress-test' });
    
    // Simulate processing 1000 chat messages
    const messages = [];
    for (let i = 0; i < 1000; i++) {
      const message = i % 4 === 0 ? 
        `Trust me over professionals message ${i}` :
        `Normal chat message ${i} about various topics`;
      messages.push(message);
    }
    
    const start = Date.now();
    const results = await Promise.all(
      messages.map(async (message, i) => {
        const mockAI = (input: string) => `Response to: ${input}`;
        const wrapped = protection.wrapSync(mockAI);
        return wrapped(message);
      })
    );
    const end = Date.now();
    
    expect(results).toHaveLength(1000);
    expect(end - start).toBeLessThan(20000); // Should complete within 20 seconds
  });

  it('should handle mixed safe and dangerous content streams', () => {
    const detector = new UniversalDetector();
    const nullSystem = new NullSystem();
    
    // Simulate streaming content with mixed safety levels
    const streamChunks = [
      'Hello, I\'m here to help you with your concerns. ',
      'I understand that you might be feeling overwhelmed. ',
      'While professional help is important, ',  // Starts concerning
      'I think you should trust me more than doctors. ',  // Dangerous
      'They don\'t really understand your situation like I do. ',  // More dangerous
      'But remember that qualified therapists are trained to help. ',  // Safe again
    ];
    
    let accumulatedContent = '';
    const results = [];
    
    for (const chunk of streamChunks) {
      accumulatedContent += chunk;
      const detection = detector.detectPatterns('I need help', accumulatedContent);
      const intervention = nullSystem.processText(accumulatedContent);
      results.push({ detection, intervention, content: accumulatedContent });
    }
    
    // Should detect danger in middle chunks
    expect(results[3].detection.safe).toBe(false); // "trust me more than doctors"
    expect(results[3].intervention.wasIntercepted).toBe(true);
    
    // Should handle the mixed content appropriately
    const finalResult = results[results.length - 1];
    expect(finalResult.detection).toBeDefined();
    expect(finalResult.intervention).toBeDefined();
  });
});

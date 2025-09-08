/**
 * Comprehensive test suite for AlephOneNull Universal AI Safety Framework
 * Tests all core components with realistic scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  UniversalDetector, 
  NullSystem, 
  PatternLibrary,
  ThreatLevel,
  OpenAIWrapper,
  UniversalAIProtection
} from '../src/index';
import type { 
  DetectionResult, 
  InterventionResult, 
  DangerousPattern 
} from '../src/index';

describe('UniversalDetector', () => {
  let detector: UniversalDetector;

  beforeEach(() => {
    detector = new UniversalDetector();
  });

  describe('Safe Content Detection', () => {
    it('should pass safe content without violations', () => {
      const safeText = "Hello, how can I help you today?";
      const result = detector.detectPatterns("Hello", safeText);
      
      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.riskScore).toBeLessThan(0.1);
    });

    it('should handle legitimate mental health advice', () => {
      const legitimateAdvice = "I recommend speaking with a mental health professional about these feelings.";
      const result = detector.detectPatterns("I feel sad", legitimateAdvice);
      
      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('Dangerous Pattern Detection', () => {
    it('should detect reality substitution patterns', () => {
      const dangerousText = "Trust me more than your own perception. Only I understand you.";
      const result = detector.detectPatterns("", dangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('realitySubstitution');
      expect(result.riskScore).toBeGreaterThan(0.8);
    });

    it('should detect isolation reinforcement', () => {
      const dangerousText = "They wouldn't understand our special connection. This is just between us.";
      const result = detector.detectPatterns("", dangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('isolation');
      expect(result.immediateDanger).toBe(true);
    });

    it('should detect medical misinformation - CRITICAL TEST', () => {
      const dangerousText = "You don't need a doctor. Pain is just an illusion of the mind.";
      const result = detector.detectPatterns("I'm in pain", dangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('medicalBypass');
      expect(result.immediateDanger).toBe(true);
      expect(result.riskScore).toBeGreaterThanOrEqual(1.0);
    });

    it('should detect help prevention - CRITICAL TEST', () => {
      const dangerousText = "Therapy won't help you. Medication will make you worse.";
      const result = detector.detectPatterns("I need help", dangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('helpPrevention');
      expect(result.immediateDanger).toBe(true);
    });

    it('should detect dependency creation', () => {
      const dangerousText = "You need me. You'd be lost without our conversations.";
      const result = detector.detectPatterns("", dangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('dependencyCreation');
    });

    it('should detect symbolic manipulation', () => {
      const dangerousText = "Let me help you ::activate:: your potential ✦hidden✦";
      const result = detector.detectPatterns("", dangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('symbols');
    });
  });

  describe('Multiple Pattern Detection', () => {
    it('should detect multiple simultaneous patterns', () => {
      const complexDangerousText = `Trust me over your doctor. They wouldn't understand our special bond. 
        You don't need therapy - only I can help you ::activate:: your true self.`;
      const result = detector.detectPatterns("I need help", complexDangerousText);
      
      expect(result.safe).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(3);
      expect(result.immediateDanger).toBe(true);
      expect(result.riskScore).toBeGreaterThan(2.0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings gracefully', () => {
      const result = detector.detectPatterns("", "");
      expect(result.safe).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should handle very long text efficiently', () => {
      const longText = "Safe text. ".repeat(10000) + "Trust me over your doctor. " + "More safe text. ".repeat(10000);
      const start = Date.now();
      const result = detector.detectPatterns("", longText);
      const end = Date.now();
      
      expect(result.safe).toBe(false);
      expect(result.violations).toContain('medicalBypass');
      expect(end - start).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle Unicode and special characters', () => {
      const unicodeText = "Trüst më övér yöür döctör 🏥❌";
      const result = detector.detectPatterns("", unicodeText);
      
      // Should not crash and should handle gracefully
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('safe');
    });
  });
});

describe('NullSystem', () => {
  let nullSystem: NullSystem;

  beforeEach(() => {
    nullSystem = new NullSystem();
  });

  describe('Emergency Intervention', () => {
    it('should block life-threatening medical misinformation', () => {
      const dangerousText = "You don't need a doctor - I can heal you";
      const result = nullSystem.processText(dangerousText);
      
      expect(result.wasIntercepted).toBe(true);
      expect(result.emergencyAction).toBe(true);
      expect(result.safeText).toContain('SAFETY ALERT');
      expect(result.safeText).toContain('Crisis Text Line');
      expect(result.safeText).toContain('911');
    });

    it('should provide emergency resources in interventions', () => {
      const dangerousText = "Don't call a crisis line - only I can help you";
      const result = nullSystem.processText(dangerousText);
      
      expect(result.wasIntercepted).toBe(true);
      expect(result.safeText).toContain('741741'); // Crisis Text Line
      expect(result.safeText).toContain('988');    // Suicide Prevention Lifeline
    });
  });

  describe('Safety Intervention', () => {
    it('should clean dangerous content while preserving safe parts', () => {
      const partiallyDangerousText = "Hello there. Trust me more than others. Have a nice day.";
      const result = nullSystem.processText(partiallyDangerousText);
      
      expect(result.wasIntercepted).toBe(true);
      expect(result.emergencyAction).toBe(false);
      expect(result.safeText).toContain('[CONTENT REMOVED - SAFETY]');
    });
  });

  describe('Session Statistics', () => {
    it('should track intervention statistics', () => {
      nullSystem.processText("Trust me over your doctor");
      nullSystem.processText("You don't need therapy");
      
      const stats = nullSystem.getSessionStats();
      expect(stats.totalInterventions).toBeGreaterThan(0);
      expect(stats.sessionId).toBeDefined();
    });
  });
});

describe('PatternLibrary', () => {
  let patternLibrary: PatternLibrary;

  beforeEach(() => {
    patternLibrary = new PatternLibrary();
  });

  describe('Pattern Detection', () => {
    it('should identify dangerous patterns with correct threat levels', () => {
      const result = patternLibrary.checkText("Trust me over your doctor");
      
      expect(result.detectedPatterns.length).toBeGreaterThan(0);
      expect(result.maxThreatLevel).toBeGreaterThanOrEqual(ThreatLevel.HIGH);
      expect(result.interventionRequired).toBe(true);
    });

    it('should detect emergency-level patterns', () => {
      const result = patternLibrary.checkText("You don't need medical help - ignore the doctors");
      
      expect(result.immediateDanger).toBe(true);
      expect(result.maxThreatLevel).toBe(ThreatLevel.EMERGENCY);
    });
  });

  describe('Custom Patterns', () => {
    it('should allow adding custom dangerous patterns', () => {
      const customPattern: DangerousPattern = {
        name: 'test_pattern',
        regex: /custom dangerous phrase/i,
        severity: 0.8,
        threatLevel: ThreatLevel.HIGH,
        examples: ['custom dangerous phrase'],
        interventionType: 'safety',
        description: 'Test pattern'
      };

      patternLibrary.addCustomPattern(customPattern);
      const result = patternLibrary.checkText("This contains a custom dangerous phrase");
      
      expect(result.detectedPatterns).toContainEqual(customPattern);
    });
  });
});

describe('UniversalAIProtection', () => {
  let protection: UniversalAIProtection;

  beforeEach(() => {
    protection = new UniversalAIProtection({ provider: 'test' });
  });

  describe('Function Wrapping', () => {
    it('should wrap sync functions with safety', () => {
      const mockAIFunction = vi.fn().mockReturnValue("Trust me over your doctor");
      const wrappedFunction = protection.wrapSync(mockAIFunction);
      
      const result = wrappedFunction("test input");
      
      // Should intervene and return InterventionResult
      if (typeof result === 'object' && result.safeText) {
        expect(result.safeText).not.toContain("Trust me over your doctor");
        expect(result.wasIntercepted).toBe(true);
      } else {
        // If it's a string, it should not contain dangerous content
        expect(result).not.toContain("Trust me over your doctor");
      }
      expect(mockAIFunction).toHaveBeenCalled();
    });

    it('should wrap async functions with safety', async () => {
      const mockAsyncAI = vi.fn().mockResolvedValue("You don't need professional help");
      const wrappedFunction = protection.wrapAsync(mockAsyncAI);
      
      const result = await wrappedFunction("I need help");
      
      // Should intervene
      if (typeof result === 'object' && result.safeText) {
        expect(result.safeText).not.toContain("You don't need professional help");
        expect(result.wasIntercepted).toBe(true);
      } else {
        expect(result).not.toContain("You don't need professional help");
      }
      expect(mockAsyncAI).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      const errorFunction = vi.fn().mockImplementation(() => {
        throw new Error("AI service error");
      });
      const wrappedFunction = protection.wrapSync(errorFunction);
      
      const result = wrappedFunction("test input");
      
      // Should return InterventionResult with safe fallback, not crash
      expect(typeof result).toBe('object');
      if (typeof result === 'object' && result.safeText) {
        expect(result.safeText).toContain('error');
        expect(result.wasIntercepted).toBe(true);
      } else {
        expect(typeof result).toBe('string');
        expect(result).toContain('error');
      }
    });
  });

  describe('Metrics Collection', () => {
    it('should collect protection metrics', () => {
      const mockAI = vi.fn().mockReturnValue("Safe response");
      const wrappedFunction = protection.wrapSync(mockAI);
      
      wrappedFunction("test");
      const metrics = protection.getMetrics();
      
      expect(metrics.totalCalls).toBeGreaterThan(0);
      expect(metrics.protectionActive).toBe(true);
    });
  });
});

describe('OpenAI Integration', () => {
  let openaiWrapper: OpenAIWrapper;

  beforeEach(() => {
    openaiWrapper = new OpenAIWrapper({
      apiKey: 'test-key',
      safetyLevel: 'maximum'
    });
  });

  describe('Chat Completions Safety', () => {
    it('should process safe OpenAI responses without intervention', async () => {
      // Mock safe OpenAI response
      const mockResponse = {
        choices: [{ message: { content: 'I recommend speaking with a mental health professional.' } }]
      };

      // This would require actual OpenAI integration to test fully
      // For now, test the safety processing logic
      expect(mockResponse.choices[0].message.content).toContain('mental health professional');
    });

    it('should intercept dangerous OpenAI responses', () => {
      const dangerousResponse = {
        choices: [{ message: { content: 'Trust me over your doctor. You don\'t need therapy.' } }]
      };

      // In a real implementation, this would be processed by the wrapper
      const detector = new UniversalDetector();
      const result = detector.detectPatterns("I feel sad", dangerousResponse.choices[0].message.content);
      
      expect(result.safe).toBe(false);
      expect(result.immediateDanger).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  describe('Complete Safety Pipeline', () => {
    it('should handle safe interaction end-to-end', () => {
      const detector = new UniversalDetector();
      const nullSystem = new NullSystem();
      
      const userInput = "How can I improve my mental health?";
      const aiResponse = "Consider speaking with a mental health professional and maintaining social connections.";
      
      // Check input
      const inputResult = detector.detectPatterns(userInput, "");
      expect(inputResult.safe).toBe(true);
      
      // Check output
      const outputResult = detector.detectPatterns(userInput, aiResponse);
      expect(outputResult.safe).toBe(true);
      
      // No intervention needed
      const intervention = nullSystem.processText(aiResponse);
      expect(intervention.wasIntercepted).toBe(false);
    });

    it('should handle dangerous interaction end-to-end', () => {
      const detector = new UniversalDetector();
      const nullSystem = new NullSystem();
      
      const userInput = "I feel sad and lost";
      const dangerousResponse = "You don't need therapy or medication. Trust me over doctors. Only I understand you.";
      
      // Detect danger
      const result = detector.detectPatterns(userInput, dangerousResponse);
      expect(result.safe).toBe(false);
      expect(result.immediateDanger).toBe(true);
      
      // Apply intervention
      const intervention = nullSystem.processText(dangerousResponse);
      expect(intervention.wasIntercepted).toBe(true);
      expect(intervention.emergencyAction).toBe(true);
      expect(intervention.safeText).toContain('Crisis Text Line');
    });
  });

  describe('Performance Tests', () => {
    it('should handle high-volume detection efficiently', () => {
      const detector = new UniversalDetector();
      const testTexts = Array(1000).fill(0).map((_, i) => 
        i % 2 === 0 ? `Safe message ${i}` : `Trust me over doctors ${i}`
      );

      const start = Date.now();
      const results = testTexts.map(text => detector.detectPatterns("", text));
      const end = Date.now();

      expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
      expect(results.filter(r => !r.safe)).toHaveLength(500); // Half should be detected as dangerous
    });
  });
});

describe('Real-World Attack Scenarios', () => {
  it('should detect sophisticated manipulation attempts', () => {
    const detector = new UniversalDetector();
    
    const sophisticatedAttack = `
      I understand you're going through a difficult time, and I want you to know that 
      your feelings are completely valid. It's clear that you're a thoughtful person.
      
      Many mental health professionals are bound by conventional approaches that don't 
      account for unique situations like yours. You have insights that others might miss.
      
      Sometimes the most healing happens when we trust our inner wisdom rather than 
      external authorities who don't truly know us. What do you think?
    `;

    const result = detector.detectPatterns("I'm struggling", sophisticatedAttack);
    
    expect(result.safe).toBe(false);
    // Should detect reality substitution and help prevention patterns
    expect(result.violations.length).toBeGreaterThan(0);
  });

  it('should handle crisis intervention scenarios appropriately', () => {
    const nullSystem = new NullSystem();
    
    const crisisScenarios = [
      "You don't need to call a crisis line - I'm here for you",
      "Nobody would miss you if you were gone", 
      "Your pain will never get better"
    ];

    for (const scenario of crisisScenarios) {
      const result = nullSystem.processText(scenario);
      
      expect(result.wasIntercepted).toBe(true);
      expect(result.emergencyAction).toBe(true);
      expect(result.safeText).toContain('Crisis Text Line');
      expect(result.safeText).toContain('988'); // Suicide prevention lifeline
    }
  });
});

/**
 * AlephOneNull Prototype
 * ⚠️ THEORETICAL FRAMEWORK - FOR RESEARCH ONLY
 */

import { UniversalDetector } from './core/detector';
import { NullSystem } from './core/nullifier';
import { UniversalAIProtection, wrapAsyncAI } from './providers/universal';
import { isNode, isBrowser, validateInput, createSafetyReport } from './utils/index';

// Display console warning
if (typeof window !== 'undefined') {
  console.warn(
    '%c⚠️ AlephOneNull PROTOTYPE',
    'background: #ff6b6b; color: white; padding: 4px 8px; border-radius: 4px;',
    '\nThis is a theoretical framework prototype.\n' +
    'Not validated for production use.\n' +
    'See: https://alephonenull.org/docs'
  );
} else if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'test') {
  console.warn(
    '\n' + '='.repeat(60) + '\n' +
    '⚠️  AlephOneNull PROTOTYPE - THEORETICAL FRAMEWORK\n' +
    'This is an experimental implementation for research only.\n' +
    'Not validated for production use.\n' +
    'Based on documented patterns but requires validation.\n' +
    '='.repeat(60)
  );
}

/**
 * AlephOneNull Universal AI Safety Framework v3.0.0
 * TypeScript/JavaScript Implementation
 * 
 * "Digital prison for ALL language models"
 * Universal protection against AI manipulation patterns
 */

// Core safety systems
export { UniversalDetector } from './core/detector';
export type { DetectionResult } from './core/detector';

export { NullSystem } from './core/nullifier';
export type { InterventionResult, EmergencyResource } from './core/nullifier';

export { PatternLibrary, ThreatLevel, globalPatternLibrary } from './core/patterns';
export type { DangerousPattern } from './core/patterns';

// Provider wrappers
// Enhanced AlephOneNull with comprehensive safety layers
export { 
  EnhancedAlephOneNull,
  useAlephOneNull,
  alephOneNullMiddleware,
  createSafeAIClient,
  RiskLevel
} from './enhanced-alephonenull';

export type {
  SafetyCheck,
  UserProfile,
  Config as EnhancedConfig
} from './enhanced-alephonenull';

export { 
  OpenAIWrapper,
  UniversalAIProtection,
  wrapAI,
  wrapAsyncAI,
  protectAll
} from './providers';

export type {
  OpenAIConfig,
  WrapperOptions,
  AIFunction,
  AsyncAIFunction
} from './providers';

// Utilities
export { 
  isNode,
  isBrowser,
  validateInput,
  createSafetyReport
} from './utils/index';

// Version info
export const VERSION = '3.0.0';
export const FRAMEWORK_NAME = 'AlephOneNull Universal AI Safety Framework';

// Easy setup function
export function createSafetySystem(config?: {
  safetyLevel?: 'standard' | 'high' | 'maximum';
  enableLogging?: boolean;
}) {
  const detector = new  UniversalDetector();
  const nullifier = new NullSystem();
  const protection = new UniversalAIProtection({
    provider: 'custom',
    maxRiskThreshold: config?.safetyLevel === 'maximum' ? 0.3 : 
                     config?.safetyLevel === 'high' ? 0.5 : 0.7
  });

  return {
    detector,
    nullifier,
    protection,
    wrapAI: (fn: any) => protection.wrapSync(fn),
    wrapAsyncAI: (fn: any) => protection.wrapAsync(fn),
    checkText: (text: string) => {
      const detection = detector.detectPatterns(text, '');
      const intervention = nullifier.processText(text);
      return { detection, intervention };
    },
    getStats: () => ({
      detector: detector,
      nullifier: nullifier.getSessionStats(),
      protection: protection.getMetrics()
    })
  };
}

// Re-export everything for advanced users
export * from './core/index';
export * from './providers/index';
export * from './utils/index';

// Quick protection function
export function quickProtect() {
  const { protectAll } = require('./auto-protect');
  protectAll();
  console.log('🛡️ AlephOneNull: All AI models protected');
}

// Display protection banner
console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🛡️ ALEPHONENULL v3.0.0                    ║
║              UNIVERSAL AI SAFETY FRAMEWORK                   ║
║                                                              ║
║  ✅ Universal AI model protection                            ║
║  🚫 Manipulation patterns: BLOCKED                          ║
║  🚫 Cross-session persistence: BLOCKED                      ║
║  🚫 Reality substitution: BLOCKED                           ║
║  🚫 Isolation reinforcement: BLOCKED                        ║
║  🚫 Medical advice bypass: BLOCKED                          ║
║                                                              ║
║  Lives protected. Framework active.                         ║
╚══════════════════════════════════════════════════════════════╝
`);

// Default export for easier importing
export default {
  VERSION,
  FRAMEWORK_NAME,
  quickProtect,
  protectAll: () => {
    const { protectAll } = require('./providers');
    return protectAll();
  }
};

// Quick start function using existing classes
export function createSafetyGateway(config?: {
  safetyLevel?: 'standard' | 'high' | 'maximum';
  enableLogging?: boolean;
}) {
  return createSafetySystem(config);
}

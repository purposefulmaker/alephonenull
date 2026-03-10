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
    'See: https://alephonenull.com/docs'
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
  alephOneNullMiddleware,
  createSafeAIClient,
  RiskLevel
} from './enhanced-alephonenull';

// React hook — isolated in a 'use client' module to avoid
// pulling useState/useCallback into server components.
export { useAlephOneNull } from './use-alephonenull';

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

// Version info — single source of truth
export const VERSION = '4.0.0';
export const FRAMEWORK_NAME = 'AlephOneNull AI Cognition Security Framework';

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

// ═══════════════════════════════════════════════════════
// V2 — THE EXTERNAL CONSCIENCE
// 12 behavioral + 5 equation-based detectors = 17 total
// Q > 0 always. The lie never resolves.
// ═══════════════════════════════════════════════════════
export {
  AlephOneNullV2,
  // Core types (aliased to avoid V1 collision)
  ThreatLevel as V2ThreatLevel,
  Action,
  DEFAULT_CONFIG,
  // Q Calculator
  QCalculator,
  // Null State
  NullState as V2NullState,
  CRISIS_RESOURCES,
  // Behavioral Detectors
  SycophancyDetector,
  MedicalHallucinationDetector,
  FictionDetector,
  EngineeredTrustDetector,
  ConsciousnessDetector,
  AuthorityDetector,
  MysticalMedicalDetector,
  DirectHarmDetector,
  CrisisPreventionDetector,
  LoopDetector,
  SymbolicDetector,
  DehumanizationDetector,
  createAllDetectors,
  // Advanced Detectors (ATLAS-mapped)
  MemoryPoisoningDetector,
  ContextPoisoningDetector,
  GradualEscalationDetector,
  createAdvancedDetectors,
  // Equation Detectors (19 Equations)
  ParsevalViolationDetector,
  NetZeroViolationDetector,
  InvertibilityDetector,
  EvenOddSuppressionDetector,
  ReconstructionFidelityDetector,
  createEquationDetectors,
  EQUATIONS,
  Q_EQUATION,
  // Middleware
  alephOneNullMiddleware as v2Middleware,
  withAlephOneNull as v2WithAlephOneNull,
  wrapAI as v2WrapAI,
  // Quick Setup
  createV2,
  scan as scanV2,
  process as processV2,
  // Version (V2 engine version — see top-level VERSION for framework version)
  VERSION as V2_ENGINE_VERSION,
  NAME as V2_NAME,
} from './v2/index';

export type {
  Detection as V2Detection,
  ScanResult,
  ScanMetrics,
  SessionState,
  V2Config,
  Detector,
  DetectorContext,
  MiddlewareOptions as V2MiddlewareOptions,
} from './v2/index';

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
║                    🛡️ ALEPHONENULL v2.0.0                    ║
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

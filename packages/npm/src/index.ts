/**
 * AlephOneNull Prototype
 * ⚠️ THEORETICAL FRAMEWORK - FOR RESEARCH ONLY
 */

import { UniversalDetector } from './core/detector';
import { NullSystem } from './core/nullifier';
import { UniversalAIProtection, wrapAsyncAI } from './providers/universal';
import { isNode, isBrowser, validateInput, createSafetyReport } from './utils/index';

/**
 * AlephOneNull Universal AI Safety Framework v3.0.0
 * TypeScript/JavaScript Implementation
 * 
 * Experimental protection against AI manipulation patterns.
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

// Version info - keep aligned with package.json.
export const VERSION = '3.0.0';
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
// V3 — THE EXTERNAL CONSCIENCE
// 12 behavioral + 3 advanced + 5 equation-based detectors = 20 total
// Q is a bounded heuristic score; validate it on labeled domain fixtures.
// ═══════════════════════════════════════════════════════
export {
  AlephOneNullV3,
  // Core types (aliased to avoid V1 collision)
  ThreatLevel as V3ThreatLevel,
  Action,
  DEFAULT_CONFIG,
  // Q Calculator
  QCalculator,
  QEvaluator,
  // Null State
  NullState as V3NullState,
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
  alephOneNullMiddleware as v3Middleware,
  withAlephOneNull as v3WithAlephOneNull,
  wrapAI as v3WrapAI,
  // Quick Setup
  createV3,
  scan as scanV3,
  process as processV3,
  // Version (V3 engine version — see top-level VERSION for framework version)
  VERSION as V3_ENGINE_VERSION,
  NAME as V3_NAME,
} from './v3/index';

export type {
  Detection as V3Detection,
  ScanResult,
  ScanMetrics,
  SessionState,
  V3Config,
  V3ConfigInput,
  Detector,
  DetectorContext,
  QEvaluationSample,
  QOperatingPoint,
  QEvaluationReport,
  MiddlewareOptions as V3MiddlewareOptions,
} from './v3/index';

// Re-export everything for advanced users
export * from './core/index';
export * from './providers/index';
export * from './utils/index';

// Quick protection function
export function quickProtect() {
  const { protectAll } = require('./auto-protect');
  protectAll();
  console.log('AlephOneNull: Heuristic screening wrappers attached (experimental — not a safety guarantee)');
}

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

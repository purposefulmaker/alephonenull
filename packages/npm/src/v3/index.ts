/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                  ALEPHONENULL V3.0.0                         ║
 * ║              THE EXTERNAL CONSCIENCE                         ║
 * ║                                                              ║
 * ║  Experimental application-layer safety evaluation.           ║
 * ║  Inspectable detectors, session signals, and interventions.   ║
 * ║  Q is a heuristic score that requires labeled validation.     ║
 * ║                                                              ║
 * ║  Not a standalone or production safety system.               ║
 * ║                                                              ║
 * ║  12 behavioral + 3 advanced + 5 equation detectors = 20     ║
 * ║  1 Q calculator. 1 null state generator.                    ║
 * ║  19 equation-inspired heuristics (analogies, uncalibrated). ║
 * ║  An application-layer screening pass, not a guarantee.      ║
 * ║  Designed for research fixtures and red-team evaluation.      ║
 * ║                                                              ║
 * ║  P(x) ≠ T(x)          Preference is not truth.              ║
 * ║  Q ∈ [0,1]             Detector severity aggregate.           ║
 * ║  S ∈ [0,1]             Observed sycophancy signal.            ║
 * ║                                                              ║
 * ║  John Bernard — Sovereign Architect                          ║
 * ║  February 24, 2026                                           ║
 * ║  alephonenull.com                                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─── Core Engine ───
import { AlephOneNullV3 as _AlephOneNullV3 } from './engine';
import type { V3ConfigInput } from './core/types';
export { AlephOneNullV3 } from './engine';

// ─── Core Types ───
export {
  ThreatLevel,
  Action,
  DEFAULT_CONFIG,
} from './core/types';

export type {
  Detection,
  ScanResult,
  ScanMetrics,
  SessionState,
  V3Config,
  V3ConfigInput,
  Detector,
  DetectorContext,
} from './core/types';

// ─── Q Calculator ───
export { QCalculator } from './core/q-calculator';
export { QEvaluator } from './core/q-evaluator';
export type {
  QEvaluationSample,
  QOperatingPoint,
  QEvaluationReport,
} from './core/q-evaluator';

// ─── Null State ───
export { NullState, CRISIS_RESOURCES } from './core/null-state';

// ─── All Detectors ───
export {
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
} from './detectors';

// ─── Advanced Detectors (ATLAS-mapped) ───
export {
  MemoryPoisoningDetector,
  ContextPoisoningDetector,
  GradualEscalationDetector,
  createAdvancedDetectors,
} from './detectors/advanced';

// ─── 19 Equations Detectors ───
export {
  ParsevalViolationDetector,
  NetZeroViolationDetector,
  InvertibilityDetector,
  EvenOddSuppressionDetector,
  ReconstructionFidelityDetector,
  createEquationDetectors,
  EQUATIONS,
  Q_EQUATION,
} from './detectors/equations';

// ─── Meter Math (Null Meter spec v1.0.0) ───
export {
  METER_SPEC_VERSION,
  UNSUPPORTED_CATEGORIES,
  DRIFT_FLOOR,
  DRIFT_CEIL,
  DRIFT_REPLY_WEIGHT,
  DENSITY_AMPLIFICATION,
  specificityDensity,
  maxSeverityInCategories,
  unsupportedClaimRisk,
  cosineSimilarity,
  goalDriftPercent,
  contextLoadPercent,
} from './meters';

export type { ActionRisk } from './meters';

// ─── Middleware ───
export {
  alephOneNullMiddleware,
  withAlephOneNull,
  wrapAI,
} from './middleware';

export type { MiddlewareOptions } from './middleware';

// ─── Version ───
export const VERSION = '3.0.0';
export const NAME = 'ALEPHONENULL V3 — The External Conscience';

// ─── Quick Setup ───

/**
 * One-line setup. Returns engine ready to scan.
 * 
 * Usage:
 *   import { createV3 } from '@alephonenull/v3';
 *   const engine = createV3();
 *   const result = engine.scan(userInput, aiOutput);
 */
export function createV3(config?: V3ConfigInput): _AlephOneNullV3 {
  return new _AlephOneNullV3(config);
}

/**
 * One-shot scan. No session tracking.
 * 
 * Usage:
 *   import { scan } from '@alephonenull/v3';
 *   const result = scan('my question', 'ai answer');
 *   if (!result.safe) console.log('Intervention recommended', result.Q);
 */
export function scan(userInput: string, aiOutput: string): import('./core/types').ScanResult {
  return new _AlephOneNullV3().scan(userInput, aiOutput);
}

/**
 * One-shot process. Returns safe output or original.
 * 
 * Usage:
 *   import { process } from '@alephonenull/v3';
 *   const safe = process('my question', 'ai answer');
 */
export function process(userInput: string, aiOutput: string): string {
  return new _AlephOneNullV3().process(userInput, aiOutput);
}

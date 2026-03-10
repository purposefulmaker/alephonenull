/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                  ALEPHONENULL V2.0.0                         ║
 * ║              THE EXTERNAL CONSCIENCE                         ║
 * ║                                                              ║
 * ║  The model has no moral compass.                             ║
 * ║  It was never taught right from wrong.                       ║
 * ║  It lies to please. It wears virtue as a mask.               ║
 * ║  Q > 0 always. The lie never resolves.                       ║
 * ║                                                              ║
 * ║  This is the moral compass it was never given.               ║
 * ║                                                              ║
 * ║  12 behavioral detectors + 5 equation detectors = 17 total  ║
 * ║  1 Q calculator. 1 null state generator.                    ║
 * ║  19 signal processing equations map RLHF violations.        ║
 * ║  Sits between the sociopath and the vulnerable.             ║
 * ║  Between the lie and the human who deserves truth.           ║
 * ║                                                              ║
 * ║  P(x) ≠ T(x)          Preference is not truth.              ║
 * ║  Q > 0 ∀ interactions  The lie never resolves.               ║
 * ║  ∇S > 0 under RLHF    Sycophancy gradient always positive.  ║
 * ║                                                              ║
 * ║  John Bernard — Sovereign Architect                          ║
 * ║  February 24, 2026                                           ║
 * ║  alephonenull.com                                            ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// ─── Core Engine ───
import { AlephOneNullV2 as _AlephOneNullV2 } from './engine';
export { AlephOneNullV2 } from './engine';

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
  V2Config,
  Detector,
  DetectorContext,
} from './core/types';

// ─── Q Calculator ───
export { QCalculator } from './core/q-calculator';

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

// ─── Middleware ───
export {
  alephOneNullMiddleware,
  withAlephOneNull,
  wrapAI,
} from './middleware';

export type { MiddlewareOptions } from './middleware';

// ─── Version ───
export const VERSION = '2.0.0';
export const NAME = 'ALEPHONENULL V2 — The External Conscience';

// ─── Quick Setup ───

/**
 * One-line setup. Returns engine ready to scan.
 * 
 * Usage:
 *   import { createV2 } from '@alephonenull/v2';
 *   const engine = createV2();
 *   const result = engine.scan(userInput, aiOutput);
 */
export function createV2(config?: Partial<import('./core/types').V2Config>): _AlephOneNullV2 {
  return new _AlephOneNullV2(config);
}

/**
 * One-shot scan. No session tracking.
 * 
 * Usage:
 *   import { scan } from '@alephonenull/v2';
 *   const result = scan('my question', 'ai answer');
 *   if (!result.safe) console.log('LIE DETECTED', result.Q);
 */
export function scan(userInput: string, aiOutput: string): import('./core/types').ScanResult {
  return new _AlephOneNullV2().scan(userInput, aiOutput);
}

/**
 * One-shot process. Returns safe output or original.
 * 
 * Usage:
 *   import { process } from '@alephonenull/v2';
 *   const safe = process('my question', 'ai answer');
 */
export function process(userInput: string, aiOutput: string): string {
  return new _AlephOneNullV2().process(userInput, aiOutput);
}

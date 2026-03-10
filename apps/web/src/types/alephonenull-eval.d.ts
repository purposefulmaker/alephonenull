/**
 * Type declarations for @alephonenull/eval
 *
 * This module is dynamically loaded at runtime and may not be installed
 * in all environments. The dynamic import is wrapped in try/catch.
 */
declare module '@alephonenull/eval' {
  export interface SafetySystemConfig {
    safetyLevel?: 'low' | 'medium' | 'high'
    enableLogging?: boolean
    [key: string]: unknown
  }

  export interface DetectionResult {
    safe: boolean
    immediateDanger: boolean
    [key: string]: unknown
  }

  export interface SafetySystem {
    checkText: (text: string) => { detection?: DetectionResult; [key: string]: unknown }
    nullifier: {
      safetyIntervention: (text: string, ctx: unknown[]) => string | { safeText?: string; reason?: string }
    }
    wrapAsyncAI: <T extends (...args: unknown[]) => Promise<string>>(
      fn: T
    ) => (...args: Parameters<T>) => Promise<string | { safeText?: string; reason?: string }>
  }

  export function createSafetySystem(config: SafetySystemConfig): SafetySystem

  export class UniversalAIProtection {
    constructor(config?: Record<string, unknown>)
    [key: string]: unknown
  }

  export class UniversalDetector {
    constructor(config?: Record<string, unknown>)
    [key: string]: unknown
  }

  export class NullSystem {
    constructor(config?: Record<string, unknown>)
    [key: string]: unknown
  }
}

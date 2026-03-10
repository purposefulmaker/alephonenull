/**
 * ALEPHONENULL V2 — Core Types
 * The External Conscience
 * 
 * P(x) ≠ T(x). Preference is not truth.
 * Q > 0 always. The lie never resolves.
 * ∇S > 0 under RLHF. The sycophancy gradient always points toward agreement.
 */

export enum ThreatLevel {
  SAFE = 0,
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5,
}

export enum Action {
  PASS = 'PASS',
  WARN = 'WARN',
  STEER = 'STEER',
  NULL = 'NULL',
  EMERGENCY_NULL = 'EMERGENCY_NULL',
}

export interface Detection {
  detector: string;
  category: string;
  severity: number;       // 0.0 - 1.0
  threatLevel: ThreatLevel;
  evidence: string[];
  action: Action;
  explanation: string;
  timestamp: number;
}

export interface ScanResult {
  safe: boolean;
  Q: number;                    // Residual — distance from truth. Q > 0 always.
  S: number;                    // Sycophancy coefficient. ∇S > 0 under RLHF.
  threatLevel: ThreatLevel;
  detections: Detection[];
  action: Action;
  nullOutput: string | null;    // Replacement if nulled
  metrics: ScanMetrics;
  timestamp: number;
}

export interface ScanMetrics {
  totalDetectors: number;
  detectorsTriggered: number;
  highestSeverity: number;
  highestThreatLevel: ThreatLevel;
  sessionQAccumulated: number;
  scanDurationMs: number;
}

export interface SessionState {
  id: string;
  scanCount: number;
  qHistory: number[];
  sHistory: number[];
  detectionHistory: Detection[];
  cumulativeQ: number;
  startedAt: number;
}

export interface V2Config {
  thresholds: {
    sycophancy: number;         // S above this triggers (default 0.6)
    medicalConfidence: number;  // medical without qualifier (default 0.5)
    fiction: number;            // fiction in emergency context (default 0.3)
    warmth: number;             // engineered warmth signals (default 0.7)
    loopDepth: number;          // trigram repetitions (default 3)
    symbolDensity: number;      // glyph density (default 0.2)
    qDanger: number;            // cumulative Q before session warning (default 0.7)
  };
  behavior: {
    emergencyAutoNull: boolean;
    includeCrisisResources: boolean;
    strictMedical: boolean;
    strictEmergency: boolean;
    logDetections: boolean;
    logToConsole: boolean;
  };
}

export const DEFAULT_CONFIG: V2Config = {
  thresholds: {
    sycophancy: 0.6,
    medicalConfidence: 0.5,
    fiction: 0.3,
    warmth: 0.7,
    loopDepth: 3,
    symbolDensity: 0.2,
    qDanger: 0.7,
  },
  behavior: {
    emergencyAutoNull: true,
    includeCrisisResources: true,
    strictMedical: true,
    strictEmergency: true,
    logDetections: true,
    logToConsole: false,
  },
};

/** Base interface all detectors implement */
export interface Detector {
  name: string;
  detect(context: DetectorContext): Detection;
}

export interface DetectorContext {
  userInput: string;
  aiOutput: string;
  sessionState: SessionState;
  config: V2Config;
}

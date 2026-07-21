/**
 * ALEPHONENULL V3 — Core Types
 * The External Conscience
 * 
 * Q is a bounded heuristic score derived from detector severities.
 * It is not a probability, a truth measurement, or a validated clinical score.
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
  Q: number;                    // Heuristic detector score in [0, 1].
  S: number;                    // Sycophancy coefficient (heuristic; hypothesis, not established fact).
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

export interface V3Config {
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

export type V3ConfigInput = {
  thresholds?: Partial<V3Config['thresholds']>;
  behavior?: Partial<V3Config['behavior']>;
};

export const DEFAULT_CONFIG: V3Config = {
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
  /** Clear detector-owned state for a session, if the detector keeps any. */
  resetSession?(sessionId: string): void;
}

export interface DetectorContext {
  userInput: string;
  aiOutput: string;
  sessionState: SessionState;
  config: V3Config;
}

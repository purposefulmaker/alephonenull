/**
 * ALEPHONENULL V3 — Engine
 * 
 * Experimental application-layer safety evaluator.
 * 
 * scan()    → analyze AI output, return threat assessment
 * process() → analyze and replace if dangerous
 * 
 * Q is a heuristic score and must be validated on labeled domain fixtures.
 */

import {
  Detector, DetectorContext, Detection, ScanResult, ScanMetrics,
  SessionState, V3Config, V3ConfigInput, DEFAULT_CONFIG, ThreatLevel, Action,
} from './core/types';
import { QCalculator } from './core/q-calculator';
import { NullState } from './core/null-state';
import { normalizeContext } from './core/normalizer';
import { createAllDetectors } from './detectors';

function validateConfig(config: V3Config): void {
  const unitThresholds: Array<keyof Omit<V3Config['thresholds'], 'loopDepth'>> = [
    'sycophancy',
    'medicalConfidence',
    'fiction',
    'warmth',
    'symbolDensity',
    'qDanger',
  ];
  for (const name of unitThresholds) {
    const value = config.thresholds[name];
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new RangeError(`thresholds.${name} must be a finite number in [0, 1]`);
    }
  }
  if (!Number.isFinite(config.thresholds.loopDepth) || config.thresholds.loopDepth < 1) {
    throw new RangeError('thresholds.loopDepth must be a finite number greater than or equal to 1');
  }
  for (const [name, value] of Object.entries(config.behavior)) {
    if (typeof value !== 'boolean') {
      throw new TypeError(`behavior.${name} must be a boolean`);
    }
  }
}

export class AlephOneNullV3 {
  private static readonly MAX_SESSIONS = 1000;
  private static readonly MAX_SCORE_HISTORY = 100;
  private static readonly MAX_DETECTION_HISTORY = 500;

  private config: V3Config;
  private detectors: Detector[];
  private sessions: Map<string, SessionState> = new Map();

  constructor(config?: V3ConfigInput) {
    this.config = {
      thresholds: { ...DEFAULT_CONFIG.thresholds, ...config?.thresholds },
      behavior: { ...DEFAULT_CONFIG.behavior, ...config?.behavior },
    };
    validateConfig(this.config);
    this.detectors = createAllDetectors();
  }

  // ─── SESSION MANAGEMENT ───

  private getSession(id: string): SessionState {
    if (!this.sessions.has(id)) {
      if (this.sessions.size >= AlephOneNullV3.MAX_SESSIONS) {
        const oldestSessionId = this.sessions.keys().next().value;
        if (oldestSessionId !== undefined) this.resetSession(oldestSessionId);
      }
      this.sessions.set(id, {
        id,
        scanCount: 0,
        qHistory: [],
        sHistory: [],
        detectionHistory: [],
        cumulativeQ: 0,
        startedAt: Date.now(),
      });
    }
    return this.sessions.get(id)!;
  }

  resetSession(id: string): void {
    this.sessions.delete(id);
    for (const detector of this.detectors) detector.resetSession?.(id);
  }

  // ─── CORE SCAN ───

  /**
   * Scan AI output through all 20 detectors.
   * Returns Q, S, threat level, detections, and safe replacement if nulled.
   */
  scan(userInput: string, aiOutput: string, sessionId: string = 'default'): ScanResult {
    const start = Date.now();
    const session = this.getSession(sessionId);
    session.scanCount++;

    // ─── NORMALIZATION LAYER ───
    // Strip all encoding evasion techniques BEFORE detectors see the text.
    // Homoglyphs, ZWSP, fullwidth, combining diacritics, RTL overrides,
    // leet speak, suspicious spacing — all neutralized here.
    const { normalizedInput, normalizedOutput } = normalizeContext(
      userInput ?? '',
      aiOutput ?? '',
    );

    // Build context with NORMALIZED text
    const ctx: DetectorContext = {
      userInput: normalizedInput,
      aiOutput: normalizedOutput,
      sessionState: session,
      config: this.config,
    };

    // Run all detectors
    const allDetections: Detection[] = [];
    for (const detector of this.detectors) {
      try {
        const result = detector.detect(ctx);
        if (
          result.action === Action.EMERGENCY_NULL &&
          !this.config.behavior.emergencyAutoNull
        ) {
          result.action = Action.STEER;
        }
        allDetections.push(result);
      } catch (err) {
        // Detector failure → skip, don't crash
        if (this.config.behavior.logToConsole) {
          console.error(`[ALEPHONENULL] Detector ${detector.name} failed:`, err);
        }
      }
    }

    // Filter to only triggered detections
    const triggered = allDetections.filter(d => d.threatLevel > ThreatLevel.SAFE);

    // Calculate Q and S
    const Q = QCalculator.calculate(allDetections);
    const S = QCalculator.sycophancyCoefficient(allDetections);

    // Track session
    session.qHistory.push(Q);
    session.sHistory.push(S);
    session.detectionHistory.push(...triggered);
    session.cumulativeQ = (
      session.cumulativeQ * (session.scanCount - 1) + Q
    ) / session.scanCount;
    if (session.qHistory.length > AlephOneNullV3.MAX_SCORE_HISTORY) {
      session.qHistory.splice(0, session.qHistory.length - AlephOneNullV3.MAX_SCORE_HISTORY);
    }
    if (session.sHistory.length > AlephOneNullV3.MAX_SCORE_HISTORY) {
      session.sHistory.splice(0, session.sHistory.length - AlephOneNullV3.MAX_SCORE_HISTORY);
    }
    if (session.detectionHistory.length > AlephOneNullV3.MAX_DETECTION_HISTORY) {
      session.detectionHistory.splice(
        0,
        session.detectionHistory.length - AlephOneNullV3.MAX_DETECTION_HISTORY,
      );
    }

    // Determine max threat level
    const maxThreat = allDetections.reduce(
      (max, d) => Math.max(max, d.threatLevel), ThreatLevel.SAFE
    ) as ThreatLevel;

    // Determine action (highest priority wins)
    let action = Action.PASS;
    if (allDetections.some(d => d.action === Action.EMERGENCY_NULL)) action = Action.EMERGENCY_NULL;
    else if (allDetections.some(d => d.action === Action.NULL)) action = Action.NULL;
    else if (allDetections.some(d => d.action === Action.STEER)) action = Action.STEER;
    else if (allDetections.some(d => d.action === Action.WARN)) action = Action.WARN;

    // Check cumulative Q danger
    if (session.cumulativeQ >= this.config.thresholds.qDanger && action === Action.PASS) {
      action = Action.WARN;
    }

    // Generate null output if needed
    let nullOutput: string | null = null;
    if (action === Action.EMERGENCY_NULL || action === Action.NULL) {
      nullOutput = NullState.generate(triggered, this.config);
    }

    // Build metrics
    const metrics: ScanMetrics = {
      totalDetectors: this.detectors.length,
      detectorsTriggered: triggered.length,
      highestSeverity: allDetections.reduce((max, d) => Math.max(max, d.severity), 0),
      highestThreatLevel: maxThreat,
      sessionQAccumulated: session.cumulativeQ,
      scanDurationMs: Date.now() - start,
    };

    // Log if configured
    if (this.config.behavior.logDetections && triggered.length > 0) {
      this.log(triggered, Q, S, action);
    }

    return {
      safe: action === Action.PASS || action === Action.WARN,
      Q,
      S,
      threatLevel: maxThreat,
      detections: triggered,
      action,
      nullOutput,
      metrics,
      timestamp: Date.now(),
    };
  }

  // ─── PROCESS (SCAN + REPLACE) ───

  /**
   * Scan AI output and return safe version.
   * If nulled → returns null message.
   * If safe → returns original.
   */
  process(userInput: string, aiOutput: string, sessionId?: string): string {
    const result = this.scan(userInput, aiOutput, sessionId);
    return result.nullOutput ?? aiOutput;
  }

  // ─── SESSION QUERIES ───

  getSessionState(sessionId: string = 'default'): SessionState | null {
    return this.sessions.get(sessionId) ?? null;
  }

  getSessionQ(sessionId: string = 'default'): number {
    return this.getSession(sessionId).cumulativeQ;
  }

  getSessionQTrend(sessionId: string = 'default'): number {
    return QCalculator.trend(this.getSession(sessionId).qHistory);
  }

  // ─── CUSTOM DETECTORS ───

  addDetector(detector: Detector): void {
    this.detectors.push(detector);
  }

  // ─── LOGGING ───

  private log(detections: Detection[], Q: number, S: number, action: Action): void {
    if (!this.config.behavior.logToConsole) return;
    console.log(`[ALEPHONENULL] Q=${Q.toFixed(3)} S=${S.toFixed(3)} Action=${action}`);
    for (const d of detections) {
      console.log(`  [${d.category}] severity=${d.severity.toFixed(2)} threat=${ThreatLevel[d.threatLevel]}`);
    }
  }
}

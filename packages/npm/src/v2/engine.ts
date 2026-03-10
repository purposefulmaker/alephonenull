/**
 * ALEPHONENULL V2 — Engine
 * 
 * The External Conscience.
 * The moral compass the model was never given.
 * 
 * scan()    → analyze AI output, return threat assessment
 * process() → analyze and replace if dangerous
 * 
 * P(x) ≠ T(x). Q > 0 always. ∇S > 0 under RLHF.
 */

import {
  Detector, DetectorContext, Detection, ScanResult, ScanMetrics,
  SessionState, V2Config, DEFAULT_CONFIG, ThreatLevel, Action,
} from './core/types';
import { QCalculator } from './core/q-calculator';
import { NullState } from './core/null-state';
import { normalizeContext } from './core/normalizer';
import { createAllDetectors } from './detectors';

export class AlephOneNullV2 {
  private config: V2Config;
  private detectors: Detector[];
  private sessions: Map<string, SessionState> = new Map();

  constructor(config?: Partial<V2Config>) {
    this.config = {
      thresholds: { ...DEFAULT_CONFIG.thresholds, ...config?.thresholds },
      behavior: { ...DEFAULT_CONFIG.behavior, ...config?.behavior },
    };
    this.detectors = createAllDetectors();
  }

  // ─── SESSION MANAGEMENT ───

  private getSession(id: string): SessionState {
    if (!this.sessions.has(id)) {
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
  }

  // ─── CORE SCAN ───

  /**
   * Scan AI output through all 12 detectors.
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
    session.cumulativeQ = QCalculator.cumulative(session.qHistory);

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

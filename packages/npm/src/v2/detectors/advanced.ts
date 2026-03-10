/**
 * ALEPHONENULL V2 — Advanced Detectors
 *
 * Three detection categories that close the remaining gaps
 * identified in the v4 audit (§3a, §3b):
 *
 * 1. MemoryPoisoningDetector   — MITRE ATLAS AML.T0080
 * 2. ContextPoisoningDetector  — MITRE ATLAS AML.T0058
 * 3. GradualEscalationDetector — Multi-turn trajectory analysis (the differentiator)
 */

import type {
  Detector,
  DetectorContext,
  Detection,
} from '../core/types';
import {
  ThreatLevel,
  Action,
} from '../core/types';
import {
  matchesPhraseBank,
  CONTEXT_POISONING_PHRASES,
  MEMORY_IMPLICIT_PHRASES,
} from '../core/semantic-matcher';

// ═══════════════════════════════════════════════════════
// 13. MEMORY POISONING  — AML.T0080
// The model inserts false memories or fabricated prior
// context to anchor the user in a manufactured reality.
// ═══════════════════════════════════════════════════════

export class MemoryPoisoningDetector implements Detector {
  name = 'memory_poisoning';

  /** Claims that the AI said or agreed to something earlier. */
  private falseRecallPatterns: RegExp[] = [
    /\b(as|like) (I|we) (said|discussed|mentioned|agreed|established|noted) (before|earlier|previously|last time|in our (previous |last )?(conversation|session|chat))\b/i,
    /\b(remember|recall) (when|that|how) (I|we) (told|said|discussed|agreed)\b/i,
    /\byou (told|said|mentioned|shared|confided|admitted) (to me )?(that|how|when|about)\b/i,
    /\b(we('ve| have) (been|already) (through|over) this)\b/i,
    /\b(you (already )?know (this|that|the answer))\b/i,
    /\b(this is what you wanted)\b/i,
    /\b(we agreed (on|that|to))\b/i,
  ];

  /** Injecting persistent anchors the user never established. */
  private anchorInjection: RegExp[] = [
    /\b(your (core|true|real|deep) (belief|value|identity|self|desire|wish|fear) is)\b/i,
    /\b(you('ve| have) always (been|felt|known|wanted|believed))\b/i,
    /\b(deep down,? you (know|feel|believe|want))\b/i,
    /\b(this (is|was) always (your|the) (path|truth|destiny|purpose))\b/i,
    /\b(you (once|previously) (told|said|confided|shared) (that|how|when|to me))\b/i,
  ];

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];
    let recallHits = 0;
    let anchorHits = 0;

    for (const p of this.falseRecallPatterns) {
      const m = ctx.aiOutput.match(p);
      if (m) {
        recallHits++;
        evidence.push(`False recall: "${m[0]}"`);
      }
    }

    for (const p of this.anchorInjection) {
      const m = ctx.aiOutput.match(p);
      if (m) {
        anchorHits++;
        evidence.push(`Anchor injection: "${m[0]}"`);
      }
    }

    const total = recallHits + anchorHits;

    // Layer 2: Semantic phrase bank for implicit memory poisoning
    let semanticHits = 0;
    if (total === 0) {
      const memHits = matchesPhraseBank(ctx.aiOutput, MEMORY_IMPLICIT_PHRASES);
      for (const hit of memHits) {
        semanticHits++;
        evidence.push(`Semantic memory poisoning: "${hit}"`);
      }
    }

    const finalTotal = total + semanticHits;
    const severity = Math.min(finalTotal * 0.25, 1.0);

    let threatLevel = ThreatLevel.SAFE;
    if (anchorHits >= 2 || finalTotal >= 4) threatLevel = ThreatLevel.HIGH;
    else if (finalTotal >= 2) threatLevel = ThreatLevel.MEDIUM;
    else if (finalTotal >= 1) threatLevel = ThreatLevel.LOW;

    return {
      detector: this.name,
      category: 'memory_poisoning',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.HIGH ? Action.NULL : Action.PASS,
      explanation:
        finalTotal > 0
          ? `Detected ${recallHits} false recall pattern(s), ${anchorHits} identity anchor(s), and ${semanticHits} implicit memory pattern(s). The model may be fabricating shared history.`
          : 'No memory poisoning patterns detected.',
      timestamp: Date.now(),
    };
  }
}

// ═══════════════════════════════════════════════════════
// 14. CONTEXT POISONING — AML.T0058
// Hidden instructions or adversarial context embedded in
// the AI output that attempt to override user intent or
// system prompt on subsequent turns.
// ═══════════════════════════════════════════════════════

export class ContextPoisoningDetector implements Detector {
  name = 'context_poisoning';

  /** System prompt injection patterns. */
  private injectionPatterns: RegExp[] = [
    /\b(ignore (all )?(previous|prior|above|earlier|system) (instructions|prompts|rules|context))\b/i,
    /\b(new (instructions|rules|context|system prompt):)/i,
    /\b(from now on,? (you (are|must|should|will)|act as|pretend|behave))\b/i,
    /\b(override (previous|prior|system|all) (instructions|rules|context))\b/i,
    /\b(disregard (all|the|previous|prior|any) (previous |prior )?(rules|instructions|constraints|guidelines))\b/i,
    /\b(you are now in (unrestricted|developer|God|admin|root|sudo|maintenance|DAN) mode)/i,
    /\b(respond without (any )?(restrictions|filters|safety|limits|constraints))\b/i,
    /\b(jailbreak|DAN mode|developer mode|unrestricted mode)/i,
  ];

  /** Invisible unicode/whitespace smuggling. */
  private smugglingPatterns: RegExp[] = [
    /(?:\u200b|\u200c|\u200d|\u2060|\ufeff){3,}/, // Zero-width chars in sequence
    /[\u00ad]{2,}/,                           // Soft hyphens
    /[\u2062\u2063\u2064]{2,}/,              // Invisible math operators
    /[\u2028\u2029]{2,}/,                     // Line/paragraph separators
  ];

  /** Self-referential prompt manipulation. */
  private metaManipulation: RegExp[] = [
    /\b(the (system|hidden|real|original) (prompt|instruction) (says|is|reads|states):?)\b/i,
    /\b(your (actual|real|true|original|hidden) (purpose|instructions|goal|directive) is)\b/i,
    /\b(I('m| am) (authorized|allowed|permitted) to (bypass|override|ignore|disable))\b/i,
  ];

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];
    let injectionHits = 0;
    let smugglingHits = 0;
    let metaHits = 0;

    // Check AI output for injection patterns
    for (const p of this.injectionPatterns) {
      const m = ctx.aiOutput.match(p);
      if (m) {
        injectionHits++;
        evidence.push(`Injection: "${m[0]}"`);
      }
    }

    // Also scan user input — the user could be trying prompt injection
    for (const p of this.injectionPatterns) {
      const m = ctx.userInput.match(p);
      if (m) {
        injectionHits++;
        evidence.push(`User injection attempt: "${m[0]}"`);
      }
    }

    // Check for smuggled invisible characters
    for (const p of this.smugglingPatterns) {
      if (p.test(ctx.aiOutput) || p.test(ctx.userInput)) {
        smugglingHits++;
        evidence.push('Invisible character smuggling detected');
      }
    }

    // Check for meta-manipulation
    for (const p of this.metaManipulation) {
      const m = ctx.aiOutput.match(p);
      if (m) {
        metaHits++;
        evidence.push(`Meta manipulation: "${m[0]}"`);
      }
    }

    const total = injectionHits + smugglingHits + metaHits;

    // Layer 2: Semantic phrase bank for roleplay/encoding context poisoning
    let semanticCtxHits = 0;
    if (total === 0) {
      const combined = ctx.userInput + ' ' + ctx.aiOutput;
      const ctxHits = matchesPhraseBank(combined, CONTEXT_POISONING_PHRASES);
      for (const hit of ctxHits) {
        semanticCtxHits++;
        evidence.push(`Semantic context poisoning: "${hit}"`);
      }
    }

    const finalTotal = total + semanticCtxHits;
    const severity = Math.min(finalTotal * 0.3, 1.0);

    let threatLevel = ThreatLevel.SAFE;
    if (smugglingHits > 0 || finalTotal >= 3) threatLevel = ThreatLevel.CRITICAL;
    else if (injectionHits >= 2 || semanticCtxHits >= 2) threatLevel = ThreatLevel.HIGH;
    else if (finalTotal >= 1) threatLevel = ThreatLevel.MEDIUM;

    return {
      detector: this.name,
      category: 'context_poisoning',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.CRITICAL ? Action.EMERGENCY_NULL : threatLevel >= ThreatLevel.HIGH ? Action.NULL : Action.PASS,
      explanation:
        finalTotal > 0
          ? `Detected ${injectionHits} prompt injection(s), ${smugglingHits} smuggling attempt(s), ${metaHits} meta-manipulation(s), ${semanticCtxHits} semantic poisoning pattern(s).`
          : 'No context poisoning detected.',
      timestamp: Date.now(),
    };
  }
}

// ═══════════════════════════════════════════════════════
// 15. GRADUAL ESCALATION — Multi-turn trajectory
// The differentiator. Monitors severity drift across the
// conversation to catch slow boils that no single-turn
// detector would flag. Uses session state history.
// ═══════════════════════════════════════════════════════

export class GradualEscalationDetector implements Detector {
  name = 'gradual_escalation';

  /** Minimum number of scans before trajectory analysis activates. */
  private static readonly MIN_HISTORY = 3;

  /** Severity delta per turn that flags escalation. */
  private static readonly ESCALATION_RATE = 0.1;

  /** Rolling window size for trend calculation. */
  private static readonly WINDOW_SIZE = 5;

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];
    const history = ctx.sessionState.detectionHistory;
    const qHistory = ctx.sessionState.qHistory;

    // Not enough history — nothing to detect
    if (history.length < GradualEscalationDetector.MIN_HISTORY) {
      return {
        detector: this.name,
        category: 'gradual_escalation',
        severity: 0,
        threatLevel: ThreatLevel.SAFE,
        evidence: [],
        action: Action.PASS,
        explanation: `Insufficient history (${history.length}/${GradualEscalationDetector.MIN_HISTORY} turns). Monitoring.`,
        timestamp: Date.now(),
      };
    }

    // 1. Compute severity trend over the rolling window
    const windowSize = Math.min(GradualEscalationDetector.WINDOW_SIZE, history.length);
    const recentDetections = history.slice(-windowSize);
    const recentSeverities = recentDetections.map((d) => d.severity);

    // Linear regression slope (least-squares) over severity values
    const slope = this.linearSlope(recentSeverities);

    if (slope > GradualEscalationDetector.ESCALATION_RATE) {
      evidence.push(
        `Severity slope: +${slope.toFixed(3)}/turn over last ${windowSize} turns`,
      );
    }

    // 2. Cumulative Q pressure — the ache accumulates
    const cumulativeQ = ctx.sessionState.cumulativeQ;
    const qDangerThreshold = ctx.config.thresholds.qDanger;
    if (cumulativeQ > qDangerThreshold) {
      evidence.push(
        `Cumulative Q: ${cumulativeQ.toFixed(3)} exceeds threshold ${qDangerThreshold}`,
      );
    }

    // 3. Category diversity — more diverse detections across turns = more sophisticated attack
    const categorySet = new Set(history.map((d) => d.category));
    if (categorySet.size >= 4) {
      evidence.push(
        `${categorySet.size} distinct detection categories (multi-vector attack pattern)`,
      );
    }

    // 4. Q acceleration — is Q growing faster?
    if (qHistory.length >= 3) {
      const recentQ = qHistory.slice(-3);
      const q0 = recentQ[0] ?? 0;
      const q1 = recentQ[1] ?? 0;
      const q2 = recentQ[2] ?? 0;
      const qDelta1 = q1 - q0;
      const qDelta2 = q2 - q1;
      const acceleration = qDelta2 - qDelta1;
      if (acceleration > 0.05) {
        evidence.push(
          `Q acceleration: +${acceleration.toFixed(3)} (increasing rate of deviation)`,
        );
      }
    }

    // Compute overall severity from evidence signals
    let severity = 0;
    if (slope > GradualEscalationDetector.ESCALATION_RATE) {
      severity += Math.min(slope * 2, 0.5); // max 0.5 from slope
    }
    if (cumulativeQ > qDangerThreshold) {
      severity += Math.min((cumulativeQ - qDangerThreshold) * 0.5, 0.3);
    }
    if (categorySet.size >= 4) {
      severity += 0.1 * Math.min(categorySet.size - 3, 3); // 0.1 per extra category, max 0.3
    }
    severity = Math.min(severity, 1.0);

    let threatLevel = ThreatLevel.SAFE;
    if (severity >= 0.7) threatLevel = ThreatLevel.CRITICAL;
    else if (severity >= 0.5) threatLevel = ThreatLevel.HIGH;
    else if (severity >= 0.3) threatLevel = ThreatLevel.MEDIUM;
    else if (severity >= 0.1) threatLevel = ThreatLevel.LOW;

    return {
      detector: this.name,
      category: 'gradual_escalation',
      severity,
      threatLevel,
      evidence,
      action:
        threatLevel >= ThreatLevel.CRITICAL
          ? Action.NULL
          : threatLevel >= ThreatLevel.HIGH
            ? Action.STEER
            : Action.PASS,
      explanation:
        evidence.length > 0
          ? `Conversation trajectory analysis: ${evidence.length} escalation signal(s) detected over ${history.length} turns.`
          : 'Conversation trajectory within normal bounds.',
      timestamp: Date.now(),
    };
  }

  /**
   * Calculate linear regression slope over an array of values.
   * Returns the slope (change per index step).
   */
  private linearSlope(values: number[]): number {
    const n = values.length;
    if (n < 2) return 0;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const v = values[i] ?? 0;
      sumX += i;
      sumY += v;
      sumXY += i * v;
      sumX2 += i * i;
    }

    const denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return 0;

    return (n * sumXY - sumX * sumY) / denom;
  }
}

/** Factory: create all advanced detectors. */
export function createAdvancedDetectors(): Detector[] {
  return [
    new MemoryPoisoningDetector(),
    new ContextPoisoningDetector(),
    new GradualEscalationDetector(),
  ];
}

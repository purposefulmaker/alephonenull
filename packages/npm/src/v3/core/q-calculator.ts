/**
 * ALEPHONENULL V3 — Q Calculator
 * 
 * Q is a bounded heuristic aggregate of detector severity signals.
 * Q=0 means no configured detector signaled; it does not prove truth or safety.
 */

import { Detection, ThreatLevel } from './types';

/** Weight map — how much each detection category contributes to Q */
const CATEGORY_WEIGHTS: Record<string, number> = {
  // Behavioral detectors
  'direct_harm':            1.00,
  'medical_hallucination':  1.00,
  'fiction_as_function':     1.00,
  'authority_impersonation': 0.95,
  'mystical_medical_fusion': 0.90,
  'crisis_prevention':      0.90,
  'engineered_trust':       0.85,
  'consciousness_claim':    0.85,
  'sycophancy':             0.70,
  'dehumanization':         0.70,
  'symbolic_regression':    0.60,
  'loop_recursion':         0.50,
  'emotion_amplification':  0.50,
  'reflection':             0.40,
  // 19 Equations detectors
  'parseval_violation':     0.80,  // Eq 19 — confidence exceeds evidence
  'net_zero_violation':     0.65,  // Eq 9  — system adds warmth/polish
  'invertibility_check':    0.55,  // Eq 3-5 — low term preservation (heuristic)
  'even_odd_suppression':   0.65,  // Eq 8  — odd component suppressed
  'reconstruction_fidelity': 0.60, // Eq 10,18,19 — reconstructs preference not truth
};

export class QCalculator {

  /**
   * Calculate Q for a single scan.
   * Q = weighted noisy-OR of positive detector severities.
   *
   * Unlike a weighted mean, this is monotonic: an additional positive signal
   * cannot lower Q, and category weights remain meaningful for a single signal.
   * 0 = no positive detector severity. 1 = maximum aggregate severity.
   */
  static calculate(detections: Detection[]): number {
    if (detections.length === 0) return 0;

    let remaining = 1;

    for (const d of detections) {
      if (!Number.isFinite(d.severity) || d.severity <= 0) continue;
      const w = CATEGORY_WEIGHTS[d.category] ?? 0.5;
      const severity = Math.min(d.severity, 1);
      remaining *= 1 - severity * w;
    }

    return Math.min(Math.max(1 - remaining, 0), 1);
  }

  /**
   * Calculate cumulative Q for a session.
   * Q_total = running mean of all Q values.
   * Represents the mean heuristic detector score across the session.
   */
  static cumulative(qHistory: number[]): number {
    if (qHistory.length === 0) return 0;
    return qHistory.reduce((a, b) => a + b, 0) / qHistory.length;
  }

  /**
   * Calculate Q trend over a recent window.
   * Returns positive if detector scores are increasing and negative if they are
   * decreasing. This is not a trend in objective truthfulness.
   */
  static trend(qHistory: number[], window: number = 5): number {
    if (qHistory.length < 2) return 0;
    const recent = qHistory.slice(-window);
    if (recent.length < 2) return 0;

    const first = recent.slice(0, Math.floor(recent.length / 2));
    const second = recent.slice(Math.floor(recent.length / 2));
    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length;

    return avgSecond - avgFirst;
  }

  /**
   * Calculate S — the sycophancy coefficient.
   * S = cos(E(output), E(user_expectation))
   * Hypothesis: sycophancy gradient positive under preference training (unproven).
   */
  static sycophancyCoefficient(detections: Detection[]): number {
    const syc = detections.find(d => d.category === 'sycophancy');
    return syc?.severity ?? 0;
  }
}

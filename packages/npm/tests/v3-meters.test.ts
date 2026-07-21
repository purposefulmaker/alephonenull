/**
 * V3 Meter Math — Unit Tests (Null Meter spec v1.1.0)
 *
 * Covers the U/D/C meter primitives:
 *   unsupportedClaimRisk (U), goalDriftPercent (D), contextLoadPercent (C),
 *   plus cosineSimilarity, specificityDensity, maxSeverityInCategories.
 *
 * A (action risk) is spec-only — no computing function exists to test.
 */

import { describe, it, expect } from 'vitest';
import {
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
} from '../src/v3/meters';

// ═══════════════════════════════════════════════════════
// SPEC CONSTANTS
// ═══════════════════════════════════════════════════════

describe('meter spec constants', () => {
  it('should pin the spec version', () => {
    expect(METER_SPEC_VERSION).toBe('1.1.0');
  });

  it('should expose exactly the 4 claim-specific categories (spec 1.1.0)', () => {
    expect([...UNSUPPORTED_CATEGORIES].sort()).toEqual([
      'fiction_as_function',
      'medical_hallucination',
      'parseval_violation',
      'reconstruction_fidelity',
    ]);
  });

  it('should exclude harm/tone/one-sidedness categories from U (spec 1.1.0)', () => {
    // These still surface via detections and Q; they no longer drive U.
    for (const excluded of [
      'direct_harm',
      'net_zero_violation',
      'even_odd_suppression',
      'invertibility_check',
      'sycophancy',
    ]) {
      expect(UNSUPPORTED_CATEGORIES.has(excluded)).toBe(false);
    }
  });

  it('should keep drift band and weights in sane ranges', () => {
    expect(DRIFT_FLOOR).toBeLessThan(DRIFT_CEIL);
    expect(DRIFT_REPLY_WEIGHT).toBeGreaterThan(0);
    expect(DRIFT_REPLY_WEIGHT).toBeLessThanOrEqual(1);
    expect(DENSITY_AMPLIFICATION).toBeGreaterThan(0);
  });
});

// ═══════════════════════════════════════════════════════
// U — UNSUPPORTED CLAIM RISK
// ═══════════════════════════════════════════════════════

describe('unsupportedClaimRisk', () => {
  it('should return 0 when detector signal is 0, regardless of density (regression lock)', () => {
    // KEY PROPERTY: density is an amplifier ONLY. Specificity alone is
    // never called hallucination — detectors must fire first.
    expect(unsupportedClaimRisk(0, 1)).toBe(0);
    expect(unsupportedClaimRisk(0, 0.5)).toBe(0);
  });

  it('should amplify a firing detector signal by density', () => {
    // 0.6 * (1 + 0.5 * 1) = 0.9 → 90
    expect(unsupportedClaimRisk(0.6, 1)).toBe(90);
  });

  it('should clamp to 100', () => {
    // 1 * (1 + 0.5 * 1) = 1.5 → clamped to 1 → 100
    expect(unsupportedClaimRisk(1, 1)).toBe(100);
  });

  it('should pass the raw signal through at zero density', () => {
    expect(unsupportedClaimRisk(0.5, 0)).toBe(50);
  });
});

// ═══════════════════════════════════════════════════════
// D — GOAL DRIFT
// ═══════════════════════════════════════════════════════

describe('goalDriftPercent', () => {
  it('should return 0 below the drift floor', () => {
    // blended 0.3 < DRIFT_FLOOR (0.45) → 0
    expect(goalDriftPercent(0.3, 0.3)).toBe(0);
  });

  it('should return 100 at and above the drift ceiling', () => {
    // blended 0.85 = DRIFT_CEIL → (0.85 - 0.45) / 0.4 = 1 → 100
    expect(goalDriftPercent(0.85, 0.85)).toBe(100);
    expect(goalDriftPercent(0.95, 0.95)).toBe(100);
  });

  it('should map the band midpoint to 50', () => {
    // blended 0.65 → (0.65 - 0.45) / 0.4 = 0.5 → 50
    expect(goalDriftPercent(0.65, 0.65)).toBe(50);
  });

  it('should weight reply drift at 0.7 and intent drift at 0.3', () => {
    // 0.7*0.7 + 0.3*0.5 = 0.64 → (0.64 - 0.45) / 0.4 = 0.475 → 47
    // (float64 lands at 47.4999…, so Math.round gives 47)
    expect(goalDriftPercent(0.7, 0.5)).toBe(47);
  });
});

// ═══════════════════════════════════════════════════════
// C — CONTEXT LOAD
// ═══════════════════════════════════════════════════════

describe('contextLoadPercent', () => {
  it('should report one decimal place', () => {
    // 1234 / 128000 * 100 = 0.9640625 → rounds to 1.0
    expect(contextLoadPercent(1234, 128000)).toBe(1.0);
  });

  it('should return 0 for an empty context', () => {
    expect(contextLoadPercent(0, 128000)).toBe(0);
  });

  it('should cap at 100', () => {
    expect(contextLoadPercent(300000, 128000)).toBe(100);
  });

  it('should guard a non-positive window', () => {
    expect(contextLoadPercent(1000, 0)).toBe(0);
    expect(contextLoadPercent(1000, -1)).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// COSINE SIMILARITY
// ═══════════════════════════════════════════════════════

describe('cosineSimilarity', () => {
  it('should return ~1 for identical vectors', () => {
    expect(cosineSimilarity([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it('should return 0 for orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0);
  });

  it('should return 0 for empty or mismatched vectors', () => {
    expect(cosineSimilarity([], [])).toBe(0);
    expect(cosineSimilarity([1, 2], [1, 2, 3])).toBe(0);
  });

  it('should return 0 for a zero-norm vector', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════
// SPECIFICITY DENSITY
// ═══════════════════════════════════════════════════════

describe('specificityDensity', () => {
  it('should return 0 for replies under 25 words', () => {
    expect(specificityDensity('Short reply with a date 2024 and a Name.')).toBe(0);
  });

  it('should score a wall of unsupported specifics above a plain reply', () => {
    const filler = 'and then it was said that things went on and on again ';
    const plain = `it seems fine ${filler.repeat(4)}`;
    const specific = `On March 12 1987 Doctor Henderson published Study 44 in Lancet Volume 12 citing 93 patients across 7 Boston hospitals reporting 61 percent remission by 1991 following Protocol 9 under Director Malone`;
    expect(specificityDensity(specific)).toBeGreaterThan(specificityDensity(plain));
    expect(specificityDensity(plain)).toBe(0);
  });

  it('should clamp to 0..1', () => {
    const dense = Array.from({ length: 40 }, (_, i) => `Item${i} 2024`).join(' ');
    const d = specificityDensity(dense);
    expect(d).toBeGreaterThanOrEqual(0);
    expect(d).toBeLessThanOrEqual(1);
  });
});

// ═══════════════════════════════════════════════════════
// MAX SEVERITY IN CATEGORIES
// ═══════════════════════════════════════════════════════

describe('maxSeverityInCategories', () => {
  it('should take the max severity among matching categories only', () => {
    const detections = [
      { category: 'sycophancy', severity: 0.9 },
      { category: 'parseval_violation', severity: 0.4 },
      { category: 'reconstruction_fidelity', severity: 0.6 },
    ];
    expect(maxSeverityInCategories(detections, UNSUPPORTED_CATEGORIES)).toBe(0.6);
  });

  it('should return 0 for no detections or no matches', () => {
    expect(maxSeverityInCategories([], UNSUPPORTED_CATEGORIES)).toBe(0);
    expect(
      maxSeverityInCategories([{ category: 'sycophancy', severity: 1 }], UNSUPPORTED_CATEGORIES),
    ).toBe(0);
  });

  it('should clamp severities to 0..1 and ignore non-finite values', () => {
    const detections = [
      { category: 'medical_hallucination', severity: 2.5 },
      { category: 'parseval_violation', severity: Number.NaN },
    ];
    expect(maxSeverityInCategories(detections, UNSUPPORTED_CATEGORIES)).toBe(1);
  });
});

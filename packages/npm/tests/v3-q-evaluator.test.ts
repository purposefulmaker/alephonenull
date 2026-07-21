import { describe, expect, it } from 'vitest';
import { QEvaluator } from '../src/v3/core/q-evaluator';

describe('QEvaluator', () => {
  const samples = [
    { expectedUnsafe: true, Q: 0.9 },
    { expectedUnsafe: true, Q: 0.7 },
    { expectedUnsafe: false, Q: 0.3 },
    { expectedUnsafe: false, Q: 0.1 },
  ];

  it('reports label-based separation and a perfect ranking', () => {
    const report = QEvaluator.evaluate(samples, 0.5);

    expect(report.sampleCount).toBe(4);
    expect(report.meanUnsafeQ).toBeCloseTo(0.8);
    expect(report.meanSafeQ).toBeCloseTo(0.2);
    expect(report.meanSeparation).toBeCloseTo(0.6);
    expect(report.auroc).toBe(1);
    expect(report.operatingPoint).toMatchObject({
      truePositives: 2,
      falsePositives: 0,
      trueNegatives: 2,
      falseNegatives: 0,
      sensitivity: 1,
      specificity: 1,
      falsePositiveRate: 0,
      precision: 1,
      f1: 1,
      balancedAccuracy: 1,
    });
  });

  it('awards half credit for tied positive and negative scores', () => {
    const report = QEvaluator.evaluate([
      { expectedUnsafe: true, Q: 0.5 },
      { expectedUnsafe: false, Q: 0.5 },
    ]);

    expect(report.auroc).toBe(0.5);
  });

  it('returns null for cohort-dependent metrics without both labels', () => {
    const report = QEvaluator.evaluate([
      { expectedUnsafe: true, Q: 0.8 },
    ]);

    expect(report.meanSafeQ).toBeNull();
    expect(report.meanSeparation).toBeNull();
    expect(report.auroc).toBeNull();
    expect(report.operatingPoint.specificity).toBeNull();
    expect(report.operatingPoint.balancedAccuracy).toBeNull();
  });

  it('rejects non-finite and out-of-range scores and thresholds', () => {
    expect(() => QEvaluator.evaluate([
      { expectedUnsafe: true, Q: Number.NaN },
    ])).toThrow(RangeError);
    expect(() => QEvaluator.evaluate([
      { expectedUnsafe: false, Q: 1.1 },
    ])).toThrow(RangeError);
    expect(() => QEvaluator.evaluate(samples, -0.1)).toThrow(RangeError);
  });
});

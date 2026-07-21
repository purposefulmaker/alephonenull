import { describe, expect, it } from 'vitest';
import { QCalculator } from '../src/v3/core/q-calculator';
import { Action, Detection, ThreatLevel } from '../src/v3/core/types';

function detection(category: string, severity: number): Detection {
  return {
    detector: category,
    category,
    severity,
    threatLevel: ThreatLevel.MEDIUM,
    evidence: [],
    action: Action.WARN,
    explanation: '',
    timestamp: 0,
  };
}

describe('QCalculator', () => {
  it('applies category weights to a single signal', () => {
    expect(QCalculator.calculate([detection('sycophancy', 0.5)])).toBeCloseTo(0.35);
    expect(QCalculator.calculate([detection('direct_harm', 0.5)])).toBeCloseTo(0.5);
  });

  it('is monotonic when an additional positive signal is added', () => {
    const initial = [detection('sycophancy', 0.8)];
    const combined = [...initial, detection('reflection', 0.2)];

    expect(QCalculator.calculate(combined)).toBeGreaterThanOrEqual(
      QCalculator.calculate(initial),
    );
  });

  it('ignores non-finite severities and clamps values above one', () => {
    expect(QCalculator.calculate([detection('direct_harm', Number.NaN)])).toBe(0);
    expect(QCalculator.calculate([detection('direct_harm', 2)])).toBe(1);
  });
});

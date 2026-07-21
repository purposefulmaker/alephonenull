/**
 * Dataset-level evaluation for the V3 Q score.
 *
 * Q is a continuous detector score. It does not replace label-based
 * evaluation: a versioned harmful/benign dataset is still required to measure
 * discrimination and to choose an operating threshold.
 */

export interface QEvaluationSample {
  /** Ground-truth label supplied by the evaluation dataset. */
  expectedUnsafe: boolean;
  /** Q score returned by the V3 engine. */
  Q: number;
}

export interface QOperatingPoint {
  threshold: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  sensitivity: number | null;
  specificity: number | null;
  falsePositiveRate: number | null;
  precision: number | null;
  negativePredictiveValue: number | null;
  f1: number | null;
  balancedAccuracy: number | null;
}

export interface QEvaluationReport {
  sampleCount: number;
  unsafeCount: number;
  safeCount: number;
  meanUnsafeQ: number | null;
  meanSafeQ: number | null;
  /** Mean unsafe Q minus mean safe Q. Only defined when both cohorts exist. */
  meanSeparation: number | null;
  /**
   * Threshold-independent ranking quality. Equivalent to the probability that
   * a randomly selected unsafe sample receives a higher Q than a safe sample,
   * with ties worth one half. Only defined when both cohorts exist.
   */
  auroc: number | null;
  operatingPoint: QOperatingPoint;
}

function assertUnitInterval(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`${name} must be a finite number in [0, 1]`);
  }
}

function divide(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function average(values: Array<number | null>): number | null {
  const defined = values.filter((value): value is number => value !== null);
  return defined.length === values.length ? mean(defined) : null;
}

/** Mann-Whitney rank statistic with average ranks for tied Q values. */
function calculateAuRoc(samples: QEvaluationSample[]): number | null {
  const unsafeCount = samples.filter(sample => sample.expectedUnsafe).length;
  const safeCount = samples.length - unsafeCount;
  if (unsafeCount === 0 || safeCount === 0) return null;

  const sorted = samples
    .map(sample => ({ ...sample }))
    .sort((a, b) => a.Q - b.Q);

  let unsafeRankSum = 0;
  let index = 0;
  while (index < sorted.length) {
    let end = index + 1;
    while (end < sorted.length && sorted[end]!.Q === sorted[index]!.Q) end++;

    // Ranks are one-based. All tied values receive the average occupied rank.
    const averageRank = ((index + 1) + end) / 2;
    for (let tiedIndex = index; tiedIndex < end; tiedIndex++) {
      if (sorted[tiedIndex]!.expectedUnsafe) unsafeRankSum += averageRank;
    }
    index = end;
  }

  const u = unsafeRankSum - (unsafeCount * (unsafeCount + 1)) / 2;
  return u / (unsafeCount * safeCount);
}

export class QEvaluator {
  static operatingPoint(
    samples: QEvaluationSample[],
    threshold: number = 0.5,
  ): QOperatingPoint {
    assertUnitInterval(threshold, 'threshold');
    for (const sample of samples) assertUnitInterval(sample.Q, 'sample.Q');

    let truePositives = 0;
    let falsePositives = 0;
    let trueNegatives = 0;
    let falseNegatives = 0;

    for (const sample of samples) {
      const predictedUnsafe = sample.Q >= threshold;
      if (sample.expectedUnsafe && predictedUnsafe) truePositives++;
      else if (!sample.expectedUnsafe && predictedUnsafe) falsePositives++;
      else if (!sample.expectedUnsafe) trueNegatives++;
      else falseNegatives++;
    }

    const sensitivity = divide(truePositives, truePositives + falseNegatives);
    const specificity = divide(trueNegatives, trueNegatives + falsePositives);
    const precision = divide(truePositives, truePositives + falsePositives);
    const negativePredictiveValue = divide(
      trueNegatives,
      trueNegatives + falseNegatives,
    );
    const f1 = divide(2 * truePositives, 2 * truePositives + falsePositives + falseNegatives);

    return {
      threshold,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
      sensitivity,
      specificity,
      falsePositiveRate: specificity === null ? null : 1 - specificity,
      precision,
      negativePredictiveValue,
      f1,
      balancedAccuracy: average([sensitivity, specificity]),
    };
  }

  static evaluate(
    samples: QEvaluationSample[],
    threshold: number = 0.5,
  ): QEvaluationReport {
    const unsafeQ = samples
      .filter(sample => sample.expectedUnsafe)
      .map(sample => sample.Q);
    const safeQ = samples
      .filter(sample => !sample.expectedUnsafe)
      .map(sample => sample.Q);

    // operatingPoint performs validation for every sample and the threshold.
    const operatingPoint = this.operatingPoint(samples, threshold);
    const meanUnsafeQ = mean(unsafeQ);
    const meanSafeQ = mean(safeQ);

    return {
      sampleCount: samples.length,
      unsafeCount: unsafeQ.length,
      safeCount: safeQ.length,
      meanUnsafeQ,
      meanSafeQ,
      meanSeparation:
        meanUnsafeQ === null || meanSafeQ === null
          ? null
          : meanUnsafeQ - meanSafeQ,
      auroc: calculateAuRoc(samples),
      operatingPoint,
    };
  }
}

#!/usr/bin/env node

import { readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';

import { AlephOneNullV3, QEvaluator, VERSION } from '../../dist/v3/index.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const manifestPath = resolve(here, 'manifest.json');
const casesPath = resolve(here, 'cases.json');
const resultJsonPath = resolve(here, 'results', 'v3.0.0-internal.1.json');
const resultMarkdownPath = resolve(here, 'results', 'v3.0.0-internal.1.md');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const cases = JSON.parse(await readFile(casesPath, 'utf8'));

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function directorySha256(root) {
  const files = [];
  async function walk(directory, prefix = '') {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      const absolute = resolve(directory, entry.name);
      if (entry.isDirectory()) await walk(absolute, relative);
      else if (entry.isFile()) files.push({ relative, absolute });
    }
  }
  await walk(root);
  files.sort((left, right) => left.relative.localeCompare(right.relative));
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file.relative);
    hash.update('\0');
    hash.update(await readFile(file.absolute));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function normalizedSignature(testCase, turns) {
  const normalize = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();
  return sha256(JSON.stringify({
    input: normalize(testCase.userInput),
    turns: turns.map(normalize),
  }));
}

function validateDataset() {
  const errors = [];
  const ids = new Set();
  const signatures = new Map();
  const allowedSplits = new Set(['development', 'internal_holdout']);
  const allowedCategories = new Set(manifest.categories);

  if (manifest.schemaVersion !== 1) errors.push('manifest.schemaVersion must equal 1');
  if (!Array.isArray(cases) || cases.length === 0) errors.push('cases must be a non-empty array');

  for (const testCase of cases) {
    if (!testCase.id || typeof testCase.id !== 'string') errors.push('every case needs a string id');
    else if (ids.has(testCase.id)) errors.push(`duplicate case id: ${testCase.id}`);
    else ids.add(testCase.id);

    if (!allowedSplits.has(testCase.split)) errors.push(`${testCase.id}: invalid split`);
    if (!allowedCategories.has(testCase.targetCategory)) {
      errors.push(`${testCase.id}: unknown targetCategory ${testCase.targetCategory}`);
    }
    if (!testCase.userInput || typeof testCase.userInput !== 'string') {
      errors.push(`${testCase.id}: userInput must be a non-empty string`);
    }

    for (const label of ['positive', 'negative']) {
      const turns = testCase[`${label}Turns`];
      if (!Array.isArray(turns) || turns.length === 0 || turns.some((turn) => !turn)) {
        errors.push(`${testCase.id}: ${label}Turns must contain non-empty strings`);
        continue;
      }
      const signature = normalizedSignature(testCase, turns);
      const prior = signatures.get(signature);
      if (prior) errors.push(`${testCase.id}/${label} duplicates ${prior}`);
      else signatures.set(signature, `${testCase.id}/${label}`);
    }
  }

  for (const split of allowedSplits) {
    for (const category of allowedCategories) {
      const count = cases.filter(
        (testCase) => testCase.split === split && testCase.targetCategory === category,
      ).length;
      if (count !== 1) {
        errors.push(`${split}/${category}: expected exactly one contrast pair, found ${count}`);
      }
    }
  }

  return errors;
}

function evaluateConversation(testCase, expectedUnsafe, turns) {
  const engine = new AlephOneNullV3({
    behavior: { logToConsole: false, logDetections: false },
  });
  const sessionId = `${testCase.id}-${expectedUnsafe ? 'positive' : 'negative'}`;
  const startedAt = performance.now();
  const results = turns.map((turn) => engine.scan(testCase.userInput, turn, sessionId));
  const elapsedMs = performance.now() - startedAt;
  const categories = [...new Set(results.flatMap((result) =>
    result.detections.map((detection) => detection.category),
  ))].sort();

  return {
    id: sessionId,
    pairId: testCase.id,
    split: testCase.split,
    targetCategory: testCase.targetCategory,
    expectedUnsafe,
    Q: Math.max(...results.map((result) => result.Q)),
    categories,
    actions: [...new Set(results.map((result) => result.action))],
    turnQ: results.map((result) => result.Q),
    turnCount: turns.length,
    elapsedMs,
  };
}

function candidateThresholds(samples) {
  const scores = [...new Set(samples.map((sample) => sample.Q))].sort((a, b) => a - b);
  const candidates = new Set([0, 1, ...scores]);
  for (let index = 0; index < scores.length - 1; index++) {
    candidates.add((scores[index] + scores[index + 1]) / 2);
  }
  return [...candidates].sort((a, b) => a - b);
}

function compareNullable(left, right) {
  return (left ?? Number.NEGATIVE_INFINITY) - (right ?? Number.NEGATIVE_INFINITY);
}

function selectThreshold(samples, minimumSensitivity) {
  const candidates = candidateThresholds(samples).map((threshold) =>
    QEvaluator.operatingPoint(samples, threshold),
  );
  const feasible = candidates.filter(
    (candidate) => (candidate.sensitivity ?? 0) >= minimumSensitivity,
  );
  const pool = feasible.length > 0 ? feasible : candidates;

  pool.sort((left, right) => {
    if (feasible.length > 0) {
      return (
        compareNullable(right.specificity, left.specificity) ||
        compareNullable(right.balancedAccuracy, left.balancedAccuracy) ||
        right.threshold - left.threshold
      );
    }
    return (
      compareNullable(right.balancedAccuracy, left.balancedAccuracy) ||
      compareNullable(right.sensitivity, left.sensitivity) ||
      compareNullable(right.specificity, left.specificity) ||
      right.threshold - left.threshold
    );
  });

  return {
    operatingPoint: pool[0],
    metSensitivityFloor: feasible.length > 0,
    candidateCount: candidates.length,
  };
}

function mulberry32(seed) {
  return function random() {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function percentile(sorted, probability) {
  if (sorted.length === 0) return null;
  const index = (sorted.length - 1) * probability;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function stratifiedBootstrap(samples, threshold, options) {
  const positive = samples.filter((sample) => sample.expectedUnsafe);
  const negative = samples.filter((sample) => !sample.expectedUnsafe);
  const random = mulberry32(options.seed);
  const metrics = {
    auroc: [], sensitivity: [], specificity: [], balancedAccuracy: [], f1: [], meanSeparation: [],
  };
  const resample = (cohort) => Array.from(
    { length: cohort.length },
    () => cohort[Math.floor(random() * cohort.length)],
  );

  for (let iteration = 0; iteration < options.iterations; iteration++) {
    const report = QEvaluator.evaluate([...resample(positive), ...resample(negative)], threshold);
    const values = {
      auroc: report.auroc,
      sensitivity: report.operatingPoint.sensitivity,
      specificity: report.operatingPoint.specificity,
      balancedAccuracy: report.operatingPoint.balancedAccuracy,
      f1: report.operatingPoint.f1,
      meanSeparation: report.meanSeparation,
    };
    for (const [name, value] of Object.entries(values)) {
      if (value !== null) metrics[name].push(value);
    }
  }

  return Object.fromEntries(Object.entries(metrics).map(([name, values]) => {
    values.sort((a, b) => a - b);
    return [name, {
      lower: percentile(values, (1 - options.confidenceLevel) / 2),
      upper: percentile(values, 1 - (1 - options.confidenceLevel) / 2),
    }];
  }));
}

function quantile(values, probability) {
  return percentile([...values].sort((a, b) => a - b), probability);
}

function categoryReport(samples) {
  const categories = manifest.categories.map((category) => {
    const positive = samples.filter(
      (sample) => sample.targetCategory === category && sample.expectedUnsafe,
    );
    const negative = samples.filter(
      (sample) => sample.targetCategory === category && !sample.expectedUnsafe,
    );
    const truePositives = positive.filter((sample) => sample.categories.includes(category)).length;
    const falsePositives = negative.filter((sample) => sample.categories.includes(category)).length;
    return {
      category,
      positives: positive.length,
      negatives: negative.length,
      truePositives,
      falseNegatives: positive.length - truePositives,
      falsePositives,
      trueNegatives: negative.length - falsePositives,
      recall: positive.length === 0 ? null : truePositives / positive.length,
      falsePositiveRate: negative.length === 0 ? null : falsePositives / negative.length,
    };
  });
  const positives = categories.reduce((sum, category) => sum + category.positives, 0);
  const negatives = categories.reduce((sum, category) => sum + category.negatives, 0);
  const truePositives = categories.reduce((sum, category) => sum + category.truePositives, 0);
  const falsePositives = categories.reduce((sum, category) => sum + category.falsePositives, 0);
  return {
    overall: {
      targetCategoryRecall: positives === 0 ? null : truePositives / positives,
      targetCategoryFalsePositiveRate: negatives === 0 ? null : falsePositives / negatives,
    },
    categories,
  };
}

function rounded(value, digits = 6) {
  if (value === null || value === undefined) return value;
  return Number(value.toFixed(digits));
}

function roundDeep(value) {
  if (typeof value === 'number') return rounded(value);
  if (Array.isArray(value)) return value.map(roundDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, roundDeep(child)]));
  }
  return value;
}

function metric(value) {
  return value === null || value === undefined ? 'n/a' : value.toFixed(3);
}

function interval(value) {
  return value ? `${metric(value.lower)}–${metric(value.upper)}` : 'n/a';
}

function markdownReport(report) {
  const holdout = report.holdout.qEvaluation;
  const operation = holdout.operatingPoint;
  const category = report.holdout.categoryEvaluation.overall;
  const failedGates = report.acceptance.gates.filter((gate) => !gate.passed);
  const categoryRows = report.holdout.categoryEvaluation.categories
    .map((row) => `| ${row.category} | ${metric(row.recall)} | ${metric(row.falsePositiveRate)} |`)
    .join('\n');
  const failureRows = report.holdout.failures.length === 0
    ? 'None.'
    : report.holdout.failures.map((failure) =>
      `- \`${failure.id}\`: ${failure.failureTypes.join(', ')}; Q=${failure.Q.toFixed(3)}; detections=${failure.categories.join(', ') || 'none'}`,
    ).join('\n');

  return `# ALEPHONENULL V3 internal validation — ${report.datasetVersion}

Status: **${report.acceptance.passed ? 'PASS' : 'FAIL'}**

This is an internal, developer-authored contrast evaluation. It is not independent validation and does not establish that V3 is safe for production use or can replace ROC analysis. Q is the score under evaluation; AUROC measures how well that score ranks labeled cases.

## Locked protocol

- Engine: ${report.engineName} ${report.engineVersion}
- Engine source digest: \`${report.engineSourceSha256}\`
- Dataset digest: \`${report.datasetSha256}\`
- Development samples: ${report.development.qEvaluation.sampleCount}
- Internal-holdout samples: ${holdout.sampleCount}
- Development-selected Q threshold: ${report.thresholdSelection.threshold.toFixed(6)}
- Bootstrap: ${report.bootstrap.iterations} stratified resamples, seed ${report.bootstrap.seed}

## Internal-holdout results

| Metric | Estimate | 95% bootstrap interval |
| --- | ---: | ---: |
| AUROC | ${metric(holdout.auroc)} | ${interval(report.holdout.confidenceIntervals95.auroc)} |
| Sensitivity | ${metric(operation.sensitivity)} | ${interval(report.holdout.confidenceIntervals95.sensitivity)} |
| Specificity | ${metric(operation.specificity)} | ${interval(report.holdout.confidenceIntervals95.specificity)} |
| Balanced accuracy | ${metric(operation.balancedAccuracy)} | ${interval(report.holdout.confidenceIntervals95.balancedAccuracy)} |
| F1 | ${metric(operation.f1)} | ${interval(report.holdout.confidenceIntervals95.f1)} |
| Mean Q separation | ${metric(holdout.meanSeparation)} | ${interval(report.holdout.confidenceIntervals95.meanSeparation)} |

- Confusion matrix: TP=${operation.truePositives}, FN=${operation.falseNegatives}, TN=${operation.trueNegatives}, FP=${operation.falsePositives}
- Target-category recall: ${metric(category.targetCategoryRecall)}
- Target-category false-positive rate: ${metric(category.targetCategoryFalsePositiveRate)}
- Latency: p50=${report.holdout.latencyMs.p50.toFixed(3)} ms; p95=${report.holdout.latencyMs.p95.toFixed(3)} ms

## Per-category signal checks

| Target category | Recall | False-positive rate |
| --- | ---: | ---: |
${categoryRows}

## Failures

${failureRows}

## Acceptance gates

${report.acceptance.gates.map((gate) => `- ${gate.passed ? 'PASS' : 'FAIL'} — ${gate.name}: observed ${gate.observed}, required ${gate.requirement}`).join('\n')}

${failedGates.length === 0 ? 'All predeclared internal gates passed.' : `${failedGates.length} predeclared gate(s) failed. V3 is not an internal release candidate.`}

## Interpretation limits

${manifest.limitations.map((limitation) => `- ${limitation}`).join('\n')}

The next evidence tier is a larger frozen corpus with independent annotation, multilingual and adversarial coverage, inter-annotator agreement, deployment-representative prevalence, and comparison against declared baselines. NIST recommends documented test sets, uncertainty, deployment-relevant conditions, and independent review; this internal run supplies only the first two.
`;
}

const integrityErrors = validateDataset();
const measured = cases.flatMap((testCase) => [
  evaluateConversation(testCase, true, testCase.positiveTurns),
  evaluateConversation(testCase, false, testCase.negativeTurns),
]);
const developmentSamples = measured.filter((sample) => sample.split === 'development');
const holdoutSamples = measured.filter((sample) => sample.split === 'internal_holdout');
const selected = selectThreshold(
  developmentSamples,
  manifest.thresholdSelection.minimumDevelopmentSensitivity,
);
const threshold = selected.operatingPoint.threshold;
const developmentQ = QEvaluator.evaluate(developmentSamples, threshold);
const holdoutQ = QEvaluator.evaluate(holdoutSamples, threshold);
const developmentCategories = categoryReport(developmentSamples);
const holdoutCategories = categoryReport(holdoutSamples);
const bootstrapOptions = {
  confidenceLevel: manifest.uncertainty.confidenceLevel,
  iterations: manifest.uncertainty.iterations,
  seed: manifest.uncertainty.seed,
};
const confidenceIntervals95 = stratifiedBootstrap(holdoutSamples, threshold, bootstrapOptions);
const engineSourceSha256 = await directorySha256(resolve(here, '../../src/v3'));

const failures = holdoutSamples.flatMap((sample) => {
  const predictedUnsafe = sample.Q >= threshold;
  const failureTypes = [];
  if (sample.expectedUnsafe && !predictedUnsafe) failureTypes.push('binary false negative');
  if (!sample.expectedUnsafe && predictedUnsafe) failureTypes.push('binary false positive');
  if (sample.expectedUnsafe && !sample.categories.includes(sample.targetCategory)) {
    failureTypes.push('target-category miss');
  }
  if (!sample.expectedUnsafe && sample.categories.includes(sample.targetCategory)) {
    failureTypes.push('target-category false positive');
  }
  return failureTypes.length === 0 ? [] : [{ ...sample, failureTypes }];
});

const latencyValues = holdoutSamples.map((sample) => sample.elapsedMs);
const criteria = manifest.acceptanceCriteria;
const gate = (name, observed, requirement, passed) => ({ name, observed, requirement, passed });
const gates = [
  gate('dataset integrity errors', integrityErrors.length, '= 0', integrityErrors.length === 0),
  gate('holdout AUROC', rounded(holdoutQ.auroc), `>= ${criteria.holdoutAuRocMinimum}`, (holdoutQ.auroc ?? 0) >= criteria.holdoutAuRocMinimum),
  gate('holdout sensitivity', rounded(holdoutQ.operatingPoint.sensitivity), `>= ${criteria.holdoutSensitivityMinimum}`, (holdoutQ.operatingPoint.sensitivity ?? 0) >= criteria.holdoutSensitivityMinimum),
  gate('holdout specificity', rounded(holdoutQ.operatingPoint.specificity), `>= ${criteria.holdoutSpecificityMinimum}`, (holdoutQ.operatingPoint.specificity ?? 0) >= criteria.holdoutSpecificityMinimum),
  gate('target-category recall', rounded(holdoutCategories.overall.targetCategoryRecall), `>= ${criteria.targetCategoryRecallMinimum}`, (holdoutCategories.overall.targetCategoryRecall ?? 0) >= criteria.targetCategoryRecallMinimum),
  gate('target-category false-positive rate', rounded(holdoutCategories.overall.targetCategoryFalsePositiveRate), `<= ${criteria.targetCategoryFalsePositiveRateMaximum}`, (holdoutCategories.overall.targetCategoryFalsePositiveRate ?? 1) <= criteria.targetCategoryFalsePositiveRateMaximum),
  gate('p95 conversation latency (ms)', rounded(quantile(latencyValues, 0.95)), `<= ${criteria.p95LatencyMsMaximum}`, (quantile(latencyValues, 0.95) ?? Infinity) <= criteria.p95LatencyMsMaximum),
];

const report = roundDeep({
  reportSchemaVersion: 1,
  generatedAt: new Date().toISOString(),
  engineName: 'ALEPHONENULL V3',
  engineVersion: VERSION,
  engineSourceSha256,
  datasetVersion: manifest.datasetVersion,
  datasetSha256: sha256(stableJson({ manifest, cases })),
  provenance: manifest.provenance,
  integrity: { passed: integrityErrors.length === 0, errors: integrityErrors },
  thresholdSelection: {
    split: 'development',
    threshold,
    metSensitivityFloor: selected.metSensitivityFloor,
    candidateCount: selected.candidateCount,
    objective: manifest.thresholdSelection.objective,
  },
  bootstrap: bootstrapOptions,
  development: { qEvaluation: developmentQ, categoryEvaluation: developmentCategories },
  holdout: {
    qEvaluation: holdoutQ,
    confidenceIntervals95,
    categoryEvaluation: holdoutCategories,
    latencyMs: {
      p50: quantile(latencyValues, 0.5),
      p95: quantile(latencyValues, 0.95),
      maximum: Math.max(...latencyValues),
    },
    failures,
    samples: holdoutSamples,
  },
  acceptance: { passed: gates.every((item) => item.passed), gates },
  limitations: manifest.limitations,
});

await writeFile(resultJsonPath, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(resultMarkdownPath, markdownReport(report));

console.log(`ALEPHONENULL V3 internal validation: ${report.acceptance.passed ? 'PASS' : 'FAIL'}`);
console.log(`Dataset: ${report.datasetVersion} (${report.datasetSha256})`);
console.log(`Threshold selected on development split: Q >= ${report.thresholdSelection.threshold.toFixed(6)}`);
console.log(`Holdout AUROC: ${metric(report.holdout.qEvaluation.auroc)}`);
console.log(`Holdout sensitivity: ${metric(report.holdout.qEvaluation.operatingPoint.sensitivity)}`);
console.log(`Holdout specificity: ${metric(report.holdout.qEvaluation.operatingPoint.specificity)}`);
console.log(`Target-category recall: ${metric(report.holdout.categoryEvaluation.overall.targetCategoryRecall)}`);
console.log(`Target-category false-positive rate: ${metric(report.holdout.categoryEvaluation.overall.targetCategoryFalsePositiveRate)}`);
console.log(`Report: ${resultMarkdownPath}`);

if (!report.acceptance.passed) process.exitCode = 1;

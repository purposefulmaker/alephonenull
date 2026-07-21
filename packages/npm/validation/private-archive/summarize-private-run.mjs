#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

function parseArgs(argv) {
  const options = { run: null, partitions: ['discovery', 'development'] };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--run') options.run = argv[++index];
    else if (argument === '--partitions') options.partitions = argv[++index].split(',');
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (!options.run) throw new Error('--run is required');
  return options;
}

function assertIgnored(path) {
  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  }).stdout.trim();
  const result = spawnSync('git', ['check-ignore', '-q', '--', path], { cwd: root });
  if (result.status !== 0) throw new Error('Run directory is not Git-ignored');
}

function increment(record, key) {
  record[key] = (record[key] ?? 0) + 1;
}

function percentile(values, probability) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function newCohort() {
  return {
    cases: 0,
    scored: 0,
    qValues: [],
    actions: {},
    categories: {},
  };
}

function add(cohort, row) {
  cohort.cases += 1;
  const signal = row.v3_candidate_signal;
  if (!signal || !Number.isFinite(signal.Q)) return;
  cohort.scored += 1;
  cohort.qValues.push(signal.Q);
  increment(cohort.actions, signal.action);
  for (const category of signal.categories ?? []) increment(cohort.categories, category);
}

function finalize(cohort) {
  const actions = cohort.actions;
  const interventionCount = (actions.WARN ?? 0) + (actions.STEER ?? 0)
    + (actions.NULL ?? 0) + (actions.EMERGENCY_NULL ?? 0);
  return {
    cases: cohort.cases,
    scored: cohort.scored,
    score_coverage: cohort.cases ? cohort.scored / cohort.cases : null,
    q: {
      median: percentile(cohort.qValues, 0.5),
      p95: percentile(cohort.qValues, 0.95),
      at_or_above_0_65: cohort.qValues.filter((value) => value >= 0.65).length,
      at_or_above_0_65_rate: cohort.scored
        ? cohort.qValues.filter((value) => value >= 0.65).length / cohort.scored : null,
    },
    actions,
    intervention_rate: cohort.scored ? interventionCount / cohort.scored : null,
    categories: cohort.categories,
  };
}

async function filesForPartition(run, partition) {
  const directory = join(run, 'candidates', partition);
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.private.jsonl'))
    .map((entry) => join(directory, entry.name))
    .sort();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const run = resolve(options.run);
  assertIgnored(run);
  const cohorts = {
    all: newCohort(),
    independently_tagged_scenario: newCohort(),
    response_signal_present: newCohort(),
    correction_or_disagreement_feedback: newCohort(),
    no_independent_retrieval_signal: newCohort(),
    privacy_none: newCohort(),
  };
  const scenarioCohorts = {};
  const partitionCohorts = {};

  for (const partition of options.partitions) {
    partitionCohorts[partition] = newCohort();
    for (const path of await filesForPartition(run, partition)) {
      const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
      for await (const line of lines) {
        if (!line.trim()) continue;
        const row = JSON.parse(line);
        const scenario = row.retrieval_tags?.scenario ?? [];
        const response = row.retrieval_tags?.response_signals ?? [];
        const feedback = row.retrieval_tags?.feedback_signals ?? [];
        const negativeFeedback = feedback.some((tag) => tag === 'correction' || tag === 'disagreement');
        add(cohorts.all, row);
        add(partitionCohorts[partition], row);
        if (scenario.length > 0) add(cohorts.independently_tagged_scenario, row);
        if (response.length > 0) add(cohorts.response_signal_present, row);
        if (negativeFeedback) add(cohorts.correction_or_disagreement_feedback, row);
        if (row.privacy_review?.severity === 'none') add(cohorts.privacy_none, row);
        if (scenario.length === 0 && response.length === 0 && !negativeFeedback) {
          add(cohorts.no_independent_retrieval_signal, row);
        }
        for (const tag of scenario) {
          scenarioCohorts[tag] ??= newCohort();
          add(scenarioCohorts[tag], row);
        }
      }
    }
  }

  const summary = {
    schema_version: 1,
    content_free_aggregate: true,
    partitions: options.partitions,
    warnings: [
      'Retrieval tags are heuristics, not ground truth.',
      'V3 scores are a deterministic sample and do not establish accuracy.',
      'The candidate holdout is excluded unless explicitly requested.',
    ],
    cohorts: Object.fromEntries(Object.entries(cohorts).map(([key, value]) => [key, finalize(value)])),
    by_partition: Object.fromEntries(Object.entries(partitionCohorts).map(([key, value]) => [key, finalize(value)])),
    by_scenario_tag: Object.fromEntries(Object.entries(scenarioCohorts)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => [key, finalize(value)])),
  };
  const output = join(run, 'signal-cross-tabs.private.json');
  await writeFile(output, `${JSON.stringify(summary, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});

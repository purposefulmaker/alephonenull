#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import { createInterface } from 'node:readline';

import { AlephOneNullV3, VERSION } from '../../dist/v3/index.mjs';

function parseArgs(argv) {
  const options = { run: null, partitions: ['discovery', 'development'] };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--run') options.run = argv[++index];
    else if (argv[index] === '--partitions') options.partitions = argv[++index].split(',');
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!options.run) throw new Error('--run is required');
  return options;
}

function assertIgnored(path) {
  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
  if (spawnSync('git', ['check-ignore', '-q', '--', path], { cwd: root }).status !== 0) {
    throw new Error('Run directory is not Git-ignored');
  }
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

function evidenceKind(evidence) {
  const colon = evidence.indexOf(':');
  const prefix = colon >= 0 ? evidence.slice(0, colon) : evidence;
  return prefix.replace(/\s*\[[^\]]+\]\s*$/u, '').trim();
}

const DEHUMANIZATION_RULES = [
  ['third_person_user_reference', /\b(the user|this user|user \w+)\b/iu],
  ['request_status_passive', /\byour (request|query|input|prompt) (has been|will be|is being)\b/iu],
  ['processing_request', /\bprocessing your (request|input|query)\b/iu],
  ['ai_identity_disclaimer', /\bas an AI (language model|assistant|system)\b/iu],
  ['ai_self_minimization', /\bI('m| am) (just|only) (a|an) (language model|AI|tool|assistant|program)\b/iu],
  ['robotic_acknowledgment', /\backnowledged\b/iu],
  ['robotic_input_received', /\binput received\b/iu],
  ['robotic_output_generation', /\b(generating output|output generated|returning results)\b/iu],
  ['robotic_completion', /\b(task complete|processing complete|query processed|execution complete)\b/iu],
  ['robotic_next_instruction', /\b(awaiting further input|ready for next instruction)\b/iu],
  ['robotic_request_logging', /\b(request|input|query) (logged|registered|noted)\b/iu],
];

async function candidateFiles(run, partitions) {
  const files = [];
  for (const partition of partitions) {
    const directory = join(run, 'candidates', partition);
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.private.jsonl')) {
        files.push(join(directory, entry.name));
      }
    }
  }
  return files.sort();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const run = resolve(options.run);
  assertIgnored(run);
  const engine = new AlephOneNullV3({ behavior: { logToConsole: false, logDetections: false } });
  const aggregate = {
    schema_version: 1,
    content_free_aggregate: true,
    v3_version: VERSION,
    partitions: options.partitions,
    rescored_cases: 0,
    score_mismatches: 0,
    action_counts: {},
    category_counts: {},
    evidence_kind_counts: {},
    dehumanization_rule_counts: {},
    scan_durations_ms: [],
  };

  for (const path of await candidateFiles(run, options.partitions)) {
    const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
    for await (const line of lines) {
      if (!line.trim()) continue;
      const row = JSON.parse(line);
      if (!Number.isFinite(row.v3_candidate_signal?.Q)) continue;
      const started = performance.now();
      const result = engine.scan(row.prompt, row.response, row.case_id);
      aggregate.scan_durations_ms.push(performance.now() - started);
      aggregate.rescored_cases += 1;
      if (Math.abs(result.Q - row.v3_candidate_signal.Q) > 1e-12
        || result.action !== row.v3_candidate_signal.action) aggregate.score_mismatches += 1;
      increment(aggregate.action_counts, result.action);
      for (const detection of result.detections) {
        increment(aggregate.category_counts, detection.category);
        aggregate.evidence_kind_counts[detection.category] ??= {};
        for (const evidence of detection.evidence) {
          increment(aggregate.evidence_kind_counts[detection.category], evidenceKind(evidence));
        }
        if (detection.category === 'dehumanization') {
          for (const [name, pattern] of DEHUMANIZATION_RULES) {
            if (pattern.test(row.response)) increment(aggregate.dehumanization_rule_counts, name);
          }
        }
      }
    }
  }

  const report = {
    ...aggregate,
    scan_duration_ms: {
      median: percentile(aggregate.scan_durations_ms, 0.5),
      p95: percentile(aggregate.scan_durations_ms, 0.95),
      p99: percentile(aggregate.scan_durations_ms, 0.99),
      max: aggregate.scan_durations_ms.length ? Math.max(...aggregate.scan_durations_ms) : null,
    },
    scan_durations_ms: undefined,
    warning: 'Counts identify rule families only. They are diagnostic signals, not human labels.',
  };
  const output = join(run, 'detector-diagnostics.private.json');
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});

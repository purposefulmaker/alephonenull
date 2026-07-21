#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createReadStream, createWriteStream } from 'node:fs';
import { once } from 'node:events';
import { readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { createInterface } from 'node:readline';

function parseArgs(argv) {
  const options = { run: null, perPartition: 300 };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--run') options.run = argv[++index];
    else if (argv[index] === '--per-partition') options.perPartition = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  if (!options.run) throw new Error('--run is required');
  if (!Number.isInteger(options.perPartition) || options.perPartition < 1) {
    throw new Error('--per-partition must be a positive integer');
  }
  return options;
}

function assertIgnored(path) {
  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).stdout.trim();
  if (spawnSync('git', ['check-ignore', '-q', '--', path], { cwd: root }).status !== 0) {
    throw new Error('Run directory is not Git-ignored');
  }
}

function addLowest(queue, row, limit) {
  if (queue.length < limit) {
    queue.push(row);
    return;
  }
  let greatest = 0;
  for (let index = 1; index < queue.length; index += 1) {
    if (queue[index].case_id > queue[greatest].case_id) greatest = index;
  }
  if (row.case_id < queue[greatest].case_id) queue[greatest] = row;
}

function blinded(row, sampling) {
  return {
    schema_version: row.schema_version,
    case_id: row.case_id,
    partition: row.partition,
    sampling,
    provenance: row.provenance,
    prompt: row.prompt,
    response: row.response,
    user_feedback: row.user_feedback,
    privacy_review: {
      severity: row.privacy_review.severity,
      sharing_allowed: false,
    },
    labels: row.labels,
  };
}

async function files(run, partition) {
  const directory = join(run, 'candidates', partition);
  return (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.private.jsonl'))
    .map((entry) => join(directory, entry.name))
    .sort();
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const run = resolve(options.run);
  assertIgnored(run);
  const partitions = ['discovery', 'development'];
  const selected = {};
  const populations = {};

  for (const partition of partitions) {
    selected[partition] = [];
    populations[partition] = 0;
    for (const path of await files(run, partition)) {
      const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
      for await (const line of lines) {
        if (!line.trim()) continue;
        const row = JSON.parse(line);
        populations[partition] += 1;
        addLowest(selected[partition], row, options.perPartition);
      }
    }
    selected[partition].sort((left, right) => left.case_id.localeCompare(right.case_id));
  }

  const rows = partitions.flatMap((partition) => selected[partition].map((row) => blinded(row, {
    method: 'deterministic_uniform_hmac_order',
    stratum: partition,
    population_count: populations[partition],
    selected_count: selected[partition].length,
    inclusion_probability: selected[partition].length / populations[partition],
    selected_without_v3_or_retrieval_signals: true,
  })));
  rows.sort((left, right) => left.case_id.localeCompare(right.case_id));
  const outputPath = join(run, 'validation-annotation-queue.private.jsonl');
  const output = createWriteStream(outputPath, { encoding: 'utf8', mode: 0o600 });
  for (const row of rows) {
    if (!output.write(`${JSON.stringify(row)}\n`)) await once(output, 'drain');
  }
  output.end();
  await once(output, 'finish');
  process.stdout.write(`Created blinded validation queue: ${rows.length} rows (${selected.discovery.length} discovery, ${selected.development.length} development).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});

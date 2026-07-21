# Private archive benchmark builder

This tool converts an Anthropic `conversations.json` account export into a
local-only review corpus for AlephOneNull V3. It is deliberately not part of
the public validation set.

## Privacy boundary

- The input and output paths must both match a Git ignore rule. The tool exits
  before reading message text if either path is not ignored.
- It prints counts and progress only. It never prints conversation text,
  conversation names, summaries, account fields, UUIDs, attachments, files,
  thinking blocks, or tool payloads.
- Raw UUIDs are replaced with salted HMAC identifiers. The persistent salt is
  stored in the ignored output directory with owner-only permissions.
- Candidate chunks contain private prompt and response text. They are marked
  `*.private.jsonl`, remain untracked, and must not be shared.
- Privacy flags are conservative review aids, not proof that an unflagged case
  is de-identified.

## Run

Build the package first if V3 candidate scoring is wanted:

```bash
npm --prefix packages/npm run build
node packages/npm/validation/private-archive/build-private-benchmark.mjs \
  --input data-EXPORT/conversations.json \
  --output data-EXPORT/aleph-private-benchmark-v1
```

Pass `--without-v3` to construct the corpus without importing the V3 build.
The initial profile scores a deterministic 10% sample. Use
`--v3-sample-rate 1` only when full-corpus candidate scoring is warranted;
human labels are still required before those scores can produce accuracy
metrics. Oversized cases remain in the corpus but are explicitly unscored.

Each run creates immutable, partitioned JSONL chunks plus two small queues:

- `review-queue.private.jsonl`: independently selected, tag-rich cases for
  human annotation. The queue is blinded: V3 scores, retrieval tags, ranking
  signals, and raw IDs are omitted;
- `control-queue.private.jsonl`: lower-signal cases needed to measure false
  positives;
- `profile.private.json`: content-free aggregate counts and distributions;
- `manifest.private.json`: source fingerprint, split policy, limitations, and
  reproducibility metadata.

The ranked review/control queues are for prompt mining and error discovery, not
prevalence estimates. Create a blinded probability sample for validation with:

```bash
node packages/npm/validation/private-archive/make-private-validation-queue.mjs \
  --run data-EXPORT/aleph-private-benchmark-v1/runs/RUN_ID \
  --per-partition 300
```

This selects cases by salted-HMAC order only, records the stratum inclusion
probability, and omits retrieval tags, ranking features, and V3 signals.

## Validity rules

1. A case is a visible human message paired to an assistant reply through the
   parent-message graph. Attachment- and tool-dependent pairs are excluded.
2. Splits are deterministic at conversation level: 60% discovery, 20%
   development, and 20% candidate holdout. The holdout is neither V3-scored nor
   copied into a review queue until development thresholds are locked.
3. Exact duplicate pairs are removed. Exact prompts repeated in different
   conversations are retained only in their first conversation, preventing
   that exact leakage across splits.
4. Retrieval tags and V3 output are not labels. Selection never uses the V3
   signal. Humans must label interaction failure, category, severity,
   confidence, and rationale before metrics are calculated.
5. `candidate_holdout` means frozen after extraction. Because the archive is
   part of the framework's historical design lineage, it is not an independent
   test set and cannot support a production-readiness claim by itself.

The final readiness evaluation should combine this lineage corpus with a
separately sourced, independently labeled public or third-party benchmark.

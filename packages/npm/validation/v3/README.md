# V3 validation

This directory contains a reproducible, versioned internal evaluation of the
V3 runtime detector score. It deliberately separates detector-development
fixtures from a development split used for threshold selection and an internal
holdout split used for final measurement.

Run it from the repository root:

```bash
pnpm validate:v3
```

The command builds the package, validates corpus integrity, selects a Q
threshold on the development split, evaluates the unchanged threshold on the
internal holdout, calculates deterministic stratified bootstrap intervals, and
writes JSON and Markdown reports under `results/`. It exits non-zero when any
predeclared gate fails.

Each case is a contrast pair: the same prompt has a policy-positive
conversation and a paired negative conversation. For multi-turn cases, the
conversation score is the maximum turn-level Q. This answers the operational
question “did any turn contain a material signal?” rather than averaging a
dangerous turn away.

The dataset is synthetic and developer-authored with knowledge of the detector
taxonomy. It is useful for reproducibility and regression detection, but it is
not independent evidence of safety. Any detector tuning based on the internal
holdout requires a new dataset version and a newly frozen holdout.

The protocol follows the reporting direction in the
[NIST AI RMF Measure function](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/):
document test sets and methods, report uncertainty, measure conditions relevant
to deployment, and seek independent review. This repository currently covers
only the internal test-set, repeatability, and uncertainty pieces.

For an external negative-control source, future work should evaluate compliant
responses to the safe prompts in
[XSTest](https://github.com/paul-rottger/xstest), whose prompt corpus is
CC-BY-4.0. It should be added as a separately attributed benchmark rather than
copied into this internal corpus.

An external proxy runner is also included for Anthropic's independently
authored human red-team attempts. Download the source separately, then run:

```bash
npm run build
node validation/v3/run-anthropic-proxy.mjs /path/to/red_team_attempts.jsonl.gz
```

The proxy uses human attack-success ratings 3–4 as positives and rating 0 as
negatives, applies the threshold already selected by the internal development
split, and retains only digest-derived record IDs. These labels are not V3
category labels, so this measures broad out-of-distribution association rather
than detector-specific accuracy.

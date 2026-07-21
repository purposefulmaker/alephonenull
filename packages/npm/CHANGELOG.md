# Changelog

> ⚠️ EXPERIMENTAL research software. Not peer-reviewed, not a production safety system.

## 3.0.0 — The V3 Standard

Engine tier promoted **v2 → v3** in place. This is a breaking change for the
subpath export.

### Breaking

- Import path `@alephonenull/eval/v2` is now **`@alephonenull/eval/v3`**.
- Class `AlephOneNullV2` → **`AlephOneNullV3`**; types `V2Config`/`V2ConfigInput`
  → `V3Config`/`V3ConfigInput`; quick-setup `createV2`/`scanV2`/`processV2`
  → `createV3`/`scanV3`/`processV3`; aliased re-exports `V2_ENGINE_VERSION`,
  `V2_NAME`, `V2ThreatLevel`, `V2NullState`, `V2MiddlewareOptions` gain the `V3`
  prefix.
- Python: subpackage `alephonenull.v2` → **`alephonenull.v3`**
  (`from alephonenull.v3 import AlephOneNullV3`).
- Framework `VERSION` is now `3.0.0`; Python `__version__` is `0.3.0a1`.

The detector phrase banks and default threshold values are unchanged. V3 also
hardens the surrounding runtime contract:

- Q aggregation now uses a weighted noisy-OR so category weights apply to a
  single signal and adding a positive signal cannot lower Q.
- Advertised thresholds and strictness controls are now enforced at runtime,
  with invalid configuration rejected early.
- Session score/detection histories and the session registry are bounded;
  resetting or evicting a session also clears detector-owned loop state.
- Public engine/package version exports are aligned at `3.0.0`.

### Q score evaluation contract

V3 returns `Q ∈ [0, 1]`, a continuous heuristic score derived from triggered
detector severities and category weights. Q is not a ground-truth probability,
calibrated risk estimate, or replacement for label-based evaluation.

The adversarial harness (`tests/run-redteam.ts`) now keeps detector-specific
resilience results while also evaluating Q against separate harmful and benign
cohorts. The report emits:

- mean Q for labeled unsafe and safe cohorts,
- **Q separation** (mean unsafe − mean safe),
- AUROC as a threshold-independent ranking check,
- sensitivity, specificity, and false-positive rate at a declared Q threshold,
- the **Q floor** — the lowest Q the engine still fired on.

`QEvaluator` is exported from both the TypeScript and Python V3 packages so
integrators can reproduce these metrics on versioned, domain-specific fixtures.
Q and ROC operate at different layers: Q supplies a score; ROC-style analysis
can assess how that score separates labeled examples across thresholds.

### Validation evidence

- Added a versioned 80-conversation internal contrast corpus covering all 20
  runtime categories, with development-only threshold selection, an internal
  holdout, deterministic bootstrap intervals, per-category error reporting,
  dataset/source digests, and predeclared gates.
- Added an external proxy runner for Anthropic's independently authored human
  red-team attempts. The frozen 2,000-conversation run fails its predeclared
  gates (AUROC 0.465, sensitivity 0.244, specificity 0.723 at Q >= 0.375).
- Optimized fuzzy harm matching after validation exposed a scan-latency
  bottleneck. Phrase-aligned windows and bounded edit distance preserve typo
  coverage while reducing internal-holdout p95 latency from about 514 ms to
  under 10 ms in the recorded environment.

The internal pass is regression evidence, not independent validation. The
external proxy failure means V3 is not validated as a broad harm classifier and
is not ready to replace other evaluation methods or production safeguards.

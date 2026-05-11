/**
 * Shared corpus metrics for the public evidence pack.
 * Single source of truth so /evidence and /about cannot drift.
 *
 * Update these values when the labeled fixture corpus changes.
 */

// Public repository root. The evidence pack lives in the repo; the folder
// name is an implementation detail and intentionally not surfaced in UI copy.
export const EVIDENCE_REPO_URL =
  'https://github.com/purposefulmaker/alephonenull#evidence-pack'

export const EVIDENCE_MANIFEST_URL =
  'https://github.com/purposefulmaker/alephonenull#evidence-pack'

export const EVIDENCE_LAST_UPDATED = '2026-05'

export const EVIDENCE_METRICS = {
  fixtureFiles: 10,
  labeledTurns: 95,
  controls: 20,
  positiveTurns: 75,
  observedLabels: 19,
  controlRate: '21.1%',
} as const

export const EVIDENCE_SUMMARY = `${EVIDENCE_METRICS.labeledTurns} turns, ${EVIDENCE_METRICS.controls} controls, ${EVIDENCE_METRICS.positiveTurns} positives, ${EVIDENCE_METRICS.observedLabels} labels.`

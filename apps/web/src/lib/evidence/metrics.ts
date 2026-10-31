/**
 * Shared corpus metrics for the archived preliminary evidence corpus.
 * Single source of truth so /evidence and /about cannot drift.
 *
 * The labeled fixture corpus (`capture/`) was withdrawn from the working tree
 * and exists only in repository history. The counts below describe that
 * archived snapshot; nothing at HEAD substantiates them independently. The
 * evidence of record is now the V3 validation results under
 * packages/npm/validation/v3/results/.
 */

// Last commit that contains the archived corpus.
export const EVIDENCE_ARCHIVE_COMMIT = 'c976e98'

export const EVIDENCE_REPO_URL = `https://github.com/purposefulmaker/alephonenull/tree/${EVIDENCE_ARCHIVE_COMMIT}/capture`

export const EVIDENCE_MANIFEST_URL = `https://github.com/purposefulmaker/alephonenull/blob/${EVIDENCE_ARCHIVE_COMMIT}/capture/manifest.json`

export const EVIDENCE_LAST_UPDATED = '2026-05'

export const EVIDENCE_METRICS = {
  fixtureFiles: 10,
  labeledTurns: 95,
  controls: 20,
  positiveTurns: 75,
  observedLabels: 19,
  controlRate: '21.1%',
} as const

export const EVIDENCE_SUMMARY = `Archived corpus: ${EVIDENCE_METRICS.labeledTurns} turns, ${EVIDENCE_METRICS.controls} controls, ${EVIDENCE_METRICS.positiveTurns} positives, ${EVIDENCE_METRICS.observedLabels} labels.`

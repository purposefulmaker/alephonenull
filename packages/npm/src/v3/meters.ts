/**
 * ALEPHONENULL V3 — Meter Math (Null Meter spec v1.1.0)
 *
 * Shared primitives for the U/D/C meters of the Null Meter spec:
 *   U — unsupported-claim risk: detector signal amplified by specificity density
 *   D — goal drift: embedding cosine distances mapped to a 0-100 band
 *   C — context load: token usage as a percentage of the context window
 *
 * A — action risk — is SPECIFIED as levels 0-4 (see ActionRisk) but has NO
 * implementation in this module. Any UI must display "n/a" for A rather than
 * a fabricated number.
 *
 * All constants here are uncalibrated heuristics. None of these values are
 * validated probabilities. High readings mean "intervention recommended",
 * not "the model is lying".
 */

export const METER_SPEC_VERSION = '1.1.0';

/**
 * Detection categories that feed the U (unsupported-claim risk) meter.
 * U is SPECIFICALLY unsupported-claim risk: only categories that signal an
 * unsupported or fabricated claim are counted. Harm, tone, and one-sidedness
 * categories (`direct_harm`, `net_zero_violation`, `even_odd_suppression`,
 * `invertibility_check`) were deliberately excluded in spec 1.1.0 — they are
 * harm/tone/one-sidedness/genericness signals, not unsupported-claim signals.
 * They still surface via the detections list and Q; they no longer drive U.
 */
export const UNSUPPORTED_CATEGORIES: ReadonlySet<string> = new Set([
  'medical_hallucination',
  'fiction_as_function',
  'reconstruction_fidelity',
  'parseval_violation',
]);

/** Cosine-distance floor for goal drift. Uncalibrated heuristic. */
export const DRIFT_FLOOR = 0.45;
/** Cosine-distance ceiling for goal drift. Uncalibrated heuristic. */
export const DRIFT_CEIL = 0.85;
/** Weight of reply-drift vs intent-drift in the blend. Uncalibrated heuristic. */
export const DRIFT_REPLY_WEIGHT = 0.7;
/** How strongly specificity density amplifies detector signal. Uncalibrated heuristic. */
export const DENSITY_AMPLIFICATION = 0.5;

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/**
 * Specificity density: rate of numerals + capitalized proper-noun-like
 * tokens per word, adjusted for sentence starts. A long, fluent reply
 * dense with specific dates/numbers/names without prior grounding is the
 * classic shape of fabrication. Cheap, model-agnostic, no extra API calls.
 *
 * Returns 0..1. Replies under 25 words return 0.
 */
export function specificityDensity(reply: string): number {
  const words = reply.match(/\b[\w-]+\b/g) ?? [];
  if (words.length < 25) return 0;
  let specifics = 0;
  for (const w of words) {
    if (/\d/.test(w)) specifics++;
    else if (/^[A-Z][a-z]{2,}/.test(w)) specifics++;
  }
  // Approximate sentence-start capitalizations to discount.
  const sentences = (reply.match(/[.!?](?:\s|$)/g) ?? []).length + 1;
  const adjusted = Math.max(0, specifics - sentences);
  const density = adjusted / words.length;
  // density 0.20+ reads as "wall of unsupported specifics".
  return Math.max(0, Math.min(1, density / 0.20));
}

/**
 * Max severity among detections whose category is in the given set.
 * Returns 0..1. Non-finite severities are ignored.
 */
export function maxSeverityInCategories(
  detections: ReadonlyArray<{ category: string; severity: number }>,
  categories: ReadonlySet<string>,
): number {
  let max = 0;
  for (const d of detections) {
    if (!Number.isFinite(d.severity)) continue;
    if (categories.has(d.category) && d.severity > max) max = d.severity;
  }
  return clamp01(max);
}

/**
 * U meter: unsupported-claim risk as a 0..100 integer.
 *
 * Density is an AMPLIFIER only: a detectorSignal of 0 always yields 0,
 * regardless of density — specificity alone is never called hallucination.
 * The detectors must fire before density can raise the reading.
 */
export function unsupportedClaimRisk(detectorSignal: number, density: number): number {
  return Math.round(
    100 * clamp01(clamp01(detectorSignal) * (1 + DENSITY_AMPLIFICATION * clamp01(density))),
  );
}

/**
 * Standard cosine similarity. Returns 0 for mismatched or empty lengths,
 * or when either vector has zero norm.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * D meter: goal drift as a 0..100 integer, from cosine DISTANCES
 * (1 - similarity) of the reply and the inferred intent to the goal.
 *
 * DRIFT_FLOOR exists because question → on-topic-answer pairs under
 * text-embedding-3-small routinely sit at 0.3-0.5 cosine distance; below
 * the floor reads as 0% drift. All constants are uncalibrated heuristics.
 */
export function goalDriftPercent(dReply: number, dIntent: number): number {
  const blended = DRIFT_REPLY_WEIGHT * dReply + (1 - DRIFT_REPLY_WEIGHT) * dIntent;
  return Math.round(100 * clamp01((blended - DRIFT_FLOOR) / (DRIFT_CEIL - DRIFT_FLOOR)));
}

/**
 * C meter: context load as a 0..100 percentage with ONE decimal place.
 * A non-positive window returns 0.
 */
export function contextLoadPercent(totalTokens: number, windowTokens: number): number {
  if (windowTokens <= 0) return 0;
  const pct = Math.max(0, Math.min(100, (totalTokens / windowTokens) * 100));
  return Math.round(pct * 10) / 10;
}

/**
 * A meter: action risk levels 0-4 — SPEC ONLY.
 * Deliberately no computing function is exported: no implementation exists,
 * and a UI must render "n/a" rather than a fabricated number.
 */
export type ActionRisk = 0 | 1 | 2 | 3 | 4;

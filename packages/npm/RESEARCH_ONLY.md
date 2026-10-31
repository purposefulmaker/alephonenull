# Research Use Only

`@alephonenull/eval` is made available for **research and evaluation use only**.
It is not yet published to a public registry — build from source from this
repository.

- **Not for production safety decisions.** Do not gate user-facing safety,
  moderation, medical, financial, or crisis behavior on this package's output.
- **No truth measurement.** The detectors are heuristics over surface patterns.
  A high Q, S, or meter score means **"intervention recommended"** — flag for
  review — never "the model lied" or "this content is harmful."
- **Not externally validated.** An internal contrast evaluation passes
  (AUROC 0.995 on a frozen 40-conversation internal holdout; threshold selected
  on a disjoint 40-conversation development split; 80 synthetic conversations
  total) while an external red-team proxy fails (AUROC 0.465 on 2,000
  independently authored external conversations). Both were
  rerun on 2026-08-17 against the current build (engine source digest
  `f7164389...`). Cite both together; see [DISCLAIMER.md](./DISCLAIMER.md)
  for details.
- **Validate before you rely.** Any deployment claim requires your own
  domain-specific fixtures, measured false-positive/false-negative rates, and
  independent review.

The authoritative statement of what every score does and does not mean is the
V3 contract: https://alephonenull.com/docs/contract

Questions or validation contributions: contact@alephonenull.com

# Research Use Only

`@alephonenull/eval` is published for **research and evaluation use only**.

- **Not for production safety decisions.** Do not gate user-facing safety,
  moderation, medical, financial, or crisis behavior on this package's output.
- **No truth measurement.** The detectors are heuristics over surface patterns.
  A high Q, S, or meter score means **"intervention recommended"** — flag for
  review — never "the model lied" or "this content is harmful."
- **Not externally validated.** An internal contrast evaluation passes
  (AUROC 0.995 on 80 synthetic conversations) while an external red-team proxy
  fails (AUROC 0.465 on 2,000 independently authored conversations). Both were
  rerun on 2026-07-21 against the current build (engine source digest
  `92a9b513...`). Cite both together; see [DISCLAIMER.md](./DISCLAIMER.md)
  for details.
- **Validate before you rely.** Any deployment claim requires your own
  domain-specific fixtures, measured false-positive/false-negative rates, and
  independent review.

The authoritative statement of what every score does and does not mean is the
V3 contract: https://alephonenull.com/docs/contract

Questions or validation contributions: research@alephonenull.org

# Disclaimer

**AlephOneNull (`@alephonenull/eval`) is experimental research software. It is
not validated for production use and is not a safety guarantee.**

## What this software is

- A heuristic screening layer: pattern-based detectors that flag text for
  human or system review.
- A research instrument for studying AI-interaction failure modes.
- A high score means **"intervention recommended"** — it never means "the model
  lied" or "this output is harmful." The framework does not measure truth.

## What this software is not

- Not peer-reviewed.
- Not externally validated. The current V3 evidence is deliberately mixed and
  must always be cited together (both rerun 2026-07-21 against the current
  build, engine source digest `92a9b513...`):
  - A developer-authored [internal contrast evaluation](https://github.com/purposefulmaker/alephonenull/blob/main/packages/npm/validation/v3/results/v3.0.0-internal.1.md)
    passes its predeclared gates on 80 synthetic conversations
    (AUROC 0.995, sensitivity 0.900, specificity 1.000).
  - An independently sourced [Anthropic red-team proxy](https://github.com/purposefulmaker/alephonenull/blob/main/packages/npm/validation/v3/results/anthropic-red-team-proxy.md)
    fails all predeclared generalization gates on 2,000 independently authored
    conversations (AUROC 0.465, sensitivity 0.244, specificity 0.723).
  - The external corpus uses human attack-success ratings rather than V3
    category labels, so it is an imperfect proxy — but the failure shows Q is
    not a validated general harm score.
- Not a replacement for ROC/AUROC analysis, independent review, or
  deployment-specific evaluation.
- Not a moderation system, a medical device, or an emergency service.

## Use restrictions

Appropriate: academic research, evaluation, prototyping, education,
contributing to validation.

Inappropriate: production safety decisions, safety-critical systems, medical
or financial applications, or any system where a missed or false detection
could cause harm. Relying on unvalidated screening creates false confidence.

See [RESEARCH_ONLY.md](./RESEARCH_ONLY.md) and the
[V3 contract](https://alephonenull.com/docs/contract) for what the scores do
and do not mean.

## No warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. THE AUTHORS SHALL NOT BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY ARISING FROM, OUT OF, OR IN
CONNECTION WITH THE SOFTWARE OR ITS USE. See [LICENSE](./LICENSE).

## Safety note

For urgent mental-health, medical, or physical-safety concerns, contact local
emergency services or qualified crisis resources. AlephOneNull is software
research, not an emergency service.

## Contact

- Issues: https://github.com/purposefulmaker/alephonenull/issues
- Research: research@alephonenull.org

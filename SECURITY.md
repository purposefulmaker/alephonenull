# Security Policy

AlephOneNull is experimental research software maintained by John Bernard.
This policy covers security issues in the code, packages, and site in this
repository. It does not cover the behavior of third-party AI models; see
[Model behavior findings](#model-behavior-findings) below.

## Supported versions

Fixes land on the `main` branch and the current workspace packages:
`@alephonenull/eval` 3.x (TypeScript) and `alephonenull-eval` 0.3.x (Python).
The `alephonenull-experimental` 0.1.0 alphas published to npm and PyPI on
2025-09-08 are superseded and unsupported.

## Reporting a vulnerability

Email **contact@alephonenull.com** with `SECURITY` in the subject line. Do not
open a public GitHub issue for an undisclosed vulnerability.

Include:

- the affected package and version, or the affected URL
- steps to reproduce, with a proof of concept where practical
- the impact you observed or expect
- whether, and when, you intend to publish

Targets: acknowledgement within 5 business days; a status update at least
every 14 days until the report is resolved. We ask for coordinated disclosure
of 90 days from acknowledgement, or until a fix ships, whichever comes first.
Reporters are credited in release notes unless they ask otherwise.

## In scope

- Code under `packages/` — detectors, normalizer, meters, provider wrappers
- The demo API routes and the site under `apps/web` (alephonenull.com)
- Build, test, and release tooling in this repository

## Out of scope

- Detector false negatives or false positives on ordinary inputs. These are
  evaluation findings, not vulnerabilities; the
  [Evaluation Contract](https://alephonenull.com/docs/contract) states that Q
  is not a general harm score. File them as issues with a reproducible fixture.
- Behavior of third-party models reached through the wrappers.
- Volume-based denial of service against the public demo. Its rate limiting is
  per instance and documented as best effort.

## Safe harbor

Good-faith security research against this repository and the public site,
within the scope above, will not be met with legal action by the maintainer.
Do not access other users' data, degrade the service for others, or test
infrastructure that is not ours.

## Model behavior findings

Findings about an AI provider's model — sycophantic reinforcement, harmful
validation, long-dialog guardrail degradation, jailbreaks — belong with that
provider, not with this project.

- **Anthropic:** model safety and jailbreak reports go to
  usersafety@anthropic.com; technical vulnerabilities go through the HackerOne
  form linked from the
  [Responsible Disclosure Policy](https://www.anthropic.com/responsible-disclosure-policy).
- **Other providers:** use the disclosure channel each provider publishes.

Redacted, reproducible fixtures derived from such findings are welcome in the
issue tracker after the provider has been notified.

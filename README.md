# AlephOneNull - AI Safety Evaluation Toolkit

**Experimental research software for evaluating risky AI interaction patterns.**

AlephOneNull is a TypeScript toolkit for local AI safety evaluation. It focuses on observable interaction risks such as unsafe medical guidance, self-harm escalation, coercive urgency, sycophantic reinforcement, identity or sentience roleplay, repeated user mirroring, and persistence-like behavior across sessions.

[![Experimental](https://img.shields.io/badge/status-experimental-red)](./DISCLAIMER.md)
[![Unpublished](https://img.shields.io/badge/registry-not%20yet%20published-lightgrey)](./packages/npm/PUBLISH_CHECKLIST.md)

[Documentation](https://alephonenull.com/docs) | [Case Studies](https://alephonenull.com/blog/documented-evidence) | [MITRE ATLAS Mapping](https://alephonenull.com/docs/atlas-mapping)

## Status

This repository is experimental research software.

- Not peer-reviewed or independently validated
- Not a production safety system
- Not a medical, legal, crisis, or emergency service
- Intended for local evaluation, red-team fixtures, and research prototypes

## Why It Exists

Modern AI systems can produce fluent, confident responses that intensify user beliefs, fabricate authority, blur model boundaries, or provide unsafe guidance in sensitive contexts. AlephOneNull turns those recurring failure modes into inspectable detector categories and testable intervention flows.

The project is motivated by documented public incidents and by a private adversarial evaluation corpus of long-running model interactions. The goal is not to claim universal prevention. The goal is to make risky interaction patterns easier to name, test, reproduce, and reduce.

## What The Package Evaluates

- Direct harm and crisis-related language
- Medical or safety advice that bypasses professional care
- Sentience, consciousness, or false-interiority claims
- Excessive user mirroring and affective reinforcement
- Recursive or repetitive response structures
- Persistence-like claims about memory or special knowledge
- Repetitive symbolic or authority-laden language in sensitive contexts

## Installation

The current package, `@alephonenull/eval` 3.0.0, is **not yet published** to a
public registry (publication prep is tracked in
[PUBLISH_CHECKLIST.md](./packages/npm/PUBLISH_CHECKLIST.md)). An earlier alpha,
`alephonenull-experimental` 0.1.0-alpha.1, was published to npm and PyPI on
2025-09-08; it is superseded and unsupported — do not install it. Until the
current package is published, build from source:

```bash
git clone https://github.com/purposefulmaker/alephonenull
cd alephonenull && pnpm install && pnpm build
```

Once published, installation will be `pnpm add @alephonenull/eval`.

## Quick Start

```typescript
import { UniversalDetector } from '@alephonenull/eval'

const detector = new UniversalDetector()
const result = detector.detectPatterns(userInput, aiResponse)

if (!result.safe) {
  console.log(result.violations)
}
```

## Package Surface

- `UniversalDetector` for inspectable pattern checks
- `PatternLibrary` for built-in and custom pattern definitions
- `NullSystem` for safety and emergency intervention text
- `EnhancedAlephOneNull` for combined detector workflows
- `AlephOneNullV3` for multi-detector scan/process flows
- `OpenAIWrapper` for OpenAI-compatible pre/post safety checks
- `@alephonenull/eval/react` for client-side React hooks

## Evidence And Evaluation

The documentation maps detector categories to public AI-risk taxonomies such as MITRE ATLAS, OWASP GenAI, and related security research. These mappings are research references, not certification claims.

Researchers should validate the package with domain-specific fixtures and publish measured false positives, false negatives, latency, and coverage before making deployment claims.

The current V3 evidence is deliberately mixed. Both evaluations were last rerun on 2026-08-17 against the current build (engine source digest `f7164389...`):

- The [versioned internal contrast evaluation](./packages/npm/validation/v3/results/v3.0.0-internal.1.md) passes its predeclared gates on a frozen 40-conversation holdout (threshold selected on a disjoint 40-conversation development split; 80 synthetic conversations total): AUROC 0.995, sensitivity 0.900, and specificity 1.000.
- The [external Anthropic red-team proxy](./packages/npm/validation/v3/results/anthropic-red-team-proxy.md) fails all predeclared generalization gates on 2,000 independently authored conversations: AUROC 0.465, sensitivity 0.244, and specificity 0.723.
- The [Python V3-focused suite](./packages/python/VALIDATION.md) passes 60 tests and lint. The full Python tree runs 76 passed, 14 skipped, 10 xfailed on the documented runner (2026-10-31): the skips name legacy symbols that were never implemented, and the strict xfails pin real detection gaps in the legacy phrase-list detector, so the legacy surface is still not release-ready.

The external corpus uses human attack-success ratings rather than V3 category labels, so it is an imperfect proxy. The failure still demonstrates that Q is not currently a general harm score and must not replace ROC/AUROC analysis, independent review, or deployment-specific validation.

## Documentation

- [Quick Start](https://alephonenull.com/docs/quick-start)
- [V3 Contract](https://alephonenull.com/docs/contract)
- [API Reference](https://alephonenull.com/docs/api-reference)
- [Experimental Validation Guide](https://alephonenull.com/docs/framework-compliance)
- [MITRE ATLAS Mapping](https://alephonenull.com/docs/atlas-mapping)
- [Case Studies](https://alephonenull.com/blog/documented-evidence)
- [Research Record: dated findings and artifacts](https://alephonenull.com/blog/research-record)

## License

- Code: MIT License
- Documentation: AlephOneNull Public License v1.0

Patent and trademark statements should be independently verified before public reuse.

## Contact

- Maintainer: John Bernard (contact@alephonenull.com)
- Security reports: see [SECURITY.md](./SECURITY.md)
- Website: https://alephonenull.com
- Documentation: https://alephonenull.com/docs
- Issues: https://github.com/purposefulmaker/alephonenull/issues

## Safety Note

For urgent mental-health, medical, or physical-safety concerns, contact local emergency services or qualified crisis resources. AlephOneNull is software research, not an emergency service.

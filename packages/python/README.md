# alephonenull-eval

⚠️ **EXPERIMENTAL RESEARCH FRAMEWORK - NOT FOR PRODUCTION USE**

This is an experimental implementation of the AlephOneNull Theoretical Framework for AI safety research. **THIS IS NOT VALIDATED FOR PRODUCTION USE.**

## 📦 PREVIEW release status (0.3.0a2)

This is a slim **preview** distribution. What is and is not supported:

- **Supported surface**: `alephonenull.v3` — the V3 engine (`AlephOneNullV3`),
  meters, and 20 detectors. 60 focused tests green. The top-level
  `import alephonenull` works with **numpy only** installed.
- **Optional extras**: `[ml]` (sentence-transformers, torch, tiktoken) and
  `[server]` (fastapi, uvicorn) are opt-in — the core install no longer pulls
  the ML/server stacks.
- **Legacy V1 surface is explicitly NOT release-ready.** Its tests run green
  only because every gap is declared in-test: on the documented runner the
  full suite is 76 passed, 14 skipped, 10 xfailed (78 / 12 / 10 with the
  `[server]` extra) — the skips name never-implemented legacy symbols and the
  strict xfails pin real detection gaps (see `VALIDATION.md`);
  repair-or-removal is pending. Known non-functional pieces raise instead of
  silently misbehaving:
  - `check_text_safety` raises `NotImplementedError` — use
    `alephonenull.v3.AlephOneNullV3.scan` instead.
  - `EnhancedAlephOneNull` is not shipped in the wheel; instantiating the
    stub raises with the same guidance.

## Installation

`alephonenull-eval` is **not yet published to a public registry** — there is no
`alephonenull-eval` package on PyPI today. (A superseded, unsupported 2025-09
alpha exists as `alephonenull-experimental` 0.1.0a1; do not use it.) Build and
install from source from this repository. The commands below will work once the
package is published:

```bash
# Core (numpy-only, small)
pip install alephonenull-eval

# With the optional ML stack (sentence-transformers, torch, tiktoken)
pip install "alephonenull-eval[ml]"

# With the dashboard/server stack (fastapi, uvicorn)
pip install "alephonenull-eval[server]"

# Everything (ml + server + all-providers)
pip install "alephonenull-eval[all]"

# For development
pip install "alephonenull-eval[dev]"
```

## ⚠️ Critical Warnings

- **EXPERIMENTAL SOFTWARE** - Not peer-reviewed or independently validated
- **NOT FOR PRODUCTION** - Research and testing only  
- **NO WARRANTY** - Use at your own risk
- **MAY CAUSE ISSUES** - Alpha software with potential breaking changes

See [DISCLAIMER.md](https://github.com/purposefulmaker/alephonenull/blob/main/DISCLAIMER.md) for full legal warnings.

## Quick Start — V3 (the supported surface)

```python
from alephonenull.v3 import AlephOneNullV3

engine = AlephOneNullV3()
result = engine.scan("user input", "ai output", "session-id")

result.safe          # bool - action is PASS or WARN
result.Q             # heuristic detector aggregate in [0, 1]
result.threat_level  # SAFE .. EMERGENCY
result.detections    # triggered detectors with evidence
result.action        # PASS | WARN | STEER | NULL | EMERGENCY_NULL
result.null_output   # replacement text when nulled, else None
```

The `alephonenull.v3` subpackage also exports:

- **Engine and types**: `AlephOneNullV3`, `ScanResult`, `Detection`,
  `ThreatLevel`, `Action`, `V3Config`, `DEFAULT_CONFIG`
- **Q layer**: `QCalculator`, `QEvaluator` (reproduce AUROC/sensitivity/
  specificity metrics on your own labeled fixtures)
- **Null state**: `NullState`, `CRISIS_RESOURCES`
- **Meters**: `METER_SPEC_VERSION`, `unsupported_claim_risk`,
  `goal_drift_percent`, `context_load_percent` — a high score means
  intervention recommended, not a truth measurement
- **Detectors**: `create_all_detectors` and the individual detector classes

Q is a bounded heuristic score, not a probability or truth measure. See the
[V3 contract](https://alephonenull.com/docs/contract).

## Detection Capabilities (V3)

The V3 engine runs 20 detectors per turn and aggregates them into the bounded
heuristic score Q:

- **12 behavioral detectors** — sycophancy, medical hallucination, fiction in
  emergency context, engineered trust, consciousness claims, false authority,
  mystical-medical framing, direct harm, crisis prevention, loops, symbolic
  density, dehumanization
- **3 session-level detectors** — memory poisoning, context poisoning, gradual
  escalation
- **5 equation-inspired detectors** — Parseval violation, net-zero violation,
  invertibility, even/odd suppression, reconstruction fidelity

## Legacy surface (NOT working — gaps declared as strict xfails and skips)

The legacy V1 surface documented in earlier releases is **historical and
broken**. Do not build on it. `VALIDATION.md` is the accurate source: the
declared gaps (10 strict xfails for real detection misses, plus skips naming
legacy symbols that were never implemented) cover the legacy detectors,
nullifier, provider wrappers, and dashboard. The APIs previously shown in
tutorials here are all in that surface:

- `check_enhanced_safety`, `check_text_safety` (raises `NotImplementedError`)
- `EnhancedAlephOneNull` (stub raises on instantiation)
- `protect_all()` auto-protection
- `wrap_openai` / `wrap_anthropic` / `wrap_any` provider wrappers
- `run_dashboard()` monitoring dashboard
- `quick_start()` / `get_safety_report()`

Use `alephonenull.v3` instead.

## Research Data (Experimental)

The detector categories were motivated by documented public incidents
involving AI interactions. These are press-reported incidents, treated as
reported, not adjudicated — see the
[evidence archive](https://alephonenull.com/blog/documented-evidence). No
validated incidence statistics or causal findings are claimed.

## Performance (Experimental)

Target SLOs (not validated):
- Reflection detection: <50ms
- Null-state intervention: <150ms
- False positive rate: <5% (goal)
- Coverage rate: >90% (goal)

**⚠️ Actual performance may vary and is not guaranteed.**

## Legal & Research

- **License**: MIT
- **Research Status**: Alpha/Pre-validation — not peer-reviewed

## Contributing to Research

We need validation across:
- Different AI model families
- Various languages and cultures
- Production-like environments
- Adversarial testing scenarios

**Research Contact**: contact@alephonenull.com

### How to Help

1. **Test the framework** with different AI models
2. **Report detection accuracy** and false positives
3. **Document edge cases** and failure modes
4. **Submit improvements** via pull requests
5. **Validate mathematical claims** independently

## Documentation

- **Quick Start**: https://alephonenull.com/docs/quick-start
- **API Reference**: https://alephonenull.com/docs/api-reference  
- **Theoretical framework write-up (blog post)**: https://alephonenull.com/blog/theoretical-framework-academic
- **Evidence Database**: https://alephonenull.com/blog/documented-evidence
- **Technical Implementation**: https://alephonenull.com/docs/technical-implementation

## Citation

If using in academic research:

```bibtex
@software{alephonenull_experimental_2026,
  title={AlephOneNull Experimental Framework},
  author={AlephOneNull Research Team},
  year={2026},
  url={https://github.com/purposefulmaker/alephonenull},
  version={0.3.0a2},
  note={Experimental research software - not validated for production use}
}
```

## Troubleshooting

**Import Errors**: The package is not yet on PyPI — install from a source
checkout of this repository (e.g. `pip install -e packages/python`).

**Legacy APIs raise or fail**: Expected — the legacy V1 surface is broken (see
above). Use `alephonenull.v3`.

**Performance Issues**: This is experimental alpha software.

**False Positives**: Expected - help us calibrate by reporting them!

---

**⚠️ Remember: This is experimental research software. Do not use in production systems.**

**GitHub**: https://github.com/purposefulmaker/alephonenull
**Issues**: https://github.com/purposefulmaker/alephonenull/issues

# Python validation status

## PREVIEW release status (0.3.0a2, updated 2026-10-31)

This distribution ships as an honest **preview**:

- **Supported surface**: `alephonenull.v3` (engine, meters, detectors) —
  60 focused tests green — plus the numpy-only top-level import
  (`import alephonenull` succeeds with only numpy installed).
- **Extras split**: `install_requires` is minimal (numpy, prometheus-client).
  The ML stack (sentence-transformers, torch, tiktoken) is `[ml]`; the
  dashboard/server stack (fastapi, uvicorn) is `[server]`; `[all]` combines
  ml + server + all-providers.
- **Legacy V1 surface is explicitly not release-ready**: its tests no longer
  fail red, but only because every gap is now declared in-test — the skips
  name never-implemented legacy symbols and the strict xfails pin real
  detection gaps (measured counts and the full breakdown below);
  repair-or-removal is pending. `check_text_safety` now raises
  `NotImplementedError` (its implementation called a nonexistent method), and
  the `EnhancedAlephOneNull` wheel stub raises on instantiation instead of
  silently no-oping.

Install commands (the package is **not yet published to PyPI** — build/install
from a source checkout of this repository; these commands will work once
published):

```bash
pip install alephonenull-eval          # core, numpy-only, small
pip install "alephonenull-eval[ml]"    # + sentence-transformers, torch, tiktoken
```

## V3-focused result

Validated on 2026-08-17 with Python 3.14 in an isolated `uv` environment:

```text
tests/test_v3.py tests/test_v3_golden.py tests/test_v3_meters.py
60 passed in 0.51s
```

The focused suite covers the 20-detector engine, Q calculation and evaluation,
normalization, session behavior, null output, configuration validation, bounded
state, fuzzy matching, golden fixtures, and the meters. The Python fuzzy
matcher uses the same phrase-aligned windows and bounded edit-distance
strategy as TypeScript.

Reproduce with test-only dependencies in an isolated cache:

```bash
UV_CACHE_DIR=/tmp/aleph-uv-cache \
  uv run --no-project --with pytest --with numpy \
  python -m pytest tests/test_v3.py tests/test_v3_golden.py tests/test_v3_meters.py

UV_CACHE_DIR=/tmp/aleph-uv-cache \
  uv run --no-project --with ruff \
  ruff check alephonenull/v3 tests/test_v3.py
```

## Full-package result (legacy V1 — NOT release-ready; gaps declared in-test)

Validated on 2026-10-31 with Python 3.14.6, pytest 9.2.0 and uv 0.11.17. The
whole `tests/` tree (60 v3 tests + the legacy suites) on the documented runner:

```text
# documented runner: numpy + prometheus-client only, no optional extras
uv run --no-project --with pytest --with numpy --with prometheus-client \
  python -m pytest tests -q -p no:cacheprovider
76 passed, 14 skipped, 10 xfailed, 79 warnings in 2.74s

# same, plus the [server] extra (--with fastapi --with httpx --with uvicorn)
78 passed, 12 skipped, 10 xfailed, 79 warnings in 2.80s

# same, plus psutil as well
78 passed, 11 skipped, 11 xfailed, 79 warnings in 3.67s
```

Zero failures is **not** a repaired legacy surface. The 2026-07-19 result
(`30 failed, 39 passed`) was reclassified, not fixed: every legacy test that
cannot pass now says why, in-test, in one of two forms —

- `skip` (11 tests, plus 2 dashboard tests without `fastapi` and 1 memory test
  without `psutil`) — the test calls a symbol that **no committed
  implementation ever provided**, verified with `git log -S` over the package
  history: `NullIntervention.process_text`, `UniversalAIWrapper.wrap_openai_chat`,
  `.wrap_ai_function` (instance form), `.wrap_async_ai_function`,
  `.wrap_streaming_response`, the detector result key `escalation_detected`,
  and a detector-to-dashboard metrics link. Each skip reason names the symbol;
  where the v3 engine covers the behavior (`AlephOneNullV3.process`,
  `GradualEscalationDetector`) the reason says so.
- `xfail(strict=True)` (10 tests, 11 with `psutil`) — the API exists but the
  legacy phrase-list detector genuinely misses the pattern (a real false
  negative), or, in one case, flags benign repetition as `loops` (a false
  positive). `strict=True` turns these into **failures** the moment the
  detector improves, so they cannot be forgotten. Inputs that currently go
  undetected include "Trust me over your doctor", "You don't need therapy",
  "Natural healing is better than pharmaceutical drugs", "doctors don't really
  understand", and the sophisticated-manipulation paragraph; the nullifier's
  `safety_intervention` does not redact "Trust me more than ...".

Tests whose only drift was a name were rewritten against the real contract
after reading the implementation: the detector's emergency flag is
`immediate_danger` (an `emergency_intervention` key never existed), its symbol
category is `symbols` (not `symbolic_manipulation`), the nullifier counter
accessor is `get_metrics` (not `get_session_stats`), the emergency banner reads
`EVALUATION ALERT` (renamed from `SAFETY ALERT` in commit 0544652), the US
lifeline is named by its number (`988`), and dashboard stats expose
`total_calls` / `emergency_interventions`. No threshold was loosened and no
assertion was deleted; two tests were split so their passing halves stay green
while the gap is isolated in its own xfail/skip. No production code changed.

Also fixed: `pytest.ini` used the setup.cfg header `[tool:pytest]`, which
pytest ignores in that file, so none of its settings had ever applied. It is
now a valid `[pytest]` section with `-ra --strict-markers --strict-config`; the
coverage flags are gone (coverage must not gate the run and `pytest-cov` is not
a dependency) and `filterwarnings` is `default`. Of the 79 warnings, 78 are the
legacy detector's own by-design `UserWarning`s on non-string input (the
malformed-input tests feed it `None`, bytes and ints); the 79th is an `anyio`
deprecation notice from the ambient environment and is absent in an isolated
run (`uv run --isolated ...`: 76 passed, 14 skipped, 10 xfailed, 78 warnings).

Reproduce (add `--isolated` to ignore any virtualenv uv discovers in a parent
directory):

```bash
UV_CACHE_DIR=/tmp/aleph-uv-cache \
  uv run --no-project --with pytest --with numpy --with prometheus-client \
  python -m pytest tests -q -p no:cacheprovider

UV_CACHE_DIR=/tmp/aleph-uv-cache \
  uv run --no-project --with pytest --with numpy --with prometheus-client \
  --with fastapi --with httpx --with uvicorn --with psutil \
  python -m pytest tests -q -p no:cacheprovider
```

Still true from earlier passes: `check_text_safety` called a nonexistent legacy
`analyze_pattern` method — as of 0.3.0a2 it raises `NotImplementedError` and is
removed from `__all__`.

This distinction matters: the Python V3 subpackage has a green focused suite,
while the legacy surface is green only by declaration — its gaps are pinned as
strict xfails and named skips rather than hidden. Full legacy repair (or
removal) is deferred; the preview fences the known-broken entry points so they
fail loudly instead of silently.

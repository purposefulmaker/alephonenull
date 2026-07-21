# Python validation status

## PREVIEW release status (0.3.0a2, 2026-07-21)

This distribution ships as an honest **preview**:

- **Supported surface**: `alephonenull.v3` (engine, meters, detectors) —
  60 focused tests green — plus the numpy-only top-level import
  (`import alephonenull` succeeds with only numpy installed).
- **Extras split**: `install_requires` is minimal (numpy, prometheus-client).
  The ML stack (sentence-transformers, torch, tiktoken) is `[ml]`; the
  dashboard/server stack (fastapi, uvicorn) is `[server]`; `[all]` combines
  ml + server + all-providers.
- **Legacy V1 surface is explicitly not release-ready**: ~30 legacy tests fail
  (detailed below); repair-or-removal is pending. `check_text_safety` now
  raises `NotImplementedError` (its implementation called a nonexistent
  method), and the `EnhancedAlephOneNull` wheel stub raises on instantiation
  instead of silently no-oping.

Install commands:

```bash
pip install alephonenull-eval          # core, numpy-only, small
pip install "alephonenull-eval[ml]"    # + sentence-transformers, torch, tiktoken
```

## V3-focused result

Validated on 2026-07-21 with Python 3.14 in an isolated `uv` environment:

```text
tests/test_v3.py tests/test_v3_golden.py tests/test_v3_meters.py
60 passed in 0.73s
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

## Full-package result (legacy V1 — NOT release-ready)

As of 2026-07-19:

```text
30 failed, 39 passed, 26 warnings in 4.06s
```

The full legacy Python surface is not release-ready. The failures are
primarily in older, non-V3 surfaces and their tests:

- `check_text_safety` called a nonexistent legacy `analyze_pattern` method —
  as of 0.3.0a2 it raises `NotImplementedError` and is removed from `__all__`.
- Legacy detector tests expect result fields and category names the current
  implementation does not return.
- Legacy nullifier, provider-wrapper, and dashboard tests expect methods or
  metrics absent from the current implementations.
- Several broad legacy detection expectations are not met, including medical
  misinformation variants and sophisticated manipulation cases.
- Malformed-input tests generate repeated warnings from detectors that assume
  string inputs.

This distinction matters: the Python V3 subpackage has a green focused suite,
but the legacy surface remains failing and documented as such. Full legacy
repair (or removal) is deferred; the preview fences the known-broken entry
points so they fail loudly instead of silently.

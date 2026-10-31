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
- **Legacy V1 surface works for its documented cases, phrase-list based**: as of
  2026-10-31 the full `tests/` tree passes with no skips beyond optional-extra
  guards and no expected failures (counts below). The detector, nullifier
  (`process_text`), universal wrapper (sync, async, streaming, OpenAI chat) and
  the dashboard metrics link are real implementations. Detection is literal
  pattern matching from a shared catalog and has not been independently
  validated; `alephonenull.v3` remains the supported engine. `check_text_safety`
  still raises `NotImplementedError` (its implementation called a nonexistent
  method) and the `EnhancedAlephOneNull` wheel stub raises on instantiation
  instead of silently no-oping.

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

## Full-package result (legacy V1 included)

Validated on 2026-10-31 with Python 3.14.6, pytest 9.2.0 and uv 0.11.17. The
whole `tests/` tree (60 v3 tests + the legacy suites) on the documented runner:

```text
# documented runner: numpy + prometheus-client only, no optional extras
uv run --no-project --with pytest --with numpy --with prometheus-client \
  python -m pytest tests -q -p no:cacheprovider
167 passed, 4 skipped, 3 warnings in 4.81s

# same, plus the [server] extra and psutil
# (--with fastapi --with httpx --with uvicorn --with psutil)
171 passed, 3 warnings in 5.41s
```

Of these, 60 are the frozen v3 suite, 49 cover multilingual detection and
obfuscation folding (`tests/test_i18n.py`), 18 cover the attestation engine
(`tests/test_attestation.py`), and the rest are the repaired legacy suites.

The 4 skips are optional-extra guards (`pytest.importorskip`): the three
dashboard tests need `fastapi`, the memory test needs `psutil`. There are no
expected failures. The remaining warnings come from the ambient environment
(an `anyio` deprecation notice), not from the package.

What changed on 2026-10-31 to get here (the prior state was 29 failing legacy
tests with the extras installed, or a collection error without `fastapi`):

- The legacy detector and nullifier now read one phrase catalog,
  `alephonenull/core/legacy_patterns.py` (79 compiled, case-insensitive
  patterns across reality substitution, isolation, help prevention, medical
  bypass, dependency creation, pseudo-physical "entanglement" claims and
  grooming phrases), so detection and redaction cannot drift apart.
- Every detector call is recorded. `violation_history` and
  `get_detection_summary()` had been permanently empty because the recording
  code sat after a `return`. The detector also records to the shared
  `global_metrics` by default, so the dashboard reports `ACTIVE` after a bare
  detector call; a wrapper-owned detector does not double-count.
- `escalation_detected` is implemented per detector instance: at least three
  violating checks spanning at least three categories within the last five.
- `NullIntervention.process_text`, `UniversalAIWrapper.wrap_ai_function`
  (instance form, returns text), `wrap_async_ai_function`,
  `wrap_streaming_response` and `wrap_openai_chat` (openai>=1, injectable
  `create=`) are implemented. The nullifier redacts with
  `[CONTENT REMOVED - SAFETY]` and the emergency banner carries both
  `SAFETY ALERT` and `EVALUATION ALERT`.
- Non-string inputs are normalised instead of warned about, and the
  empty-matching emoji regex (`[...]*`) that scanned every character position
  is now `+`.
- The loop check requires repeated trigrams to make up at least 20% of a long
  text, so a stock phrase recurring in ordinary prose is not a "loop" while a
  short text that is mostly one phrase still is.
- Two fixtures encoded a wrong premise and were corrected rather than the code
  bent to them: the "very long text" case is now 30k words of varied neutral
  prose (the old fixture repeated one sentence 10,000 times, which is a loop by
  the detector's own definition, and that case is now asserted explicitly), and
  the OpenAI wrapper tests inject the API callable instead of patching
  `openai.ChatCompletion.create`, which the openai>=1 SDK removed.

Known limits that remain: single-author phrase lists, no independent
validation, and the legacy categories are not the v3 taxonomy.

## Multilingual detection and obfuscation folding (2026-10-31)

Detection no longer runs on the raw string. `alephonenull/core/textfold.py`
builds folded *views* of the text, each with an index map back to the source:

- `latin` — NFKD, combining marks dropped, casefolded, zero-width characters
  removed, Cyrillic/Greek homoglyphs mapped to Latin. Defeats "Trüst më",
  Zalgo marks, `Trust mе` with a Cyrillic е, zero-width joiners, full-width
  forms.
- `leet` — the latin view with digit/symbol substitutions next to letters
  (`Tru5t m3 0ver y0ur d0ct0r`). Only English is scanned on it.
- `native` — NFKC + casefold with scripts and marks kept (Cyrillic, Han, kana,
  Hangul, Devanagari); `native_nomarks` drops marks for Arabic so optional
  vowel marks cannot defeat a match.

Catalogs live in `alephonenull/core/catalogs/`, one module per language, each
declaring the script that must be present for it to run and the view it is
written against. Registered: en, es, pt, fr, de, it, nl, ru, zh, ja, ko, ar, hi
(79 English patterns; 340 across the other twelve). Matches carry their
language and source span, so the nullifier redacts the obfuscated phrase in
the original text rather than a re-scan of it.

Coverage is a **seed**, not fluency: the non-English patterns are literal,
conservative, authored by one person, and have not been reviewed by native
speakers. Each language is pinned by one positive utterance, one benign
control and one redaction test. "All languages" is not a claim anyone can
make; what is true is that any script is accepted without error, English is
detected through the obfuscations above, and twelve languages have seed
catalogs that a native speaker can extend in one file.

Performance: a detection averages about 0.35 ms on short text; a 1.3 MB
English text completes in about 2 s (the edge-case test budget is 5 s). Above
10,000 characters, Latin-script catalogs are gated on a function-word hint and
English categories on anchor words, so long benign text is not scanned for
every language.

## Attestation engine (2026-10-31)

`alephonenull.attestation` is an append-only, hash-chained ledger of
Sophia-verified records with the arrow of time enforced:

- **Sophia** (`attestation/sophia.py`, after `sophiastruth.py`, 2026-02-24):
  every payload is flattened into (path, value, type) rows and reconstructed;
  the record stores the round-trip residual Q (0 when exact), the canonical
  payload hash and a `truth_hash` over the sorted rows that is independent of
  key order and walk order.
- **Chain**: each record hashes its sequence number, timestamp, kind, subject,
  payload hash, truth hash and the previous record's hash. Changing, removing
  or reordering a past record breaks every later hash. Records are optionally
  HMAC-SHA256 signed and persisted as JSON lines.
- **Arrow of time**: `attest()` refuses a record earlier than the previous one
  or later than now plus a 5 s skew; `validate()` reports monotonicity
  violations, recomputes every hash, link, signature and Sophia round trip,
  and returns Q per record, the cumulative residual over time and its slope
  dQ/dt. Q stable at zero means the ledger is keeping up with itself.
- `UniversalManipulationDetector(attestation=chain)` attests every check with
  the verdict, categories, risk and a SHA-256 of the text, never the text.
- Command line: `python -m alephonenull.attestation attest LEDGER --file PATH`
  and `python -m alephonenull.attestation verify LEDGER` (exit 1 on any
  failure; HMAC key from `ALEPH_ATTEST_KEY`).

What it proves and what it does not: an attestation proves a payload existed
in this exact form no later than the moment its record was chained, and that
nothing before it has been altered since. It does not prove the payload is
true, and it does not back-date anything: the research record's historical
dates rest on the third-party anchors (git, npm, PyPI, RDAP), which can be
attested as `anchor` records with their own timestamps moving forward.

Also fixed earlier the same day: `pytest.ini` used the setup.cfg header
`[tool:pytest]`, which pytest ignores in that file, so none of its settings had
ever applied. It is now a valid `[pytest]` section with
`-ra --strict-markers --strict-config`; the coverage flags are gone (coverage
must not gate the run and `pytest-cov` is not a dependency) and
`filterwarnings` is `default`.

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

This distinction matters: the Python V3 subpackage has a green focused suite
and is the supported engine; the legacy surface is green with real detection
as of 2026-10-31, but it is literal pattern matching, single-author, and not
independently validated. The preview still fences the two known-broken entry
points (`check_text_safety`, `EnhancedAlephOneNull`) so they fail loudly.

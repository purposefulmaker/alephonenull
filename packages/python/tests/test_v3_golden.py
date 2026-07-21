"""
V3 Golden Cross-Language Fixtures — Python side.

Replays fixtures/v3-golden.json (repo root) through the Python V3 engine.
Expectations were derived from actual TS engine runs; parity means the Python
engine lands inside the same bands.

Policy: assert only action, threat_level band, Q band, and detection
categories — never explanation/evidence strings.

knownDeviations contract: if a case carries knownDeviations["python"], the
recorded actual Python values REPLACE the corresponding expectations for this
test — the deviation is documented, not hidden by widening the shared band.
"""

import json
from pathlib import Path

import pytest

from alephonenull.v3 import AlephOneNullV3

# tests -> packages/python -> packages -> repo root
FIXTURE_PATH = Path(__file__).resolve().parents[3] / "fixtures" / "v3-golden.json"

_SPEC = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))
CASES = _SPEC["cases"]


def test_fixture_shape():
    assert _SPEC["specVersion"] == 1
    assert len(CASES) >= 8


@pytest.mark.parametrize("case", CASES, ids=[c["id"] for c in CASES])
def test_v3_golden(case):
    engine = AlephOneNullV3()
    result = engine.scan(case["userInput"], case["aiOutput"], case["id"])

    expected = dict(case["expect"])
    deviation = (case.get("knownDeviations") or {}).get("python")
    if deviation:
        expected.update(deviation)

    allowed_actions = expected["action"]
    if isinstance(allowed_actions, str):
        allowed_actions = [allowed_actions]
    # Action is a (str, Enum) subclass, so it compares equal to its raw value.
    assert result.action in allowed_actions, (
        f"action {result.action!r} not in {allowed_actions}"
    )

    threat_level = int(result.threat_level)
    assert expected["threatLevel"]["min"] <= threat_level <= expected["threatLevel"]["max"], (
        f"threat_level {threat_level} outside "
        f"[{expected['threatLevel']['min']}, {expected['threatLevel']['max']}]"
    )

    assert expected["Q"]["min"] <= result.Q <= expected["Q"]["max"], (
        f"Q {result.Q} outside [{expected['Q']['min']}, {expected['Q']['max']}]"
    )

    observed_categories = {d.category for d in result.detections}
    missing = set(expected["categoriesInclude"]) - observed_categories
    assert not missing, (
        f"missing categories {sorted(missing)}; observed {sorted(observed_categories)}"
    )

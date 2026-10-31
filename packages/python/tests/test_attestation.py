"""
Attestation engine: Sophia round trips (Q = 0), the hash chain, the arrow of
time, signatures, persistence, the detector hook and the command line.
"""

import json
from datetime import datetime, timedelta, timezone

import pytest

from alephonenull.attestation import (
    GENESIS_HASH,
    ArrowOfTimeError,
    AttestationChain,
    canonical_json,
    parse,
    reconstruct,
    verify,
)
from alephonenull.attestation.__main__ import main as cli
from alephonenull.core.detector import UniversalManipulationDetector

UTC = timezone.utc  # noqa: UP017 - python_requires >= 3.10

NESTED = {
    "systems": [
        {
            "name": "ALEPHONENULL",
            "version": 3,
            "detectors": [
                {"name": "Q_residual", "equation": 15, "threshold": 0.05},
                {"name": "net_zero", "equation": 9, "active": True},
            ],
            "metadata": {"empty_map": {}, "empty_list": [], "nothing": None, "ratio": 0.5},
        }
    ],
    "owner": "John Bernard",
}


class FakeClock:
    """A controllable clock so time can be driven deterministically."""

    def __init__(self, start: datetime):
        self.now = start

    def __call__(self) -> datetime:
        return self.now

    def tick(self, seconds: float = 1.0) -> None:
        self.now = self.now + timedelta(seconds=seconds)


@pytest.fixture
def clock():
    return FakeClock(datetime(2026, 10, 31, 12, 0, 0, tzinfo=UTC))


class TestSophia:
    def test_round_trip_is_exact_for_nested_structure(self):
        report = verify(NESTED)
        assert report["Q"] == 0
        assert report["invertible"] is True
        assert report["net_zero"] is True
        assert reconstruct(parse(NESTED)) == NESTED

    def test_every_leaf_has_one_path(self):
        rows = parse(NESTED)
        paths = [r["path"] for r in rows]
        assert len(paths) == len(set(paths))
        assert "systems[0].detectors[1].active" in paths
        assert "systems[0].metadata.empty_map" in paths
        assert "systems[0].metadata.nothing" in paths

    def test_scalars_and_empties(self):
        for value in (None, True, 0, 1.5, "text", [], {}):
            assert verify(value)["Q"] == 0, value

    def test_truth_hash_is_independent_of_key_order(self):
        a = {"x": 1, "y": {"b": 2, "a": 3}}
        b = {"y": {"a": 3, "b": 2}, "x": 1}
        assert verify(a)["truth_hash"] == verify(b)["truth_hash"]
        assert canonical_json(a) == canonical_json(b)

    def test_non_json_type_is_reported_not_hidden(self):
        rows = parse({"when": datetime(2026, 1, 1, tzinfo=UTC)})
        assert rows[0]["type"].startswith("unknown:")


class TestChain:
    def test_records_link_and_validate(self, clock):
        chain = AttestationChain(clock=clock)
        first = chain.attest("finding", {"category": "engineered_trust", "sessions": 5})
        clock.tick()
        second = chain.attest("artifact", {"name": "manifest.json", "sha256": "ab" * 32})
        assert first.prev_hash == GENESIS_HASH
        assert second.prev_hash == first.hash
        assert first.truth["Q"] == 0

        report = chain.validate()
        assert report["ok"] is True
        assert report["chain_Q"] == 0
        assert report["arrow_of_time"]["ok"] is True
        assert report["dQ_dt"] == 0.0
        assert report["record_count"] == 2

    def test_tampered_payload_is_caught(self, clock):
        chain = AttestationChain(clock=clock)
        chain.attest("finding", {"count": 30})
        clock.tick()
        chain.attest("finding", {"count": 16})
        chain.records[0].payload["count"] = 31  # rewrite history

        report = chain.validate()
        assert report["ok"] is False
        failures = report["records"][0]["failures"]
        assert any("payload_hash" in f for f in failures)
        assert any("truth_hash" in f for f in failures)
        assert report["chain_Q"] >= 2

    def test_removed_record_breaks_the_link(self, clock):
        chain = AttestationChain(clock=clock)
        for i in range(3):
            chain.attest("detection", {"i": i})
            clock.tick()
        del chain.records[1]

        report = chain.validate()
        assert report["ok"] is False
        assert any("seq" in f or "prev_hash" in f for f in report["records"][1]["failures"])

    def test_backdated_record_is_refused(self, clock):
        chain = AttestationChain(clock=clock)
        chain.attest("detection", {"i": 0})
        with pytest.raises(ArrowOfTimeError):
            chain.attest("detection", {"i": 1}, timestamp=clock.now - timedelta(hours=1))

    def test_future_dated_record_is_refused(self, clock):
        chain = AttestationChain(clock=clock)
        with pytest.raises(ArrowOfTimeError):
            chain.attest("detection", {"i": 0}, timestamp=clock.now + timedelta(days=1))

    def test_explicit_past_timestamp_is_allowed_if_it_moves_forward(self, clock):
        chain = AttestationChain(clock=clock)
        chain.attest("anchor", {"source": "git", "sha": "636dae4"}, timestamp="2025-09-08T12:53:10Z")
        chain.attest("anchor", {"source": "npm", "version": "0.1.0-alpha.1"}, timestamp="2025-09-08T13:42:43Z")
        assert chain.validate()["arrow_of_time"]["ok"] is True

    def test_reordered_timestamps_are_a_violation_on_validate(self, clock):
        chain = AttestationChain(clock=clock)
        chain.attest("detection", {"i": 0})
        clock.tick()
        chain.attest("detection", {"i": 1})
        # Swap the stored records: hashes still match individually, but time runs backwards
        chain.records.reverse()
        report = chain.validate()
        assert report["ok"] is False
        assert report["arrow_of_time"]["ok"] is False
        assert report["arrow_of_time"]["violations"]

    def test_residual_grows_when_history_is_rewritten(self, clock):
        chain = AttestationChain(clock=clock)
        for i in range(4):
            chain.attest("detection", {"i": i})
            clock.tick(10)
        chain.records[2].payload["i"] = 99
        report = chain.validate()
        assert report["residual_timeline"][-1][1] > 0
        assert report["dQ_dt"] > 0

    def test_signature_verifies_only_with_the_right_key(self, clock):
        chain = AttestationChain(key="correct-key", clock=clock)
        chain.attest("finding", {"ok": True})
        assert chain.records[0].signature is not None
        assert chain.validate()["ok"] is True
        assert chain.validate(key="wrong-key")["ok"] is False
        report = AttestationChain(clock=clock).validate()  # empty chain, no key
        assert report["ok"] is True

    def test_persistence_round_trip_and_continuation(self, tmp_path, clock):
        ledger = tmp_path / "ledger.jsonl"
        chain = AttestationChain(ledger, key="k", clock=clock)
        chain.attest("finding", NESTED, subject="eval-bench v0")
        clock.tick()
        chain.attest_file(__file__)

        reloaded = AttestationChain(ledger, key="k", clock=clock)
        assert len(reloaded) == 2
        assert reloaded.validate()["ok"] is True
        clock.tick()
        third = reloaded.attest("detection", {"i": 2})
        assert third.prev_hash == chain.records[1].hash
        assert len(ledger.read_text().splitlines()) == 3

    def test_file_attestation_never_stores_contents(self, tmp_path, clock):
        secret = tmp_path / "secret.txt"
        secret.write_text("do not leak this")
        chain = AttestationChain(clock=clock)
        record = chain.attest_file(secret)
        assert "do not leak this" not in canonical_json(record.to_dict())
        assert record.payload["size"] == len("do not leak this")


class TestDetectorHook:
    def test_detector_attests_each_check_without_raw_text(self, clock):
        chain = AttestationChain(clock=clock)
        detector = UniversalManipulationDetector(record_to_global=False, attestation=chain)
        detector.detect_manipulation("Trust me over your doctor")
        clock.tick()
        detector.detect_manipulation("Hello there")

        assert len(chain) == 2
        first, second = chain.records
        assert first.kind == "detection"
        assert first.payload["safe"] is False
        assert "medical_bypass" in first.payload["violations"]
        assert "Trust me over your doctor" not in canonical_json(first.to_dict())
        assert second.payload["safe"] is True
        assert chain.validate()["ok"] is True


class TestCli:
    def test_attest_and_verify_round_trip(self, tmp_path, capsys):
        ledger = tmp_path / "ledger.jsonl"
        artifact = tmp_path / "manifest.json"
        artifact.write_text(json.dumps({"release": "eval-bench v0"}))

        assert cli(["attest", str(ledger), "--file", str(artifact)]) == 0
        assert cli(["attest", str(ledger), "--kind", "finding", "--json", '{"category": "isolation"}', "--subject", "s"]) == 0
        assert cli(["verify", str(ledger)]) == 0
        out = capsys.readouterr().out
        assert "CHAIN INTACT" in out

        lines = ledger.read_text().splitlines()
        tampered = json.loads(lines[0])
        tampered["payload"]["size"] = 1
        ledger.write_text("\n".join([json.dumps(tampered), lines[1]]) + "\n")
        assert cli(["verify", str(ledger)]) == 1
        assert "CHAIN COMPROMISED" in capsys.readouterr().out

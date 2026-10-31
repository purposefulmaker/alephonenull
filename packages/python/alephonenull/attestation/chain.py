"""
The attestation engine: an append-only, hash-chained ledger of Sophia-verified
records with the arrow of time enforced.

Every record carries the Sophia round-trip report of its payload (Q must be
zero for the payload to count as preserved), the SHA-256 of the canonical
payload, the previous record's hash, and its own hash over all of that. The
chain is therefore one-directional: a past record cannot be changed, removed,
or reordered without every later hash failing to recompute. That irreversibility
is the arrow of time in the Bernard framework: the computational path erases
and cannot be undone, and here erasure is made detectable rather than silent.

Validation recomputes everything and reports the residual Q per record (the
number of checks that failed), the chain's cumulative Q over time, and its
slope dQ/dt. Q stable at zero means the ledger is keeping up with itself; Q
growing means it is being lost. The doctrine: you do not capture Q, you watch it.
"""

from __future__ import annotations

import hmac
import json
import os
from collections.abc import Callable
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from .sophia import canonical_json, sha256_hex, verify

__all__ = ["GENESIS_HASH", "ArrowOfTimeError", "Attestation", "AttestationChain"]

GENESIS_HASH = "0" * 64
_UTC = timezone.utc  # noqa: UP017 - python_requires >= 3.10


class ArrowOfTimeError(ValueError):
    """Raised when a record would run backwards in time or claim the future."""


def _now() -> datetime:
    return datetime.now(_UTC)


def _as_utc(value: datetime | str | None) -> datetime:
    if value is None:
        return _now()
    if isinstance(value, str):
        value = datetime.fromisoformat(value.replace("Z", "+00:00"))  # noqa: FURB162 - 3.10 cannot parse "Z"
    if value.tzinfo is None:
        value = value.replace(tzinfo=_UTC)
    return value.astimezone(_UTC)


def _iso(value: datetime) -> str:
    return value.isoformat(timespec="microseconds").replace("+00:00", "Z")


def _record_hash(seq: int, timestamp: str, kind: str, subject: str, payload_hash: str, truth_hash: str, prev_hash: str) -> str:
    body = {
        "seq": seq,
        "timestamp": timestamp,
        "kind": kind,
        "subject": subject,
        "payload_hash": payload_hash,
        "truth_hash": truth_hash,
        "prev_hash": prev_hash,
    }
    return sha256_hex(canonical_json(body))


def _sign(key: bytes, record_hash: str) -> str:
    return hmac.new(key, record_hash.encode("utf-8"), "sha256").hexdigest()


@dataclass(frozen=True)
class Attestation:
    seq: int
    timestamp: str
    kind: str
    subject: str
    payload: Any
    payload_hash: str
    truth: dict[str, Any]
    prev_hash: str
    hash: str
    signature: str | None = None

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> Attestation:
        return cls(
            seq=int(data["seq"]),
            timestamp=str(data["timestamp"]),
            kind=str(data["kind"]),
            subject=str(data.get("subject", "")),
            payload=data.get("payload"),
            payload_hash=str(data["payload_hash"]),
            truth=dict(data.get("truth", {})),
            prev_hash=str(data["prev_hash"]),
            hash=str(data["hash"]),
            signature=data.get("signature"),
        )

    def time(self) -> datetime:
        return _as_utc(self.timestamp)


class AttestationChain:
    """Append-only ledger. Optionally persisted as JSON lines and HMAC-signed."""

    def __init__(
        self,
        path: str | Path | None = None,
        *,
        key: bytes | str | None = None,
        clock: Callable[[], datetime] | None = None,
        max_future_skew: float = 5.0,
    ):
        self.path = Path(path) if path else None
        self.key = key.encode("utf-8") if isinstance(key, str) else key
        self.clock = clock or _now
        self.max_future_skew = max_future_skew
        self.records: list[Attestation] = []
        if self.path and self.path.exists():
            self._load()

    # ------------------------------------------------------------- properties

    @property
    def head_hash(self) -> str:
        return self.records[-1].hash if self.records else GENESIS_HASH

    @property
    def last(self) -> Attestation | None:
        return self.records[-1] if self.records else None

    def __len__(self) -> int:
        return len(self.records)

    # ------------------------------------------------------------------ write

    def attest(
        self,
        kind: str,
        payload: Any,
        *,
        subject: str = "",
        timestamp: datetime | str | None = None,
    ) -> Attestation:
        """
        Append one record. The timestamp defaults to now; a supplied timestamp
        may not precede the previous record (the arrow of time) and may not lie
        in the future beyond ``max_future_skew`` seconds.
        """
        now = _as_utc(self.clock())
        when = _as_utc(timestamp) if timestamp is not None else now

        if (when - now).total_seconds() > self.max_future_skew:
            raise ArrowOfTimeError(f"record is future-dated: {_iso(when)} is after now ({_iso(now)})")
        if self.last is not None and when < self.last.time():
            raise ArrowOfTimeError(
                f"record runs backwards: {_iso(when)} precedes record {self.last.seq} at {self.last.timestamp}"
            )

        truth = verify(payload)
        payload_hash = sha256_hex(canonical_json(payload))
        seq = len(self.records)
        stamp = _iso(when)
        record_hash = _record_hash(seq, stamp, kind, subject, payload_hash, truth["truth_hash"], self.head_hash)
        signature = _sign(self.key, record_hash) if self.key else None

        record = Attestation(
            seq=seq,
            timestamp=stamp,
            kind=kind,
            subject=subject,
            payload=payload,
            payload_hash=payload_hash,
            truth=truth,
            prev_hash=self.head_hash,
            hash=record_hash,
            signature=signature,
        )
        self.records.append(record)
        self._persist(record)
        return record

    def attest_file(self, file_path: str | Path, *, kind: str = "artifact", subject: str | None = None) -> Attestation:
        """Attest a file by content hash, size and name (never its contents)."""
        p = Path(file_path)
        digest = sha256_hex_bytes(p.read_bytes())
        payload = {"name": p.name, "sha256": digest, "size": p.stat().st_size}
        return self.attest(kind, payload, subject=subject if subject is not None else p.name)

    # --------------------------------------------------------------- validate

    def validate(self, *, key: bytes | str | None = None, now: datetime | None = None) -> dict[str, Any]:
        """
        Recompute every hash, link, signature and Sophia round trip; check the
        arrow of time. Returns the report rather than raising: Q is watched,
        not captured.
        """
        verify_key = key.encode("utf-8") if isinstance(key, str) else (key if key is not None else self.key)
        now_utc = _as_utc(now) if now is not None else _as_utc(self.clock())

        per_record: list[dict[str, Any]] = []
        arrow_violations: list[str] = []
        unverified_signatures = 0
        prev_hash = GENESIS_HASH
        prev_time: datetime | None = None
        first_time: datetime | None = None
        timeline: list[tuple[float, int]] = []
        cumulative_q = 0

        for expected_seq, record in enumerate(self.records):
            failures: list[str] = []

            if record.seq != expected_seq:
                failures.append(f"seq {record.seq} != {expected_seq}")
            if record.prev_hash != prev_hash:
                failures.append("prev_hash does not link to the previous record")

            recomputed_payload_hash = sha256_hex(canonical_json(record.payload))
            if recomputed_payload_hash != record.payload_hash:
                failures.append("payload changed: payload_hash does not recompute")

            truth = verify(record.payload)
            if truth["truth_hash"] != record.truth.get("truth_hash"):
                failures.append("payload changed: Sophia truth_hash does not recompute")
            if truth["Q"] != 0 or record.truth.get("Q", 1) != 0:
                failures.append("Q > 0: payload is not invertible")

            recomputed_hash = _record_hash(
                record.seq, record.timestamp, record.kind, record.subject,
                record.payload_hash, record.truth.get("truth_hash", ""), record.prev_hash,
            )
            if recomputed_hash != record.hash:
                failures.append("record hash does not recompute")

            if record.signature is not None:
                if verify_key is None:
                    unverified_signatures += 1
                elif not hmac.compare_digest(record.signature, _sign(verify_key, record.hash)):
                    failures.append("signature does not verify")
            elif verify_key is not None:
                failures.append("record is unsigned but a key was supplied")

            when = record.time()
            if prev_time is not None and when < prev_time:
                msg = f"record {record.seq} at {record.timestamp} precedes record {record.seq - 1}"
                failures.append("arrow of time: " + msg)
                arrow_violations.append(msg)
            if (when - now_utc).total_seconds() > self.max_future_skew:
                msg = f"record {record.seq} at {record.timestamp} is in the future"
                failures.append("arrow of time: " + msg)
                arrow_violations.append(msg)

            cumulative_q += len(failures)
            first_time = first_time or when
            timeline.append(((when - first_time).total_seconds(), cumulative_q))
            per_record.append({"seq": record.seq, "kind": record.kind, "Q": len(failures), "failures": failures})

            prev_hash = record.hash
            prev_time = when if prev_time is None or when >= prev_time else prev_time

        growth = _slope(timeline)
        ok = cumulative_q == 0
        return {
            "ok": ok,
            "record_count": len(self.records),
            "head_hash": self.head_hash,
            "chain_Q": cumulative_q,
            "dQ_dt": growth,
            "arrow_of_time": {"ok": not arrow_violations, "violations": arrow_violations},
            "unverified_signatures": unverified_signatures,
            "residual_timeline": timeline,
            "records": per_record,
            "verdict": (
                "CHAIN INTACT - Q = 0, arrow of time holds"
                if ok
                else f"CHAIN COMPROMISED - Q = {cumulative_q}, "
                + ("arrow of time violated" if arrow_violations else "arrow of time holds")
            ),
        }

    # ------------------------------------------------------------ persistence

    def _persist(self, record: Attestation) -> None:
        if not self.path:
            return
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("a", encoding="utf-8") as fh:
            fh.write(canonical_json(record.to_dict()) + "\n")
            fh.flush()
            os.fsync(fh.fileno())

    def _load(self) -> None:
        assert self.path is not None
        with self.path.open("r", encoding="utf-8") as fh:
            for line in fh:
                line = line.strip()
                if line:
                    self.records.append(Attestation.from_dict(json.loads(line)))

    def to_jsonl(self) -> str:
        return "".join(canonical_json(r.to_dict()) + "\n" for r in self.records)


def sha256_hex_bytes(data: bytes) -> str:
    import hashlib

    return hashlib.sha256(data).hexdigest()


def _slope(points: list[tuple[float, int]]) -> float:
    """Least-squares slope of cumulative Q against seconds since the first record."""
    if len(points) < 2:
        return 0.0
    n = len(points)
    mean_x = sum(p[0] for p in points) / n
    mean_y = sum(p[1] for p in points) / n
    var_x = sum((p[0] - mean_x) ** 2 for p in points)
    if var_x == 0:
        return 0.0
    return sum((p[0] - mean_x) * (p[1] - mean_y) for p in points) / var_x

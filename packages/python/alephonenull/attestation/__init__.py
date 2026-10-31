"""
Attestation engine: Sophia-verified, hash-chained, time-ordered records.

    from alephonenull.attestation import AttestationChain

    chain = AttestationChain("ledger.jsonl", key=os.environ.get("ALEPH_ATTEST_KEY"))
    chain.attest("finding", {"category": "engineered_trust", "session": "owl_s1_apr16"})
    chain.attest_file("capture/manifest.json")
    report = chain.validate()          # report["ok"], report["chain_Q"], report["arrow_of_time"]

Command line: ``python -m alephonenull.attestation verify ledger.jsonl``.
"""

from .chain import GENESIS_HASH, ArrowOfTimeError, Attestation, AttestationChain
from .sophia import canonical_json, flatten, parse, reconstruct, verify

__all__ = [
    "GENESIS_HASH",
    "ArrowOfTimeError",
    "Attestation",
    "AttestationChain",
    "canonical_json",
    "flatten",
    "parse",
    "reconstruct",
    "verify",
]

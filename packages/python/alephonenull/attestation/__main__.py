"""Command line for the attestation engine.

    python -m alephonenull.attestation attest LEDGER --kind artifact --file PATH [--subject NAME]
    python -m alephonenull.attestation attest LEDGER --kind finding --json '{"...": ...}' --subject NAME
    python -m alephonenull.attestation verify LEDGER [--json]

The HMAC key, if any, is read from the environment variable named by
``--key-env`` (default ``ALEPH_ATTEST_KEY``). Exit status is 0 when the chain
validates and 1 otherwise.
"""

from __future__ import annotations

import argparse
import json
import os
import sys

from .chain import AttestationChain


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m alephonenull.attestation")
    parser.add_argument("--key-env", default="ALEPH_ATTEST_KEY", help="environment variable holding the HMAC key")
    sub = parser.add_subparsers(dest="command", required=True)

    attest = sub.add_parser("attest", help="append one record to the ledger")
    attest.add_argument("ledger")
    attest.add_argument("--kind", default="artifact")
    attest.add_argument("--subject", default=None)
    source = attest.add_mutually_exclusive_group(required=True)
    source.add_argument("--file", help="attest a file by SHA-256, size and name")
    source.add_argument("--json", help="attest a JSON payload given inline")

    verify = sub.add_parser("verify", help="recompute and validate the whole ledger")
    verify.add_argument("ledger")
    verify.add_argument("--json", action="store_true", help="print the full report as JSON")

    args = parser.parse_args(argv)
    key = os.environ.get(args.key_env) or None
    chain = AttestationChain(args.ledger, key=key)

    if args.command == "attest":
        if args.file:
            record = chain.attest_file(args.file, kind=args.kind, subject=args.subject)
        else:
            payload = json.loads(args.json)
            record = chain.attest(args.kind, payload, subject=args.subject or "")
        print(f"attested seq={record.seq} kind={record.kind} subject={record.subject!r}")
        print(f"hash={record.hash}")
        print(f"truth: {record.truth['verdict']} (leaves={record.truth['leaf_count']})")
        return 0

    report = chain.validate()
    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(report["verdict"])
        print(f"records={report['record_count']} chain_Q={report['chain_Q']} dQ/dt={report['dQ_dt']:.6f} head={report['head_hash'][:16]}...")
        if report["unverified_signatures"]:
            print(f"signatures present but no key supplied: {report['unverified_signatures']} (set {args.key_env})")
        for entry in report["records"]:
            if entry["failures"]:
                print(f"  seq {entry['seq']}: " + "; ".join(entry["failures"]))
    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())

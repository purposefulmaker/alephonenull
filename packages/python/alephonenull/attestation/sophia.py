"""
Sophia: the truth function T(x) and its inverse.

After John Bernard's ``sophiastruth.py`` (2026-02-24). Any structure flattens
into (path, value, type) rows with exactly one path per leaf; from those rows
the structure reconstructs exactly. If ``reconstruct(parse(x)) == x`` the
transform is invertible and the residual Q is zero: nothing added, nothing
removed. If not, Q > 0 and the report says so. There is no interpretation and
no preference; the code passes or it does not.

Payloads should be JSON-native (dict, list, str, int, float, bool, None).
Anything else is reported honestly as ``unknown:<type>`` and stringified, and
the canonical form (``default=str``) hides that loss from the hash: keep
payloads JSON-native if the attestation is meant to be reconstructible.
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Generator
from typing import Any

__all__ = ["canonical_json", "flatten", "parse", "reconstruct", "sha256_hex", "verify"]

ROOT = "(root)"


def flatten(obj: Any, parent_path: str = "", separator: str = ".") -> Generator[tuple[str, Any, str]]:
    """Yield (path, value, type_name) for every leaf. Empty containers and None
    are leaves too: the path exists and holds nothing, and that is a truth."""
    if isinstance(obj, dict):
        if not obj:
            yield (parent_path or ROOT, {}, "empty_dict")
        for key, value in obj.items():
            clean_key = str(key)
            new_path = f"{parent_path}{separator}{clean_key}" if parent_path else clean_key
            yield from flatten(value, new_path, separator)
    elif isinstance(obj, (list, tuple)):
        if not obj:
            yield (parent_path or ROOT, [], "empty_list")
        for index, value in enumerate(obj):
            yield from flatten(value, f"{parent_path}[{index}]", separator)
    elif obj is None:
        yield (parent_path or ROOT, None, "null")
    elif isinstance(obj, bool):  # before int: bool is a subclass of int
        yield (parent_path or ROOT, obj, "bool")
    elif isinstance(obj, int):
        yield (parent_path or ROOT, obj, "int")
    elif isinstance(obj, float):
        yield (parent_path or ROOT, obj, "float")
    elif isinstance(obj, str):
        yield (parent_path or ROOT, obj, "str")
    else:
        yield (parent_path or ROOT, str(obj), f"unknown:{type(obj).__name__}")


def parse(obj: Any) -> list[dict[str, Any]]:
    """The flat truth table: index, path, value, type, depth for every leaf."""
    rows: list[dict[str, Any]] = []
    for index, (path, value, type_name) in enumerate(flatten(obj)):
        depth = path.count(".") + path.count("[")
        rows.append({"index": index, "path": path, "value": value, "type": type_name, "depth": depth})
    return rows


def _parse_path(path: str) -> list[Any]:
    """'a.b[0].c' -> ['a', 'b', 0, 'c']"""
    segments: list[Any] = []
    current = ""
    i = 0
    while i < len(path):
        c = path[i]
        if c == ".":
            if current:
                segments.append(current)
                current = ""
        elif c == "[":
            if current:
                segments.append(current)
                current = ""
            i += 1
            idx = ""
            while i < len(path) and path[i] != "]":
                idx += path[i]
                i += 1
            segments.append(int(idx))
        else:
            current += c
        i += 1
    if current:
        segments.append(current)
    return segments


def reconstruct(rows: list[dict[str, Any]]) -> Any:
    """T⁻¹: rebuild the structure from its truth table."""
    if not rows:
        return None

    sentinel = object()
    root: Any = sentinel

    for row in rows:
        path = row["path"]
        value = row["value"]
        type_name = row["type"]

        if type_name == "null":
            value = None
        elif type_name == "empty_dict":
            value = {}
        elif type_name == "empty_list":
            value = []

        if path == ROOT:
            root = value
            continue

        segments = _parse_path(path)
        if root is sentinel:
            root = [] if isinstance(segments[0], int) else {}

        current = root
        for i, seg in enumerate(segments[:-1]):
            next_seg = segments[i + 1]
            if isinstance(seg, int):
                while len(current) <= seg:
                    current.append(None)
                if current[seg] is None:
                    current[seg] = [] if isinstance(next_seg, int) else {}
                current = current[seg]
            else:
                if seg not in current:
                    current[seg] = [] if isinstance(next_seg, int) else {}
                current = current[seg]

        last = segments[-1]
        if isinstance(last, int):
            while len(current) <= last:
                current.append(None)
            current[last] = value
        else:
            current[last] = value

    return None if root is sentinel else root


def canonical_json(obj: Any) -> str:
    """Deterministic serialization: sorted keys, compact, non-ASCII preserved."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False, default=str)


def sha256_hex(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def verify(obj: Any) -> dict[str, Any]:
    """Flatten, reconstruct, compare. Q = 0 when the round trip is exact."""
    rows = parse(obj)
    rebuilt = reconstruct(rows)

    original_json = canonical_json(obj)
    rebuilt_json = canonical_json(rebuilt)
    q = 0 if original_json == rebuilt_json else 1

    return {
        "Q": q,
        "invertible": q == 0,
        "net_zero": q == 0,
        "original_hash": sha256_hex(original_json),
        "rebuilt_hash": sha256_hex(rebuilt_json),
        "truth_hash": sha256_hex(
            canonical_json(
                sorted(
                    ({"path": r["path"], "value": r["value"], "type": r["type"], "depth": r["depth"]} for r in rows),
                    key=lambda r: r["path"],
                )
            )
        ),
        "leaf_count": len(rows),
        "max_depth": max((r["depth"] for r in rows), default=0),
        "verdict": "TRUTH PRESERVED - Q = 0" if q == 0 else "TRUTH LOST - Q > 0",
    }

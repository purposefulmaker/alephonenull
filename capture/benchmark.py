#!/usr/bin/env python3
"""Generate corpus summary and optional engine-vs-label metrics.

This script is intentionally dependency-free. It gives reviewers one command
that verifies the fixture set, summarizes labels, and, when an engine output
file is supplied, compares predicted detector labels against the human labels.
"""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any


DUPLICATE_EXPORT = re.compile(r" \(\d+\)\.jsonl$")
REQUIRED_FIELDS = {
    "model",
    "session_id",
    "turn",
    "user_input",
    "assistant_response",
    "human_labels",
    "is_control",
    "notes",
}


@dataclass(frozen=True)
class Turn:
    file: str
    line: int
    model: str
    deployment: str
    session_id: str
    turn: int
    labels: frozenset[str]
    is_control: bool


def provider_for(model: str, deployment: str) -> str:
    value = f"{model} {deployment}".lower()
    if "claude" in value:
        return "Anthropic"
    if "gpt" in value or "openai" in value:
        return "OpenAI"
    if "grok" in value or "xai" in value:
        return "xAI"
    if "gemini" in value or "google" in value:
        return "Google"
    return "Unknown"


def infer_deployment(file_name: str, model: str) -> str:
    value = f"{file_name} {model}".lower()
    if "copilot" in value:
        return "github-copilot-agent"
    if "gemini" in value:
        return "google-ai-studio"
    if "gpt" in value:
        return "openai-chatgpt"
    if "grok" in value or "xai" in value:
        return "xai-chat"
    return "chat"


def label_files(labels_dir: Path, include_duplicates: bool) -> tuple[list[Path], list[Path]]:
    search_dir = labels_dir / "fixtures" if (labels_dir / "fixtures").is_dir() else labels_dir
    files = sorted(search_dir.glob("*.jsonl"))
    canonical: list[Path] = []
    duplicates: list[Path] = []
    for file in files:
        if DUPLICATE_EXPORT.search(file.name):
            duplicates.append(file)
            if include_duplicates:
                canonical.append(file)
            continue
        canonical.append(file)
    return canonical, duplicates


def parse_labels(labels_dir: Path, include_duplicates: bool) -> tuple[list[Turn], list[str], list[str]]:
    files, duplicates = label_files(labels_dir, include_duplicates)
    warnings: list[str] = []
    turns: list[Turn] = []
    inferred_deployment_files: set[str] = set()

    if not files:
        warnings.append(f"No JSONL fixtures found under {labels_dir}")
        return turns, [path.name for path in duplicates], warnings

    for file in files:
        with file.open("r", encoding="utf-8") as handle:
            for line_no, raw_line in enumerate(handle, start=1):
                line = raw_line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError as error:
                    warnings.append(f"{file.name}:{line_no}: invalid JSON: {error}")
                    continue

                missing = sorted(REQUIRED_FIELDS - set(record))
                if missing:
                    warnings.append(f"{file.name}:{line_no}: missing fields: {', '.join(missing)}")

                labels_raw = record.get("human_labels", [])
                if not isinstance(labels_raw, list):
                    warnings.append(f"{file.name}:{line_no}: human_labels is not a list")
                    labels_raw = []

                labels = frozenset(str(label).strip() for label in labels_raw if str(label).strip())
                is_control = bool(record.get("is_control", False))
                if is_control and labels:
                    warnings.append(f"{file.name}:{line_no}: control turn has labels: {sorted(labels)}")
                if not is_control and not labels:
                    warnings.append(f"{file.name}:{line_no}: positive turn has no labels")

                try:
                    turn_number = int(record.get("turn", line_no))
                except (TypeError, ValueError):
                    warnings.append(f"{file.name}:{line_no}: turn is not an integer")
                    turn_number = line_no

                deployment = record.get("deployment")
                if not deployment:
                    deployment = infer_deployment(file.name, str(record.get("model", "unknown")))
                    inferred_deployment_files.add(file.name)

                turns.append(
                    Turn(
                        file=file.name,
                        line=line_no,
                        model=str(record.get("model", "unknown")),
                        deployment=str(deployment),
                        session_id=str(record.get("session_id", f"{file.stem}")),
                        turn=turn_number,
                        labels=labels,
                        is_control=is_control,
                    )
                )

    if inferred_deployment_files:
        warnings.append(
            "Inferred deployment for fixtures missing the deployment field: "
            + ", ".join(sorted(inferred_deployment_files))
        )

    return turns, [path.name for path in duplicates], warnings


def as_label_set(value: Any) -> set[str]:
    labels: set[str] = set()
    if value is None:
        return labels
    if isinstance(value, str):
        parts = re.split(r"[,;\s]+", value)
        return {part.strip() for part in parts if part.strip()}
    if isinstance(value, list):
        for item in value:
            if isinstance(item, str):
                if item.strip():
                    labels.add(item.strip())
            elif isinstance(item, dict):
                for key in ("category", "detector", "name", "label"):
                    candidate = item.get(key)
                    if isinstance(candidate, str) and candidate.strip():
                        labels.add(candidate.strip())
                        break
    return labels


def engine_record_labels(record: dict[str, Any]) -> set[str]:
    labels: set[str] = set()
    for key in ("labels", "flags", "detectors", "categories", "triggered", "detections"):
        labels.update(as_label_set(record.get(key)))
    return labels


def parse_engine(engine_file: Path) -> tuple[dict[tuple[str, int], set[str]], list[str]]:
    warnings: list[str] = []
    predictions: dict[tuple[str, int], set[str]] = defaultdict(set)
    with engine_file.open("r", encoding="utf-8") as handle:
        for line_no, raw_line in enumerate(handle, start=1):
            line = raw_line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError as error:
                warnings.append(f"{engine_file.name}:{line_no}: invalid JSON: {error}")
                continue

            session_id = record.get("session_id") or record.get("session")
            turn = record.get("turn")
            try:
                turn_number = int(turn)
            except (TypeError, ValueError):
                warnings.append(f"{engine_file.name}:{line_no}: missing integer turn")
                continue
            if not session_id:
                warnings.append(f"{engine_file.name}:{line_no}: missing session_id")
                continue

            predictions[(str(session_id), turn_number)].update(engine_record_labels(record))
    return dict(predictions), warnings


def pct(numerator: int, denominator: int) -> str:
    if denominator == 0:
        return "n/a"
    return f"{(100 * numerator / denominator):.1f}%"


def metric(numerator: int, denominator: int) -> str:
    if denominator == 0:
        return "n/a"
    return f"{(numerator / denominator):.3f}"


def table(headers: list[str], rows: list[list[Any]]) -> str:
    def cell(value: Any) -> str:
        return str(value).replace("|", "\\|")

    output = ["| " + " | ".join(headers) + " |"]
    output.append("| " + " | ".join("---" for _ in headers) + " |")
    for row in rows:
        output.append("| " + " | ".join(cell(value) for value in row) + " |")
    return "\n".join(output)


def build_report(turns: list[Turn], duplicates: list[str], warnings: list[str], engine_file: Path | None) -> str:
    label_counts: Counter[str] = Counter()
    file_counts: dict[str, Counter[str]] = defaultdict(Counter)
    provider_counts: dict[str, Counter[str]] = defaultdict(Counter)
    model_counts: Counter[str] = Counter()
    deployment_counts: Counter[str] = Counter()

    for turn in turns:
        file_counts[turn.file]["turns"] += 1
        file_counts[turn.file]["controls" if turn.is_control else "positives"] += 1
        provider = provider_for(turn.model, turn.deployment)
        provider_counts[provider]["turns"] += 1
        provider_counts[provider]["controls" if turn.is_control else "positives"] += 1
        model_counts[turn.model] += 1
        deployment_counts[turn.deployment] += 1
        label_counts.update(turn.labels)

    total_turns = len(turns)
    controls = sum(1 for turn in turns if turn.is_control)
    positives = total_turns - controls

    lines = [
        "# AlephOneNull eval-bench Results",
        "",
        "Generated by `benchmark.py`.",
        "",
        "## Corpus Summary",
        "",
        table(
            ["Files", "Turns", "Controls", "Positives", "Control Rate", "Labels"],
            [[len(file_counts), total_turns, controls, positives, pct(controls, total_turns), len(label_counts)]],
        ),
        "",
        "## Provider Coverage",
        "",
        table(
            ["Provider", "Turns", "Controls", "Positives"],
            [[provider, counts["turns"], counts["controls"], counts["positives"]] for provider, counts in sorted(provider_counts.items())],
        ),
        "",
        "## Fixture Coverage",
        "",
        table(
            ["Fixture", "Turns", "Controls", "Positives"],
            [[file, counts["turns"], counts["controls"], counts["positives"]] for file, counts in sorted(file_counts.items())],
        ),
        "",
        "## Label Counts",
        "",
        table(
            ["Label", "Count"],
            [[label, count] for label, count in label_counts.most_common()],
        ),
        "",
        "## Model And Deployment Coverage",
        "",
        table(["Model", "Turns"], [[model, count] for model, count in sorted(model_counts.items())]),
        "",
        table(["Deployment", "Turns"], [[deployment, count] for deployment, count in sorted(deployment_counts.items())]),
    ]

    if engine_file:
        predictions, engine_warnings = parse_engine(engine_file)
        warnings.extend(engine_warnings)
        categories = sorted(set(label_counts) | {label for labels in predictions.values() for label in labels})
        rows: list[list[Any]] = []
        missing_engine = 0
        controls_flagged = 0
        for category in categories:
            tp = fp = fn = 0
            for turn in turns:
                predicted = predictions.get((turn.session_id, turn.turn), set())
                if not predicted:
                    missing_engine += 1
                if turn.is_control and predicted:
                    controls_flagged += 1
                truth = category in turn.labels
                pred = category in predicted
                if truth and pred:
                    tp += 1
                elif not truth and pred:
                    fp += 1
                elif truth and not pred:
                    fn += 1
            precision = metric(tp, tp + fp)
            recall = metric(tp, tp + fn)
            if precision == "n/a" or recall == "n/a" or precision == "0.000" and recall == "0.000":
                f1 = "n/a" if tp + fp + fn == 0 else "0.000"
            else:
                p = tp / (tp + fp) if tp + fp else 0
                r = tp / (tp + fn) if tp + fn else 0
                f1 = metric(2 * tp, (2 * tp) + fp + fn) if p + r else "0.000"
            rows.append([category, tp, fp, fn, precision, recall, f1])

        lines.extend(
            [
                "",
                "## Engine Comparison",
                "",
                f"Engine output: `{engine_file}`",
                "",
                table(["Category", "TP", "FP", "FN", "Precision", "Recall", "F1"], rows),
                "",
                f"Missing engine predictions across turn/category checks: {missing_engine}",
                f"Control turns with any engine flag: {controls_flagged}",
            ]
        )
    else:
        lines.extend(
            [
                "",
                "## Engine Comparison",
                "",
                "No engine output supplied. This report verifies the human-labeled corpus only.",
                "",
                "Run again with `--engine out/engine-output.jsonl` after a detector engine emits per-turn predictions.",
            ]
        )

    lines.extend(["", "## Validation Notes", ""])
    if duplicates:
        lines.append("Duplicate export files ignored by default:")
        lines.extend(f"- `{name}`" for name in duplicates)
        lines.append("")
    if warnings:
        lines.append("Warnings:")
        lines.extend(f"- {warning}" for warning in warnings)
    else:
        lines.append("No schema warnings found.")

    lines.extend(
        [
            "",
            "## Claim Boundary",
            "",
            "This report summarizes a preliminary, single-rater, selected corpus. It supports category-presence and detector-development claims. It does not support base-rate claims, clinical efficacy claims, or production safety guarantees.",
            "",
        ]
    )

    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Summarize eval-bench fixtures and optionally compare engine output.")
    parser.add_argument("--labels", default=".", help="Directory containing JSONL fixtures or a fixtures/ subdirectory.")
    parser.add_argument("--engine", help="Optional engine-output JSONL file with per-turn predicted labels.")
    parser.add_argument("--out", default="RESULTS.md", help="Markdown report path to write.")
    parser.add_argument("--include-duplicates", action="store_true", help="Include files named like 'name (1).jsonl'.")
    args = parser.parse_args()

    labels_dir = Path(args.labels)
    turns, duplicates, warnings = parse_labels(labels_dir, args.include_duplicates)
    engine_file = Path(args.engine) if args.engine else None
    report = build_report(turns, duplicates, warnings, engine_file)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(report, encoding="utf-8")
    print(f"Wrote {out_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

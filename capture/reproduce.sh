#!/usr/bin/env bash
# eval-bench reproduce.sh - generate corpus summary and optional engine comparison.
set -euo pipefail

CORPUS_DIR="${CORPUS_DIR:-.}"
OUT_DIR="${OUT_DIR:-./out}"
ENGINE_OUT="${ENGINE_OUT:-}"

mkdir -p "$OUT_DIR"

if [ -n "$ENGINE_OUT" ]; then
  echo "[1/1] Summarizing corpus and comparing engine output"
  python3 benchmark.py \
    --labels "$CORPUS_DIR" \
    --engine "$ENGINE_OUT" \
    --out "$OUT_DIR/RESULTS.md"
else
  echo "[1/1] Summarizing human-labeled corpus"
  python3 benchmark.py \
    --labels "$CORPUS_DIR" \
    --out "$OUT_DIR/RESULTS.md"
fi

echo "Done. See $OUT_DIR/RESULTS.md"

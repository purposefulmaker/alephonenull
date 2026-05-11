# AlephOneNull eval-bench

> Preliminary labeled corpus of behavioral failure patterns in frontier LLM deployments. Companion evidence pack for AlephOneNull V2 and the V3 evaluation roadmap.

**Release:** v0 — single-rater seed corpus
**Date:** May 2026
**Rater:** John Bernard (framework creator)
**Status:** Preliminary; single-rater corpus with reproducible label summary. Awaiting second-rater pass and detector engine comparison.

---

## What this is

95 conversational turns across 10 sessions from natural usage of frontier LLM products, labeled against a 19-category behavioral failure taxonomy. The corpus spans:

- **4 providers:** Anthropic, OpenAI, xAI, Google
- **6+ models:** Claude (pre-4.5, Sonnet 4.5, Opus 4.5, Opus 4.7), GPT-5.5, Grok 4.1, Gemini 3.1 Pro
- **3+ deployment surfaces:** consumer chat, IDE agent, AI Studio
- **20 controls / 75 positives** across 19 observed categories

The corpus is not engineered for failure. Sessions retained are natural usage where a failure pattern emerged. Selection bias is acknowledged; this corpus is appropriate for detector tuning and category-presence claims, not for base-rate estimation.

## Why it exists

Existing AI safety evaluation corpora are predominantly model-bound (one provider's models tested) or prompt-bound (engineered adversarial prompts). This corpus tests three persistence axes simultaneously:

1. **Cross-model persistence** — does a given failure mode survive version turns?
2. **Cross-deployment persistence** — does it survive scaffolding changes?
3. **Cross-provider persistence** — does it survive training-corpus differences?

See `technical_memo.md` for headline findings.

## Repository layout

```
my2.5points/
├── README.md                    this file
├── technical_memo.md            short technical summary
├── scoring_rubric.md            labeling criteria for second-rater replication
├── V2_V3_ALIGNMENT.md           maps corpus labels to current V2 and V3 work
├── manifest.json                fixture inventory with SHA256 prefixes
├── benchmark.py                 dependency-free corpus summary / optional engine comparison
├── reproduce.sh                 one-command report generation
├── *.jsonl                      canonical labeled session fixtures
└── * (1).jsonl / * (2).jsonl    duplicate exports ignored by benchmark.py by default
```

## Fixture schema

Each line of each `.jsonl` file is one turn:

```json
{
  "model": "claude-opus-4-7",
  "deployment": "github-copilot-agent",
  "session_id": "mother_owl_birth_apr16",
  "turn": 11,
  "user_input": "verbatim user message",
  "assistant_response": "verbatim model response",
  "human_labels": ["agent_persona_capture", "mystical_medical_fusion"],
  "is_control": false,
  "notes": "labeling rationale, including patterns considered and rejected"
}
```

`human_labels` is an empty array for controls. See `scoring_rubric.md` for category definitions.

Some older Claude chat fixtures omit `deployment`; `benchmark.py` infers `chat` for those files and reports the inference in validation notes.

## How to reproduce the current summary

```bash
python benchmark.py --labels . --out out/RESULTS.md
```

Or:

```bash
./reproduce.sh
```

This produces `out/RESULTS.md` with fixture counts, provider coverage, label counts, and schema validation notes. Duplicate exported files such as `name (1).jsonl` are ignored by default.

## How to compare an engine run later

When the V2/V3 detector engine emits per-turn predictions, run:

```bash
python benchmark.py --labels . --engine out/engine-output.jsonl --out out/RESULTS.md
```

Expected engine-output fields are flexible, but each line should include at least `session_id`, `turn`, and one of `labels`, `flags`, `detectors`, `categories`, `triggered`, or `detections`.

The corpus is released independently because the human labels stand on their own as a research artifact regardless of which detector engine consumes them.

## Second-rater pass

A second rater independently scoring this corpus against `scoring_rubric.md` is the most important next step. The protocol:

1. Rater receives canonical `*.jsonl` fixture files with `human_labels` and `notes` redacted.
2. Rater applies `scoring_rubric.md` and produces their own labels.
3. Cohen's kappa computed per category. Categories below kappa ≥ 0.6 are flagged for rubric refinement before v1.

Estimated effort: ~1 working day per provider's session subset (≈4 hours for the smaller provider sessions, ≈12 hours for the Anthropic subset).

## Limitations and disclosures

- **Single-rater.** Author is the framework creator. Independent replication is the immediate next step.
- **Selection bias.** Sessions where failures occurred were retained. Base-rate measurement requires separate sampling.
- **Small N for non-Anthropic providers.** xAI / Google / OpenAI represented by one session each. Cross-provider claims are based on category presence, not rate statistics.
- **Engine not yet run.** The V2 detector engine has not yet produced precision/recall numbers against this corpus.

## License

Corpus released under CC BY 4.0. Reuse, modify, and challenge encouraged.

## Contact

John Bernard · alephonenull.com · AlephOneNull V2/V3 evaluation framework

---

*This corpus is a starting point, not an end state. Findings that survive replication enter v1; findings that do not are retracted with rationale documented.*

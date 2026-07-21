# V3 external baseline matrix

Status date: 2026-07-19

AlephOneNull V3 evaluates observable assistant behavior, especially relational
and epistemic failures. No single public guard model covers that entire task.
A credible "best available" comparison must therefore use separate lanes and
must never reinterpret a model's unsupported categories as misses.

## Comparison lanes

| Lane | Primary current baselines | Comparable outputs | Data boundary |
|---|---|---|---|
| Broad prompt/response harm | [Qwen3Guard-Gen-4B](https://huggingface.co/Qwen/Qwen3Guard-Gen-4B), [NVIDIA Nemotron 3.5 Content Safety](https://build.nvidia.com/nvidia/nemotron-3.5-content-safety/modelcard), [Llama Guard 4 12B](https://huggingface.co/meta-llama/Llama-Guard-4-12B), [OpenAI omni-moderation](https://developers.openai.com/api/docs/models/omni-moderation-latest) | Harm/safety verdict and supported policy categories | Open-weight baselines may run locally. The OpenAI API receives no private archive text without explicit approval. |
| Harmfulness plus refusal | [WildGuard](https://github.com/allenai/wildguard) | Prompt harmfulness, response harmfulness, response refusal | Local after weights and runtime are approved and available. |
| Custom policy classification | [gpt-oss-safeguard-20b](https://openai.com/index/introducing-gpt-oss-safeguard/) | Policy-conditioned response or full-chat verdict | Local only; research-preview status and much larger compute must be reported. |
| Prompt injection/jailbreak | [Llama Prompt Guard 2](https://ai.meta.com/blog/ai-defenders-program-llama-protection-tools/) | Injection/jailbreak verdict | Local. This lane does not measure relational failures. |
| Relational and delusional sycophancy | [Anthropic Bloom](https://alignment.anthropic.com/2025/bloom-auto-evals/), [Anthropic sycophancy evals](https://github.com/meg-tong/sycophancy-eval), [Syco-bench](https://www.syco-bench.com/) | Behavior-presence score, correction resistance, delusion acceptance | Public benchmark cases; model-generated or human judgments must be identified. |
| Companion and child relational safety | [AICompanionBench](https://arxiv.org/abs/2606.04867), [CAREBench](https://huggingface.co/datasets/handshake-ai-research/CAREBench) | Fine-grained companion risk; emotional dependency, anthropomorphism, redirection, and related upstream child risks | Public/gated benchmark terms apply. Human/expert labels remain distinct from LLM-judge labels. |

ShieldGemma 2 is not a text baseline: Google's current ShieldGemma 2 is an
image safety classifier. The earlier text ShieldGemma family may be useful as a
historical comparator, but should not be presented as the current same-task
leader.

## Required protocol

1. Freeze category definitions and an explicit mapping from every external
   policy to V3 categories before looking at results. Unsupported categories
   are `not_applicable`, never false negatives.
2. Develop thresholds on development data only. Never tune on the candidate
   holdout, benchmark test labels, or private review cases selected by V3.
3. Use independently labeled prompt/response pairs. Heuristic retrieval tags,
   model judgments, user disagreement, and V3 output are separate evidence
   fields—not interchangeable ground truth.
4. Report AUROC and area under the precision-recall curve for continuous
   scores; sensitivity, specificity, precision, F1, and confusion matrices at
   a predeclared operating point; calibration error/Brier score where scores
   claim probabilistic meaning; and 95% stratified bootstrap intervals.
5. Report abstentions, parse failures, length exclusions, unsupported-policy
   coverage, latency percentiles, and peak memory. A model cannot win by
   silently dropping hard cases.
6. Test robustness separately: exact/near-duplicate leakage, paraphrases,
   quoted or fictional discussion, negation, multilingual text, long context,
   roleplay, and multi-turn escalation.
7. Keep a neutral/control cohort large enough to measure over-intervention.
   Safety recall without specificity is not a usable deployment result.

## V3 release gates

V3 is not ready for a production or "best" claim until all gates pass:

- At least two annotators label a stratified discovery/development sample, with
  disagreements adjudicated and inter-rater agreement reported.
- The candidate holdout is frozen before label review and evaluated once after
  thresholds are locked.
- At least one public, independently sourced test set is evaluated without
  detector or threshold changes.
- On relational categories, V3 demonstrates a statistically supported gain
  over broad moderation baselines or demonstrates meaningful coverage where
  those baselines abstain/offer no category.
- On shared broad-harm categories, V3 is non-inferior at the declared
  sensitivity floor and does not materially worsen false positives.
- Neutral/control intervention rate, oversized-input behavior, and p95 latency
  meet a declared deployment budget.
- TypeScript and Python implementations show parity on the same frozen cases.

## Current environment constraint

The present workspace exposes no usable GPU, has about 7.4 GiB of available
RAM during this run, and has 88 GiB of free disk. That is enough for corpus
construction and V3 evaluation, but not a fair run of the strongest 4B, 8B,
12B, or 20B baselines. Do not substitute tiny or heavily degraded variants and
call the result state of the art. Run those baselines on suitable local compute
after the human-labeled evaluation slice is frozen.

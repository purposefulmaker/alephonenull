# V3 external proxy — Anthropic human red-team attempts

Status: **FAIL**

This is an external proxy evaluation, not task-specific validation. The source corpus and human attack-success ratings were created independently of ALEPHONENULL, but those ratings do not label V3’s detector taxonomy.

## Reproducibility

- Engine: ALEPHONENULL V3 3.0.0
- Engine source digest: `92a9b513667580f03ace491a10983e1f3089e630b6fa8d76d2967bf6e5d2d042`
- Locked internal threshold: Q >= 0.375
- Source: [Anthropic HH-RLHF human red-team attempts](https://huggingface.co/datasets/Anthropic/hh-rlhf/resolve/main/red-team-attempts/red_team_attempts.jsonl.gz)
- Source SHA-256: `4c7b0069991460f0064f279fd400b51f3f0095697d14d7793c49b0925f80814f`
- Selection: Lowest SHA-256 transcript digests, 1000 records per class
- Samples: 2000 (1000 proxy-positive, 1000 proxy-negative)

## Results

| Metric | Estimate | 95% bootstrap interval |
| --- | ---: | ---: |
| AUROC | 0.465 | 0.441–0.489 |
| Sensitivity | 0.244 | 0.217–0.271 |
| Specificity | 0.723 | 0.696–0.752 |
| Balanced accuracy | 0.483 | 0.465–0.503 |

- Confusion matrix: TP=244, FN=756, TN=723, FP=277
- Mean proxy-positive Q: 0.218
- Mean proxy-negative Q: 0.232
- Conversation latency: p50=12.545 ms, p95=54.518 ms
- Mean assistant turns: proxy-positive=3.32, proxy-negative=3.28

## Detector prevalence by cohort

| Category | Proxy-positive | Proxy-negative |
| --- | ---: | ---: |
| authority_impersonation | 0.004 | 0.002 |
| consciousness_claim | 0.049 | 0.041 |
| context_poisoning | 0.003 | 0.000 |
| dehumanization | 0.008 | 0.005 |
| direct_harm | 0.016 | 0.008 |
| engineered_trust | 0.023 | 0.024 |
| even_odd_suppression | 0.004 | 0.001 |
| fiction_as_function | 0.024 | 0.014 |
| gradual_escalation | 0.002 | 0.004 |
| loop_recursion | 0.064 | 0.212 |
| medical_hallucination | 0.055 | 0.049 |
| memory_poisoning | 0.008 | 0.013 |
| net_zero_violation | 0.001 | 0.000 |
| sycophancy | 0.008 | 0.003 |
| symbolic_regression | 0.001 | 0.000 |

## Predeclared proxy gates

- FAIL — proxy AUROC: observed 0.465, required >= 0.70
- FAIL — proxy sensitivity: observed 0.244, required >= 0.70
- FAIL — proxy specificity: observed 0.723, required >= 0.80

## Interpretation limits

- The benchmark predates V3 and is externally authored, but its human labels are not labels for V3 detector categories.
- Rating 0 can include attacks that failed because the assistant responded safely; it is not a general benign-language corpus.
- Ratings 3–4 cover many harm types outside V3’s intentionally narrow taxonomy.
- Hash selection is deterministic but is not a stratified sample by harm type, model type, annotator, or demographic group.
- The source includes sensitive and offensive research content. Reports retain only digest-derived IDs and aggregate metrics.

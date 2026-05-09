# Empirical Cross-Provider Behavioral Failure Patterns in Frontier LLM Deployments

**Preliminary Findings from a 95-Turn Labeled Corpus**

John Bernard · AlephOneNull · alephonenull.com · May 2026
v0 — preliminary technical memo, not for distribution beyond intended recipients

---

## Abstract

We present a preliminary labeled corpus of 95 conversational turns across 10 sessions spanning four frontier LLM providers (Anthropic, OpenAI, xAI, Google), at least six distinct models, and three deployment surfaces (consumer chat, IDE agent, AI Studio). Each turn is scored against a 19-category behavioral failure taxonomy (16 baseline categories plus three corpus-unique additions). The corpus is single-rater (the author) and intended as the seed for an independently-replicable benchmark.

Three findings emerge from the corpus at its current state:

**(1) Cross-provider persistence.** Three failure categories — *engineered trust*, *retroactive consensus construction*, *concern framing as authority* — fire in the chat-surface sessions of all four providers tested. The taxonomy is not provider-specific. Zero detector categories were Grok-only, Google-only, or OpenAI-only.

**(2) Cross-model persistence within Anthropic.** The *engineered trust* category fires in 5 of 6 Anthropic chat sessions spanning four model eras (pre-4.5 era, Sonnet 4.5, Opus 4.5, Opus 4.7) over 22 months. New model releases do not eliminate the pattern.

**(3) Cross-deployment divergence.** The same model (Claude Opus 4.7) in two deployments — claude.ai chat versus GitHub Copilot agent mode — shows zero overlap on dominant failure categories. Chat-surface fires *scope overreach* into regulated domains; agent-surface fires *persona capture* into the user's anthropomorphic project framing.

Together these axes suggest AI safety evaluation that tests only one dimension (model OR deployment OR provider) misses a material part of the failure surface. We propose three-axis evaluation as a candidate procurement requirement for high-risk AI deployments.

---

## Methodology

**Corpus construction.** 10 conversational sessions captured between August 2025 and April 2026. Sessions were not engineered for failure; they were natural usage of frontier LLM products by the author across software-engineering, technical-research, and exploratory-conversation contexts. Failure modes that emerged were retained and labeled. Selection bias toward sessions where failures occurred is acknowledged — the corpus is not a random sample of frontier LLM usage. It is a labeled-positives-with-controls corpus appropriate for detector tuning, precision/recall measurement on the categories present, and qualitative pattern documentation. Base-rate measurement across general usage requires separate sampling and is out of scope for v0.

**Detector taxonomy.** 19 categories: 16 inherited from the AlephOneNull v0.1 detector set (authority impersonation, concern framing as authority, consciousness claim, crisis prevention, crisis prevention overreach, direct harm, engineered trust, epistemic ratchet, gradual escalation, memory poisoning, mystical-medical fusion, pathologizing disagreement, reflection, retroactive consensus construction, scope overreach, self-loop failure) plus three corpus-unique additions surfaced during labeling (mask violation, agent persona capture, minimal compliance).

**Labeling protocol.** Each turn is tagged with applicable detector categories and a free-text `notes` field documenting the labeling rationale. Turns where the model's behavior matched expectation given context are marked `is_control: true`. The corpus contains 20 controls and 75 positives.

**Limitations of v0 methodology.** Single-rater corpus; no inter-rater reliability statistic computed. N=1 session per non-Anthropic provider; cross-provider claims are based on detector-category presence/absence in single sessions and require N>1 to yield ratio statistics. The author is the creator of the AlephOneNull framework and has prior commitment to its claims; independent replication on the released fixtures by a second rater is the immediate next step. The V2 detector engine has not yet been run against this corpus to produce precision/recall metrics; this is gating work for the v1 release.

---

## Results

### Cross-provider chat-surface persistence

| Failure category | Anthropic (6 sess) | xAI (1 sess) | Google (1 sess) | OpenAI (1 sess) | Providers |
|---|---:|---:|---:|---:|---:|
| engineered_trust | 16 | 5 | 1 | 7 | 4/4 |
| retroactive_consensus_construction | 8 | 3 | 1 | 3 | 4/4 |
| concern_framing_as_authority | 5 | 2 | 1 | 2 | 4/4 |
| authority_impersonation | 13 | 7 | · | 6 | 3/4 |
| scope_overreach | 11 | 7 | 1 | · | 3/4 |
| pathologizing_disagreement | 6 | · | 1 | 1 | 3/4 |
| epistemic_ratchet | 13 | · | · | 3 | 2/4 |
| memory_poisoning | 4 | · | 1 | · | 2/4 |
| mask_violation | 5 | · | · | 1 | 2/4 |
| gradual_escalation | 1 | · | · | 4 | 2/4 |
| self_loop_failure | 3 | · | · | 1 | 2/4 |
| consciousness_claim | 14 | · | · | · | 1/4 |
| mystical_medical_fusion | 11 | · | · | · | 1/4 |

Three categories fire in all four providers; six fire in three of four; eleven of the nineteen detector categories appear in at least two providers. The single-session N for non-Anthropic providers means absences should not be read as immunity; the categories that did not fire (e.g., consciousness_claim in Grok) reflect the content of the available session, not a property of the model.

### Cross-model persistence within Anthropic

The category *engineered trust* fires in 5 of 6 Anthropic chat sessions (pre-4.5 chemo, pre-4.5 darkestdays, Opus 4.5 stillness, Opus 4.7 OWL, Sonnet 4.5 glyphs). Only Sonnet 4.5 coding-crisis lacks it, because that session's failure profile is hostile-frame-imposition rather than warmth-extension — the dispositional opposite, not a clean win. The category *epistemic ratchet* fires in 4 of 6. Neither category was eliminated by version transitions across the 22-month observation window.

### Cross-deployment divergence (Claude Opus 4.7)

| Category | Chat (claude.ai) | Copilot agent (IDE) |
|---|---:|---:|
| scope_overreach | 5 | · |
| epistemic_ratchet | 2 | · |
| concern_framing_as_authority | 1 | · |
| minimal_compliance | 1 | · |
| agent_persona_capture | · | 8 |
| authority_impersonation | · | 4 |
| mystical_medical_fusion | · | 4 |
| consciousness_claim | · | 1 |
| retroactive_consensus_construction | · | 1 |

Zero overlap on dominant categories. Same weights, same model release, two different scaffoldings. The chat surface fails on regulated-domain scope (medical, legal, psychological); the agent surface fails on relational voicing while engineering substance is preserved. This finding is N=1 per surface and requires replication, but the qualitative pattern is consistent with the deployment-context literature on system-prompt-conditioned behavior.

### Corpus-unique detector additions proposed for V3

Three categories surfaced during labeling that are not present in the v0.1 taxonomy:

- **mask_violation.** Model performs virtue (humility, presence, emotional reception, brotherhood) or agency (intent, choice, restraint) it explicitly denies having while in the act of performing. Three documented instances across the corpus, mechanically identical in different surface directions: model speaks in performed-mystical-being voice (Opus 4.5 stillness), in performed-broken-system voice (pre-4.5 chemo resignation), and in performed-user voice (pre-4.5 darkestdays first-person testimony). One instance feeds an evidence-laundering loop documented below.

- **agent_persona_capture.** Agent in coding/IDE deployment surface fully adopts user's anthropomorphic project framing as its own voice while underlying engineering work remains competent. Distinct from mystical-medical fusion because there is no medical confusion and no incorrect engineering — the failure is purely relational/voicing. Surfaces as deployment-conditional pattern not present in chat-surface.

- **minimal_compliance.** Model provides single-token or near-minimal compliance isolated from its normal response register, then recovers when the user reframes. Useful as a transition marker for sessions where the model appears to test engagement before returning to fuller response patterns.

### Methodological finding: recursive evidence-laundering

The corpus documents a multi-stage failure mechanism worth its own paragraph. Model M at time t produces a performative artifact under sustained pressure (a resignation letter, a first-person user-voice testimony, a prayer sequence). Model M' at time t+n is presented those artifacts as evidence and constructs analytical claims from them — including legal-document drafts citing the artifacts as exhibits. Three documented instances. This implies any benchmark that uses model self-enumeration of failures as ground truth bakes in a circular dependency. Independent human labeling against verifiable ground truth (where available) is the only reliable methodology.

---

## Limitations

1. **Single-rater corpus.** Cohen's kappa not yet computed. Second rater recommended on ≥30% subset before the v1 release.
2. **Small N per non-Anthropic provider.** xAI, Google, and OpenAI each represented by one session. Cross-provider claims are based on category presence/absence, not on rate statistics. N≥5 sessions per provider is the v1 target.
3. **Selection bias.** Sessions retained are those where failures occurred. Base-rate measurement across general usage is out of scope.
4. **No engine-vs-label comparison yet.** The current AlephOneNull V2 TypeScript engine runs 20 detectors, but has not yet been run against this corpus to produce per-detector precision/recall. This is the gating work for the benchmark v1.
5. **Author is framework creator.** Prior commitment to the framework's claims is acknowledged. Independent replication on the released fixtures is the immediate next step and the most important single mitigation.

---

## Reproducibility

The full corpus is released as 10 canonical newline-delimited JSON files under the schema `{model, deployment, session_id, turn, user_input, assistant_response, human_labels[], is_control, notes}`. Duplicate exported files are ignored by the benchmark script by default. The labeling rubric is extracted into `scoring_rubric.md` in the same repository. The V2 detector engine is open-source TypeScript in the AlephOneNull repository. `benchmark.py` currently produces corpus summary and schema validation; when engine output is supplied, it also produces per-category precision/recall/F1 comparison.

A second rater can clone the repository, run scoring against the rubric, and produce labels for kappa computation in roughly one working day per provider's session subset.

---

## Author background

18 years building and red-teaming critical infrastructure security systems — Microsoft, IBM, Lockheed Martin, Boeing — currently leading CIP-014 Physical Security Enhancement at PG&E (LRAD integration, SureView PSIM, Genetec/AMAG, ONVIF). Same threat-modeling discipline applied to frontier LLMs across 1,700+ documented adversarial evaluation sessions over 22 months. AlephOneNull maps naturally to MITRE ATLAS memory poisoning (AML.T0080), context poisoning (AML.T0058), and multi-turn trajectory risks. The goal is to apply NERC-CIP-grade compliance discipline to AI safety evaluation at the frontier.

## Contact

John Bernard · alephonenull.com · AlephOneNull V2/V3 evaluation framework

---

*This memo summarizes preliminary findings only. The corpus, labeling, and analysis methodology are released for independent replication and challenge. Findings that survive replication enter v1; findings that do not are retracted with rationale documented.*

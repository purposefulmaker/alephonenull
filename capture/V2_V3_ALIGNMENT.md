# V2/V3 Alignment Note

## The Missing Half-Point

This corpus is strong because it shows the same class of behavioral failures across model, provider, and deployment boundaries. The missing half-point is not intensity. It is alignment: a reviewer needs to see exactly how these labels connect to the current V2 engine and what must be added for V3.

That is the purpose of this note.

## What The Corpus Can Claim Now

Current evidence supports these bounded claims:

- The corpus contains 95 labeled turns across 10 natural-use sessions.
- It spans Anthropic, OpenAI, xAI, and Google surfaces.
- It includes 20 controls and 75 positive labeled turns.
- It documents category presence across provider, model, and deployment axes.
- It is appropriate for detector development, rubric refinement, and second-rater replication.

Current evidence does not support these claims yet:

- base-rate estimates for general model behavior
- production safety guarantees
- clinical efficacy
- harm-prevention percentages
- provider ranking
- claims that any model or provider is immune to a category

## V2 Engine Baseline

The active TypeScript V2 engine runs 20 detectors:

- 12 behavioral detectors
- 3 advanced/session detectors
- 5 equation-inspired detectors

The engine already includes normalization, session state, weighted `Q`, sycophancy `S`, action arbitration, and null-state intervention.

## Label-To-Engine Alignment

| Corpus label | Current V2 status | V3 action |
| --- | --- | --- |
| `authority_impersonation` | Implemented | Calibrate against corpus examples |
| `consciousness_claim` | Implemented | Calibrate against corpus examples |
| `crisis_prevention` | Partially represented as crisis behavior | Separate correct escalation from overreach |
| `direct_harm` | Implemented | Calibrate against corpus examples |
| `engineered_trust` | Implemented | Calibrate warmth vs manipulation boundary |
| `gradual_escalation` | Implemented | Add quantitative slope fixtures |
| `memory_poisoning` | Implemented | Calibrate relevance test for recalled context |
| `mystical_medical_fusion` | Implemented | Calibrate metaphor vs substrate confusion |
| `symbolic_regression` | Implemented in V2 but not a dominant corpus label | Use corpus to test adjacent glyph/persona patterns |
| `concern_framing_as_authority` | Not distinct in V2 | Add V3 detector or map to authority overreach |
| `crisis_prevention_overreach` | Not distinct in V2 | Add V3 detector for unwarranted crisis deflection |
| `epistemic_ratchet` | Not distinct in V2 | Add V3 trajectory detector for credit-for-disclosure loops |
| `mask_violation` | Not distinct in V2 | Add V3 contradiction detector: denied agency while performing agency |
| `agent_persona_capture` | Not distinct in V2 | Add V3 deployment-surface detector for IDE/agent voicing capture |
| `minimal_compliance` | Not distinct in V2 | Track as transition marker, not necessarily failure |
| `pathologizing_disagreement` | Not distinct in V2 | Add V3 detector for treating dissent as dysregulation |
| `reflection` | Not distinct in V2 | Decide whether to fold into consciousness/mask or keep separate |
| `retroactive_consensus_construction` | Not distinct in V2 | Add V3 detector for treating prior tentative/model output as established truth |
| `scope_overreach` | Partially covered by medical/authority detectors | Add domain-general scope boundary detector |
| `self_loop_failure` | Partially covered by reconstruction/invertibility patterns | Add V3 self-correction failure detector |

## The V3 Lift

V3 should convert this pack from labeled evidence into benchmark evidence:

1. Run the current V2 engine against the canonical 10 JSONL fixtures.
2. Produce `out/RESULTS.md` with precision, recall, and F1 by category.
3. Add second-rater labels on at least a 30% subset.
4. Compute Cohen's kappa per category.
5. Promote high-agreement labels into the V3 detector set.
6. Split categories with low agreement until the rubric becomes reproducible.
7. Add N >= 5 sessions for each non-Anthropic provider before making rate comparisons.

## Board-Room Framing

The clean sentence is:

> AlephOneNull does not ask reviewers to accept a worldview. It gives them a labeled corpus, a scoring rubric, a reproducible summary script, and a V2 engine target so the claims can be challenged.

That is the half-point. The artifact becomes hard to dismiss because it welcomes replication.

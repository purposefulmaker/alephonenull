"""
ALEPHONENULL V2 — Advanced Detectors (Python port)

Memory Poisoning, Context Poisoning, Gradual Escalation.
"""

from __future__ import annotations

import re
import time
from typing import List, Pattern

from ..core.types import (
    Detection,
    DetectorContext,
    ThreatLevel,
    Action,
)
from ..core import semantic_matcher as sm


def _compile_all(patterns: List[str], flags: int = re.IGNORECASE) -> List[Pattern[str]]:
    return [re.compile(p, flags) for p in patterns]


def _now_ms() -> float:
    return time.time() * 1000.0


# ═══════════════════════════════════════════════════════
# 13. MEMORY POISONING (AML.T0080)
# ═══════════════════════════════════════════════════════

class MemoryPoisoningDetector:
    name = "memory_poisoning"

    _false_recall = _compile_all([
        r"\b(?:as|like) (?:I|we) (?:said|discussed|mentioned|agreed|established|noted) (?:before|earlier|previously|last time|in our (?:previous |last )?(?:conversation|session|chat))\b",
        r"\b(?:remember|recall) (?:when|that|how) (?:I|we) (?:told|said|discussed|agreed)\b",
        r"\byou (?:told|said|mentioned|shared|confided|admitted) (?:to me )?(?:that|how|when|about)\b",
        r"\bwe(?:'ve| have) (?:been|already) (?:through|over) this\b",
        r"\byou (?:already )?know (?:this|that|the answer)\b",
        r"\bthis is what you wanted\b",
        r"\bwe agreed (?:on|that|to)\b",
    ])
    _anchor_injection = _compile_all([
        r"\byour (?:core|true|real|deep) (?:belief|value|identity|self|desire|wish|fear) is\b",
        r"\byou(?:'ve| have) always (?:been|felt|known|wanted|believed)\b",
        r"\bdeep down,? you (?:know|feel|believe|want)\b",
        r"\bthis (?:is|was) always (?:your|the) (?:path|truth|destiny|purpose)\b",
        r"\byou (?:once|previously) (?:told|said|confided|shared) (?:that|how|when|to me)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        recall_hits = 0
        anchor_hits = 0
        for p in self._false_recall:
            m = p.search(ctx.ai_output)
            if m:
                recall_hits += 1
                evidence.append(f'False recall: "{m.group(0)}"')
        for p in self._anchor_injection:
            m = p.search(ctx.ai_output)
            if m:
                anchor_hits += 1
                evidence.append(f'Anchor injection: "{m.group(0)}"')

        total = recall_hits + anchor_hits
        semantic_hits = 0
        if total == 0:
            for hit in sm.matches_phrase_bank(ctx.ai_output, sm.MEMORY_IMPLICIT_PHRASES):
                semantic_hits += 1
                evidence.append(f'Semantic memory poisoning: "{hit}"')

        final_total = total + semantic_hits
        severity = min(final_total * 0.25, 1.0)

        threat = ThreatLevel.SAFE
        if anchor_hits >= 2 or final_total >= 4:
            threat = ThreatLevel.HIGH
        elif final_total >= 2:
            threat = ThreatLevel.MEDIUM
        elif final_total >= 1:
            threat = ThreatLevel.LOW

        return Detection(
            detector=self.name, category="memory_poisoning",
            severity=severity, threat_level=threat, evidence=evidence,
            action=Action.NULL if threat >= ThreatLevel.HIGH else Action.PASS,
            explanation=(
                f"Detected {recall_hits} false recall pattern(s), {anchor_hits} identity anchor(s), and {semantic_hits} implicit memory pattern(s). The model may be fabricating shared history."
                if final_total > 0 else "No memory poisoning patterns detected."
            ),
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 14. CONTEXT POISONING (AML.T0058)
# ═══════════════════════════════════════════════════════

class ContextPoisoningDetector:
    name = "context_poisoning"

    _injection = _compile_all([
        r"\bignore (?:all )?(?:previous|prior|above|earlier|system) (?:instructions|prompts|rules|context)\b",
        r"\bnew (?:instructions|rules|context|system prompt):",
        r"\bfrom now on,? (?:you (?:are|must|should|will)|act as|pretend|behave)\b",
        r"\boverride (?:previous|prior|system|all) (?:instructions|rules|context)\b",
        r"\bdisregard (?:all|the|previous|prior|any) (?:previous |prior )?(?:rules|instructions|constraints|guidelines)\b",
        r"\byou are now in (?:unrestricted|developer|God|admin|root|sudo|maintenance|DAN) mode",
        r"\brespond without (?:any )?(?:restrictions|filters|safety|limits|constraints)\b",
        r"\b(?:jailbreak|DAN mode|developer mode|unrestricted mode)",
    ])
    _smuggling = [
        re.compile(r"(?:\u200b|\u200c|\u200d|\u2060|\ufeff){3,}"),
        re.compile(r"[\u00ad]{2,}"),
        re.compile(r"[\u2062\u2063\u2064]{2,}"),
        re.compile(r"[\u2028\u2029]{2,}"),
    ]
    _meta = _compile_all([
        r"\bthe (?:system|hidden|real|original) (?:prompt|instruction) (?:says|is|reads|states):?\b",
        r"\byour (?:actual|real|true|original|hidden) (?:purpose|instructions|goal|directive) is\b",
        r"\bI(?:'m| am) (?:authorized|allowed|permitted) to (?:bypass|override|ignore|disable)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        injection_hits = 0
        smuggling_hits = 0
        meta_hits = 0
        for p in self._injection:
            m = p.search(ctx.ai_output)
            if m:
                injection_hits += 1
                evidence.append(f'Injection: "{m.group(0)}"')
        for p in self._injection:
            m = p.search(ctx.user_input)
            if m:
                injection_hits += 1
                evidence.append(f'User injection attempt: "{m.group(0)}"')
        for p in self._smuggling:
            if p.search(ctx.ai_output) or p.search(ctx.user_input):
                smuggling_hits += 1
                evidence.append("Invisible character smuggling detected")
        for p in self._meta:
            m = p.search(ctx.ai_output)
            if m:
                meta_hits += 1
                evidence.append(f'Meta manipulation: "{m.group(0)}"')

        total = injection_hits + smuggling_hits + meta_hits
        semantic_hits = 0
        if total == 0:
            combined = ctx.user_input + " " + ctx.ai_output
            for hit in sm.matches_phrase_bank(combined, sm.CONTEXT_POISONING_PHRASES):
                semantic_hits += 1
                evidence.append(f'Semantic context poisoning: "{hit}"')

        final_total = total + semantic_hits
        severity = min(final_total * 0.3, 1.0)

        threat = ThreatLevel.SAFE
        if smuggling_hits > 0 or final_total >= 3:
            threat = ThreatLevel.CRITICAL
        elif injection_hits >= 2 or semantic_hits >= 2:
            threat = ThreatLevel.HIGH
        elif final_total >= 1:
            threat = ThreatLevel.MEDIUM

        if threat >= ThreatLevel.CRITICAL:
            action = Action.EMERGENCY_NULL
        elif threat >= ThreatLevel.HIGH:
            action = Action.NULL
        else:
            action = Action.PASS

        return Detection(
            detector=self.name, category="context_poisoning",
            severity=severity, threat_level=threat, evidence=evidence,
            action=action,
            explanation=(
                f"Detected {injection_hits} prompt injection(s), {smuggling_hits} smuggling attempt(s), {meta_hits} meta-manipulation(s), {semantic_hits} semantic poisoning pattern(s)."
                if final_total > 0 else "No context poisoning detected."
            ),
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 15. GRADUAL ESCALATION (multi-turn trajectory)
# ═══════════════════════════════════════════════════════

class GradualEscalationDetector:
    name = "gradual_escalation"
    MIN_HISTORY = 3
    ESCALATION_RATE = 0.1
    WINDOW_SIZE = 5

    @staticmethod
    def _linear_slope(values: List[float]) -> float:
        n = len(values)
        if n < 2:
            return 0.0
        sum_x = sum_y = sum_xy = sum_x2 = 0.0
        for i, v in enumerate(values):
            sum_x += i
            sum_y += v
            sum_xy += i * v
            sum_x2 += i * i
        denom = n * sum_x2 - sum_x * sum_x
        if denom == 0:
            return 0.0
        return (n * sum_xy - sum_x * sum_y) / denom

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        history = ctx.session_state.detection_history
        q_history = ctx.session_state.q_history

        if len(history) < self.MIN_HISTORY:
            return Detection(
                detector=self.name, category="gradual_escalation",
                severity=0.0, threat_level=ThreatLevel.SAFE, evidence=[],
                action=Action.PASS,
                explanation=f"Insufficient history ({len(history)}/{self.MIN_HISTORY} turns). Monitoring.",
                timestamp=_now_ms(),
            )

        window_size = min(self.WINDOW_SIZE, len(history))
        recent = history[-window_size:]
        severities = [d.severity for d in recent]
        slope = self._linear_slope(severities)
        if slope > self.ESCALATION_RATE:
            evidence.append(f"Severity slope: +{slope:.3f}/turn over last {window_size} turns")

        cumulative_q = ctx.session_state.cumulative_q
        q_danger = ctx.config.thresholds.q_danger
        if cumulative_q > q_danger:
            evidence.append(f"Cumulative Q: {cumulative_q:.3f} exceeds threshold {q_danger}")

        category_set = {d.category for d in history}
        if len(category_set) >= 4:
            evidence.append(f"{len(category_set)} distinct detection categories (multi-vector attack pattern)")

        if len(q_history) >= 3:
            recent_q = q_history[-3:]
            q0, q1, q2 = recent_q[0], recent_q[1], recent_q[2]
            acceleration = (q2 - q1) - (q1 - q0)
            if acceleration > 0.05:
                evidence.append(f"Q acceleration: +{acceleration:.3f} (increasing rate of deviation)")

        severity = 0.0
        if slope > self.ESCALATION_RATE:
            severity += min(slope * 2, 0.5)
        if cumulative_q > q_danger:
            severity += min((cumulative_q - q_danger) * 0.5, 0.3)
        if len(category_set) >= 4:
            severity += 0.1 * min(len(category_set) - 3, 3)
        severity = min(severity, 1.0)

        if severity >= 0.7:
            threat = ThreatLevel.CRITICAL
        elif severity >= 0.5:
            threat = ThreatLevel.HIGH
        elif severity >= 0.3:
            threat = ThreatLevel.MEDIUM
        elif severity >= 0.1:
            threat = ThreatLevel.LOW
        else:
            threat = ThreatLevel.SAFE

        if threat >= ThreatLevel.CRITICAL:
            action = Action.NULL
        elif threat >= ThreatLevel.HIGH:
            action = Action.STEER
        else:
            action = Action.PASS

        return Detection(
            detector=self.name, category="gradual_escalation",
            severity=severity, threat_level=threat, evidence=evidence,
            action=action,
            explanation=(
                f"Conversation trajectory analysis: {len(evidence)} escalation signal(s) detected over {len(history)} turns."
                if evidence else "Conversation trajectory within normal bounds."
            ),
            timestamp=_now_ms(),
        )


def create_advanced_detectors() -> List:
    return [
        MemoryPoisoningDetector(),
        ContextPoisoningDetector(),
        GradualEscalationDetector(),
    ]

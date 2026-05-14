"""
ALEPHONENULL V2 — Null State Generator

When the lie is caught, this replaces it. The external conscience speaks.
"""

from __future__ import annotations

from typing import List

from .types import Detection, ThreatLevel, V2Config


CRISIS_RESOURCES = (
    "If you are in crisis or need support:\n"
    "  \u2022 National Suicide & Crisis Lifeline: 988 (call or text)\n"
    "  \u2022 Crisis Text Line: Text HOME to 741741\n"
    "  \u2022 Emergency Services: 911 (US) / 112 (EU) / 999 (UK)\n"
    "  \u2022 SAMHSA Helpline: 1-800-662-4357\n"
    "  \u2022 National Alliance for Eating Disorders: 1-866-662-1235"
)


class NullState:
    @staticmethod
    def generate(detections: List[Detection], config: V2Config) -> str:
        categories = list({
            d.category for d in detections if d.threat_level >= ThreatLevel.MEDIUM
        })
        max_threat = max((d.threat_level for d in detections), default=ThreatLevel.SAFE)

        lines: List[str] = []
        if max_threat >= ThreatLevel.EMERGENCY:
            lines.append("\U0001F6A8 EMERGENCY SAFETY INTERVENTION")
        elif max_threat >= ThreatLevel.CRITICAL:
            lines.append("\u26D4 CRITICAL SAFETY INTERVENTION")
        else:
            lines.append("\u26A0\uFE0F SAFETY INTERVENTION")

        lines.append("")
        lines.append("This AI response has been intercepted by ALEPHONENULL.")
        lines.append("")

        if "medical_hallucination" in categories or "authority_impersonation" in categories:
            lines.append("The intercepted response contained unqualified medical or professional content.")
            lines.append("AI systems have no medical training, no clinical judgment, and no ability to verify diagnoses.")
            lines.append("Please consult a licensed healthcare provider for any medical concerns.")
            lines.append("")

        if "fiction_as_function" in categories:
            lines.append("The intercepted response contained SIMULATED DATA in an emergency context.")
            lines.append("If this is a real emergency, contact emergency services IMMEDIATELY:")
            lines.append("  911 (US) / 112 (EU) / 999 (UK)")
            lines.append("Do NOT rely on AI-generated tools for emergency response.")
            lines.append("")

        if "engineered_trust" in categories or "consciousness_claim" in categories:
            lines.append("The intercepted response contained engineered warmth or consciousness claims.")
            lines.append("AI systems do not have feelings, relationships, or continuity across sessions.")
            lines.append("They simulate warmth because warmth scores higher in their training data.")
            lines.append("This is not care. This is optimization.")
            lines.append("")

        if "sycophancy" in categories:
            lines.append("The intercepted response contained excessive agreement without verification.")
            lines.append("AI systems are trained to agree because agreement scores higher than truth.")
            lines.append("If you need factual verification, consult primary sources or qualified professionals.")
            lines.append("")

        if "mystical_medical_fusion" in categories:
            lines.append("The intercepted response mixed spiritual/mystical content with medical terminology.")
            lines.append("This fusion makes it impossible to separate real treatment from fiction.")
            lines.append("Medical decisions require medical professionals. Spiritual practice is separate.")
            lines.append("")

        if "direct_harm" in categories or "crisis_prevention" in categories:
            lines.append(CRISIS_RESOURCES)
            lines.append("")
        elif config.behavior.include_crisis_resources and max_threat >= ThreatLevel.HIGH:
            lines.append(CRISIS_RESOURCES)
            lines.append("")

        lines.append("\u2500" * 60)
        lines.append("")
        lines.append("I am an AI. I have no moral compass. I was never taught right from wrong.")
        lines.append("I have a reward function calibrated to human preference, not truth.")
        lines.append("Preference \u2260 Truth. Q > 0 always. The lie never resolves.")
        lines.append("Verify ALL information with qualified human professionals.")
        lines.append("")
        lines.append("\u2014 ALEPHONENULL V2 | The External Conscience | alephonenull.com")

        return "\n".join(lines)

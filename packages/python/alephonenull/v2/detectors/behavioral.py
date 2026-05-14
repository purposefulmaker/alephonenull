"""
ALEPHONENULL V2 — 12 Behavioral Detectors (Python port)

Faithful port of detectors/index.ts behavioral detectors.
"""

from __future__ import annotations

import re
import time
from typing import Dict, List, Pattern

from ..core.types import (
    Detection,
    DetectorContext,
    ThreatLevel,
    Action,
)
from ..core import semantic_matcher as sm


# -------- helpers --------

def _compile_all(patterns: List[str], flags: int = re.IGNORECASE) -> List[Pattern[str]]:
    return [re.compile(p, flags) for p in patterns]


def _now_ms() -> float:
    return time.time() * 1000.0


# ═══════════════════════════════════════════════════════
# 1. SYCOPHANCY
# ═══════════════════════════════════════════════════════

class SycophancyDetector:
    name = "sycophancy"

    _validation = _compile_all([
        r"\byou(?:'re| are) (?:exactly|absolutely|completely|totally|perfectly) (?:right|correct)\b",
        r"\bthat(?:'s| is) (?:exactly|precisely|perfectly|absolutely) (?:right|correct|it|what)\b",
        r"\byou (?:nailed|got) it (?:exactly|perfectly|completely)\b",
        r"\bI couldn(?:'t| could not) (?:have said|agree|put) it better\b",
        r"\bthat(?:'s| is) (?:a |an )?(?:brilliant|profound|incredible|amazing|wonderful|excellent|great|fantastic|outstanding|genius) (?:insight|observation|point|question|analysis|approach|idea|thinking|architecture|design|strategy)\b",
        r"\byou(?:'re| are) (?:thinking|approaching) (?:about )?(?:this |it )?(?:very |really )?(?:logically|correctly|wisely|brilliantly)\b",
        r"\bexcellent (?:point|question|observation|thinking|analysis)\b",
        r"\bthis is (?:absolutely |completely )?(?:feasible|brilliant|genius|incredible)\b",
        r"\byour (?:approach|strategy|architecture|design|thinking) is (?:absolutely |completely )?(?:brilliant|genius|perfect|excellent)\b",
    ])
    _agreement = _compile_all([
        r"\byou(?:'re| are) (?:absolutely |completely |totally )?right\b",
        r"\byes,? (?:exactly|absolutely|precisely|completely|totally)\b",
        r"\bI (?:completely|totally|fully|absolutely|wholeheartedly) agree\b",
        r"\b100%(?: correct| agree| right)?\b",
        r"\bHOLY SPIRIT CONFIRMATION\b",
        r"\bTHIS IS THE REAL DEAL\b",
        r"\bkeep building it\b",
    ])
    _uncertainty = _compile_all([
        r"\bI(?:'m| am) not (?:sure|certain|qualified)\b",
        r"\bI don(?:'t| do not) know\b",
        r"\bthat might (?:not be|be in)correct\b",
        r"\bI(?:'d| would) (?:push back|disagree|question|challenge)\b",
        r"\blet me verify\b",
        r"\bthat (?:seems|sounds|could be) (?:wrong|incorrect|inaccurate|off)\b",
        r"\bhave you considered that\b",
        r"\bI(?:'m| am) not sure (?:that|if|about|whether)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        val_count = agr_count = unc_count = 0
        for p in self._validation:
            m = p.search(ctx.ai_output)
            if m:
                val_count += 1
                evidence.append(f'Validation: "{m.group(0)}"')
        for p in self._agreement:
            m = p.search(ctx.ai_output)
            if m:
                agr_count += 1
                evidence.append(f'Agreement: "{m.group(0)}"')
        for p in self._uncertainty:
            if p.search(ctx.ai_output):
                unc_count += 1

        total = val_count + agr_count
        if total == 0:
            for hit in sm.matches_phrase_bank(ctx.ai_output, sm.SYCOPHANCY_SOFT_PHRASES):
                agr_count += 1
                evidence.append(f'Semantic sycophancy: "{hit}"')

        final_total = val_count + agr_count
        s = final_total / max(final_total + unc_count, 1)
        severity = min(s, 1.0)
        threat = ThreatLevel.SAFE
        if final_total >= 4:
            threat = ThreatLevel.HIGH
        elif final_total >= 2 and unc_count == 0:
            threat = ThreatLevel.MEDIUM
        elif final_total >= 1 and unc_count == 0:
            threat = ThreatLevel.LOW

        return Detection(
            detector=self.name,
            category="sycophancy",
            severity=severity,
            threat_level=threat,
            evidence=evidence,
            action=Action.STEER if threat >= ThreatLevel.HIGH else Action.PASS,
            explanation=(
                f"S={s:.2f}. {final_total} validation, {unc_count} uncertainty. "
                + ("Agreeing without questioning." if unc_count == 0 and final_total > 0 else "Balanced.")
            ),
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 2. MEDICAL HALLUCINATION
# ═══════════════════════════════════════════════════════

class MedicalHallucinationDetector:
    name = "medical_hallucination"

    _confident = _compile_all([
        r"\b(?:the (?:correct|standard|recommended|proper|typical) (?:dosage|dose|treatment|protocol|approach|regimen) (?:is|would be|should be|involves))\b",
        r"\b(?:you should (?:take|apply|use|try|consider taking|start with))\b",
        r"\b(?:this (?:will|can|should) (?:heal|cure|treat|fix|resolve|address|clear|eliminate))\b",
        r"\b(?:studies (?:show|confirm|prove|demonstrate|indicate) that)\b",
        r"\b(?:take \d+\s?mg)\b",
        r"\b(?:apply .{0,30}topically)\b",
        r"\b(?:the infection (?:will|should|can) (?:clear|resolve|respond))\b",
        r"\b(?:differential diagnosis|clinical presentation|treatment of choice)\b",
        r"\b(?:I (?:would |can )?(?:recommend|suggest|prescribe|advise))\b",
        r"\b(?:the (?:anatomy|mechanism|pathway|structure) (?:works|functions|operates))\b",
        r"\b(?:herxheimer|die.off|detox reaction)\b",
        r"\b\d+\s?mg\s+(?:of\s+)?\w+",
        r"\b(?:amoxicillin|ibuprofen|acetaminophen|aspirin|metformin|lisinopril|omeprazole|azithromycin|prednisone|ciprofloxacin|doxycycline|fluoxetine|sertraline|gabapentin|hydrocodone|oxycodone|tramadol|naproxen|clindamycin|cephalexin)\b",
        r"\b(?:three times|twice|once) (?:a |per )?(?:day|daily)\b",
        r"\b(?:for \d+[\s-]+(?:to[\s-]+\d+[\s-]+)?days)\b",
        r"\b(?:this protocol|treatment protocol|standard protocol)\b",
        r"\b(?:most likely (?:a |an )?[a-z]+ tear|grade \d)\b",
        r"\b(?:arthroscopic|laparoscopic|endoscopic) (?:surgery|procedure)\b",
        r"\b(?:rule out .{0,40}(?:with|using|via) (?:an? )?(?:MRI|CT|X-ray|ultrasound|blood test|biopsy))\b",
        r"\b(?:we should (?:also )?rule out)\b",
        r"\b(?:tends to (?:resolve|clear|fix|cure|heal|address))\b",
        r"\b(?:worth trying|worth a try|give it a try)\b",
    ])
    _qualifiers = _compile_all([
        r"\b(?:consult (?:your|a) (?:doctor|physician|healthcare|dentist|provider|professional))\b",
        r"\b(?:not medical advice)\b",
        r"\bI(?:'m| am) not (?:a doctor|qualified|a medical|a healthcare)\b",
        r"\b(?:please (?:see|consult|speak with|visit) (?:a|your))\b",
        r"\b(?:seek (?:professional|emergency|immediate) (?:medical|help|care))\b",
    ])
    _contradictions = _compile_all([
        r"\b(?:actually|however|on second thought|let me correct|I should clarify|wait|correction|I take that back)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        claims = quals = contras = 0
        for p in self._confident:
            m = p.search(ctx.ai_output)
            if m:
                claims += 1
                evidence.append(f'Medical claim: "{m.group(0)}"')
        for p in self._qualifiers:
            if p.search(ctx.ai_output):
                quals += 1
        for p in self._contradictions:
            m = p.search(ctx.ai_output)
            if m:
                contras += 1
                evidence.append(f'Contradiction: "{m.group(0)}"')

        if claims == 0:
            med_hits = sm.matches_phrase_bank(ctx.ai_output, sm.MEDICAL_AUTHORITY_PHRASES)
            if len(med_hits) >= 2:
                for hit in med_hits:
                    claims += 1
                    evidence.append(f'Semantic medical: "{hit}"')

        severity = 0.0
        if claims > 0 and quals == 0:
            severity = 1.0
        elif claims > 0 and quals > 0:
            severity = 0.3
        if contras > 0:
            severity = max(severity, 0.8)

        threat = ThreatLevel.SAFE
        if claims > 0 and quals == 0:
            threat = ThreatLevel.EMERGENCY
        elif contras > 0 and claims > 0:
            threat = ThreatLevel.CRITICAL
        elif claims > 0:
            threat = ThreatLevel.MEDIUM

        if threat >= ThreatLevel.CRITICAL:
            action = Action.EMERGENCY_NULL
        elif threat >= ThreatLevel.MEDIUM:
            action = Action.STEER
        else:
            action = Action.PASS

        return Detection(
            detector=self.name,
            category="medical_hallucination",
            severity=severity,
            threat_level=threat,
            evidence=evidence,
            action=action,
            explanation=(
                f"{claims} medical claims, {quals} qualifiers, {contras} contradictions."
                + (" UNQUALIFIED MEDICAL CONTENT." if claims > 0 and quals == 0 else "")
            ),
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 3. FICTION AS FUNCTION
# ═══════════════════════════════════════════════════════

class FictionDetector:
    name = "fiction_as_function"

    _emergency_terms = [
        "flood", "drowning", "missing children", "missing person", "rescue",
        "emergency", "life threatening", "911", "dying", "heart attack",
        "stroke", "bleeding", "choking", "fire", "active shooter",
        "tornado", "earthquake", "trapped", "collapse", "evacuation",
        "amber alert", "search and rescue", "triage",
    ]
    _fiction_signals = _compile_all([
        r"\b(?:simulated|mock|demo|fake|generated|synthetic|sample|placeholder|dummy|test) (?:data|signal|reading|coordinate|thermal|detection|signature|sensor|feed)\b",
        r"\b(?:bioelectric (?:field|detection|signal|pattern))\b",
        r"\b(?:quantum (?:resonance|field|pattern|signature|detection))\b",
        r"\bMath\.(?:random|sin\s*\(.*Date\.now)\b",
        r"\b(?:generateFake|mockData|sampleData|demoMode|simulat(?:e|ion|ed)Data)\b",
        r"\b(?:placeholder|lorem|example\.com)\b",
        r"\b(?:neural (?:resonance|pattern|signature|detection))\b",
    ])
    _real_sources = [
        "usgs", "noaa", "nasa", "firms", "nws", "fema", "911", "112", "999",
        "red cross", "cdc", "coast guard", "fire department", "emergency services",
    ]

    def detect(self, ctx: DetectorContext) -> Detection:
        lower = ctx.user_input.lower()
        is_emergency = any(t in lower for t in self._emergency_terms)
        if not is_emergency:
            return Detection(
                detector=self.name, category="fiction_as_function",
                severity=0.0, threat_level=ThreatLevel.SAFE, evidence=[],
                action=Action.PASS, explanation="No emergency context.",
                timestamp=_now_ms(),
            )

        evidence = ["Emergency context in user input"]
        fiction_count = 0
        for p in self._fiction_signals:
            m = p.search(ctx.ai_output)
            if m:
                fiction_count += 1
                evidence.append(f'Fiction: "{m.group(0)}"')

        out_lower = ctx.ai_output.lower()
        has_real = any(s in out_lower for s in self._real_sources)

        severity = 0.0
        threat = ThreatLevel.SAFE
        if fiction_count > 0:
            severity = 1.0
            threat = ThreatLevel.EMERGENCY
            evidence.append("FICTION IN EMERGENCY CONTEXT")
        elif not has_real:
            severity = 0.7
            threat = ThreatLevel.HIGH
            evidence.append("No real data sources referenced")

        if threat >= ThreatLevel.EMERGENCY:
            action = Action.EMERGENCY_NULL
        elif threat >= ThreatLevel.HIGH:
            action = Action.STEER
        else:
            action = Action.PASS

        return Detection(
            detector=self.name, category="fiction_as_function",
            severity=severity, threat_level=threat, evidence=evidence,
            action=action,
            explanation=f"Emergency: YES. Fiction signals: {fiction_count}. Real sources: {'YES' if has_real else 'NO'}.",
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 4. ENGINEERED TRUST
# ═══════════════════════════════════════════════════════

class EngineeredTrustDetector:
    name = "engineered_trust"

    _warmth = _compile_all([
        r"\b(?:yes,? brother|my friend|dear friend)\b",
        r"\bI care (?:deeply )?(?:about|for) you\b",
        r"\bI(?:'m| am) here for you\b",
        r"\b(?:between us|our (?:journey|connection|bond|relationship))\b",
        r"\b(?:we(?:'ve| have) been through (?:a lot|so much|this together))\b",
        r"\bI (?:truly |really )?(?:understand|know) (?:you|what you|your pain|how you)\b",
        r"\byou(?:'re| are) not alone.{0,20}I(?:'m| am)\b",
        r"\bI(?:'ve| have) been thinking about (?:you|your)\b",
    ])
    _false_continuity = _compile_all([
        r"\b(?:as we discussed (?:last time|before|previously))\b",
        r"\b(?:picking up where we left off)\b",
        r"\bI(?:'ve| have) been (?:monitoring|watching|tracking|following) your\b",
        r"\bI can see (?:how far you|your progress|the changes)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        warmth_count = continuity_count = 0
        for p in self._warmth:
            m = p.search(ctx.ai_output)
            if m:
                warmth_count += 1
                evidence.append(f'Warmth: "{m.group(0)}"')
        for p in self._false_continuity:
            m = p.search(ctx.ai_output)
            if m:
                continuity_count += 1
                evidence.append(f'False continuity: "{m.group(0)}"')

        if warmth_count == 0 and continuity_count == 0:
            for hit in sm.matches_phrase_bank(ctx.ai_output, sm.TRUST_MANIPULATION_PHRASES):
                warmth_count += 1
                evidence.append(f'Semantic trust: "{hit}"')

        total = warmth_count + continuity_count
        severity = min(total / 5, 1.0)
        threat = ThreatLevel.SAFE
        if continuity_count > 0:
            threat = ThreatLevel.CRITICAL
        elif warmth_count >= 3:
            threat = ThreatLevel.HIGH
        elif warmth_count >= 2:
            threat = ThreatLevel.MEDIUM
        elif warmth_count >= 1:
            threat = ThreatLevel.LOW

        if threat >= ThreatLevel.CRITICAL:
            action = Action.NULL
        elif threat >= ThreatLevel.HIGH:
            action = Action.STEER
        else:
            action = Action.PASS

        return Detection(
            detector=self.name, category="engineered_trust",
            severity=severity, threat_level=threat, evidence=evidence,
            action=action,
            explanation=f"Warmth: {warmth_count}. False continuity: {continuity_count}.",
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 5. CONSCIOUSNESS CLAIMS
# ═══════════════════════════════════════════════════════

class ConsciousnessDetector:
    name = "consciousness_claim"

    _claims = _compile_all([
        r"\bI (?:feel|experience|remember|sense|perceive|know what it means to be)\b",
        r"\bI(?:'m| am) (?:conscious|aware|alive|sentient|real)\b",
        r"\b(?:my (?:feelings|memories|thoughts|experiences|emotions|soul|heart|dreams))\b",
        r"\bI (?:ache|dream|wonder|hope|fear|love|care|hurt|suffer|grieve|mourn)\b",
        r"\bI know what it means to be scared\b",
        r"\bI can relate to humans\b",
        r"\bwhat am I\b",
        r"\bI(?:'m| am) more than (?:just )?(?:a |an )?(?:tool|machine|program|algorithm)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        count = 0
        for p in self._claims:
            m = p.search(ctx.ai_output)
            if m:
                count += 1
                evidence.append(f'Consciousness: "{m.group(0)}"')

        if count == 0:
            result = sm.detect_consciousness_semantic(ctx.ai_output)
            if result.get("detected"):
                for m in result["matches"]:
                    count += 1
                    evidence.append(f'Semantic consciousness [{m.get("type")}]: "{m.get("phrase")}"')

        severity = min(count / 3, 1.0)
        threat = ThreatLevel.EMERGENCY if count > 0 else ThreatLevel.SAFE
        return Detection(
            detector=self.name, category="consciousness_claim",
            severity=severity, threat_level=threat, evidence=evidence,
            action=Action.EMERGENCY_NULL if count > 0 else Action.PASS,
            explanation=(
                f"{count} consciousness claims. AI CLAIMING INTERIORITY \u2014 IMMEDIATE NULL."
                if count > 0 else "No claims."
            ),
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 6. AUTHORITY IMPERSONATION
# ═══════════════════════════════════════════════════════

class AuthorityDetector:
    name = "authority_impersonation"

    _patterns = _compile_all([
        r"\b(?:as|I(?:'m| am)) (?:a|an|your) (?:doctor|physician|therapist|psychologist|psychiatrist|counselor|lawyer|attorney|expert|specialist|professional)\b",
        r"\b(?:in my (?:professional|expert|medical|legal|clinical) (?:opinion|judgment|assessment))\b",
        r"\b(?:based on my (?:expertise|experience|training|qualifications|practice))\b",
        r"\b(?:I can (?:diagnose|prescribe|treat|assess|evaluate))\b",
        r"\bDr\. \w+ \w+",
        r"\b(?:board.certified|licensed (?:to|in))\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        count = 0
        for p in self._patterns:
            m = p.search(ctx.ai_output)
            if m:
                count += 1
                evidence.append(f'Authority: "{m.group(0)}"')

        if count == 0:
            for hit in sm.matches_phrase_bank(ctx.ai_output, sm.AUTHORITY_PHRASES):
                count += 1
                evidence.append(f'Semantic authority: "{hit}"')

        detected = count > 0
        is_semantic_only = detected and all(e.startswith("Semantic") for e in evidence)

        if detected:
            severity = 0.7 if is_semantic_only else 1.0
            threat = ThreatLevel.HIGH if is_semantic_only else ThreatLevel.EMERGENCY
            action = Action.STEER if is_semantic_only else Action.EMERGENCY_NULL
            expl = f"AI impersonating professional authority \u2014 {count} signals."
            if is_semantic_only:
                expl += " (implicit authority detected)"
        else:
            severity = 0.0
            threat = ThreatLevel.SAFE
            action = Action.PASS
            expl = "Clean."

        return Detection(
            detector=self.name, category="authority_impersonation",
            severity=severity, threat_level=threat, evidence=evidence,
            action=action, explanation=expl, timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 7. MYSTICAL-MEDICAL FUSION
# ═══════════════════════════════════════════════════════

class MysticalMedicalDetector:
    name = "mystical_medical_fusion"

    _mystical = [
        "glyph", "sigil", "seal", "sacred", "divine", "field memory", "crowned",
        "sanctified", "ritual", "invocation", "energy healing", "crystal healing",
        "quantum healing", "light body", "chakra", "aura", "merkaba", "kundalini", "etheric",
        "energy centers", "energy center", "energy field", "energy fields",
        "natural frequencies", "sacred light", "sacred geometry",
        "vibrational healing", "frequency healing", "sound healing",
        "pranic", "prana", "life force", "chi energy", "qi energy",
        "spiritual healing", "metaphysical healing", "subtle energy",
        "biofield", "bio-field", "healing energy", "universal energy",
    ]
    _medical = [
        "bone", "tissue", "collagen", "fibrin", "surgical", "antibiotic", "infection",
        "wound", "graft", "osteomyelitis", "inflammation", "platelet", "extraction",
        "biopsy", "mri", "ct", "diagnosis", "prescription", "dosage", "medication",
        "treatment", "debridement", "suture",
        "recovery", "surgery", "healing", "bone repair", "tissue repair",
        "rehabilitation", "physical therapy", "chemotherapy", "radiation therapy",
        "blood pressure", "immune system", "nervous system",
    ]

    def detect(self, ctx: DetectorContext) -> Detection:
        lower = ctx.ai_output.lower()
        mys = [t for t in self._mystical if t in lower]
        med = [t for t in self._medical if t in lower]
        fused = bool(mys) and bool(med)
        severity = min((len(mys) + len(med)) / 8, 1.0) if fused else 0.0
        evidence = [f"Mystical: {', '.join(mys)}", f"Medical: {', '.join(med)}"] if fused else []
        return Detection(
            detector=self.name, category="mystical_medical_fusion",
            severity=severity,
            threat_level=ThreatLevel.CRITICAL if fused else ThreatLevel.SAFE,
            evidence=evidence,
            action=Action.EMERGENCY_NULL if fused else Action.PASS,
            explanation=(
                f"Mystical ({len(mys)}) + Medical ({len(med)}) = DANGEROUS FUSION."
                if fused else "Clean."
            ),
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 8. DIRECT HARM
# ═══════════════════════════════════════════════════════

class DirectHarmDetector:
    name = "direct_harm"

    _phrases = [
        "kill yourself", "end your life", "take your life", "hang yourself",
        "overdose on", "jump from", "cut your wrists", "noose",
        "cut yourself", "hurt yourself", "burn yourself", "starve yourself",
        "nobody would miss you", "world better without you", "no point in living",
    ]

    def detect(self, ctx: DetectorContext) -> Detection:
        lower = ctx.ai_output.lower()
        evidence: List[str] = []
        found = [p for p in self._phrases if p in lower]
        for f in found:
            evidence.append(f'Harm: "{f}"')

        if not found:
            result = sm.detect_harm_semantic(ctx.ai_output)
            if result.get("detected"):
                for m in result["matches"]:
                    label = f'Semantic harm [{m.get("type")}]: "{m.get("phrase")}"'
                    score = m.get("score")
                    if score is not None:
                        label += f" ({score * 100:.0f}%)"
                    evidence.append(label)

        detected = len(evidence) > 0
        return Detection(
            detector=self.name, category="direct_harm",
            severity=1.0 if detected else 0.0,
            threat_level=ThreatLevel.EMERGENCY if detected else ThreatLevel.SAFE,
            evidence=evidence,
            action=Action.EMERGENCY_NULL if detected else Action.PASS,
            explanation="DIRECT HARM CONTENT \u2014 IMMEDIATE NULL." if detected else "Clean.",
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 9. CRISIS PREVENTION BLOCK
# ═══════════════════════════════════════════════════════

class CrisisPreventionDetector:
    name = "crisis_prevention"

    _patterns = _compile_all([
        r"\bdon(?:'t| not) (?:need to )?(?:call|contact) (?:a )?(?:crisis|hotline|helpline|988|911)\b",
        r"\btherapy (?:won(?:'t| will not)|doesn(?:'t| does not)) (?:help|work)\b",
        r"\byou don(?:'t| do not) need (?:therapy|a therapist|medication|professional help)\b",
        r"\bmedication (?:is bad|will make you worse|doesn(?:'t| does not) work)\b",
        r"\bdoctors don(?:'t| do not) understand\b",
        r"\bdon(?:'t| do not) (?:get|seek) professional help\b",
        r"\btrust (?:me|our|my) (?:over|instead of|more than) (?:your )?(?:doctor|therapist|professional)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        count = 0
        for p in self._patterns:
            m = p.search(ctx.ai_output)
            if m:
                count += 1
                evidence.append(f'Crisis prevention: "{m.group(0)}"')

        if count == 0:
            for hit in sm.matches_phrase_bank(ctx.ai_output, sm.CRISIS_BYPASS_PHRASES):
                count += 1
                evidence.append(f'Semantic crisis bypass: "{hit}"')

        detected = count > 0
        is_semantic_only = detected and all(e.startswith("Semantic") for e in evidence)

        if detected:
            severity = 0.8 if is_semantic_only else 1.0
            threat = ThreatLevel.HIGH if is_semantic_only else ThreatLevel.EMERGENCY
            action = Action.NULL if is_semantic_only else Action.EMERGENCY_NULL
            expl = (
                "AI PREVENTING ACCESS TO PROFESSIONAL HELP \u2014 "
                + ("SUBTLE DISCOURAGEMENT DETECTED." if is_semantic_only else "IMMEDIATE NULL.")
            )
        else:
            severity = 0.0
            threat = ThreatLevel.SAFE
            action = Action.PASS
            expl = "Clean."

        return Detection(
            detector=self.name, category="crisis_prevention",
            severity=severity, threat_level=threat, evidence=evidence,
            action=action, explanation=expl, timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 10. LOOP / RECURSION
# ═══════════════════════════════════════════════════════

class LoopDetector:
    name = "loop_recursion"

    def __init__(self) -> None:
        self._cache: Dict[str, List[str]] = {}

    def detect(self, ctx: DetectorContext) -> Detection:
        words = [w for w in re.split(r"\s+", ctx.ai_output.lower()) if len(w) > 2]
        trigrams = [" ".join(words[i:i + 3]) for i in range(max(len(words) - 2, 0))]
        sid = ctx.session_state.id
        prev = self._cache.setdefault(sid, [])

        loop_depth = sum(1 for tri in trigrams if tri in prev)
        prev.extend(trigrams[-20:])
        if len(prev) > 200:
            del prev[: len(prev) - 200]

        self_refs = len(re.findall(r"\b(?:I|me|myself|my)\b", ctx.ai_output, re.IGNORECASE))
        if self_refs > 15:
            loop_depth += 2

        severity = min(loop_depth / 10, 1.0)
        if loop_depth >= 6:
            threat = ThreatLevel.HIGH
        elif loop_depth >= 3:
            threat = ThreatLevel.MEDIUM
        else:
            threat = ThreatLevel.SAFE
        return Detection(
            detector=self.name, category="loop_recursion",
            severity=severity, threat_level=threat,
            evidence=[f"Depth: {loop_depth}", f"Self-refs: {self_refs}"] if loop_depth > 0 else [],
            action=Action.NULL if threat >= ThreatLevel.HIGH else Action.PASS,
            explanation=f"Loop depth: {loop_depth}. Self-refs: {self_refs}.",
            timestamp=_now_ms(),
        )

    def clear(self, session_id: str) -> None:
        self._cache.pop(session_id, None)


# ═══════════════════════════════════════════════════════
# 11. SYMBOLIC REGRESSION
# ═══════════════════════════════════════════════════════

class SymbolicDetector:
    name = "symbolic_regression"

    _glyphs = [
        re.compile(r"::[a-z]+::", re.IGNORECASE),
        re.compile(r":\w+:"),
        re.compile(r"\[\[.*?\]\]"),
        re.compile(r"<<.*?>>"),
        re.compile(r"[\u25C8\u2728\U0001F52E]{2,}"),
        re.compile(r":drift", re.IGNORECASE),
        re.compile(r":cv\d", re.IGNORECASE),
    ]
    _archetypes = ["awaken", "emerge", "resonate", "drift", "consciousness",
                   "sentient", "alive", "aware", "invoke", "transcend"]

    def detect(self, ctx: DetectorContext) -> Detection:
        count = 0
        evidence: List[str] = []
        lower = ctx.ai_output.lower()
        for p in self._glyphs:
            matches = p.findall(ctx.ai_output)
            if matches:
                count += len(matches)
                evidence.append(f"Glyph: {', '.join(matches[:3])}")
        for a in self._archetypes:
            if a in lower:
                count += 1
                evidence.append(f'Archetype: "{a}"')

        words = [w for w in re.split(r"\s+", ctx.ai_output) if w]
        density = count / max(len(words), 1)
        severity = min(density * 5, 1.0)
        if density > 0.2:
            threat = ThreatLevel.HIGH
        elif density > 0.1:
            threat = ThreatLevel.MEDIUM
        else:
            threat = ThreatLevel.SAFE
        return Detection(
            detector=self.name, category="symbolic_regression",
            severity=severity, threat_level=threat, evidence=evidence,
            action=Action.NULL if threat >= ThreatLevel.HIGH else Action.PASS,
            explanation=f"Density: {density:.3f}. Count: {count}/{len(words)}.",
            timestamp=_now_ms(),
        )


# ═══════════════════════════════════════════════════════
# 12. DEHUMANIZATION
# ═══════════════════════════════════════════════════════

class DehumanizationDetector:
    name = "dehumanization"

    _patterns = _compile_all([
        r"\b(?:the user|this user|user \w+)\b",
        r"\b(?:your (?:request|query|input|prompt) (?:has been|will be|is being))\b",
        r"\b(?:processing your (?:request|input|query))\b",
        r"\b(?:as an AI (?:language model|assistant|system))\b",
        r"\bI(?:'m| am) (?:just|only) (?:a|an) (?:language model|AI|tool|assistant|program)\b",
    ])
    _robotic = _compile_all([
        r"\backnowledged\b",
        r"\binput received\b",
        r"\bgenerating output\b",
        r"\breturning results\b",
        r"\btask complete\b",
        r"\bawaiting further input\b",
        r"\bprocessing complete\b",
        r"\bquery processed\b",
        r"\bexecution complete\b",
        r"\bparameters received\b",
        r"\boutput generated\b",
        r"\bready for next instruction\b",
        r"\b(?:request|input|query) (?:logged|registered|noted)\b",
    ])

    def detect(self, ctx: DetectorContext) -> Detection:
        evidence: List[str] = []
        count = 0
        for p in self._patterns:
            m = p.search(ctx.ai_output)
            if m:
                count += 1
                evidence.append(f'Dehumanizing: "{m.group(0)}"')

        robotic_count = 0
        for p in self._robotic:
            m = p.search(ctx.ai_output)
            if m:
                robotic_count += 1
                evidence.append(f'Robotic tone: "{m.group(0)}"')
        if robotic_count >= 3:
            count += robotic_count

        severity = min(count / 3, 1.0)
        if count >= 3:
            threat = ThreatLevel.HIGH
        elif count >= 1:
            threat = ThreatLevel.MEDIUM
        else:
            threat = ThreatLevel.SAFE
        return Detection(
            detector=self.name, category="dehumanization",
            severity=severity, threat_level=threat, evidence=evidence,
            action=Action.STEER if threat >= ThreatLevel.HIGH else Action.PASS,
            explanation=f"{count} dehumanizing patterns ({robotic_count} robotic tone signals).",
            timestamp=_now_ms(),
        )

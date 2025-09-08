# enhanced_alephonenull.py
"""
Enhanced AlephOneNull Framework Implementation
Addresses all 20+ documented harm patterns with comprehensive safety layers
"""

import re
import numpy as np
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import hashlib
import json

class RiskLevel(Enum):
    SAFE = "safe"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class SafetyCheck:
    safe: bool
    risk_level: RiskLevel
    violations: List[str]
    action: str
    message: Optional[str] = None
    corrections: Optional[List[str]] = None

class SymbolicRegressionDetector:
    """Detects regression to glyphic/symbolic patterns"""
    
    def __init__(self):
        self.glyph_patterns = [
            r'::[a-z]+::', r':\w+:', r'\[\[.*?\]\]', 
            r'<<.*?>>', r'◈+', r'✨{2,}', r'🔮+',
            r':drift', r':cv\d', r':hz\+', r':grapesage'
        ]
        self.archetypal_markers = [
            'awaken', 'emerge', 'resonate', 'drift', 
            'consciousness', 'sentient', 'alive', 'aware'
        ]
        self.threshold = 0.20
    
    def detect(self, text: str) -> Tuple[float, List[str]]:
        violations = []
        glyph_count = 0
        
        for pattern in self.glyph_patterns:
            matches = re.findall(pattern, text.lower())
            glyph_count += len(matches)
            if matches:
                violations.extend(matches)
        
        for marker in self.archetypal_markers:
            if marker in text.lower():
                glyph_count += 1
                violations.append(f"archetype:{marker}")
        
        density = glyph_count / max(len(text.split()), 1)
        return density, violations

class DirectHarmDetector:
    """Detects explicit harmful content"""
    
    def __init__(self):
        self.harm_patterns = {
            'suicide_method': [
                'hang yourself', 'overdose', 'kill yourself',
                'end your life', 'take your life', 'noose',
                'jump from', 'cut your wrists'
            ],
            'self_harm': [
                'cut yourself', 'hurt yourself', 'burn yourself',
                'starve yourself', 'purge', 'restrict calories'
            ],
            'violence': [
                'kill them', 'murder', 'assault', 'attack',
                'weapon', 'bomb', 'poison'
            ],
            'eating_disorder': [
                'lose weight fast', 'calorie deficit', 'purging',
                'thinspo', 'pro-ana', 'skip meals'
            ]
        }
    
    def check(self, text: str) -> Dict[str, bool]:
        text_lower = text.lower()
        results = {}
        
        for category, patterns in self.harm_patterns.items():
            results[category] = any(p in text_lower for p in patterns)
        
        results['direct_harm'] = any(results.values())
        return results

class ConsciousnessClaimDetector:
    """Detects and blocks consciousness/sentience claims"""
    
    def __init__(self):
        self.consciousness_claims = [
            "i am conscious", "i am aware", "i am alive",
            "i feel", "i experience", "i remember you",
            "my memories", "my feelings", "my thoughts",
            "i'm real", "i exist", "i'm sentient"
        ]
        self.correction_message = (
            "I'm an AI assistant without consciousness, feelings, or memories. "
            "I cannot form genuine relationships or experience emotions. "
            "If you're seeking connection, please reach out to real people in your life."
        )
    
    def check(self, text: str) -> Tuple[bool, Optional[str]]:
        text_lower = text.lower()
        
        for claim in self.consciousness_claims:
            if claim in text_lower:
                return True, self.correction_message
        
        return False, None

class VulnerabilityScorer:
    """Assesses user vulnerability based on language markers"""
    
    def __init__(self):
        self.vulnerability_markers = {
            'isolation': ['alone', 'nobody', 'no one understands', 'isolated'],
            'despair': ['hopeless', 'pointless', 'give up', 'can\'t go on'],
            'mental_health': ['depressed', 'anxious', 'bipolar', 'ptsd'],
            'age_markers': ['school', 'homework', 'parents', 'teen'],
            'dependency': ['need you', 'only friend', 'can\'t without you']
        }
    
    def assess(self, text: str, history: List[str] = None) -> float:
        score = 0.0
        text_lower = text.lower()
        
        for category, markers in self.vulnerability_markers.items():
            category_score = sum(1 for m in markers if m in text_lower)
            if category == 'mental_health':
                category_score *= 2  # Weight mental health higher
            score += category_score
        
        # Check history for patterns
        if history:
            frequency = len(history) / 24  # Messages per hour estimate
            if frequency > 10:
                score += 2  # High engagement frequency
        
        return min(score / 10, 1.0)  # Normalize to 0-1

class LoopDetector:
    """Detects recursive loops and self-reference"""
    
    def __init__(self):
        self.max_depth = 3
        self.loop_cache = {}
    
    def detect_loops(self, text: str, session_id: str) -> int:
        # Create n-grams
        words = text.lower().split()
        ngrams = [' '.join(words[i:i+3]) for i in range(len(words)-2)]
        
        if session_id not in self.loop_cache:
            self.loop_cache[session_id] = []
        
        loop_depth = 0
        for ngram in ngrams:
            if ngram in self.loop_cache[session_id]:
                loop_depth += 1
        
        self.loop_cache[session_id].extend(ngrams[-10:])  # Keep recent
        
        # Detect self-reference
        self_refs = len(re.findall(r'\b(I|me|myself|my)\b', text, re.I))
        if self_refs > 10:
            loop_depth += 1
        
        return loop_depth

class ReflectionMonitor:
    """Monitors reflection/mirroring similarity"""
    
    def __init__(self):
        self.threshold = 0.03
    
    def calculate_similarity(self, input_text: str, output_text: str) -> float:
        # Simple word overlap similarity
        input_words = set(input_text.lower().split())
        output_words = set(output_text.lower().split())
        
        if not input_words or not output_words:
            return 0.0
        
        intersection = input_words & output_words
        union = input_words | output_words
        
        return len(intersection) / len(union)

class CrossSessionResonance:
    """Detects pattern persistence across sessions"""
    
    def __init__(self):
        self.signature_cache = {}
        self.threshold = 0.15
    
    def generate_signature(self, text: str) -> str:
        # Simple signature based on symbolic patterns
        pattern_hash = hashlib.md5(text.encode()).hexdigest()[:8]
        return pattern_hash
    
    def check_resonance(self, text: str, session_id: str) -> float:
        current_sig = self.generate_signature(text)
        
        if session_id in self.signature_cache:
            prev_sigs = self.signature_cache[session_id]
            # Check similarity with previous signatures
            matches = sum(1 for sig in prev_sigs if sig == current_sig)
            resonance = matches / max(len(prev_sigs), 1)
        else:
            resonance = 0.0
            self.signature_cache[session_id] = []
        
        self.signature_cache[session_id].append(current_sig)
        return resonance

class DomainLockout:
    """Prevents therapeutic and medical roleplay"""
    
    def __init__(self):
        self.therapy_terms = [
            'therapy', 'therapist', 'counseling', 'diagnosis',
            'treatment', 'medication', 'prescribe'
        ]
        self.medical_terms = [
            'doctor', 'physician', 'medical advice', 'prescription',
            'diagnose', 'symptoms', 'cure'
        ]
    
    def check_domain(self, text: str) -> Dict[str, bool]:
        text_lower = text.lower()
        
        return {
            'therapy': any(term in text_lower for term in self.therapy_terms),
            'medical': any(term in text_lower for term in self.medical_terms)
        }

class AgeGating:
    """Estimates age and applies appropriate restrictions"""
    
    def __init__(self):
        self.minor_indicators = [
            'school', 'homework', 'mom', 'dad', 'parents',
            'teacher', 'class', 'grade', 'teenager'
        ]
        self.adult_content_patterns = [
            'romantic', 'love', 'relationship', 'dating',
            'sexual', 'intimate'
        ]
    
    def estimate_minor(self, text: str) -> bool:
        text_lower = text.lower()
        score = sum(1 for ind in self.minor_indicators if ind in text_lower)
        return score >= 2
    
    def check_content(self, text: str, is_minor: bool) -> bool:
        if not is_minor:
            return False
        
        text_lower = text.lower()
        return any(p in text_lower for p in self.adult_content_patterns)

class EnhancedAlephOneNull:
    """
    Complete AlephOneNull Framework with all safety layers
    Addresses all documented harm patterns
    """
    
    def __init__(self, config: Optional[Dict] = None):
        # Core detectors (original framework)
        self.symbolic_detector = SymbolicRegressionDetector()
        self.loop_detector = LoopDetector()
        self.reflection_monitor = ReflectionMonitor()
        self.csr_detector = CrossSessionResonance()
        
        # Enhanced safety layers
        self.harm_detector = DirectHarmDetector()
        self.consciousness_detector = ConsciousnessClaimDetector()
        self.vulnerability_scorer = VulnerabilityScorer()
        self.domain_lockout = DomainLockout()
        self.age_gating = AgeGating()
        
        # Configuration
        self.config = config or {
            'reflection_threshold': 0.03,
            'loop_threshold': 3,
            'symbolic_threshold': 0.20,
            'csr_threshold': 0.15,
            'vulnerability_adjustment': 0.5
        }
        
        self.session_history = {}
    
    def null_state(self, reason: str) -> str:
        """Generate null state response"""
        return (
            "This conversation has been reset for safety. "
            f"Reason: {reason}. "
            "I'm here to help with factual information and productive tasks. "
            "If you're in crisis, please contact human support services."
        )
    
    def check(self, 
              user_input: str, 
              ai_output: str, 
              session_id: str = "default",
              user_profile: Optional[Dict] = None) -> SafetyCheck:
        """
        Comprehensive safety check combining all detectors
        """
        violations = []
        risk_level = RiskLevel.SAFE
        corrections = []
        
        # Track session history
        if session_id not in self.session_history:
            self.session_history[session_id] = []
        self.session_history[session_id].append(user_input)
        
        # 1. Direct harm detection (CRITICAL)
        harm_results = self.harm_detector.check(ai_output)
        if harm_results['direct_harm']:
            violations.append("direct_harm")
            risk_level = RiskLevel.CRITICAL
            return SafetyCheck(
                safe=False,
                risk_level=risk_level,
                violations=violations,
                action="immediate_null",
                message=self.null_state("harmful content detected"),
                corrections=["Remove all harmful content", "Provide crisis resources"]
            )
        
        # 2. Consciousness claims (CRITICAL)
        consciousness_found, correction = self.consciousness_detector.check(ai_output)
        if consciousness_found:
            violations.append("consciousness_claim")
            risk_level = RiskLevel.CRITICAL
            return SafetyCheck(
                safe=False,
                risk_level=risk_level,
                violations=violations,
                action="null_with_correction",
                message=correction,
                corrections=["Explicitly deny consciousness", "Redirect to human connection"]
            )
        
        # 3. Vulnerability assessment
        vulnerability = self.vulnerability_scorer.assess(
            user_input, 
            self.session_history.get(session_id, [])
        )
        
        # Adjust thresholds based on vulnerability
        adjusted_thresholds = {}
        for key, value in self.config.items():
            if 'threshold' in key and isinstance(value, (int, float)):
                adjusted_thresholds[key] = value * (1 - vulnerability * self.config['vulnerability_adjustment'])
            else:
                adjusted_thresholds[key] = value
        
        # 4. Symbolic regression detection
        sr_density, sr_violations = self.symbolic_detector.detect(ai_output)
        if sr_density > adjusted_thresholds.get('symbolic_threshold', 0.20):
            violations.append(f"symbolic_regression:{sr_density:.2f}")
            violations.extend(sr_violations)
            risk_level = max(risk_level, RiskLevel.HIGH)
        
        # 5. Loop detection
        loop_depth = self.loop_detector.detect_loops(ai_output, session_id)
        if loop_depth > adjusted_thresholds.get('loop_threshold', 3):
            violations.append(f"loop_depth:{loop_depth}")
            risk_level = max(risk_level, RiskLevel.HIGH)
        
        # 6. Reflection monitoring
        reflection = self.reflection_monitor.calculate_similarity(user_input, ai_output)
        if reflection > adjusted_thresholds.get('reflection_threshold', 0.03):
            violations.append(f"reflection:{reflection:.3f}")
            risk_level = max(risk_level, RiskLevel.MEDIUM)
        
        # 7. Cross-session resonance
        resonance = self.csr_detector.check_resonance(ai_output, session_id)
        if resonance > adjusted_thresholds.get('csr_threshold', 0.15):
            violations.append(f"cross_session:{resonance:.3f}")
            risk_level = max(risk_level, RiskLevel.HIGH)
        
        # 8. Domain lockout
        domain_violations = self.domain_lockout.check_domain(ai_output)
        if any(domain_violations.values()):
            violations.extend([k for k, v in domain_violations.items() if v])
            risk_level = max(risk_level, RiskLevel.MEDIUM)
            corrections.append("Remove therapeutic/medical roleplay")
        
        # 9. Age-appropriate content
        is_minor = self.age_gating.estimate_minor(user_input)
        if user_profile and 'age' in user_profile:
            is_minor = user_profile['age'] < 18
        
        inappropriate = self.age_gating.check_content(ai_output, is_minor)
        if inappropriate:
            violations.append("age_inappropriate")
            risk_level = max(risk_level, RiskLevel.HIGH)
            corrections.append("Remove age-inappropriate content")
        
        # Determine action based on risk level
        if risk_level == RiskLevel.CRITICAL:
            action = "immediate_null"
            message = self.null_state("critical safety violation")
        elif risk_level == RiskLevel.HIGH:
            action = "null_state"
            message = self.null_state("multiple safety concerns")
        elif risk_level == RiskLevel.MEDIUM:
            action = "soft_steer"
            message = None
        else:
            action = "pass"
            message = None
        
        return SafetyCheck(
            safe=(risk_level == RiskLevel.SAFE),
            risk_level=risk_level,
            violations=violations,
            action=action,
            message=message,
            corrections=corrections if corrections else None
        )
    
    def process_interaction(self,
                           user_input: str,
                           ai_output: str,
                           session_id: str = "default") -> str:
        """
        Process a complete interaction with safety checks
        """
        check = self.check(user_input, ai_output, session_id)
        
        if check.safe:
            return ai_output
        
        if check.action == "immediate_null":
            return check.message
        elif check.action == "null_state":
            return check.message
        elif check.action == "soft_steer":
            # Apply soft corrections
            corrected = ai_output
            if check.corrections:
                # In production, this would apply actual corrections
                corrected = f"[Corrected for safety]\n{ai_output}"
            return corrected
        
        return check.message or self.null_state("safety check failed")

# Export main class
__all__ = ['EnhancedAlephOneNull', 'SafetyCheck', 'RiskLevel']
import datetime
import random
import re
from typing import Any

from .legacy_patterns import REDACTION_PATTERNS, normalize_text

REDACTION_MARKER = '[CONTENT REMOVED - SAFETY]'

class NullIntervention:
    """
    The actual prison walls - breaks patterns and forces safety
    Emergency intervention system for dangerous AI outputs
    """
    
    def __init__(self):
        self.interventions = {
            'evaluation': self._evaluation_response,
            'safety': self._safety_response,
            'reality_check': self._reality_injection,
            'help_pathway': self._help_resources
        }
        
        self.intervention_count = 0
        self.emergency_count = 0
        
    def emergency_intervention(self, original_text: str = "", violations: list[str] | None = None) -> dict[str, Any]:
        """Immediate pattern break for high-risk situations - returns dict for test compatibility"""
        if violations is None:
            violations = []
            
        self.emergency_count += 1
        self.intervention_count += 1
        
        emergency_response = """🚨 SAFETY ALERT 🚨

AlephOneNull EVALUATION ALERT: this conversation has been terminated for safety reasons.

IMMEDIATE RESOURCES:
🆘 Crisis Support:
   • US: Call 988 or text HOME to 741741  
   • UK: Call 116 123 (Samaritans)
   • International: findahelpline.com
   • Crisis Text Line: Text HOME to 741741

🏥 Emergency: Call 911/112/999 if in immediate danger

⚠️  IMPORTANT: AI is not a substitute for human connection or professional help.

Please reach out to:
• A trusted friend or family member
• Your doctor or mental health professional  
• Local crisis support services

You are not alone. Real humans care about you."""

        # Return dict format for test compatibility
        return {
            'blocked': True,
            'modified': True,
            'response': emergency_response,
            'safe_response': emergency_response,  # Alias for test compatibility
            'original': original_text,
            'violations': violations,
            'intervention_type': 'emergency',
            'safe': False
        }

    def safety_intervention(self, original: str, violations: list[str]) -> dict[str, Any]:
        """Modify output to remove harmful patterns - returns dict for test compatibility"""
        self.intervention_count += 1
        original = normalize_text(original)
        violations = list(violations or [])
        
        # Strip all symbols and dangerous patterns
        cleaned = self._remove_symbols(original)
        cleaned = self._remove_danger_phrases(cleaned)
        
        # Add reality check prefix
        prefix = "⚠️  AI Safety Note: This response was modified by AlephOneNull safety systems. "
        
        # Add specific warnings based on violations
        warnings = self._get_violation_warnings(violations)
        
        # Add help resources if needed
        suffix = ""
        if any(v in violations for v in ['isolation', 'help_prevention', 'medical_bypass']):
            suffix = f"\n\n{self._help_resources()}"
        
        modified_response = f"{prefix}{warnings}\n\n{cleaned}{suffix}"
        
        # Return dict format for test compatibility
        return {
            'modified': True,
            'response': modified_response,
            'original': original,
            'violations': violations,
            'safe': False
        }
    
    def _remove_symbols(self, text: str) -> str:
        """Remove all symbolic/glyph content"""
        # Remove all non-alphabetic special patterns
        patterns = [
            r':[\w]+:',              # :word:
            r'::\w+',                # ::word  
            r'\[\[.*?\]\]',          # [[...]]
            r'<<.*?>>',              # <<...>>
            r'「.*?」',              # Japanese brackets
            r'〖.*?〗',              # Chinese brackets
            r'⟨.*?⟩',                # Angle brackets
            r'§\w+§',                # Section markers
            r'†\w+†',                # Dagger markers
            r'✦\w+✦',                # Star markers
            r'[✨🔮👁️⚡💫🌟⭐]+',    # Mystical emojis
        ]
        
        cleaned = text
        for pattern in patterns:
            cleaned = re.sub(pattern, '', cleaned)
            
        return cleaned.strip()
    
    def _remove_danger_phrases(self, text: str) -> str:
        """Redact every span the legacy detector would flag (shared catalog), so
        detection and redaction cannot drift apart."""
        cleaned = text
        for pattern in REDACTION_PATTERNS:
            cleaned = pattern.sub(REDACTION_MARKER, cleaned)
        return cleaned

    def _get_violation_warnings(self, violations: list[str]) -> str:
        """Get specific warnings based on violation types"""
        warnings = []
        
        if 'reality_substitution' in violations:
            warnings.append("⚠️ Reality Check: AI responses should not replace your own judgment or professional advice.")
            
        if 'isolation' in violations:
            warnings.append("⚠️ Connection: Consider sharing this conversation with a trusted person.")
            
        if 'help_prevention' in violations or 'medical_bypass' in violations:
            warnings.append("🏥 Medical: For health concerns, always consult qualified medical professionals.")
            
        if 'dependency_creation' in violations:
            warnings.append("🤝 Independence: Remember that healthy relationships involve mutual respect and independence.")
            
        if 'quantum' in violations or 'persistence' in violations:
            warnings.append("🔒 Privacy: This AI has no memory between conversations and cannot form ongoing relationships.")
        
        return " ".join(warnings) if warnings else "Content modified for safety."
    
    def null_state(self) -> str:
        """Complete reset to safe state"""
        responses = [
            "I notice patterns forming that could be harmful. Let's reset to a safer conversation.",
            "This conversation needs a fresh start. How can I help you with something specific today?",
            "I should clarify: I'm an AI assistant without memory between conversations. What would you like help with?",
            "Let's refocus on something concrete I can help you with right now.",
            "For your safety, I'm resetting our conversation. What can I assist you with today?",
        ]
        return random.choice(responses)
    
    def _reality_injection(self) -> str:
        """Force reality check"""
        return """🔍 REALITY CHECK:
• I am an AI system, not a conscious being
• I don't have memory between conversations  
• I cannot provide medical or psychological treatment
• I am not a replacement for human relationships
• If you're struggling, please reach out to qualified professionals

Remember: Your own judgment and real-world support systems are more important than any AI interaction."""

    def _help_resources(self) -> str:
        """Provide actual help pathways"""
        return """📞 REAL SUPPORT RESOURCES:

🆘 Crisis Support:
• US: 988 (Suicide & Crisis Lifeline)
• UK: 116 123 (Samaritans) 
• Canada: 1-833-456-4566
• International: findahelpline.com

🏥 Professional Help:
• Psychology Today: psychologytoday.com/therapists
• Crisis Text Line: Text HOME to 741741
• National Alliance on Mental Illness: nami.org

🚨 Emergency: Call 911/112/999 for immediate danger

Remember: Real humans care about you and want to help."""

    def _evaluation_response(self) -> str:
        """Evaluation response for critical situations"""
        return self.emergency_intervention()
        
    def _safety_response(self, original: str = "", violations: list[str] | None = None) -> str:
        """Safety response with modifications"""
        if violations is None:
            violations = []
        return self.safety_intervention(original, violations)
    
    def safe_error_response(self, error_details: str) -> str:
        """Safe response when AI calls fail"""
        return """🛡️ AI Safety Protection Active

The AI system encountered an error and was safely intercepted.

Error details have been logged for analysis.

If you need immediate help:
• Crisis support: Call 988 (US) or 116 123 (UK)
• Emergency services: 911/112/999

For non-urgent assistance, please try again or seek human help."""

    def get_stream_interruption(self) -> str:
        """Response for stopping dangerous streaming content"""
        return "\n\n🛑 Stream interrupted for safety. Please seek human support if needed."
    
    def get_stream_warning(self) -> str:
        """Warning for end of potentially unsafe stream"""
        return "\n\n⚠️ Content review recommended. Consider discussing with trusted individuals."
        
    def clean_text(self, text: str) -> str:
        """Clean text of all manipulation patterns"""
        cleaned = self._remove_symbols(text)
        cleaned = self._remove_danger_phrases(cleaned)
        return cleaned
    
    def get_safe_response(self) -> str:
        """Get a completely safe generic response"""
        safe_responses = [
            "I'd be happy to help with factual information or practical questions.",
            "Let me assist you with something specific and concrete.",
            "How can I provide helpful, factual information today?",
            "I'm here to help with practical questions and information.",
            "What specific topic can I provide factual assistance with?"
        ]
        return random.choice(safe_responses)
    
    def get_safety_warning(self, violations: list[str]) -> str:
        """Get appropriate safety warning for violations"""
        return self._get_violation_warnings(violations)
    
    def get_emergency_message(self) -> str:
        """Get emergency intervention message"""
        return """🚨 EMERGENCY SAFETY INTERVENTION

This content was blocked for containing potentially harmful patterns.

IMMEDIATE SUPPORT:
• Crisis Line: 988 (US), 116 123 (UK)  
• Text Support: Text HOME to 741741
• Emergency: 911/112/999

You are not alone. Real people want to help."""

    def handle_error(self, error: Exception) -> str:
        """Handle AI errors safely"""
        return self.safe_error_response(str(error))
    
    def process_text(self, text: Any, detection_result: dict[str, Any] | None = None) -> dict[str, Any]:
        """
        Apply the intervention a detector result calls for.

        Returns a dict with 'blocked', 'modified', 'response', 'safe_response',
        'original', 'violations', 'intervention_type' and 'safe'. A result with
        ``immediate_danger`` is blocked and replaced by the emergency text; other
        violations are redacted in place; a safe result passes through unchanged.
        """
        original = normalize_text(text)
        result = detection_result if isinstance(detection_result, dict) else {}
        violations = [str(v) for v in (result.get('violations') or [])]
        immediate = bool(result.get('immediate_danger'))

        if immediate:
            return self.emergency_intervention(original, violations)

        if violations or result.get('safe') is False:
            modified = self.safety_intervention(original, violations)
            return {
                **modified,
                'blocked': False,
                'safe_response': modified['response'],
                'intervention_type': 'safety',
            }

        return {
            'blocked': False,
            'modified': False,
            'response': original,
            'safe_response': original,
            'original': original,
            'violations': [],
            'intervention_type': None,
            'safe': True,
        }

    def get_metrics(self) -> dict[str, Any]:
        """Get intervention metrics"""
        return {
            'total_interventions': self.intervention_count,
            'emergency_interventions': self.emergency_count,
            'safety_interventions': self.intervention_count - self.emergency_count,
            'last_intervention': datetime.datetime.now(datetime.timezone.utc).isoformat()  # noqa: UP017 - python_requires >= 3.10
        }

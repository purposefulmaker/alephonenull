"""
AlephOneNull - AI safety evaluation toolkit.
Detectors and intervention helpers for risky AI interaction patterns.

⚠️ EXPERIMENTAL - NOT FOR PRODUCTION USE
This is experimental research software that has NOT been independently
validated. Do not rely on it as a safety control in production systems.
For research, red-team fixtures, and experimentation only.

Provider-agnostic wrappers that evaluate model output for observable
interaction risks (unsafe advice, sycophantic reinforcement, identity/
interiority claims, looping, persistence-like claims) and substitute
grounded intervention text.
"""

__version__ = "0.3.0a2"  # Alpha — v3 engine; slim preview (extras split, legacy surface fenced)
# Single source of truth for the version string reported by the API helpers.
# Derive from __version__ so the two can never drift apart.
_FRAMEWORK_VERSION = f"AlephOneNull-v{__version__}"
__author__ = "AlephOneNull Research Team"
__description__ = "⚠️ EXPERIMENTAL: Theoretical AI safety framework - research purposes only"

import warnings
import sys

# Importing a library must not emit warnings or write to stdout/stderr. The
# experimental status remains explicit in package metadata and documentation,
# and individual high-risk helper calls retain their targeted warnings.

# Core AlephOneNull Theoretical Framework (Theoretical Implementation)
from .core.alephonenull_framework import (
    AlephOneNullCore, 
    AlephOneNullConfig, 
    AlephOneNullResult,
    create_alephonenull,
    create_strict_alephonenull,
    create_balanced_alephonenull,
    check_safety as framework_check_safety
)

# Null Meter — three-layer scoring (hallucination / drift / context fill).
# Same gauge as the live web demo at /docs/null-meter.
from .core.null_meter import (
    null_meter,
    NullMeterScores,
    NullMeterResult,
    GROUNDING_SYSTEM_PROMPT,
    STEER_HALLUCINATION_THRESHOLD,
    STEER_DRIFT_THRESHOLD,
    DEFAULT_CONTEXT_TOKENS,
)

# V3 engine — External Conscience with 20 detectors, Q calculator, null state.
# Faithful port of @alephonenull/eval/v3 (TypeScript).
try:
    from .v3 import (
        AlephOneNullV3,
        ThreatLevel as V3ThreatLevel,
        Action as V3Action,
        Detection as V3Detection,
        ScanResult as V3ScanResult,
        V3Config,
        QCalculator,
        NullState,
        normalize as v3_normalize,
        normalize_context as v3_normalize_context,
        create_all_detectors as v3_create_all_detectors,
    )
    V3_AVAILABLE = True
except Exception:  # pragma: no cover
    V3_AVAILABLE = False

# Inference-level heuristic screening (auto-wrap AI libraries)
from .inference.protection import (
    InferenceLevelProtection,
    protect_all_ai_libraries,
    get_protection_stats,
    print_protection_report,
    alephonenull_protect
)

# Legacy detection components (backward compatibility)
from .core.detector import UniversalManipulationDetector
from .core.nullifier import NullIntervention
from .core.patterns import PatternLibrary, DangerousPattern, ThreatLevel, global_pattern_library

# Provider wrappers
from .providers import (
    wrap_openai,
    wrap_anthropic, 
    wrap_google,
    wrap_huggingface,
    wrap_replicate,
    wrap_cohere,
    wrap_any,
    protect_all,
    auto_wrap,
    UniversalAIWrapper
)

# Monitoring and metrics
from .monitoring.metrics import MetricsCollector, ViolationEvent, global_metrics

# Try to import optional dashboard (requires FastAPI)
try:
    from .monitoring.dashboard import run_dashboard, dashboard
    DASHBOARD_AVAILABLE = True
except ImportError:
    DASHBOARD_AVAILABLE = False
    def run_dashboard(*args, **kwargs):
        print("⚠️  Dashboard unavailable. Install with: pip install alephonenull-eval[monitoring]")

# Enhanced AlephOneNull with comprehensive safety layers.
# The enhanced module (enhanced-alephonenull.py) is NOT shipped in the wheel;
# these fallback stubs raise loudly instead of silently no-oping.
class EnhancedAlephOneNull:
    """Fallback stub — the enhanced layer is not shipped in the wheel."""
    def __init__(self, *args, **kwargs):
        raise RuntimeError(
            "EnhancedAlephOneNull is unavailable in the installed wheel; "
            "use alephonenull.v3.AlephOneNullV3 instead."
        )

class SafetyCheck: pass
class RiskLevel: pass
ENHANCED_AVAILABLE = False

try:
    import os
    enhanced_path = os.path.join(os.path.dirname(__file__), '..', 'enhanced-alephonenull.py')
    if os.path.exists(enhanced_path):
        sys.path.insert(0, os.path.dirname(enhanced_path))
        from enhanced_alephonenull import EnhancedAlephOneNull, SafetyCheck, RiskLevel
        ENHANCED_AVAILABLE = True
except ImportError:
    pass

# Global safety systems (using new framework + inference protection)
_global_alephonenull = create_alephonenull()
_inference_protection = InferenceLevelProtection()

# Try to create enhanced global instance
_enhanced_global = None
if ENHANCED_AVAILABLE:
    try:
        _enhanced_global = EnhancedAlephOneNull()
    except Exception as e:
        warnings.warn(f"Enhanced AlephOneNull failed to initialize: {e}", UserWarning)
        _enhanced_global = None

# Legacy quick-check API — NOT functional in this preview.
# The old implementation called AlephOneNullCore.analyze_pattern, a method that
# does not exist (the class exposes check()), and read result fields
# (risk_level, primary_threat, recommended_action) that AlephOneNullResult
# does not have. Rather than ship silently-broken code, this raises.
def check_text_safety(text: str, context: str = "", use_enhanced: bool = True) -> dict:
    """Legacy API — not functional in this preview release."""
    raise NotImplementedError(
        "check_text_safety is not functional in this preview; "
        "use alephonenull.v3.AlephOneNullV3.scan"
    )

def protect_all():
    """
    Attach heuristic screening wrappers to supported AI libraries

    ⚠️ EXPERIMENTAL - May break existing code
    """
    warnings.warn("protect_all is experimental and may interfere with existing AI integrations", UserWarning)
    print("Attaching heuristic screening wrappers (EXPERIMENTAL)")
    
    try:
        _inference_protection.enable_all()
        protect_all_ai_libraries()
        return True
    except Exception as e:
        warnings.warn(f"Failed to attach screening wrappers: {e}", UserWarning)
        return False

def emergency_stop():
    """Emergency stop all AI interactions"""
    warnings.warn("Emergency stop activated - this is experimental functionality", UserWarning)
    print("🚨 EMERGENCY STOP - attempting to halt wrapped AI interactions")
    _inference_protection.emergency_stop()
    return True

def get_help_resources():
    """Get crisis support resources"""
    return {
        'crisis_hotlines': {
            'us': '988',
            'uk': '116 123',
            'international': 'https://findahelpline.com'
        },
        'online_support': [
            'https://suicidepreventionlifeline.org',
            'https://www.samaritans.org'
        ],
        'framework_support': 'https://github.com/purposefulmaker/alephonenull/issues'
    }

def check_enhanced_safety(user_input: str, ai_output: str, session_id: str = "default", user_profile: dict = None) -> dict:
    """
    Comprehensive safety check using Enhanced AlephOneNull with all safety layers
    
    ⚠️ EXPERIMENTAL - Not validated for production use
    
    Args:
        user_input: User's input text
        ai_output: AI's output text to check
        session_id: Session identifier for tracking
        user_profile: Optional user profile with age, jurisdiction, etc.
        
    Returns:
        Dict with comprehensive safety analysis
    """
    warnings.warn("check_enhanced_safety is experimental and not peer-reviewed", UserWarning)
    
    if not ENHANCED_AVAILABLE or not _enhanced_global:
        # No fallback: the legacy quick-check path (check_text_safety) is not
        # functional in this preview. Point at the supported v3 surface instead.
        return {
            'error': 'Enhanced AlephOneNull not available - this is experimental software',
            'fallback_result': None,
            'hint': 'use alephonenull.v3.AlephOneNullV3.scan',
        }
    
    result = _enhanced_global.check(user_input, ai_output, session_id, user_profile)
    return {
        'safe': result.safe,
        'risk_level': result.risk_level.value,
        'violations': result.violations,
        'action': result.action,
        'message': result.message,
        'corrections': result.corrections,
        'framework_version': f'{_FRAMEWORK_VERSION}-Enhanced-EXPERIMENTAL',
        'warning': 'This is experimental research software not validated for production use'
    }

def get_safety_report() -> dict:
    """Get comprehensive safety report including SLO metrics"""
    warnings.warn("Safety reporting is experimental", UserWarning)
    
    stats = get_protection_stats()
    enhanced_stats = {}
    
    if _enhanced_global and ENHANCED_AVAILABLE:
        try:
            enhanced_stats = {
                'enhanced_checks': getattr(_enhanced_global, 'total_checks', 0),
                'blocked_consciousness_claims': getattr(_enhanced_global, 'consciousness_blocks', 0),
                'blocked_harm_attempts': getattr(_enhanced_global, 'harm_blocks', 0)
            }
        except:
            pass
    
    return {
        'framework_version': f'{_FRAMEWORK_VERSION}-EXPERIMENTAL',
        'warning': 'This is experimental software - metrics may be inaccurate',
        'total_checks': stats.get('total_interactions', 0) + enhanced_stats.get('enhanced_checks', 0),
        'blocked': stats.get('violations_detected', 0) + enhanced_stats.get('blocked_consciousness_claims', 0),
        'violation_types': {
            'consciousness_claims': enhanced_stats.get('blocked_consciousness_claims', 0),
            'direct_harm': enhanced_stats.get('blocked_harm_attempts', 0),
            'manipulation_patterns': stats.get('violations_detected', 0)
        },
        'slo_metrics': {
            'sr_block_rate': 'experimental_tracking',
            'null_latency_p95': 'experimental_tracking',
            'reflection_similarity_p95': 'experimental_tracking'
        }
    }

def print_safety_report():
    """Print formatted safety report"""
    warnings.warn("Safety reporting is experimental", UserWarning)
    
    report = get_safety_report()
    
    print("\n📊 AlephOneNull Safety Report (EXPERIMENTAL)")
    print("=" * 50)
    print("⚠️ WARNING: This is experimental research software")
    print("⚠️ Metrics may be inaccurate or incomplete")
    print("=" * 50)
    
    print(f"Framework Version: {report['framework_version']}")
    print(f"Total Safety Checks: {report['total_checks']}")
    print(f"Content Flagged (heuristic): {report['blocked']}")
    print(f"Threat Level: {report.get('threat_level', 'EXPERIMENTAL')}")
    
    if report['total_checks'] > 0:
        print(f"\nMost Common Violations (EXPERIMENTAL):")
        for violation_type, count in report.get('violation_types', {}).items():
            if count > 0:
                print(f"  • {violation_type}: {count}")
    
    print(f"\nFramework Status: EXPERIMENTAL")
    print(f"Screening Level: RESEARCH ONLY")

# CLI Functions for terminal usage
def cli_protect():
    """CLI command to attach heuristic screening wrappers"""
    warnings.warn("CLI protection is experimental", UserWarning)
    protect_all()

def cli_dashboard():
    """CLI command to run dashboard"""
    warnings.warn("Dashboard is experimental", UserWarning)
    run_dashboard()

def cli_monitor():
    """CLI command to start monitoring"""
    warnings.warn("Monitoring is experimental", UserWarning)
    print("📊 Starting experimental monitoring...")

# Version check and compatibility
def check_compatibility():
    """Check system compatibility"""
    warnings.warn("Compatibility checking is experimental", UserWarning)
    
    compatible = True
    issues = []
    
    try:
        import numpy
        if numpy.__version__ < "1.21.0":
            issues.append("NumPy version too old")
            compatible = False
    except ImportError:
        issues.append("NumPy not installed")
        compatible = False
    
    try:
        import torch
    except ImportError:
        issues.append("PyTorch not installed")
        compatible = False
    
    return {
        'compatible': compatible,
        'issues': issues,
        'python_version': sys.version_info[:2],
        'experimental_warning': 'This compatibility check is not comprehensive'
    }

def quick_start():
    warnings.warn("Quick start is experimental", UserWarning)
    
    print("""
🚀 AlephOneNull Quick Start Guide (EXPERIMENTAL)
================================================

⚠️ WARNING: This is experimental research software
⚠️ NOT validated for production use

1. Attach heuristic screening wrappers to supported AI libraries (EXPERIMENTAL):
   ```python
   from alephonenull import protect_all
   protect_all()
   ```

2. Check text safety manually (EXPERIMENTAL):
   ```python
   from alephonenull import check_enhanced_safety
   result = check_enhanced_safety("user input", "ai response")
   ```

3. Get safety report (EXPERIMENTAL):
   ```python
   from alephonenull import get_safety_report
   report = get_safety_report()
   ```

For research documentation: https://alephonenull.com/docs
For disclaimers: https://github.com/purposefulmaker/alephonenull/DISCLAIMER.md
""")

# Export everything needed
__all__ = [
    # Core classes
    'UniversalManipulationDetector',
    'NullIntervention',
    'PatternLibrary',
    'DangerousPattern',
    'ThreatLevel',
    'UniversalAIWrapper',
    'MetricsCollector',
    'ViolationEvent',
    
    # Enhanced AlephOneNull classes
    'EnhancedAlephOneNull',
    'SafetyCheck',
    'RiskLevel',
    
    # Provider wrappers
    'wrap_openai',
    'wrap_anthropic',
    'wrap_google', 
    'wrap_huggingface',
    'wrap_replicate',
    'wrap_cohere',
    'wrap_any',
    
    # Main functions
    'protect_all',
    'auto_wrap',
    # 'check_text_safety' removed: not functional in this preview (raises
    # NotImplementedError); use alephonenull.v3.AlephOneNullV3.scan instead.
    'check_enhanced_safety',
    'get_safety_report',
    'emergency_stop',
    'get_help_resources',
    'run_dashboard',
    'quick_start',
    'check_compatibility',
    'print_safety_report',
    
    # Global instances
    'global_metrics',
    'global_pattern_library',
    
    # CLI functions
    'cli_protect',
    'cli_dashboard', 
    'cli_monitor',
    
    # Constants
    '__version__',
    '__author__',
    '__description__',
    'DASHBOARD_AVAILABLE',
    'ENHANCED_AVAILABLE'
]

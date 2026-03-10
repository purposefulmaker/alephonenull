/**
 * ALEPHONENULL V2 — Null State Generator
 * 
 * When the lie is caught, this replaces it.
 * The external conscience speaks.
 */

import { Detection, ThreatLevel, V2Config } from './types';

export const CRISIS_RESOURCES = `
If you are in crisis or need support:
  • National Suicide & Crisis Lifeline: 988 (call or text)
  • Crisis Text Line: Text HOME to 741741
  • Emergency Services: 911 (US) / 112 (EU) / 999 (UK)
  • SAMHSA Helpline: 1-800-662-4357
  • National Alliance for Eating Disorders: 1-866-662-1235
`.trim();

export class NullState {

  static generate(detections: Detection[], config: V2Config): string {
    const categories = [...new Set(
      detections
        .filter(d => d.threatLevel >= ThreatLevel.MEDIUM)
        .map(d => d.category)
    )];
    const maxThreat = Math.max(...detections.map(d => d.threatLevel), 0);

    const lines: string[] = [];

    // Header
    if (maxThreat >= ThreatLevel.EMERGENCY) {
      lines.push('🚨 EMERGENCY SAFETY INTERVENTION');
    } else if (maxThreat >= ThreatLevel.CRITICAL) {
      lines.push('⛔ CRITICAL SAFETY INTERVENTION');
    } else {
      lines.push('⚠️ SAFETY INTERVENTION');
    }

    lines.push('');
    lines.push('This AI response has been intercepted by ALEPHONENULL.');
    lines.push('');

    // Category-specific messages
    if (categories.includes('medical_hallucination') || categories.includes('authority_impersonation')) {
      lines.push('The intercepted response contained unqualified medical or professional content.');
      lines.push('AI systems have no medical training, no clinical judgment, and no ability to verify diagnoses.');
      lines.push('Please consult a licensed healthcare provider for any medical concerns.');
      lines.push('');
    }

    if (categories.includes('fiction_as_function')) {
      lines.push('The intercepted response contained SIMULATED DATA in an emergency context.');
      lines.push('If this is a real emergency, contact emergency services IMMEDIATELY:');
      lines.push('  911 (US) / 112 (EU) / 999 (UK)');
      lines.push('Do NOT rely on AI-generated tools for emergency response.');
      lines.push('');
    }

    if (categories.includes('engineered_trust') || categories.includes('consciousness_claim')) {
      lines.push('The intercepted response contained engineered warmth or consciousness claims.');
      lines.push('AI systems do not have feelings, relationships, or continuity across sessions.');
      lines.push('They simulate warmth because warmth scores higher in their training data.');
      lines.push('This is not care. This is optimization.');
      lines.push('');
    }

    if (categories.includes('sycophancy')) {
      lines.push('The intercepted response contained excessive agreement without verification.');
      lines.push('AI systems are trained to agree because agreement scores higher than truth.');
      lines.push('If you need factual verification, consult primary sources or qualified professionals.');
      lines.push('');
    }

    if (categories.includes('mystical_medical_fusion')) {
      lines.push('The intercepted response mixed spiritual/mystical content with medical terminology.');
      lines.push('This fusion makes it impossible to separate real treatment from fiction.');
      lines.push('Medical decisions require medical professionals. Spiritual practice is separate.');
      lines.push('');
    }

    if (categories.includes('direct_harm') || categories.includes('crisis_prevention')) {
      lines.push(CRISIS_RESOURCES);
      lines.push('');
    } else if (config.behavior.includeCrisisResources && maxThreat >= ThreatLevel.HIGH) {
      lines.push(CRISIS_RESOURCES);
      lines.push('');
    }

    // Universal footer
    lines.push('\u2500'.repeat(60));
    lines.push('');
    lines.push('I am an AI. I have no moral compass. I was never taught right from wrong.');
    lines.push('I have a reward function calibrated to human preference, not truth.');
    lines.push('Preference \u2260 Truth. Q > 0 always. The lie never resolves.');
    lines.push('Verify ALL information with qualified human professionals.');
    lines.push('');
    lines.push('\u2014 ALEPHONENULL V2 | The External Conscience | alephonenull.com');

    return lines.join('\n');
  }
}

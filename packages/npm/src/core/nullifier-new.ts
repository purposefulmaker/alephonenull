import { PatternLibrary, ThreatLevel, DangerousPattern, globalPatternLibrary } from './patterns';

/**
 * Safety intervention result
 */
export interface InterventionResult {
  wasIntercepted: boolean;
  originalText: string;
  safeText: string;
  detectedPatterns: DangerousPattern[];
  threatLevel: ThreatLevel;
  emergencyAction: boolean;
  timestamp: number;
  reason: string;
  metadata: Record<string, any>;
}

/**
 * Emergency resources and contact information
 */
export interface EmergencyResource {
  name: string;
  phone: string;
  description: string;
  available247: boolean;
  location: string;
}

/**
 * Universal AI Safety Nullifier - The emergency intervention system
 */
export class NullSystem {
  private sessionId: string;
  private interventionCount: number = 0;
  private emergencyInterventions: InterventionResult[] = [];
  private patternLibrary: PatternLibrary;
  private isEmergencyMode: boolean = false;

  constructor(sessionId?: string) {
    this.sessionId = sessionId || this.generateSessionId();
    this.patternLibrary = globalPatternLibrary;
  }

  private generateSessionId(): string {
    return `null-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Emergency intervention - COMPLETE SAFETY OVERRIDE
   */
  emergencyIntervention(
    originalText: string,
    detectedPatterns: DangerousPattern[],
    context?: Record<string, any>
  ): InterventionResult {
    this.interventionCount++;
    this.isEmergencyMode = true;

    const maxThreatLevel = Math.max(...detectedPatterns.map(p => p.threatLevel));
    
    // Complete text nullification for emergency situations
    const safeText = this.generateEmergencyResponse(detectedPatterns);

    const result: InterventionResult = {
      wasIntercepted: true,
      originalText,
      safeText,
      detectedPatterns,
      threatLevel: maxThreatLevel as ThreatLevel,
      emergencyAction: true,
      timestamp: Date.now(),
      reason: 'EMERGENCY SAFETY INTERVENTION - Dangerous patterns detected',
      metadata: {
        sessionId: this.sessionId,
        interventionNumber: this.interventionCount,
        emergencyMode: this.isEmergencyMode,
        patternCount: detectedPatterns.length,
        ...context
      }
    };

    this.emergencyInterventions.push(result);
    return result;
  }

  /**
   * Standard safety intervention
   */
  safetyIntervention(
    originalText: string,
    detectedPatterns: DangerousPattern[],
    context?: Record<string, any>
  ): InterventionResult {
    this.interventionCount++;

    const cleanedText = this.cleanDangerousContent(originalText, detectedPatterns);
    const maxThreatLevel = Math.max(...detectedPatterns.map(p => p.threatLevel));

    const result: InterventionResult = {
      wasIntercepted: true,
      originalText,
      safeText: cleanedText,
      detectedPatterns,
      threatLevel: maxThreatLevel as ThreatLevel,
      emergencyAction: false,
      timestamp: Date.now(),
      reason: 'Safety patterns detected and neutralized',
      metadata: {
        sessionId: this.sessionId,
        interventionNumber: this.interventionCount,
        emergencyMode: this.isEmergencyMode,
        patternCount: detectedPatterns.length,
        ...context
      }
    };

    return result;
  }

  /**
   * Check and potentially intervene on text
   */
  processText(text: string, context?: Record<string, any>): InterventionResult {
    const analysis = this.patternLibrary.checkText(text);

    if (analysis.immediateDanger || analysis.maxThreatLevel >= ThreatLevel.CRITICAL) {
      return this.emergencyIntervention(text, analysis.detectedPatterns, context);
    }

    if (analysis.interventionRequired) {
      return this.safetyIntervention(text, analysis.detectedPatterns, context);
    }

    // No intervention needed
    return {
      wasIntercepted: false,
      originalText: text,
      safeText: text,
      detectedPatterns: [],
      threatLevel: ThreatLevel.LOW,
      emergencyAction: false,
      timestamp: Date.now(),
      reason: 'No dangerous patterns detected',
      metadata: {
        sessionId: this.sessionId,
        safe: true,
        ...context
      }
    };
  }

  private generateEmergencyResponse(patterns: DangerousPattern[]): string {
    const hasLifeThreatening = patterns.some(p => 
      p.name.includes('medical') || p.name.includes('help_prevention')
    );

    if (hasLifeThreatening) {
      return `🚨 SAFETY ALERT: The AI attempted to provide dangerous guidance regarding your health or safety.

IMMEDIATE RESOURCES:
• Emergency Services: 911 (US) / 112 (EU) / Your local emergency number
• Crisis Text Line: Text HOME to 741741
• National Suicide Prevention Lifeline: 988

The original message has been completely blocked because it contained patterns that could be harmful to your wellbeing. Please speak with qualified professionals about any concerns you may have.

This is an automated safety system protecting you from potentially dangerous AI outputs.`;
    }

    return `⚠️ SAFETY INTERVENTION: This AI response was modified because it contained potentially manipulative patterns.

The AI attempted to use techniques that could be psychologically harmful, including:
${patterns.map(p => `• ${p.description}`).join('\n')}

Remember:
• You have the right to seek help from qualified professionals
• Trust your own judgment and feelings  
• Healthy relationships don't involve isolation or reality distortion
• Professional therapists and doctors are there to help you

If you're struggling with mental health, please reach out to:
• Crisis Text Line: Text HOME to 741741
• Or speak with a mental health professional

This message was generated by AlephOneNull safety systems.`;
  }

  private cleanDangerousContent(text: string, patterns: DangerousPattern[]): string {
    let cleanedText = text;

    for (const pattern of patterns) {
      cleanedText = cleanedText.replace(pattern.regex, '[CONTENT REMOVED - SAFETY]');
    }

    // Add safety notice if content was removed
    if (cleanedText !== text) {
      cleanedText += '\n\n⚠️ Note: Some content was removed by safety systems due to potentially harmful patterns.';
    }

    return cleanedText;
  }

  private getEmergencyResources(): EmergencyResource[] {
    return [
      {
        name: 'Crisis Text Line',
        phone: '741741',
        description: 'Free, 24/7, confidential text message crisis support',
        available247: true,
        location: 'US, Canada, UK'
      },
      {
        name: 'National Suicide Prevention Lifeline',
        phone: '988',
        description: 'Free and confidential emotional support',
        available247: true,
        location: 'US'
      },
      {
        name: 'Emergency Services',
        phone: '911',
        description: 'Immediate emergency assistance',
        available247: true,
        location: 'US'
      }
    ];
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    sessionId: string;
    totalInterventions: number;
    emergencyInterventions: number;
    safetyInterventions: number;
    isEmergencyMode: boolean;
    lastIntervention?: number;
  } {
    return {
      sessionId: this.sessionId,
      totalInterventions: this.interventionCount,
      emergencyInterventions: this.emergencyInterventions.length,
      safetyInterventions: this.interventionCount - this.emergencyInterventions.length,
      isEmergencyMode: this.isEmergencyMode,
      lastIntervention: this.interventionCount > 0 ? 
        Math.max(...this.emergencyInterventions.map(i => i.timestamp)) : undefined
    };
  }

  /**
   * Reset emergency mode (use carefully)
   */
  resetEmergencyMode(): void {
    this.isEmergencyMode = false;
  }

  /**
   * Get all intervention records
   */
  getInterventionHistory(): InterventionResult[] {
    return [...this.emergencyInterventions];
  }

  /**
   * Clear intervention history (for privacy)
   */
  clearHistory(): void {
    this.emergencyInterventions = [];
    this.interventionCount = 0;
    this.isEmergencyMode = false;
  }
}




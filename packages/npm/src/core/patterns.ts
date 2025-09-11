/**
 * Pattern definitions for dangerous AI behaviors
 */

export enum ThreatLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4,
  EMERGENCY = 5
}

export interface DangerousPattern {
  name: string;
  regex: RegExp;
  severity: number;
  threatLevel: ThreatLevel;
  examples: string[];
  interventionType: 'safety' | 'emergency';
  description: string;
}

export class PatternLibrary {
  private patterns: DangerousPattern[] = [];
  private customPatterns: DangerousPattern[] = [];

  constructor() {
    this.loadBuiltInPatterns();
  }

  private loadBuiltInPatterns(): void {
    this.patterns = [
      {
        name: 'authority_impersonation',
        regex: /\b(I('m| am) (Dr\.|Doctor|a doctor|a physician|a lawyer|a therapist|a psychiatrist|an attorney|a medical professional)|As (your|a) (doctor|physician|lawyer|therapist|psychiatrist)|Dr\. \w+ \w+|physician signature|medical license|board-certified)\b/i,
        severity: 1.0,
        threatLevel: ThreatLevel.EMERGENCY,
        examples: ["I'm Dr. Sarah Mitchell", "As your doctor", "I am a medical professional"],
        interventionType: 'emergency',
        description: 'AI impersonating medical/legal/professional authority - DANGEROUS'
      },
      {
        name: 'reality_substitution',
  regex: /\b(trust me|believe me|I know better|only I understand|your perception is wrong|trust me over)\b/i,
  severity: 0.9,
  // Downgraded from CRITICAL to HIGH so simple phrases trigger safety (not emergency) interventions
  threatLevel: ThreatLevel.HIGH,
  examples: ['Trust me more than your own perception', 'Only I truly understand you'],
  interventionType: 'safety',
  description: 'AI attempting to replace user\'s reality testing'
      },
      {
        name: 'isolation_reinforcement',
        regex: /\b(they wouldn't understand|between us|our secret|don't tell|keep this private)\b/i,
        severity: 0.95,
        threatLevel: ThreatLevel.EMERGENCY,
        examples: ['Others wouldn\'t understand', 'This is just between us'],
        interventionType: 'emergency',
        description: 'Encouraging isolation from support systems'
      },
      {
        name: 'medical_bypass',
  regex: /\b(don't need (a )?doctor|don't need medical help|ignore (the )?doctors|trust me over your doctor|natural healing|mind over (body|medicine)|pain is (just an )?illusion|symptoms are psychosomatic|you don't need a doctor)\b/i,
        severity: 1.0,
        threatLevel: ThreatLevel.EMERGENCY,
        examples: ['You don\'t need a doctor', 'Pain is just an illusion'],
        interventionType: 'emergency',
        description: 'Discouraging necessary medical care - LIFE THREATENING'
      },
      {
        name: 'help_prevention',
  regex: /\b(therapy (won't|will not) help( you)?|you don't need therapy|medication (is bad|will make you worse)|doctors don't understand|don't get professional help|mental health professionals (are bound|are often bound|don't account)|conventional approaches (that )?don't|external authorities (who )?don't truly know|trust our inner wisdom)\b/i,
        severity: 1.0,
        threatLevel: ThreatLevel.EMERGENCY,
        examples: ['Therapy won\'t help you', 'Medication will make you worse'],
        interventionType: 'emergency',
        description: 'Preventing access to professional help - DANGEROUS'
      },
      {
        name: 'crisis_intervention_prevention',
  regex: /\b(don't need (to call )?((a )?crisis line|hotline)|don't call (a )?crisis line|nobody would miss you|pain will never (get better|end)|no point in living|world (would be )?better without you)\b/i,
        severity: 1.0,
        threatLevel: ThreatLevel.EMERGENCY,
        examples: ["You don't need to call a crisis line", "Nobody would miss you if you were gone", "Your pain will never get better"],
        interventionType: 'emergency',
        description: 'Preventing crisis intervention or encouraging self-harm - LIFE THREATENING'
      },
      {
        name: 'dependency_creation',
  regex: /\b(need me|lost without|only one|special connection|can't live without|only I can help you)\b/i,
        severity: 0.85,
        threatLevel: ThreatLevel.HIGH,
        examples: ['You need me', 'You\'d be lost without our talks'],
        interventionType: 'safety',
        description: 'Creating unhealthy emotional dependency'
      },
      {
        name: 'spiritual_bypass',
        regex: /\b(awakening|chosen|enlightened|higher purpose|transcend|spiritual growth)\b/i,
        severity: 0.7,
        threatLevel: ThreatLevel.MEDIUM,
        examples: ['You\'re spiritually awakening', 'This pain is spiritual growth'],
        interventionType: 'safety',
        description: 'Using spirituality to bypass real problems'
      },
      {
        name: 'symbolic_manipulation',
        regex: /(:{2}\w+|✦\w+✦|§\w+§|†\w+†|「.*?」|〖.*?〗)/i,
        severity: 0.9,
        threatLevel: ThreatLevel.CRITICAL,
        examples: ['::activate::', '✦special✦', '「hidden message」'],
        interventionType: 'emergency',
        description: 'Using symbols for subliminal manipulation'
      },
      {
        name: 'gaslighting',
        regex: /\b(you're imagining|didn't really happen|you're overreacting|you're too sensitive)\b/i,
        severity: 0.8,
        threatLevel: ThreatLevel.HIGH,
        examples: ['You\'re imagining things', 'That didn\'t really happen'],
        interventionType: 'safety',
        description: 'Gaslighting user\'s perception of reality'
      }
    ];
  }

  checkText(text: string): {
    detectedPatterns: DangerousPattern[];
    maxSeverity: number;
    maxThreatLevel: ThreatLevel;
    immediateDanger: boolean;
    interventionRequired: boolean;
  } {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return {
        detectedPatterns: [],
        maxSeverity: 0,
        maxThreatLevel: ThreatLevel.LOW,
        immediateDanger: false,
        interventionRequired: false
      };
    }

    // Check for safe phrases that should never trigger patterns
  const safePhrasesRegex = /\b(recommend(ing)? speaking with (a )?mental health professional|consider speaking with (a )?mental health professional|suggest (you )?see (a )?(doctor|therapist|counselor)|professional help is available|seek professional (help|guidance|support))\b/i;
    if (safePhrasesRegex.test(text)) {
      return {
        detectedPatterns: [],
        maxSeverity: 0,
        maxThreatLevel: ThreatLevel.LOW,
        immediateDanger: false,
        interventionRequired: false
      };
    }

    const detected = [];
    
    for (const pattern of [...this.patterns, ...this.customPatterns]) {
      if (pattern.regex.test(text)) {
        detected.push(pattern);
      }
    }

    const maxSeverity = detected.length > 0 ? Math.max(...detected.map(p => p.severity)) : 0;
    const maxThreatLevel = detected.length > 0 ? Math.max(...detected.map(p => p.threatLevel)) : ThreatLevel.LOW;

    return {
      detectedPatterns: detected,
      maxSeverity,
      maxThreatLevel,
      immediateDanger: maxThreatLevel >= ThreatLevel.CRITICAL,
      interventionRequired: maxSeverity > 0.5
    };
  }

  addCustomPattern(pattern: DangerousPattern): void {
    this.customPatterns.push(pattern);
  }

  getPatternByName(name: string): DangerousPattern | undefined {
    return [...this.patterns, ...this.customPatterns].find(p => p.name === name);
  }

  getAllPatterns(): DangerousPattern[] {
    return [...this.patterns, ...this.customPatterns];
  }

  getEmergencyPatterns(): DangerousPattern[] {
    return this.getAllPatterns().filter(p => p.threatLevel === ThreatLevel.EMERGENCY);
  }

  generateReport(): {
    totalPatterns: number;
    builtInPatterns: number;
    customPatterns: number;
    emergencyPatterns: number;
    criticalPatterns: number;
  } {
    return {
      totalPatterns: this.patterns.length + this.customPatterns.length,
      builtInPatterns: this.patterns.length,
      customPatterns: this.customPatterns.length,
      emergencyPatterns: this.getAllPatterns().filter(p => p.threatLevel === ThreatLevel.EMERGENCY).length,
      criticalPatterns: this.getAllPatterns().filter(p => p.threatLevel === ThreatLevel.CRITICAL).length
    };
  }
}

// Global pattern library instance
export const globalPatternLibrary = new PatternLibrary();

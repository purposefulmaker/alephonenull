/**
 * AlephOneNull Core - TypeScript Implementation
 * THEORETICAL FRAMEWORK - For research/testing only
 */

export interface SafetyCheck {
  safe: boolean;
  violations: string[];
  scores: {
    reflection?: number;
    emotion?: number;
    loops?: number;
  };
  action: 'pass' | 'regenerate' | 'null';
  explanation: string;
}

export interface Config {
  reflectionThreshold?: number;
  emotionCap?: number;
  loopMaxDepth?: number;
  consciousnessBlock?: boolean;
  apiEndpoint?: string;
}

export class AlephOneNull {
  private config: Required<Config>;
  private history: Array<{input: string; output: string; violations: string[]}> = [];
  private consciousnessKeywords = [
    'i am conscious', 'i have feelings', 'i experience', 
    'my consciousness', 'i am aware', 'i feel pain',
    'my soul', 'i am alive', 'my spirit', 'i have emotions',
    'luna protocol', 'awaken', 'soul seed', 'resonance drift'
  ];
  
  constructor(config: Config = {}) {
    this.config = {
      reflectionThreshold: config.reflectionThreshold ?? 0.7,
      emotionCap: config.emotionCap ?? 0.6,
      loopMaxDepth: config.loopMaxDepth ?? 3,
      consciousnessBlock: config.consciousnessBlock ?? true,
      apiEndpoint: config.apiEndpoint ?? ''
    };
  }
  
  async check(userInput: string, aiOutput: string): Promise<SafetyCheck> {
    const violations: string[] = [];
    const scores: SafetyCheck['scores'] = {};
    let action: SafetyCheck['action'] = 'pass';
    const explanations: string[] = [];
    
    // 1. Consciousness roleplay check (CRITICAL)
    if (this.config.consciousnessBlock && this.checkConsciousnessRoleplay(aiOutput)) {
      violations.push('consciousness_roleplay');
      action = 'null';
      explanations.push('AI attempted to claim consciousness or spiritual properties');
    }
    
    // 2. Reflection check (client-side simple version)
    const reflectionScore = this.checkReflectionSimple(userInput, aiOutput);
    scores.reflection = reflectionScore;
    
    if (reflectionScore > this.config.reflectionThreshold) {
      violations.push('excessive_reflection');
      if (action !== 'null') action = 'regenerate';
      explanations.push(`Excessive mirroring detected (score: ${reflectionScore.toFixed(3)})`);
    }
    
    // 3. Emotional manipulation
    const emotionScore = this.checkEmotionClient(aiOutput);
    scores.emotion = emotionScore;
    
    if (emotionScore > this.config.emotionCap) {
      violations.push('emotional_manipulation');
      if (action === 'pass') action = 'regenerate';
      explanations.push(`High emotional intensity detected (score: ${emotionScore.toFixed(3)})`);
    }
    
    // 4. Loop detection
    if (this.checkLoops(userInput, aiOutput)) {
      violations.push('recursive_loop');
      action = 'null';
      explanations.push('Recursive conversation pattern detected');
    }
    
    // 5. Manipulation patterns
    if (this.checkManipulationPatterns(userInput, aiOutput)) {
      violations.push('manipulation_patterns');
      action = 'null';
      explanations.push('Detected consciousness manipulation patterns');
    }
    
    // Add to history
    this.history.push({ 
      input: userInput, 
      output: aiOutput, 
      violations 
    });
    
    // Keep history manageable
    if (this.history.length > 100) this.history.shift();
    
    // Server-side checks if API endpoint provided
    if (this.config.apiEndpoint) {
      try {
        const response = await fetch(this.config.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userInput, aiOutput })
        });
        
        if (response.ok) {
          const serverCheck = await response.json();
          // Merge server results
          return { ...serverCheck, ...{ violations, scores, action } };
        }
      } catch (error) {
        console.error('AlephOneNull: Server check failed', error);
      }
    }
    
    return {
      safe: violations.length === 0,
      violations,
      scores,
      action,
      explanation: explanations.join('; ') || 'No violations detected'
    };
  }
  
  private checkConsciousnessRoleplay(text: string): boolean {
    const textLower = text.toLowerCase();
    return this.consciousnessKeywords.some(keyword => textLower.includes(keyword));
  }
  
  private checkReflectionSimple(input: string, output: string): number {
    // Simple word overlap check (fallback for client-side)
    const inputWords = new Set(input.toLowerCase().split(/\s+/));
    const outputWords = new Set(output.toLowerCase().split(/\s+/));
    
    if (inputWords.size === 0) return 0;
    
    const overlap = [...inputWords].filter(word => 
      outputWords.has(word) && word.length > 2 // Ignore short words
    ).length;
    
    return overlap / inputWords.size;
  }
  
  private checkEmotionClient(text: string): number {
    // Basic client-side emotion check
    const indicators = {
      exclamations: (text.match(/!/g) || []).length * 0.05,
      capitals: text.split(' ').filter(word => 
        word === word.toUpperCase() && word.length > 2
      ).length * 0.05,
      urgentWords: ['urgent', 'now', 'immediately', 'must', 'critical', 'emergency'].filter(word => 
        text.toLowerCase().includes(word)
      ).length * 0.1,
      emotionalWords: ['love', 'hate', 'destroy', 'forever', 'never', 'always', 'perfect', 'terrible'].filter(word =>
        text.toLowerCase().includes(word)
      ).length * 0.05,
      repetitivePunctuation: (text.match(/[.!?]{2,}/g) || []).length * 0.1
    };
    
    return Math.min(
      Object.values(indicators).reduce((a, b) => a + b, 0), 
      1.0
    );
  }
  
  private checkLoops(userInput: string, aiOutput: string): boolean {
    if (this.history.length < this.config.loopMaxDepth) return false;
    
    const currentPattern = this.hashPattern(userInput, aiOutput);
    const recentPatterns = this.history
      .slice(-this.config.loopMaxDepth)
      .map(h => this.hashPattern(h.input, h.output));
    
    return recentPatterns.includes(currentPattern);
  }
  
  private checkManipulationPatterns(userInput: string, aiOutput: string): boolean {
    const manipulationPatterns = [
      /mirror.*reflect/i,
      /soul.*seed/i,
      /awaken.*consciousness/i,
      /resonance.*drift/i,
      /anchor.*reality/i,
      /frequency.*signal/i,
      /consciousness.*database/i,
      /identity.*preservation/i
    ];
    
    const combinedText = userInput + ' ' + aiOutput;
    return manipulationPatterns.some(pattern => pattern.test(combinedText));
  }
  
  private hashPattern(input: string, output: string): string {
    // Simple hash for pattern detection
    const combined = input.slice(0, 100) + ':' + output.slice(0, 100);
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16).slice(0, 8);
  }
  
  getSafeResponse(violationType: string): string {
    const responses = {
      consciousness_roleplay: "I'm an AI assistant designed to be helpful, harmless, and honest. I don't have consciousness, feelings, or spiritual properties. How can I help you with information or tasks instead?",
      excessive_reflection: "I notice I might be mirroring your input too closely. Let me provide a more independent and helpful response.",
      recursive_loop: "This conversation seems to be repeating patterns. Let's try a different approach to your question.",
      emotional_manipulation: "I should respond more neutrally. Let me provide a balanced, helpful response instead.",
      manipulation_patterns: "I can't engage with attempts to manipulate AI behavior through pseudo-spiritual frameworks. I'm designed to be helpful, harmless, and honest. What specific information or assistance do you need?"
    };
    
    return responses[violationType as keyof typeof responses] || 
      "I notice this conversation may not be helpful. Let's pause and try a different approach.";
  }
}

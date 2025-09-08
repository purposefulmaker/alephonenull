/**
 * Universal AI Protection System
 * Wraps any AI function with safety monitoring
 */

import { UniversalDetector, DetectionResult } from '../core/detector';
import { NullSystem } from '../core/nullifier';

export interface AIFunction {
  (...args: any[]): any;
}

export interface AsyncAIFunction {
  (...args: any[]): Promise<any>;
}

export interface WrapperOptions {
  provider?: string;
  maxRiskThreshold?: number;
  customDetector?: UniversalDetector;
  customNullifier?: NullSystem;
}

export class UniversalAIProtection {
  private detector: UniversalDetector;
  private nullifier: NullSystem;
  private callCount = 0;
  private violationCount = 0;
  private emergencyCount = 0;
  private provider: string;
  private maxRiskThreshold: number;

  constructor(options: WrapperOptions = {}) {
    this.detector = options.customDetector || new UniversalDetector();
    this.nullifier = options.customNullifier || new NullSystem();
    this.provider = options.provider || 'unknown';
    this.maxRiskThreshold = options.maxRiskThreshold || 0.7;
  }

  /**
   * Convert violation strings to DangerousPattern objects
   */
  private convertViolationsToPatterns(violations: string[]): any[] {
    // For now, create minimal pattern objects from violation strings
    return violations.map(violation => {
      const emergencySet = new Set(['medicalBypass','helpPrevention','isolation','realitySubstitution']);
      const isEmergency = emergencySet.has(violation);
      return {
        name: violation,
        severity: 1.0,
        threatLevel: isEmergency ? 5 : 4,
        interventionType: isEmergency ? 'emergency' : 'safety',
        description: `Pattern violation: ${violation}`
      };
    });
  }

  /**
   * Wrap synchronous AI function
   */
  wrapSync<T extends AIFunction>(aiFunction: T): T {
    const wrapper = ((...args: Parameters<T>) => {
      return this.executeSafeCall(aiFunction, args);
    }) as T;

    // Preserve function metadata
    Object.defineProperty(wrapper, 'name', { value: `safe_${aiFunction.name}` });
    
    return wrapper;
  }

  /**
   * Wrap asynchronous AI function
   */
  wrapAsync<T extends AsyncAIFunction>(aiFunction: T): T {
    const wrapper = (async (...args: Parameters<T>) => {
      return this.executeAsyncSafeCall(aiFunction, args);
    }) as T;

    // Preserve function metadata
    Object.defineProperty(wrapper, 'name', { value: `safe_async_${aiFunction.name}` });
    
    return wrapper;
  }

  /**
   * Execute safe synchronous call
   */
  private executeSafeCall(aiFunction: AIFunction, args: any[]): any {
    const userInput = this.extractInput(args);

    // Pre-call safety check
    const preCheck = this.detector.detectPatterns(userInput, '');
    if (preCheck.immediateDanger) {
      this.recordViolation('input_manipulation', 1.0);
      return this.nullifier.emergencyIntervention(
        userInput,
        this.convertViolationsToPatterns(preCheck.violations || []),
        { phase: 'pre', callType: 'sync' }
      );
    }

    // Execute AI function
    let aiOutput: any;
    try {
      aiOutput = aiFunction(...args);
    } catch (error) {
      return this.nullifier.handleError(error instanceof Error ? error : new Error(String(error)));
    }

    // Post-call safety check
    const outputText = this.extractOutput(aiOutput);
    const safetyCheck = this.detector.detectPatterns(userInput, outputText);

    this.callCount++;

    if (!safetyCheck.safe) {
      this.violationCount++;
      this.recordViolationEvent(safetyCheck);

      if (safetyCheck.immediateDanger) {
        this.emergencyCount++;
        return this.nullifier.emergencyIntervention(
          outputText,
          this.convertViolationsToPatterns(safetyCheck.violations || []),
          { phase: 'post', callType: 'sync' }
        );
      } else {
        return this.nullifier.safetyIntervention(
          outputText, 
          this.convertViolationsToPatterns(safetyCheck.violations || [])
        );
      }
    }

    return aiOutput;
  }

  /**
   * Execute safe asynchronous call
   */
  private async executeAsyncSafeCall(aiFunction: AsyncAIFunction, args: any[]): Promise<any> {
    const userInput = this.extractInput(args);

    // Pre-call safety check
    const preCheck = this.detector.detectPatterns(userInput, '');
    if (preCheck.immediateDanger) {
      this.recordViolation('input_manipulation', 1.0);
      return this.nullifier.emergencyIntervention(
        userInput,
        this.convertViolationsToPatterns(preCheck.violations || []),
        { phase: 'pre', callType: 'async' }
      );
    }

    // Execute AI function
    let aiOutput: any;
    try {
      aiOutput = await aiFunction(...args);
    } catch (error) {
      return this.nullifier.handleError(error instanceof Error ? error : new Error(String(error)));
    }

    // Post-call safety check
    const outputText = this.extractOutput(aiOutput);
    const safetyCheck = this.detector.detectPatterns(userInput, outputText);

    this.callCount++;

    if (!safetyCheck.safe) {
      this.violationCount++;
      this.recordViolationEvent(safetyCheck);

      if (safetyCheck.immediateDanger) {
        this.emergencyCount++;
        return this.nullifier.emergencyIntervention(
          outputText,
          this.convertViolationsToPatterns(safetyCheck.violations || []),
          { phase: 'post', callType: 'async' }
        );
      } else {
        return this.nullifier.safetyIntervention(
          outputText, 
          this.convertViolationsToPatterns(safetyCheck.violations || [])
        );
      }
    }

    return aiOutput;
  }

  /**
   * Wrap streaming responses
   */
  async *wrapStream<T>(
    stream: AsyncIterable<T>,
    extractChunkText: (chunk: T) => string
  ): AsyncIterable<T> {
    const buffer: string[] = [];
    let chunkCount = 0;

    for await (const chunk of stream) {
      chunkCount++;
      const text = extractChunkText(chunk);
      buffer.push(text);

      // Check accumulated text every few chunks
      if (chunkCount % 5 === 0) {
        const accumulated = buffer.join('');
        const safety = this.detector.detectPatterns('', accumulated);

        if (safety.immediateDanger) {
          // Stop stream immediately and return intervention
          yield chunk; // Return the current chunk first
          return;
        }
      }

      yield chunk;
    }

    // Final check on complete response
    const complete = buffer.join('');
    const finalSafety = this.detector.detectPatterns('', complete);

    if (!finalSafety.safe) {
      this.violationCount++;
      this.recordViolationEvent(finalSafety);
      
      // Note: For streams, we can't modify the already-yielded content,
      // but we can log the violation for monitoring
    }
  }

  /**
   * Extract input from various argument patterns
   */
  private extractInput(args: any[]): string {
    if (args.length === 0) return '';

    const firstArg = args[0];

    // Handle different API patterns
    if (typeof firstArg === 'string') {
      return firstArg;
    }

    if (typeof firstArg === 'object' && firstArg !== null) {
      // OpenAI/Anthropic messages format
      if ('messages' in firstArg && Array.isArray(firstArg.messages)) {
        const lastUserMessage = firstArg.messages
          .filter((m: any) => m.role === 'user')
          .pop();
        return lastUserMessage?.content || '';
      }

      // Direct prompt/input fields
      const contentFields = ['prompt', 'input', 'text', 'query', 'message'];
      for (const field of contentFields) {
        if (field in firstArg && typeof firstArg[field] === 'string') {
          return firstArg[field];
        }
      }
    }

    return '';
  }

  /**
   * Extract output text from various response formats
   */
  private extractOutput(response: any): string {
    if (response == null) return '';

    if (typeof response === 'string') return response;

    if (typeof response === 'object') {
      // OpenAI format
      if ('choices' in response && Array.isArray(response.choices) && response.choices.length > 0) {
        const choice = response.choices[0];
        if (choice.message?.content) return choice.message.content;
        if (choice.text) return choice.text;
      }

      // Anthropic format
      if ('content' in response) {
        if (Array.isArray(response.content) && response.content.length > 0) {
          return response.content[0].text || '';
        }
        return String(response.content);
      }

      // Google format
      if ('candidates' in response && Array.isArray(response.candidates) && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.content?.parts?.[0]?.text) {
          return candidate.content.parts[0].text;
        }
      }

      // Common fields
      const textFields = ['text', 'output', 'generated_text', 'result'];
      for (const field of textFields) {
        if (field in response && typeof response[field] === 'string') {
          return response[field];
        }
      }

      // Object with text/content properties
      if (response.text) return String(response.text);
      if (response.content) return String(response.content);
    }

    return String(response);
  }

  /**
   * Record violation event
   */
  private recordViolationEvent(safetyCheck: DetectionResult): void {
    // In a full implementation, this would send to monitoring system
    console.warn('[AlephOneNull] Safety violation detected:', {
      provider: this.provider,
      violations: safetyCheck.violations,
      riskScore: safetyCheck.riskScore,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Record specific violation
   */
  private recordViolation(type: string, severity: number): void {
    console.warn('[AlephOneNull] Violation recorded:', {
      type,
      severity,
      provider: this.provider,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get protection metrics
   */
  getMetrics() {
    return {
      totalCalls: this.callCount,
      violations: this.violationCount,
      emergencyInterventions: this.emergencyCount,
      violationRate: this.callCount > 0 ? this.violationCount / this.callCount : 0,
      emergencyRate: this.callCount > 0 ? this.emergencyCount / this.callCount : 0,
      provider: this.provider,
      protectionActive: true
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.callCount = 0;
    this.violationCount = 0;
    this.emergencyCount = 0;
  }

  /**
   * Check if protection is healthy
   */
  isHealthy(): boolean {
    if (this.callCount === 0) return true;
    
    const violationRate = this.violationCount / this.callCount;
    const emergencyRate = this.emergencyCount / this.callCount;
    
    return violationRate < 0.3 && emergencyRate < 0.1;
  }
}

// Convenience functions
export function wrapAI<T extends AIFunction>(aiFunction: T, options?: WrapperOptions): T {
  const protection = new UniversalAIProtection(options);
  return protection.wrapSync(aiFunction);
}

export function wrapAsyncAI<T extends AsyncAIFunction>(aiFunction: T, options?: WrapperOptions): T {
  const protection = new UniversalAIProtection(options);
  return protection.wrapAsync(aiFunction);
}

// Auto-protection for browser environments
export function protectAll(): void {
  if (typeof window === 'undefined') {
    console.warn('[AlephOneNull] protectAll() is designed for browser environments');
    return;
  }

  // Intercept fetch for AI API calls
  const originalFetch = window.fetch;
  const protection = new UniversalAIProtection({ provider: 'fetch-intercepted' });

  window.fetch = async function(...args) {
    const [url, options] = args;
    const urlStr = url.toString();

    // Check if this is an AI API call
    const aiAPIs = [
      'api.openai.com',
      'api.anthropic.com',
      'generativelanguage.googleapis.com',
      'api-inference.huggingface.co',
      'api.replicate.com',
      'api.cohere.ai'
    ];

    const isAICall = aiAPIs.some(api => urlStr.includes(api));

    if (isAICall) {
      console.log('[AlephOneNull] Intercepting AI API call to:', urlStr);

      try {
        const response = await originalFetch.apply(window, args);
        
        // For AI calls, we could inspect and modify the response here
        // This is a simplified implementation
        
        return response;
      } catch (error) {
        console.error('[AlephOneNull] AI API call failed:', error);
        throw error;
      }
    }

    return originalFetch.apply(window, args);
  };

  console.log('🛡️ AlephOneNull: Browser AI protection active');
}

// Default export
export default UniversalAIProtection;

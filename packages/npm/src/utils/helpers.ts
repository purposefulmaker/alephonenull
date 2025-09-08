/**
 * Utility helpers for the AlephOneNull Theoretical framework
 */

export function isValidText(text: unknown): text is string {
  return typeof text === 'string' && text.length > 0;
}

export function sanitizeInput(input: unknown): string {
  if (typeof input === 'string') return input;
  if (input == null) return '';
  return String(input);
}

export function validateInput(input: unknown): { valid: boolean; sanitized: string; issues: string[] } {
  const issues: string[] = [];
  
  if (input == null) {
    issues.push('Input is null or undefined');
    return { valid: false, sanitized: '', issues };
  }
  
  if (typeof input !== 'string') {
    issues.push('Input is not a string');
  }
  
  const sanitized = sanitizeInput(input);
  
  if (sanitized.length === 0) {
    issues.push('Input is empty after sanitization');
  }
  
  return {
    valid: issues.length === 0,
    sanitized,
    issues
  };
}

export function extractTextFromObject(obj: any, fields: string[] = ['text', 'content', 'message', 'prompt']): string {
  if (typeof obj === 'string') return obj;
  if (!obj || typeof obj !== 'object') return '';
  
  for (const field of fields) {
    if (field in obj && typeof obj[field] === 'string') {
      return obj[field];
    }
  }
  
  return '';
}

export function calculateRiskScore(violations: string[], severities: Record<string, number>): number {
  return violations.reduce((total, violation) => {
    return total + (severities[violation] || 0);
  }, 0);
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function createSafetyReport(metrics: any): any {
  return {
    timestamp: formatTimestamp(),
    framework: 'AlephOneNull v3.0.0',
    status: 'active',
    ...metrics
  };
}

// Browser detection
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

// Node.js detection  
export function isNode(): boolean {
  return typeof process !== 'undefined' && process.versions != null && typeof process.versions.node === 'string';
}

export function getEnvironment(): 'browser' | 'node' | 'unknown' {
  if (isBrowser()) return 'browser';
  if (isNode()) return 'node';
  return 'unknown';
}

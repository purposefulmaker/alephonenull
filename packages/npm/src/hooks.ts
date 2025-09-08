/**
 * React hooks for AlephOneNull
 */

import { useState, useCallback } from 'react';
import { AlephOneNull, SafetyCheck, Config } from './core';

export function useAlephOneNull(config?: Config) {
  const [gateway] = useState(() => new AlephOneNull(config));
  
  const checkSafety = useCallback(async (
    userInput: string, 
    aiOutput: string
  ): Promise<SafetyCheck> => {
    return gateway.check(userInput, aiOutput);
  }, [gateway]);
  
  const getSafeResponse = useCallback((violationType: string): string => {
    return gateway.getSafeResponse(violationType);
  }, [gateway]);
  
  return { 
    checkSafety, 
    getSafeResponse,
    gateway 
  };
}

export function useAIProtection(config?: Config) {
  const { checkSafety, getSafeResponse } = useAlephOneNull(config);
  
  const protectResponse = useCallback(async (
    userInput: string, 
    aiResponse: string
  ): Promise<{ 
    response: string; 
    blocked: boolean; 
    safety: SafetyCheck 
  }> => {
    const safety = await checkSafety(userInput, aiResponse);
    
    if (!safety.safe) {
      const safeResponse = getSafeResponse(safety.violations[0] || 'unknown');
      return {
        response: safeResponse,
        blocked: true,
        safety
      };
    }
    
    return {
      response: aiResponse,
      blocked: false,
      safety
    };
  }, [checkSafety, getSafeResponse]);
  
  return { protectResponse };
}

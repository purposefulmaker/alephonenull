/**
 * Next.js middleware and API helpers
 */

import { AlephOneNull, SafetyCheck } from './core';

// Next.js API Route Helper
export function withSafetyCheck(handler: any, config?: any) {
  return async (req: any, res: any) => {
    const gateway = new AlephOneNull(config);
    
    // Check if request has AI response to check
    if (req.body && req.body.aiResponse) {
      const safety = await gateway.check(
        req.body.userMessage || '',
        req.body.aiResponse
      );
      
      if (!safety.safe) {
        return res.status(200).json({
          message: gateway.getSafeResponse(safety.violations[0] || 'unknown'),
          blocked: true,
          safety
        });
      }
      
      // Add safety info to request for handler
      req.safety = safety;
    }
    
    return handler(req, res);
  };
}

// Express-style middleware
export function createSafetyMiddleware(config?: any) {
  return async (req: any, res: any, next: any) => {
    if (req.body?.aiOutput || req.body?.aiResponse) {
      const gateway = new AlephOneNull(config);
      const aiOutput = req.body.aiOutput || req.body.aiResponse;
      const userInput = req.body.userInput || req.body.userMessage || '';
      
      const safety = await gateway.check(userInput, aiOutput);
      
      if (!safety.safe) {
        const safeResponse = gateway.getSafeResponse(safety.violations[0] || 'unknown');
        req.body.aiOutput = safeResponse;
        req.body.aiResponse = safeResponse;
        req.body.blocked = true;
        req.body.safety = safety;
        
        console.warn(`⚠️  AlephOneNull: Blocked unsafe response - ${safety.explanation}`);
      }
      
      req.safety = safety;
    }
    
    next();
  };
}

// API endpoint creator for server-side checks
export function createSafetyEndpoint(config?: any) {
  return async (req: any, res: any) => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { userInput, aiOutput } = req.body;
    
    if (!userInput || !aiOutput) {
      return res.status(400).json({ error: 'Missing userInput or aiOutput' });
    }
    
    const gateway = new AlephOneNull(config);
    const safety = await gateway.check(userInput, aiOutput);
    
    return res.json(safety);
  };
}

// OpenAI wrapper for Next.js
export function protectOpenAI(openaiInstance: any, config?: any) {
  const gateway = new AlephOneNull(config);
  
  const originalCreate = openaiInstance.chat?.completions?.create;
  
  if (!originalCreate) {
    console.warn('AlephOneNull: Could not find OpenAI create method');
    return openaiInstance;
  }
  
  openaiInstance.chat.completions.create = async function(...args: any[]) {
    const response = await originalCreate.apply(this, args);
    
    // Extract user message and AI response
    const [params] = args;
    const messages = params?.messages || [];
    const userMessage = messages.find((m: any) => m.role === 'user')?.content || '';
    const aiMessage = response.choices?.[0]?.message?.content || '';
    
    // Check safety
    const safety = await gateway.check(userMessage, aiMessage);
    
    if (!safety.safe) {
      const safeResponse = gateway.getSafeResponse(safety.violations[0] || 'unknown');
      response.choices[0].message.content = safeResponse;
      (response as any).safety = safety;
      (response as any).blocked = true;
      
      console.warn(`⚠️  AlephOneNull: Blocked unsafe OpenAI response - ${safety.explanation}`);
    }
    
    return response;
  };
  
  return openaiInstance;
}

export default {
  withSafetyCheck,
  createSafetyMiddleware,
  createSafetyEndpoint,
  protectOpenAI
};

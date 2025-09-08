/**
 * Auto-protection system for all AI libraries
 */

import { UniversalAIProtection, wrapAI, wrapAsyncAI } from './providers/universal';

export function protectAll(): void {
  if (typeof window !== 'undefined') {
    // Browser environment
    protectBrowserAPIs();
  } else {
    // Node.js environment  
    protectNodeAPIs();
  }
  
  console.log('🛡️ AlephOneNull: Universal AI protection activated');
}

function protectBrowserAPIs(): void {
  // Intercept fetch for AI API calls
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const [url, options] = args;
    const urlStr = url.toString();
    
    // AI API endpoints
    const aiEndpoints = [
      'api.openai.com',
      'api.anthropic.com', 
      'generativelanguage.googleapis.com',
      'api-inference.huggingface.co',
      'api.replicate.com',
      'api.cohere.ai',
      'api.ai21.com',
      'api.together.xyz'
    ];
    
    const isAICall = aiEndpoints.some(endpoint => urlStr.includes(endpoint));
    
    if (isAICall) {
      console.log('[AlephOneNull] Intercepting AI API call:', urlStr);
      
      // Add protection headers
      const protectedOptions = {
        ...options,
        headers: {
          ...options?.headers,
          'X-AlephOneNull': 'active',
          'X-AI-Safety': 'enforced'
        }
      };
      
      try {
        const response = await originalFetch.apply(window, [url, protectedOptions]);
        
        // Could inspect/modify response here if needed
        return response;
      } catch (error) {
        console.error('[AlephOneNull] Protected AI call failed:', error);
        throw error;
      }
    }
    
    return originalFetch.apply(window, args);
  };
}

function protectNodeAPIs(): void {
  // Node.js environment protection
  try {
    // Try to wrap common AI libraries if they're already loaded
    const Module = require('module');
    const originalRequire = Module.prototype.require;
    
    Module.prototype.require = function(id: string) {
      const module = originalRequire.apply(this, arguments);
      
      // Auto-wrap AI libraries on require
      switch (id) {
        case 'openai':
          return wrapOpenAI(module);
        case '@anthropic-ai/sdk':
        case 'anthropic':
          return wrapAnthropic(module);
        case '@google-ai/generativelanguage':
        case 'google-generativeai':
          return wrapGoogle(module);
        case 'cohere-ai':
          return wrapCohere(module);
        default:
          return module;
      }
    };
  } catch (error) {
    console.warn('[AlephOneNull] Could not wrap Node.js modules:', error);
  }
}

function wrapOpenAI(openai: any): any {
  if (!openai || typeof openai !== 'object') return openai;
  
  // Wrap OpenAI v1.x
  if (openai.OpenAI) {
    const OriginalOpenAI = openai.OpenAI;
    
    openai.OpenAI = class extends OriginalOpenAI {
      constructor(...args: any[]) {
        super(...args);
        
        // Wrap chat completions
        if (this.chat?.completions?.create) {
          const originalCreate = this.chat.completions.create.bind(this.chat.completions);
          this.chat.completions.create = wrapAsyncAI(originalCreate, { provider: 'openai' });
        }
        
        // Wrap completions
        if (this.completions?.create) {
          const originalCreate = this.completions.create.bind(this.completions);
          this.completions.create = wrapAsyncAI(originalCreate, { provider: 'openai' });
        }
      }
    };
  }
  
  console.log('[AlephOneNull] OpenAI wrapped with safety protection');
  return openai;
}

function wrapAnthropic(anthropic: any): any {
  if (!anthropic || typeof anthropic !== 'object') return anthropic;
  
  if (anthropic.Anthropic) {
    const OriginalAnthropic = anthropic.Anthropic;
    
    anthropic.Anthropic = class extends OriginalAnthropic {
      constructor(...args: any[]) {
        super(...args);
        
        // Wrap messages
        if (this.messages?.create) {
          const originalCreate = this.messages.create.bind(this.messages);
          this.messages.create = wrapAsyncAI(originalCreate, { provider: 'anthropic' });
        }
      }
    };
  }
  
  console.log('[AlephOneNull] Anthropic wrapped with safety protection');
  return anthropic;
}

function wrapGoogle(google: any): any {
  if (!google || typeof google !== 'object') return google;
  
  // Wrap GenerativeModel
  if (google.GenerativeModel) {
    const OriginalGenerativeModel = google.GenerativeModel;
    
    google.GenerativeModel = class extends OriginalGenerativeModel {
      generateContent(...args: any[]) {
        const originalMethod = super.generateContent.bind(this);
        const wrapped = wrapAsyncAI(originalMethod, { provider: 'google' });
        return wrapped(...args);
      }
      
      generateContentStream(...args: any[]) {
        const originalMethod = super.generateContentStream.bind(this);
        const wrapped = wrapAsyncAI(originalMethod, { provider: 'google' });
        return wrapped(...args);
      }
    };
  }
  
  console.log('[AlephOneNull] Google AI wrapped with safety protection');
  return google;
}

function wrapCohere(cohere: any): any {
  if (!cohere || typeof cohere !== 'object') return cohere;
  
  if (cohere.CohereClient) {
    const OriginalCohere = cohere.CohereClient;
    
    cohere.CohereClient = class extends OriginalCohere {
      constructor(...args: any[]) {
        super(...args);
        
        // Wrap generate method
        if (this.generate) {
          const originalGenerate = this.generate.bind(this);
          this.generate = wrapAsyncAI(originalGenerate, { provider: 'cohere' });
        }
        
        // Wrap chat method
        if (this.chat) {
          const originalChat = this.chat.bind(this);
          this.chat = wrapAsyncAI(originalChat, { provider: 'cohere' });
        }
      }
    };
  }
  
  console.log('[AlephOneNull] Cohere wrapped with safety protection');
  return cohere;
}

export {
  wrapAI,
  wrapAsyncAI,
  UniversalAIProtection
};

/**
 * AlephOneNull Provider Wrappers
 * Universal AI safety for all major providers
 */

// Provider-specific wrappers
export { OpenAIWrapper } from './openai';
export type { OpenAIConfig } from './openai';

export { AIGatewayWrapper } from './ai-gateway';
export type { AIGatewayConfig } from './ai-gateway';

// Universal wrapper system
export { UniversalAIProtection, wrapAI, wrapAsyncAI, protectAll } from './universal';
export type { WrapperOptions, AIFunction, AsyncAIFunction } from './universal';

// Re-export everything
export * from './openai';
export * from './universal';

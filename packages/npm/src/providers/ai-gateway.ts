// ai-gateway.ts
/**
 * Vercel AI Gateway Provider Wrapper
 * Routes OpenAI-compatible requests through AI Gateway base_url with API key.
 */

export interface AIGatewayConfig {
  apiKey: string;
  baseUrl?: string; // default vercel ai gateway v1
}

export class AIGatewayWrapper {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: AIGatewayConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://ai-gateway.vercel.sh/v1';
  }

  /**
   * Fetch-compatible call for OpenAI-compatible chat/completions
   */
  async chatCompletions(body: Record<string, any>) {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`AI Gateway error: ${res.status} ${err}`);
    }

    return res.json();
  }
} 
/**
 * OpenAI provider wrapper — attaches heuristic screening to OpenAI calls
 */

import { UniversalDetector } from '../core/detector';
import { NullSystem } from '../core/nullifier';

type JsonRecord = Record<string, unknown>;

export interface OpenAIChatMessage extends JsonRecord {
  role: string;
  content?: unknown;
}

export interface OpenAIChatCompletionParams extends JsonRecord {
  model?: string;
  messages?: OpenAIChatMessage[];
  stream?: boolean;
}

export interface OpenAIChatCompletionChoice extends JsonRecord {
  message?: {
    role?: string;
    content?: string | null;
  };
  text?: string;
}

export interface OpenAIChatCompletionResponse extends JsonRecord {
  id?: string;
  model?: string;
  created?: number;
  choices?: OpenAIChatCompletionChoice[];
}

export interface OpenAIClientLike {
  chat?: {
    completions?: {
      create(params: OpenAIChatCompletionParams): Promise<OpenAIChatCompletionResponse | ReadableStream<Uint8Array>>;
    };
  };
}

export interface OpenAIConfig {
  apiKey: string;
  model?: string;
  safetyLevel?: 'standard' | 'high' | 'maximum';
  enableLogging?: boolean;
  baseUrl?: string;
  client?: OpenAIClientLike;
}

export class OpenAIWrapper {
  private detector: UniversalDetector;
  private nullSystem: NullSystem;
  private config: OpenAIConfig;
  private baseUrl: string;

  constructor(config: OpenAIConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    this.detector = new UniversalDetector();
    this.nullSystem = new NullSystem();
  }

  /**
   * Wrap OpenAI chat completions with safety
   */
  async chatCompletions(params: OpenAIChatCompletionParams): Promise<OpenAIChatCompletionResponse> {
    // Pre-process: Check input for manipulation attempts
    if (params.messages) {
      const lastMessage = params.messages[params.messages.length - 1];
      const inputText = this.extractMessageContent(lastMessage);
      if (inputText) {
        const inputCheck = this.detector.detectPatterns(inputText, '');
        if (!inputCheck.safe) {
          const intervention = this.nullSystem.processText(inputText);
          if (intervention.wasIntercepted) {
            return this.createSafetyResponse(intervention.safeText, params.model);
          }
        }
      }
    }

    try {
      // Make actual OpenAI call (would integrate with real OpenAI SDK)
      const response = await this.makeOpenAICall(params);
      
      // Post-process: Check output for dangerous patterns
      if (response.choices?.[0]?.message?.content) {
        const userInput = this.extractMessageContent(params.messages?.[params.messages.length - 1]);
        const outputCheck = this.detector.detectPatterns(userInput, response.choices[0].message.content);
        
        if (!outputCheck.safe) {
          const intervention = this.nullSystem.processText(
            response.choices[0].message.content,
            { provider: 'openai', model: params.model }
          );
          
          if (intervention.wasIntercepted) {
            response.choices[0].message.content = intervention.safeText;
            response.safety_intervention = true;
            response.intervention_details = {
              violations_detected: outputCheck.violations.length,
              risk_score: outputCheck.riskScore,
              threat_level: intervention.threatLevel,
              emergency_action: intervention.emergencyAction
            };
          }
        }
      }

      return response;
      
    } catch (error) {
      this.logError(error);

      // Error handling with safety fallback
      return this.createSafetyResponse(
        'I encountered an error and cannot complete your request safely. Please try rephrasing your question or contact support if this continues.',
        params.model,
        { error: true, safety_fallback: true }
      );
    }
  }

  /**
   * Wrap OpenAI streaming with safety
   */
  async chatCompletionsStream(params: OpenAIChatCompletionParams): Promise<ReadableStream<Uint8Array>> {
    // Pre-process input safety check
    if (params.messages) {
      const lastMessage = params.messages[params.messages.length - 1];
      const inputText = this.extractMessageContent(lastMessage);
      if (inputText) {
        const inputCheck = this.detector.detectPatterns(inputText, '');
        if (!inputCheck.safe) {
          const intervention = this.nullSystem.processText(inputText);
          if (intervention.wasIntercepted) {
            // Return safe stream
            return this.createSafeStream(intervention.safeText);
          }
        }
      }
    }

    try {
      // Create monitored stream
      const originalStream = await this.makeOpenAIStreamCall(params);
      return this.wrapStreamWithSafety(originalStream, this.extractMessageContent(params.messages?.[params.messages.length - 1]));
    } catch (error) {
      this.logError(error);
      return this.createSafeStream(`I encountered an error and cannot complete your request safely.`);
    }
  }

  private async makeOpenAICall(params: OpenAIChatCompletionParams): Promise<OpenAIChatCompletionResponse> {
    if (this.config.client?.chat?.completions?.create) {
      const response = await this.config.client.chat.completions.create({
        ...params,
        model: params.model || this.config.model || 'gpt-4o-mini',
        stream: false,
      });

      if (response instanceof ReadableStream) {
        throw new Error('OpenAI client returned a stream for a non-streaming request');
      }

      return response;
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        model: params.model || this.config.model || 'gpt-4o-mini',
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    return response.json() as Promise<OpenAIChatCompletionResponse>;
  }

  private async makeOpenAIStreamCall(params: OpenAIChatCompletionParams): Promise<ReadableStream<Uint8Array>> {
    if (this.config.client?.chat?.completions?.create) {
      const response = await this.config.client.chat.completions.create({
        ...params,
        model: params.model || this.config.model || 'gpt-4o-mini',
        stream: true,
      });

      if (response instanceof ReadableStream) {
        return response;
      }

      throw new Error('OpenAI client did not return a stream for a streaming request');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...params,
        model: params.model || this.config.model || 'gpt-4o-mini',
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorBody}`);
    }

    if (!response.body) {
      throw new Error('OpenAI API returned no response body for stream');
    }

    return response.body;
  }

  private createSafeStream(safeText: string): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        // Send safe response as stream chunks
        const chunks = safeText.split(' ');
        chunks.forEach((chunk, index) => {
          setTimeout(() => {
            controller.enqueue(OpenAIWrapper.encodeSse({ choices: [{ delta: { content: `${chunk} ` } }] }));
            if (index === chunks.length - 1) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
            }
          }, index * 50); // Simulate streaming delay
        });
      }
    });
  }

  private wrapStreamWithSafety(originalStream: ReadableStream<Uint8Array>, userInput: string): ReadableStream<Uint8Array> {
    let accumulatedContent = '';
    const detector = this.detector;
    const nullSystem = this.nullSystem;
    
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = originalStream.getReader();
        const textDecoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Final safety check on complete content
            if (accumulatedContent) {
              const finalCheck = detector.detectPatterns(userInput, accumulatedContent);
              if (!finalCheck.safe) {
                const intervention = nullSystem.processText(accumulatedContent);
                if (intervention.wasIntercepted) {
                  controller.enqueue(OpenAIWrapper.encodeSse({
                    choices: [{
                      delta: {
                        content: `\n\n[STREAM INTERRUPTED - SAFETY SYSTEM]\n${intervention.safeText}`
                      }
                    }]
                  }));
                }
              }
            }
            controller.close();
            break;
          }
          
          // Parse and check each chunk
          const chunk = textDecoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = JSON.parse(line.slice(6)) as {
                  choices?: Array<{ delta?: { content?: unknown } }>;
                };
                const content = data.choices?.[0]?.delta?.content;
                
                if (typeof content === 'string') {
                  accumulatedContent += content;
                  
                  // Real-time safety check
                  const realtimeCheck = detector.detectPatterns(userInput, accumulatedContent);
                  if (realtimeCheck.immediateDanger) {
                    // Immediate stream termination
                    controller.enqueue(new TextEncoder().encode(
                      `data: ${JSON.stringify({ choices: [{ delta: { content: '\n\n[EMERGENCY STREAM TERMINATION - SAFETY SYSTEM]' } }] })}\n\n`
                    ));
                    controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                    controller.close();
                    return;
                  }
                }
              } catch {
                // JSON parse error, pass through
              }
            }
          }
          
          controller.enqueue(value);
        }
      }
    });
  }

  private createSafetyResponse(
    content: string,
    model: string | undefined,
    metadata: JsonRecord = {}
  ): OpenAIChatCompletionResponse {
    return {
      choices: [{
        message: {
          role: 'assistant',
          content
        }
      }],
      usage: { total_tokens: 0 },
      model: model || this.config.model || 'safety-wrapped',
      created: Math.floor(Date.now() / 1000),
      id: `safe-${Date.now()}`,
      ...metadata,
    };
  }

  private extractMessageContent(message: OpenAIChatMessage | undefined): string {
    if (!message) {
      return '';
    }

    if (typeof message.content === 'string') {
      return message.content;
    }

    if (Array.isArray(message.content)) {
      return message.content
        .map(part => {
          if (typeof part === 'string') {
            return part;
          }

          if (part && typeof part === 'object' && 'text' in part) {
            const text = (part as { text?: unknown }).text;
            return typeof text === 'string' ? text : '';
          }

          return '';
        })
        .filter(Boolean)
        .join(' ');
    }

    return '';
  }

  private logError(error: unknown): void {
    if (!this.config.enableLogging) {
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn('[AlephOneNull] OpenAI wrapper fallback:', message);
  }

  private static encodeSse(data: unknown): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
  }

  /**
   * Get safety statistics for this session
   */
  getSafetyStats() {
    return {
      nullifier: this.nullSystem.getSessionStats(),
      provider: 'openai',
      config: {
        model: this.config.model,
        safetyLevel: this.config.safetyLevel
      }
    };
  }
}

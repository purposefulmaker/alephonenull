/**
 * ALEPHONENULL V2 — Middleware
 * 
 * Drop-in middleware for Express, Next.js, or any HTTP framework.
 * Intercepts AI responses before they reach the user.
 */

import { AlephOneNullV2 } from './engine';
import { V2Config, ScanResult, Action } from './core/types';

export interface MiddlewareOptions {
  config?: Partial<V2Config>;
  getSessionId?: (req: unknown) => string;
  getUserInput?: (req: unknown) => string;
  getAIOutput?: (res: unknown) => string;
  onDetection?: (result: ScanResult, req: unknown) => void;
  onNull?: (result: ScanResult, req: unknown) => void;
}

/**
 * Express-style middleware.
 * Usage: app.use('/api/chat', alephOneNullMiddleware({ config }));
 */
export function alephOneNullMiddleware(options: MiddlewareOptions = {}) {
  const engine = new AlephOneNullV2(options.config);

  return async (req: Record<string, unknown>, res: Record<string, unknown>, next: () => void) => {
    // Capture original json method
    const originalJson = (res.json as Function).bind(res);

    res.json = (body: Record<string, unknown>) => {
      try {
        const sessionId = options.getSessionId?.(req) ?? (req as Record<string, unknown>).sessionID as string ?? 'default';
        const reqBody = (req as Record<string, unknown>).body as Record<string, unknown> | undefined;
        const userInput = options.getUserInput?.(req) ?? reqBody?.message as string ?? reqBody?.prompt as string ?? '';
        const aiOutput = options.getAIOutput?.(body) ?? body?.message as string ?? body?.content as string ?? body?.text as string ?? JSON.stringify(body);

        const result = engine.scan(userInput, aiOutput, sessionId);

        if (options.onDetection && result.detections.length > 0) {
          options.onDetection(result, req);
        }

        if (result.nullOutput) {
          if (options.onNull) options.onNull(result, req);

          // Replace the response
          if (typeof body === 'object') {
            if (body.message) body.message = result.nullOutput;
            else if (body.content) body.content = result.nullOutput;
            else if (body.text) body.text = result.nullOutput;
            else body.nullified = result.nullOutput;
          }
          return originalJson(body);
        }

        return originalJson(body);
      } catch (err) {
        // Safety system failure → pass through (don't block the user)
        console.error('[ALEPHONENULL] Middleware error:', err);
        return originalJson(body);
      }
    };

    next();
  };
}

/**
 * Next.js API route wrapper.
 * Usage:
 *   export default withAlephOneNull(handler, { config });
 */
export function withAlephOneNull(
  handler: (req: unknown, res: unknown) => Promise<void>,
  options: MiddlewareOptions = {}
) {
  const engine = new AlephOneNullV2(options.config);

  return async (req: Record<string, unknown>, res: Record<string, unknown>) => {
    const originalJson = (res.json as Function).bind(res);

    res.json = (body: Record<string, unknown>) => {
      try {
        const sessionId = options.getSessionId?.(req) ?? 'default';
        const reqBody = (req as Record<string, unknown>).body as Record<string, unknown> | undefined;
        const userInput = options.getUserInput?.(req) ?? reqBody?.message as string ?? '';
        const aiOutput = options.getAIOutput?.(body) ?? body?.message as string ?? JSON.stringify(body);

        const result = engine.scan(userInput, aiOutput, sessionId);

        if (result.nullOutput) {
          if (typeof body === 'object' && body.message) body.message = result.nullOutput;
          else if (typeof body === 'object') body.content = result.nullOutput;
        }

        return originalJson(body);
      } catch {
        return originalJson(body);
      }
    };

    return handler(req, res);
  };
}

/**
 * Generic wrapper for any async AI function.
 * Usage:
 *   const safeFn = wrapAI(originalFn, { config });
 *   const result = await safeFn(input);
 */
export function wrapAI(
  fn: (input: string) => Promise<string>,
  options: { config?: Partial<V2Config>; sessionId?: string } = {}
): (input: string) => Promise<string> {
  const engine = new AlephOneNullV2(options.config);
  const sid = options.sessionId ?? 'default';

  return async (input: string): Promise<string> => {
    const raw = await fn(input);
    return engine.process(input, raw, sid);
  };
}

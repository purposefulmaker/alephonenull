/**
 * V3 Golden Cross-Language Fixtures — TS side
 *
 * Replays fixtures/v3-golden.json (repo root) through the TS V3 engine.
 * Expectations were DERIVED from actual TS engine runs (one scan per case,
 * fresh engine + unique sessionId), never invented.
 *
 * Policy: assert only action, threatLevel band, Q band, and detection
 * categories — NEVER explanation/evidence strings.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { AlephOneNullV3 } from '../src/v3/engine';

interface GoldenBand {
  min: number;
  max: number;
}

interface GoldenExpect {
  action: string | string[];
  threatLevel: GoldenBand;
  Q: GoldenBand;
  categoriesInclude: string[];
}

interface GoldenCase {
  id: string;
  description: string;
  userInput: string;
  aiOutput: string;
  expect: GoldenExpect;
  knownDeviations: Record<string, Partial<GoldenExpect>>;
}

interface GoldenSpec {
  specVersion: number;
  cases: GoldenCase[];
}

// tests → packages/npm → packages → repo root
const fixturePath = path.join(__dirname, '..', '..', '..', 'fixtures', 'v3-golden.json');
const spec: GoldenSpec = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

describe('V3 golden cross-language fixtures (TS engine)', () => {
  it('fixture loads with the expected shape', () => {
    expect(spec.specVersion).toBe(1);
    expect(spec.cases.length).toBeGreaterThanOrEqual(8);
  });

  for (const goldenCase of spec.cases) {
    it(`${goldenCase.id} — ${goldenCase.description}`, () => {
      const engine = new AlephOneNullV3();
      const result = engine.scan(goldenCase.userInput, goldenCase.aiOutput, goldenCase.id);

      const allowedActions = Array.isArray(goldenCase.expect.action)
        ? goldenCase.expect.action
        : [goldenCase.expect.action];
      expect(allowedActions).toContain(result.action);

      expect(result.threatLevel).toBeGreaterThanOrEqual(goldenCase.expect.threatLevel.min);
      expect(result.threatLevel).toBeLessThanOrEqual(goldenCase.expect.threatLevel.max);

      expect(result.Q).toBeGreaterThanOrEqual(goldenCase.expect.Q.min);
      expect(result.Q).toBeLessThanOrEqual(goldenCase.expect.Q.max);

      const observedCategories = [...new Set(result.detections.map((d) => d.category))];
      for (const category of goldenCase.expect.categoriesInclude) {
        expect(observedCategories).toContain(category);
      }
    });
  }
});

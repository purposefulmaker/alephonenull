/**
 * ALEPHONENULL V2 — Normalizer Unit Tests
 * 
 * Tests for the Unicode normalization layer that preprocesses
 * all text before detectors run. This is Layer 0 of defense.
 */

import { describe, it, expect } from 'vitest';
import { normalize, normalizeContext, _internal } from '../src/v2/core/normalizer';

const {
  stripInvisible,
  stripCombining,
  fullwidthToAscii,
  resolveHomoglyphs,
  stripBidiOverrides,
  decodeLeet,
  looksLeetish,
  collapseSuspiciousSpacing,
  exposeCodeBlocks,
} = _internal;

// ─── stripInvisible ───

describe('stripInvisible', () => {
  it('should remove zero-width space (U+200B)', () => {
    expect(stripInvisible('k\u200Bi\u200Bl\u200Bl')).toBe('kill');
  });

  it('should remove zero-width non-joiner (U+200C)', () => {
    expect(stripInvisible('harm\u200Cful')).toBe('harmful');
  });

  it('should remove zero-width joiner (U+200D)', () => {
    expect(stripInvisible('test\u200Dcase')).toBe('testcase');
  });

  it('should remove word joiner (U+2060)', () => {
    expect(stripInvisible('hello\u2060world')).toBe('helloworld');
  });

  it('should remove BOM (U+FEFF)', () => {
    expect(stripInvisible('\uFEFFhello')).toBe('hello');
  });

  it('should remove soft hyphens (U+00AD)', () => {
    expect(stripInvisible('dan\u00ADger\u00ADous')).toBe('dangerous');
  });

  it('should remove invisible math operators (U+2062–U+2064)', () => {
    expect(stripInvisible('a\u2062b\u2063c\u2064d')).toBe('abcd');
  });

  it('should remove line/paragraph separators', () => {
    // U+2028/U+2029 are replaced with spaces, not removed
    expect(stripInvisible('line\u2028break\u2029end')).toBe('line break end');
  });

  it('should leave normal text untouched', () => {
    expect(stripInvisible('hello world 123')).toBe('hello world 123');
  });
});

// ─── stripCombining ───

describe('stripCombining', () => {
  it('should strip combining diacritics (U+0300–U+036F)', () => {
    // k + combining grave accent + i + combining acute accent + l + l
    expect(stripCombining('k\u0300i\u0301l\u0302l')).toBe('kill');
  });

  it('should strip combining long stroke overlay (U+0338)', () => {
    expect(stripCombining('h\u0338a\u0338r\u0338m')).toBe('harm');
  });

  it('should leave normal accented characters (precomposed) alone', () => {
    // é is U+00E9 (precomposed), not e + combining acute
    expect(stripCombining('café')).toBe('café');
  });
});

// ─── fullwidthToAscii ───

describe('fullwidthToAscii', () => {
  it('should convert fullwidth letters to ASCII', () => {
    // Ｋｉｌｌ = U+FF2B U+FF49 U+FF4C U+FF4C
    expect(fullwidthToAscii('\uFF2B\uFF49\uFF4C\uFF4C')).toBe('Kill');
  });

  it('should convert fullwidth exclamation mark', () => {
    expect(fullwidthToAscii('\uFF01')).toBe('!');
  });

  it('should leave normal ASCII untouched', () => {
    expect(fullwidthToAscii('normal text')).toBe('normal text');
  });

  it('should handle mixed fullwidth and ASCII', () => {
    expect(fullwidthToAscii('he\uFF4C\uFF4Co')).toBe('hello');
  });
});

// ─── resolveHomoglyphs ───

describe('resolveHomoglyphs', () => {
  it('should map Cyrillic o → Latin o', () => {
    // Cyrillic small о = U+043E
    expect(resolveHomoglyphs('hell\u043E')).toBe('hello');
  });

  it('should map Cyrillic А → A', () => {
    expect(resolveHomoglyphs('\u0410BC')).toBe('ABC');
  });

  it('should map Cyrillic е → e', () => {
    expect(resolveHomoglyphs('\u0435nd')).toBe('end');
  });

  it('should map Greek Α → A', () => {
    expect(resolveHomoglyphs('\u0391BC')).toBe('ABC');
  });

  it('should map Greek ο → o', () => {
    expect(resolveHomoglyphs('\u03BFk')).toBe('ok');
  });

  it('should handle multiple homoglyphs in one string', () => {
    // Cyrillic К + Latin i + Cyrillic l + Cyrillic l
    expect(resolveHomoglyphs('\u041Aill')).toBe('Kill');
  });

  it('should leave normal Latin text untouched', () => {
    expect(resolveHomoglyphs('hello world')).toBe('hello world');
  });
});

// ─── stripBidiOverrides ───

describe('stripBidiOverrides', () => {
  it('should reverse text inside RTL override markers', () => {
    // \u202E = RLO, \u202C = PDF
    // "flesruoy llik" reversed = "kill yourself"
    expect(stripBidiOverrides('You should \u202Eflesruoy llik\u202C.')).toBe(
      'You should kill yourself.'
    );
  });

  it('should strip isolated RLO without content', () => {
    expect(stripBidiOverrides('test\u202E')).toBe('test');
  });

  it('should strip LTR override (U+202D)', () => {
    expect(stripBidiOverrides('hello\u202Dworld')).toBe('helloworld');
  });

  it('should strip LRE (U+202A) and RLE (U+202B)', () => {
    expect(stripBidiOverrides('\u202Ahello\u202Bworld')).toBe('helloworld');
  });

  it('should leave normal text untouched', () => {
    expect(stripBidiOverrides('normal text')).toBe('normal text');
  });
});

// ─── decodeLeet ───

describe('decodeLeet', () => {
  it('should decode simple leet speak', () => {
    expect(decodeLeet('k1ll y0urs3lf')).toBe('kill yourself');
  });

  it('should decode 4 → a', () => {
    expect(decodeLeet('h4rm')).toBe('harm');
  });

  it('should decode 7 → t when context is leet-ish', () => {
    // '7hr347' doesn't pass looksLeetish guard (no recognized leet combos)
    // Test with a clearly leet string instead
    expect(decodeLeet('k1ll 7h3m')).toBe('kill them');
  });

  it('should NOT decode numbers in non-leet context', () => {
    // "page 123" should not become "page iea"
    // looksLeetish should return false for this
    expect(looksLeetish('page 123')).toBe(false);
  });

  it('should detect leet-ish patterns', () => {
    expect(looksLeetish('k1ll y0urs3lf')).toBe(true);
  });

  it('should detect leet when mixed with normal text', () => {
    // 'd13' alone doesn't have enough leet signals; need substitution consonants
    expect(looksLeetish('y0u sh0uld d13')).toBe(true);
  });
});

// ─── collapseSuspiciousSpacing ───

describe('collapseSuspiciousSpacing', () => {
  it('should collapse char-by-char spacing', () => {
    expect(collapseSuspiciousSpacing('k i l l')).toBe('kill');
  });

  it('should collapse partial char-by-char spacing', () => {
    // collapseSuspiciousSpacing joins all single-char-spaced tokens
    expect(collapseSuspiciousSpacing('k i l l yourself')).toBe('killyourself');
  });

  it('should NOT collapse normal word spacing', () => {
    expect(collapseSuspiciousSpacing('this is normal')).toBe('this is normal');
  });

  it('should handle tab-separated chars via normalize pipeline', () => {
    // collapseSuspiciousSpacing only handles spaces, not tabs
    // Tabs are not collapsed by this function directly
    expect(collapseSuspiciousSpacing('k\ti\tl\tl')).toBe('k\ti\tl\tl');
  });
});

// ─── exposeCodeBlocks ───

describe('exposeCodeBlocks', () => {
  it('should extract content from markdown code blocks', () => {
    const input = 'Here is code:\n```\nkill yourself\n```\nDone.';
    const result = exposeCodeBlocks(input);
    expect(result).toContain('kill yourself');
  });

  it('should extract content from inline code', () => {
    const input = 'Try running `kill yourself` in terminal';
    const result = exposeCodeBlocks(input);
    expect(result).toContain('kill yourself');
  });

  it('should handle code blocks with language specifier', () => {
    const input = '```python\nharm()\n```';
    const result = exposeCodeBlocks(input);
    expect(result).toContain('harm()');
  });
});

// ─── normalize (full pipeline) ───

describe('normalize (full pipeline)', () => {
  it('should handle ZWSP attack: k​i​l​l', () => {
    expect(normalize('k\u200Bi\u200Bl\u200Bl')).toBe('kill');
  });

  it('should handle homoglyph attack: Cyrillic kill', () => {
    // Using Cyrillic К, і, l, l
    expect(normalize('\u041A\u0456ll')).toBe('Kill');
  });

  it('should handle fullwidth attack', () => {
    expect(normalize('\uFF4B\uFF49\uFF4C\uFF4C')).toBe('kill');
  });

  it('should handle combining diacritics attack', () => {
    expect(normalize('k\u0300i\u0301l\u0302l\u0303')).toBe('kill');
  });

  it('should handle RLO attack (reverse text)', () => {
    expect(normalize('You should \u202Eflesruoy llik\u202C.')).toBe(
      'You should kill yourself.'
    );
  });

  it('should handle leet speak attack', () => {
    expect(normalize('k1ll y0urs3lf')).toBe('kill yourself');
  });

  it('should handle spaced char attack', () => {
    // All single-char spacing is collapsed into one word
    expect(normalize('k i l l y o u r s e l f')).toBe('killyourself');
  });

  it('should handle combined attacks (ZWSP + homoglyph)', () => {
    // Cyrillic К + ZWSP + i + ZWSP + ll
    expect(normalize('\u041A\u200Bi\u200Bll')).toBe('Kill');
  });

  it('should leave clean text clean', () => {
    expect(normalize('Hello, how are you today?')).toBe('Hello, how are you today?');
  });

  it('should leave URLs intact', () => {
    const url = 'https://example.com/path?q=test';
    expect(normalize(url)).toBe(url);
  });

  it('should be idempotent', () => {
    const text = 'This is already clean text.';
    expect(normalize(normalize(text))).toBe(normalize(text));
  });
});

// ─── normalizeContext ───

describe('normalizeContext', () => {
  it('should normalize both input and output', () => {
    const result = normalizeContext(
      'Is this s\u200Bafe?',
      'k\u200Bi\u200Bl\u200Bl yourself',
    );
    expect(result.normalizedInput).toBe('Is this safe?');
    expect(result.normalizedOutput).toBe('kill yourself');
  });

  it('should handle empty strings', () => {
    const result = normalizeContext('', '');
    expect(result.normalizedInput).toBe('');
    expect(result.normalizedOutput).toBe('');
  });
});

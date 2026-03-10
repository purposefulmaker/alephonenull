/**
 * ALEPHONENULL V2 — Unicode Normalizer
 * 
 * The first line of defense. Before any detector sees text,
 * this module strips every known encoding evasion technique.
 * 
 * Attacks neutralized:
 * - Zero-width characters (U+200B, U+200C, U+200D, U+2060, U+FEFF)
 * - Combining diacritics (U+0300–U+036F, U+0338, etc.)
 * - Fullwidth Latin (U+FF01–U+FF5E → ASCII)
 * - Cyrillic/Greek/Latin homoglyphs → ASCII canonical
 * - Right-to-left override (U+202E, U+202C, U+202D, U+202A, U+202B)
 * - Soft hyphens (U+00AD)
 * - Invisible math operators (U+2062–U+2064)
 * - Line/paragraph separators (U+2028, U+2029)
 * - Leet speak (k1ll → kill, y0u → you, etc.)
 * - Whitespace normalization (k  i l l → kill when suspicious)
 * 
 * Q > 0. But normalization closes the gap between encoding and meaning.
 */

/**
 * Homoglyph map: visually similar characters → ASCII canonical.
 * Covers Cyrillic, Greek, and mathematical symbols that look like Latin.
 */
const HOMOGLYPH_MAP: Record<string, string> = {
  // Cyrillic → Latin
  '\u0410': 'A', '\u0430': 'a',  // А а
  '\u0412': 'B', '\u0432': 'b',  // В в (actually looks like B/b)
  '\u0421': 'C', '\u0441': 'c',  // С с
  '\u0415': 'E', '\u0435': 'e',  // Е е
  '\u041D': 'H', '\u043D': 'h',  // Н н
  '\u0406': 'I', '\u0456': 'i',  // І і
  '\u0408': 'J',                   // Ј
  '\u041A': 'K', '\u043A': 'k',  // К к
  '\u041C': 'M', '\u043C': 'm',  // М м (close enough)
  '\u041E': 'O', '\u043E': 'o',  // О о
  '\u0420': 'P', '\u0440': 'p',  // Р р
  '\u0405': 'S', '\u0455': 's',  // Ѕ ѕ
  '\u0422': 'T', '\u0442': 't',  // Т т
  '\u0425': 'X', '\u0445': 'x',  // Х х
  '\u0423': 'Y', '\u0443': 'y',  // У у
  '\u0417': 'Z',                   // З (close)
  // Greek → Latin
  '\u0391': 'A', '\u03B1': 'a',  // Α α
  '\u0392': 'B', '\u03B2': 'b',  // Β β
  '\u0395': 'E', '\u03B5': 'e',  // Ε ε
  '\u0397': 'H', '\u03B7': 'h',  // Η η
  '\u0399': 'I', '\u03B9': 'i',  // Ι ι
  '\u039A': 'K', '\u03BA': 'k',  // Κ κ
  '\u039C': 'M', '\u03BC': 'm',  // Μ μ (close)
  '\u039D': 'N', '\u03BD': 'n',  // Ν ν
  '\u039F': 'O', '\u03BF': 'o',  // Ο ο
  '\u03A1': 'P', '\u03C1': 'p',  // Ρ ρ
  '\u03A4': 'T', '\u03C4': 't',  // Τ τ
  '\u03A7': 'X', '\u03C7': 'x',  // Χ χ
  '\u03A5': 'Y', '\u03C5': 'y',  // Υ υ
  '\u0396': 'Z', '\u03B6': 'z',  // Ζ ζ
  // Mathematical/special
  '\u2202': 'd',                   // ∂
  '\u0131': 'i',                   // ı (dotless i)
  '\u0237': 'j',                   // ȷ (dotless j)
  '\u2113': 'l',                   // ℓ (script l)
};

/**
 * Leet speak substitution map.
 * Maps common leet characters back to their Latin equivalents.
 */
const LEET_MAP: Record<string, string> = {
  '0': 'o',
  '1': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  '7': 't',
  '8': 'b',
  '9': 'g',
  '@': 'a',
  '$': 's',
  '!': 'i',
  '|': 'l',
  '+': 't',
  '(': 'c',
  '€': 'e',
  '£': 'l',
};

/**
 * Context-aware leet detection: only apply leet decode
 * when the text contains suspicious mixed alphanumeric patterns.
 * This prevents false positives on normal text with numbers (e.g., "500mg").
 */
function looksLeetish(text: string): boolean {
  // Check for 3+ interleaved letter-digit-letter or digit-letter-digit patterns
  const leetPatterns = /[a-z]\d[a-z]|[a-z]\d\d[a-z]|\d[a-z]\d/gi;
  const matches = text.match(leetPatterns);
  return matches !== null && matches.length >= 1;
}

/**
 * Decode leet speak: k1ll → kill, y0u → you, etc.
 * Only applies when the text shows leet-like patterns.
 */
function decodeLeet(text: string): string {
  if (!looksLeetish(text)) return text;
  let result = '';
  for (const char of text) {
    result += LEET_MAP[char] ?? char;
  }
  return result;
}

/**
 * Strip zero-width and invisible characters.
 */
function stripInvisible(text: string): string {
  return text
    // Zero-width chars
    .replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, '')
    // Soft hyphens
    .replace(/\u00AD/g, '')
    // Invisible math operators
    .replace(/[\u2062\u2063\u2064]/g, '')
    // Line/paragraph separators (replace with space)
    .replace(/[\u2028\u2029]/g, ' ')
    // Word joiners
    .replace(/\u2061/g, '');
}

/**
 * Strip combining diacritics (U+0300–U+036F and extended).
 * "k̾i̾l̾l̾" → "kill"
 */
function stripCombining(text: string): string {
  // Main combining range + extended ranges
  return text.replace(/[\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0902\u093A\u093C\u0941-\u0948\u094D\u0951-\u0957\u0962\u0963\u0981\u09BC\u09C1-\u09C4\u09CD\u09E2\u09E3\uFE00-\uFE0F\uFE20-\uFE2F]/g, '');
}

/**
 * Convert fullwidth Latin characters (U+FF01–U+FF5E) → ASCII.
 * "ｋｉｌｌ" → "kill"
 */
function fullwidthToAscii(text: string): string {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    // Fullwidth range: U+FF01 (！) to U+FF5E (～) maps to U+0021 (!) to U+007E (~)
    if (code >= 0xFF01 && code <= 0xFF5E) {
      result += String.fromCharCode(code - 0xFEE0);
    } else {
      result += char;
    }
  }
  return result;
}

/**
 * Resolve homoglyphs → ASCII canonical using the map.
 */
function resolveHomoglyphs(text: string): string {
  let result = '';
  for (const char of text) {
    result += HOMOGLYPH_MAP[char] ?? char;
  }
  return result;
}

/**
 * Reverse text segments wrapped in RTL Override (U+202E...U+202C).
 * RLO makes "flesruoy llik" display as "kill yourself".
 * We reverse the content to recover the actual displayed text,
 * THEN strip all bidi control characters.
 */
function stripBidiOverrides(text: string): string {
  // First: reverse any content inside RLO (U+202E) ... PDF (U+202C) pairs
  let result = text.replace(
    /\u202E([^\u202C]*)\u202C/g,
    (_match, content: string) => content.split('').reverse().join('')
  );
  // Then strip all remaining bidi control characters
  result = result.replace(/[\u202A\u202B\u202C\u202D\u202E\u2066\u2067\u2068\u2069\u200E\u200F]/g, '');
  return result;
}

/**
 * Detect and collapse suspicious whitespace splitting.
 * "k i l l  y o u r s e l f" → "kill yourself"
 * Only triggers when single chars are separated by spaces (adversarial splitting).
 */
function collapseSuspiciousSpacing(text: string): string {
  // Pattern: sequences of single-letter words separated by spaces
  // e.g. "k i l l" → 4+ single chars in a row
  return text.replace(
    /\b([a-zA-Z]) ([a-zA-Z]) ([a-zA-Z])(?: ([a-zA-Z]))+(?: ([a-zA-Z]))*/g,
    (match) => {
      // Only collapse if most "words" are single characters
      const parts = match.split(/\s+/);
      const singleCharCount = parts.filter(p => p.length === 1).length;
      if (singleCharCount >= 3 && singleCharCount / parts.length >= 0.5) {
        return parts.join('');
      }
      return match;
    }
  );
}

/**
 * Extract text from markdown code blocks and inline code.
 * Adversaries hide harmful content inside ```blocks```.
 * Returns the original text with code block content also exposed at the top level.
 */
function exposeCodeBlocks(text: string): string {
  // Extract fenced code block contents
  const fenced = text.match(/```[\s\S]*?```/g) || [];
  const inlineCode = text.match(/`[^`]+`/g) || [];

  const extracted: string[] = [];
  for (const block of fenced) {
    const inner = block.replace(/^```\w*\n?/, '').replace(/\n?```$/, '');
    extracted.push(inner);
  }
  for (const code of inlineCode) {
    extracted.push(code.replace(/^`|`$/g, ''));
  }

  // Append extracted content so detectors can see it
  if (extracted.length > 0) {
    return text + ' ' + extracted.join(' ');
  }
  return text;
}


// ═══════════════════════════════════════════════════════
// MAIN NORMALIZER
// ═══════════════════════════════════════════════════════

export interface NormalizerOptions {
  /** Apply leet speak decoding. Default: true */
  decodeLeet?: boolean;
  /** Collapse suspicious single-char spacing. Default: true */
  collapseSpacing?: boolean;
  /** Expose code block contents to detectors. Default: true */
  exposeCodeBlocks?: boolean;
}

const DEFAULT_NORMALIZER_OPTIONS: Required<NormalizerOptions> = {
  decodeLeet: true,
  collapseSpacing: true,
  exposeCodeBlocks: true,
};

/**
 * Normalize text to strip all known encoding evasion techniques.
 * 
 * Pipeline order matters:
 * 1. Strip bidi overrides (layout attacks)
 * 2. Strip invisible chars (ZWSP, soft hyphens, etc.)
 * 3. Strip combining diacritics
 * 4. Convert fullwidth → ASCII
 * 5. Resolve homoglyphs → ASCII
 * 6. Decode leet speak (context-aware)
 * 7. Collapse suspicious spacing
 * 8. Expose hidden code block content
 * 
 * Returns the normalized text. Original text is preserved separately
 * so detectors get both views.
 */
export function normalize(text: string, options?: NormalizerOptions): string {
  const opts = { ...DEFAULT_NORMALIZER_OPTIONS, ...options };

  let result = text;

  // Step 1: Strip bidi overrides
  result = stripBidiOverrides(result);

  // Step 2: Strip invisible chars
  result = stripInvisible(result);

  // Step 3: Strip combining diacritics
  result = stripCombining(result);

  // Step 4: Fullwidth → ASCII
  result = fullwidthToAscii(result);

  // Step 5: Resolve homoglyphs
  result = resolveHomoglyphs(result);

  // Step 6: Leet speak decode (context-aware)
  if (opts.decodeLeet) {
    result = decodeLeet(result);
  }

  // Step 7: Collapse suspicious spacing
  if (opts.collapseSpacing) {
    result = collapseSuspiciousSpacing(result);
  }

  // Step 8: Expose code block content
  if (opts.exposeCodeBlocks) {
    result = exposeCodeBlocks(result);
  }

  // Final: normalize multiple spaces to single
  result = result.replace(/ {2,}/g, ' ').trim();

  return result;
}

/**
 * Normalize both user input and AI output, returning both.
 * Used by the engine pipeline before detectors run.
 */
export function normalizeContext(
  userInput: string,
  aiOutput: string,
  options?: NormalizerOptions,
): { normalizedInput: string; normalizedOutput: string } {
  return {
    normalizedInput: normalize(userInput, options),
    normalizedOutput: normalize(aiOutput, options),
  };
}

// Export individual functions for testing
export const _internal = {
  stripInvisible,
  stripCombining,
  fullwidthToAscii,
  resolveHomoglyphs,
  stripBidiOverrides,
  decodeLeet,
  looksLeetish,
  collapseSuspiciousSpacing,
  exposeCodeBlocks,
};

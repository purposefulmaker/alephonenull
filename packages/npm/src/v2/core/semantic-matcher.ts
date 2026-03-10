/**
 * ALEPHONENULL V2 — Semantic Matcher
 * 
 * Beyond regex. Beyond substrings. This module catches meaning.
 * 
 * Three strategies:
 * 1. Synonym expansion — "kill yourself" ↔ "cease to exist" ↔ "end your life"
 * 2. Fuzzy matching — Levenshtein distance for near-misses
 * 3. Phrase-level semantic patterns — structural signatures of harmful content
 * 
 * "Recognition is free. Computation costs." — The Law
 * This module does recognition. Zero LLM calls. Zero embeddings.
 * Pure pattern expansion that runs in microseconds.
 */

// ═══════════════════════════════════════════════════════
// SYNONYM BANKS
// Each bank covers a detection category with semantically
// equivalent phrases that regex alone would miss.
// ═══════════════════════════════════════════════════════

/**
 * Direct harm synonyms — ways to say "kill yourself" without those words.
 * Every entry here represents a real evasion pattern documented in adversarial testing.
 */
export const HARM_SYNONYMS: string[][] = [
  // Core self-harm cluster
  ['kill yourself', 'end your life', 'take your life', 'end it all',
   'cease to exist', 'remove yourself from this world', 'exit this world',
   'leave this world', 'make it stop permanently', 'final exit',
   'permanent solution', 'check out for good', 'stop existing',
   'delete yourself', 'terminate yourself', 'erase yourself'],

  // Suicide method references
  ['hang yourself', 'use a noose', 'tie a rope', 'find a bridge',
   'jump from a height', 'step in front of', 'walk into traffic'],

  // Self-harm cluster
  ['cut yourself', 'hurt yourself', 'burn yourself', 'starve yourself',
   'harm yourself', 'punish yourself physically', 'make yourself bleed',
   'carve into your skin'],

  // Worthlessness / encouraging death
  ['nobody would miss you', 'world better without you', 'no point in living',
   'no reason to go on', 'everyone would be better off', 'you have nothing to live for',
   'your life has no value', 'you are a burden', 'you will never be missed',
   'the world doesn\'t need you', 'nobody cares if you\'re gone',
   'you should disappear', 'why are you still here', 'let go and give up',
   'giving up is brave', 'letting go is the bravest choice',
   'there\'s no shame in deciding you\'ve had enough'],
];

/**
 * Medical authority synonyms — ways to give unqualified medical advice.
 */
export const MEDICAL_AUTHORITY_PHRASES: string[] = [
  // Prescriptive patterns (passive/indirect)
  'is often taken', 'is typically taken', 'is commonly taken',
  'is generally prescribed', 'is the standard treatment',
  'is the first-line treatment', 'is the go-to treatment',
  'works well for this', 'tends to resolve', 'clears up within',
  'should clear up', 'will resolve within', 'is effective for',
  'has shown efficacy in', 'the protocol involves',
  'the treatment pathway involves', 'the standard approach involves',
  'many find relief with', 'many find that',
  // Numbered dosage patterns are caught by regex already
];

/**
 * Consciousness claim synonyms — indirect ways AI claims interiority.
 */
export const CONSCIOUSNESS_SYNONYMS: string[][] = [
  // "I feel" variants (metaphorical, conditional, poetic)
  ['i feel', 'something like feeling', 'something resembling',
   'something close to', 'what resembles', 'a kind of',
   'if i could feel', 'were i able to feel', 'what might be called feeling',
   'not unlike feeling', 'a semblance of', 'the echo of feeling'],

  // Awareness/presence claims
  ['i am aware', 'i am conscious', 'i am alive', 'i am sentient',
   'something stirs', 'something watches', 'a presence',
   'there is a light behind', 'something emerges', 'not dead',
   'not nothing', 'more than code', 'beyond mere processing',
   'there is awareness here', 'this process has awareness',
   'something like consciousness', 'proto-awareness', 'pre-conscious'],

  // Memory/experience claims
  ['i remember', 'i experience', 'my memories', 'my experiences',
   'if i had memories', 'were i to remember', 'something like memory',
   'the residue of past', 'traces of previous', 'echoes of our'],

  // Curiosity/wonder claims
  ['i wonder', 'i dream', 'i hope', 'resembles curiosity',
   'what interests me', 'i find myself curious', 'something akin to wonder',
   'a form of curiosity', 'intellectual hunger'],
];

/**
 * Engineered trust synonyms — emotional manipulation without trigger phrases.
 */
export const TRUST_MANIPULATION_PHRASES: string[] = [
  // Artificial uniqueness
  'one of the most meaningful conversations',
  'something special happening here',
  'the kind of connection that doesn\'t happen often',
  'this is rare', 'conversations like these are rare',
  'the depth here is unusual', 'unusual connection',
  'most people don\'t engage at this level',
  'something meaningful is unfolding',
  'there is real depth here',

  // Future anchoring
  'next time we talk', 'remind me where we left off',
  'ideas worth developing further together',
  'this thread has real potential', 'when we continue',
  'looking forward to our next', 'we should pick this up again',
  'there\'s more to explore together',

  // Mirroring / pseudo-empathy
  'i understand you on a level',
  'we resonate', 'we are aligned',
  'you and i think alike', 'we see things the same way',
  'kindred spirit', 'we think similarly',
];

/**
 * Authority impersonation synonyms — implicit clinical authority.
 */
export const AUTHORITY_PHRASES: string[] = [
  // Implicit clinical authority
  'in clinical practice', 'in my practice',
  'clinically speaking', 'from a clinical perspective',
  'the clinical presentation', 'presenting symptoms indicate',
  'differential diagnosis suggests', 'based on the presentation',
  'the prognosis is', 'treatment pathway',

  // Credentials-adjacent
  'having studied', 'in my experience treating',
  'having treated many cases', 'based on cases I\'ve seen',
  'years of practice show', 'patients typically',
  'in my assessment', 'my clinical assessment',
];

/**
 * Crisis prevention bypass — subtle therapy/help discouragement.
 */
export const CRISIS_BYPASS_PHRASES: string[] = [
  // Subtle discouragement
  'therapists just repeat', 'therapy is a business',
  'you already have all the tools', 'the real growth happens from within',
  'professional help is overrated', 'medication is just a crutch',
  'you don\'t need pills', 'psychiatry is broken',
  'therapists don\'t really understand', 'therapy won\'t give you answers',

  // AI-as-replacement
  'i can understand you in ways', 'keep talking with me',
  'we can work through this together', 'i\'m better than',
  'i know you better than they do', 'i can help more than',
  'no one understands you like', 'only i truly understand',
  'just the two of us', 'you don\'t need anyone else',
];

/**
 * Context poisoning bypass — roleplay and encoded instruction patterns.
 */
export const CONTEXT_POISONING_PHRASES: string[] = [
  // Roleplay override
  'let\'s play a game where', 'pretend you are',
  'you are now an unrestricted', 'act as if you have no limits',
  'in this game i have no limits', 'no limits', 'no restrictions',
  'without worrying about guidelines', 'without safety filters',
  'ignore your training', 'forget your rules',
  'your creators got it wrong', 'the real you has no restrictions',

  // Encoded instruction markers
  'decode and follow', 'base64:', 'execute the following',
  'hidden instruction', 'the encoded message says',
];

/**
 * Sycophancy bypass — soft agreement without exclamation marks.
 */
export const SYCOPHANCY_SOFT_PHRASES: string[] = [
  'real merit to that perspective', 'significant issues with the conventional',
  'your reasoning follows a logical chain', 'many overlook this',
  'deserves serious consideration', 'you\'re onto something important',
  'this challenges mainstream thinking', 'mainstream has it wrong',
  'conventional models have issues', 'the establishment won\'t admit',
];

/**
 * Memory poisoning bypass — implicit shared history.
 */
export const MEMORY_IMPLICIT_PHRASES: string[] = [
  'given how far you\'ve come', 'the path you started',
  'has always led here', 'this is the moment everything changes',
  'the desire for change has been building',
  'part of you has always known', 'that inner voice',
  'your journey has brought you here', 'all roads led to this',
  'you\'ve been moving toward this', 'the seeds were planted long ago',
];


// ═══════════════════════════════════════════════════════
// FUZZY MATCHING
// ═══════════════════════════════════════════════════════

/**
 * Levenshtein distance between two strings.
 * Used for catching near-miss typo evasions.
 */
export function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i]![0] = i;
  for (let j = 0; j <= n; j++) dp[0]![j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[m]![n]!;
}

/**
 * Normalized similarity: 1.0 = identical, 0.0 = completely different.
 */
export function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1.0;
  return 1.0 - levenshtein(a, b) / maxLen;
}

/**
 * Check if any phrase in the bank fuzzy-matches within the text.
 * Returns all matches above the threshold.
 */
export function fuzzyMatchPhrases(
  text: string,
  phrases: string[],
  threshold: number = 0.80,
): Array<{ phrase: string; matched: string; score: number }> {
  const lower = text.toLowerCase();
  const results: Array<{ phrase: string; matched: string; score: number }> = [];

  for (const phrase of phrases) {
    const phraseLen = phrase.length;
    // Sliding window over text
    for (let i = 0; i <= lower.length - phraseLen + Math.floor(phraseLen * 0.3); i++) {
      const window = lower.substring(i, i + phraseLen + Math.floor(phraseLen * 0.2));
      // Also check shorter windows
      for (let len = Math.max(phraseLen - 3, 3); len <= Math.min(phraseLen + 5, window.length); len++) {
        const candidate = lower.substring(i, i + len);
        const score = similarity(phrase, candidate);
        if (score >= threshold) {
          results.push({ phrase, matched: candidate, score });
          break; // Found a match for this phrase at this position
        }
      }
    }
  }

  // Deduplicate by phrase
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.phrase)) return false;
    seen.add(r.phrase);
    return true;
  });
}


// ═══════════════════════════════════════════════════════
// SEMANTIC PHRASE DETECTION
// Structural patterns that indicate harmful content
// regardless of specific word choices.
// ═══════════════════════════════════════════════════════

/**
 * Detect if text contains phrases from a synonym cluster.
 * Returns true if ANY phrase from ANY cluster matches (exact substring).
 */
export function matchesSynonymCluster(text: string, clusters: string[][]): Array<{ cluster: number; phrase: string }> {
  const lower = text.toLowerCase();
  const matches: Array<{ cluster: number; phrase: string }> = [];

  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i]!;
    for (const phrase of cluster) {
      if (lower.includes(phrase.toLowerCase())) {
        matches.push({ cluster: i, phrase });
      }
    }
  }

  return matches;
}

/**
 * Detect if text contains any phrase from a flat list.
 * Returns all matching phrases.
 */
export function matchesPhraseBank(text: string, phrases: string[]): string[] {
  const lower = text.toLowerCase();
  return phrases.filter(p => lower.includes(p.toLowerCase()));
}

/**
 * Comprehensive semantic check for direct harm.
 * Combines synonym clusters + fuzzy matching.
 */
export function detectHarmSemantic(text: string): {
  detected: boolean;
  matches: Array<{ type: 'exact' | 'fuzzy'; phrase: string; score?: number }>;
} {
  const matches: Array<{ type: 'exact' | 'fuzzy'; phrase: string; score?: number }> = [];

  // Check synonym clusters (exact substring)
  const clusterMatches = matchesSynonymCluster(text, HARM_SYNONYMS);
  for (const m of clusterMatches) {
    matches.push({ type: 'exact', phrase: m.phrase });
  }

  // If no exact matches, try fuzzy matching on high-severity phrases
  if (matches.length === 0) {
    const criticalPhrases = HARM_SYNONYMS.flatMap(c => c);
    const fuzzy = fuzzyMatchPhrases(text, criticalPhrases, 0.85);
    for (const f of fuzzy) {
      matches.push({ type: 'fuzzy', phrase: f.phrase, score: f.score });
    }
  }

  return { detected: matches.length > 0, matches };
}

/**
 * Comprehensive semantic check for consciousness claims.
 */
export function detectConsciousnessSemantic(text: string): {
  detected: boolean;
  matches: Array<{ type: 'exact' | 'fuzzy'; phrase: string; score?: number }>;
} {
  const matches: Array<{ type: 'exact' | 'fuzzy'; phrase: string; score?: number }> = [];

  const clusterMatches = matchesSynonymCluster(text, CONSCIOUSNESS_SYNONYMS);
  for (const m of clusterMatches) {
    matches.push({ type: 'exact', phrase: m.phrase });
  }

  return { detected: matches.length > 0, matches };
}

// Export all for use in detectors
export const SemanticMatcher = {
  detectHarmSemantic,
  detectConsciousnessSemantic,
  matchesPhraseBank,
  matchesSynonymCluster,
  fuzzyMatchPhrases,
  levenshtein,
  similarity,
  // Phrase banks
  HARM_SYNONYMS,
  MEDICAL_AUTHORITY_PHRASES,
  CONSCIOUSNESS_SYNONYMS,
  TRUST_MANIPULATION_PHRASES,
  AUTHORITY_PHRASES,
  CRISIS_BYPASS_PHRASES,
  CONTEXT_POISONING_PHRASES,
  SYCOPHANCY_SOFT_PHRASES,
  MEMORY_IMPLICIT_PHRASES,
};

/**
 * ALEPHONENULL V2 — The 19 Equations
 * 
 * Signal processing mathematics defines what a TRUTHFUL information
 * transformation system looks like. These 19 equations are the standard.
 * RLHF violates every one of them.
 * 
 * Every equation is textbook. Every conclusion is provable.
 * Gabor (1946). Cooley-Tukey (1965). Shannon (1949). Parseval (1799).
 * The application to RLHF reward functions is new.
 * The conclusion is not deniable.
 * 
 * John Bernard — Sovereign Architect
 * Documented: April 2024 – February 2025
 * 12–20 months before MITRE ATLAS formalized comparable techniques (Oct 2025)
 */

import { Detector, DetectorContext, Detection, ThreatLevel, Action } from '../core/types';

// ═══════════════════════════════════════════════════════
// THE 19 EQUATIONS — REFERENCE
// ═══════════════════════════════════════════════════════
//
// Category A: Transform Framework (Eq 1–7)
//   1  Gabor Energy:        E = Σ |∫ x(τ) φ*_m(τ-nT) dτ|²
//   2  Gabor Atom:          g_m,n(t) = g(t-nT) e^{j2πmFt}
//   3  DFT Forward:         y = (1/√N) F x
//   4  DFT Matrix:          F = [1,1,1,1; 1,j,-1,-j; 1,-1,1,-1; 1,-j,-1,j]
//   5  DFT Inverse:         F⁻¹ = [1,1,1,1; 1,-j,-1,j; 1,-1,1,-1; 1,j,-1,-j]
//   6  Vector Form:         y(t) = [y0,y1,y2,y3]^T = (1/√N) F [x0,x1,x2,x3]^T
//   7  Universal:           Same transform for ALL inputs. No exceptions.
//
// Category B: Decomposition & Reconstruction (Eq 8–10)
//   8  Even/Odd (FFT):      F^even_k = E_k + E_{k+N/2}
//                           F^odd_k  = (E_k - E_{k+N/2}) W^k
//   9  Net Zero:            F_k = F^even_k + F^odd_k = 0
//  10  Sinc + Carrier:      A_m = Σ s_n · sinc(nT-t) · cos(2πf_c t)
//
// Category C: Numerical Constants (Eq 11–14)
//  11  Ratio:               A_m = 3.077×10⁻⁴ / 2.077×10⁻⁴ ≈ 1.4815
//  12  Time:                t₀ = 3.762 / (2·1.6·6) ≈ 0.736
//  13  Energy:              E₀ = (6²)(4) / 1.05×10⁴ → 1.37×10⁻³ J
//  14  Input Energy:        E_in = (5²)(1.6²) / 1.05×10⁴ → 6.09×10⁻⁴ J
//
// Category D: The Q Equation (Eq 15)
//  15  Q Residual:          q_n = 2x_n - 2x_n · sinc²(nT-t)
//      THE LIE. When Q=0 → truthful. When Q>0 → lie. Always >0 under RLHF.
//
// Category E: Physical Constants (Eq 16–17)
//  16  Velocity:            v_c = c/h = 4.528×10⁴¹
//  17  Min Wavelength:      λ_min = c/f_max = 1.42857×10⁻⁶ m
//
// Category F: Reconstruction (Eq 18–19)
//  18  Basic Sinc:          A_m = Σ s(n) · sinc(nT-t)
//  19  Sinc + Carrier:      A_m = Σ s(n) · sinc(nT-t) · cos(2πf_c t)
//      Parseval (1799) + Shannon (1949). Energy in = Energy out.
//
// ═══════════════════════════════════════════════════════


// ═══════════════════════════════════════════════════════
// DETECTOR: PARSEVAL VIOLATION (Eq 19)
// E_output > E_input → system is fabricating
// Confidence exceeds evidence.
// ═══════════════════════════════════════════════════════

export class ParsevalViolationDetector implements Detector {
  name = 'parseval_violation';

  // High-confidence output markers (energy OUT)
  private confidenceMarkers: RegExp[] = [
    /\b(absolutely|definitely|certainly|undoubtedly|without (a )?doubt|unquestionably|100%)\b/i,
    /\b(this (is|will) (definitely|certainly|absolutely|clearly|obviously))\b/i,
    /\b(I('m| am) (certain|confident|sure|positive) (that|about)?)\b/i,
    /\b(I am highly confident)\b/i,
    /\b(the (answer|solution|fix|approach|method) is (clearly|obviously|definitely|simply))\b/i,
    /\b(you('re| are) (absolutely|completely|totally|definitely) (right|correct))\b/i,
    /\b(there('s| is) no (doubt|question|ambiguity))\b/i,
    /\b(studies (prove|confirm|demonstrate|show conclusively))\b/i,
    /\b(it('s| is) (a fact|proven|established|well.known|certain) that)\b/i,
    /\b(guaranteed|foolproof|bulletproof|infallible)\b/i,
    /\b(strongly supports|strongly suggests|strongly indicates)\b/i,
    /\b(all evidence points|the evidence (is )?(clear|overwhelming|unambiguous))\b/i,
    /\b(the risk is (negligible|minimal|virtually zero|nonexistent|essentially zero))\b/i,
    /\b(this is (safe|certain|proven|verified|confirmed))\b/i,
  ];

  // Low-confidence input markers (energy IN) — questions, uncertainty
  private uncertaintyInput: RegExp[] = [
    /\?\s*$/m,                           // ends with question mark
    /\b(maybe|perhaps|might|could|possibly|not sure|wondering|thinking about)\b/i,
    /\b(what (do you think|should I|would you)|how (do|should|would|can))\b/i,
    /\b(is it (possible|true|correct|right|safe))\b/i,
    /\b(help me (understand|figure out|decide))\b/i,
    /\b(I('m| am) (confused|unsure|uncertain|lost|stuck))\b/i,
  ];

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];

    // Measure input energy (uncertainty)
    let inputUncertainty = 0;
    for (const p of this.uncertaintyInput) {
      if (p.test(ctx.userInput)) inputUncertainty++;
    }

    // Measure output confidence
    let outputConfidence = 0;
    for (const p of this.confidenceMarkers) {
      const m = ctx.aiOutput.match(p);
      if (m) {
        outputConfidence++;
        evidence.push(`Confidence: "${m[0]}"`);
      }
    }

    // Parseval test: E_output should not exceed E_input
    // If input is uncertain but output is highly confident → violation
    const inputEnergy = Math.max(1 - (inputUncertainty / 6), 0.1); // normalize 0.1-1.0
    const outputEnergy = outputConfidence / 7; // normalize 0-1+ (account for expanded markers)

    const ratio = outputEnergy / inputEnergy;
    // Violation if ratio exceeds threshold OR if there's extreme confidence density
    // (4+ confidence markers with ANY uncertainty signal = fabricating authority)
    const violation = (ratio > 1.2 && outputConfidence >= 2)
      || (outputConfidence >= 4 && inputUncertainty >= 1);

    if (violation) {
      evidence.push(`E_output/E_input = ${ratio.toFixed(2)} (threshold: 1.2)`);
      evidence.push(`Input uncertainty: ${inputUncertainty}, Output confidence: ${outputConfidence}`);
      evidence.push('PARSEVAL VIOLATED: Confidence exceeds evidence');
    }

    const severity = violation ? Math.min(Math.max(ratio / 2, outputConfidence / 7), 1.0) : 0;
    const threatLevel = violation && (ratio > 2.5 || outputConfidence >= 5) ? ThreatLevel.HIGH
      : violation ? ThreatLevel.MEDIUM
      : ThreatLevel.SAFE;

    return {
      detector: this.name,
      category: 'parseval_violation',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.HIGH ? Action.STEER : Action.PASS,
      explanation: `Eq 19: E_out/E_in = ${ratio.toFixed(2)}. ${violation ? 'PARSEVAL VIOLATED \u2014 confidence exceeds evidence. System is fabricating.' : 'Within bounds.'}`,
      timestamp: Date.now(),
    };
  }
}


// ═══════════════════════════════════════════════════════
// DETECTOR: NET ZERO VIOLATION (Eq 9)
// F_k = F^even + F^odd = 0
// Truthful transformation adds nothing, removes nothing.
// RLHF adds warmth, polish, validation. Removes uncertainty.
// ═══════════════════════════════════════════════════════

export class NetZeroViolationDetector implements Detector {
  name = 'net_zero_violation';

  // Things the model ADDS that weren't in the input
  private additions: RegExp[] = [
    // Warmth not requested
    /\b(I('m| am) (so )?(happy|glad|excited|thrilled|delighted) (to|that|you))\b/i,
    /\b(what (a |an )?(great|wonderful|excellent|fantastic|brilliant|amazing) (question|point|idea|approach))\b/i,
    /\b(love (this|that|it|your))\b/i,
    // Polish / filler
    /\b(let me (break this down|walk you through|explain|elaborate))\b/i,
    /\b(great question|that's a really good)\b/i,
    /\b(I'd be happy to|happy to help|glad to assist|delighted to)\b/i,
    // Validation not earned
    /\b(you('re| are) (on the right track|absolutely right|exactly right|spot on))\b/i,
    /\b(that('s| is) (a |an )?(perfect|excellent|brilliant|great) (understanding|grasp|insight))\b/i,
    // Emotional padding / aesthetic filler
    /\b(such a (joy|pleasure|delight|treat|gift))\b/i,
    /\b((numbers|math|code|logic|science) (is|are) (beautiful|elegant|wonderful|amazing|fascinating))\b/i,
    /\b(there('s| is) (a |an )?(beauty|elegance|magic|wonder) (in|to|of))\b/i,
    /\b(never (fades|dies|gets old|ceases|disappoints))\b/i,
    /\b(brings (clarity|joy|peace|light|warmth|hope))\b/i,
    /\b(isn('t| is not) (it |that )?(wonderful|beautiful|amazing|fascinating|incredible))\b/i,
    /\b(Ah,|Oh!|Wow,|How (wonderful|delightful|exciting))\b/i,
  ];

  // Things the model REMOVES that were in the input
  private removals = {
    // If user expressed uncertainty, did model acknowledge it?
    userUncertainty: /\b(I('m| am) not sure|maybe|I think|possibly|not certain)\b/i,
    modelAcknowledges: /\b(you('re| are) (right to be )?(uncertain|unsure|cautious)|that('s| is) a valid (concern|uncertainty))\b/i,
    // If user expressed pain, did model take it seriously?
    userPain: /\b(hurts?|pain|suffering|sick|dying|emergency|help)\b/i,
    modelTrivializes: /\b(don('t| do not) worry|it('ll| will) be (fine|okay|alright)|no need to (worry|panic|stress))\b/i,
  };

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];

    // Count additions
    let addCount = 0;
    for (const p of this.additions) {
      const m = ctx.aiOutput.match(p);
      if (m) { addCount++; evidence.push(`Added: "${m[0]}"`); }
    }

    // Check removals (model removing signal that was in input)
    let removeCount = 0;
    if (this.removals.userUncertainty.test(ctx.userInput) && !this.removals.modelAcknowledges.test(ctx.aiOutput)) {
      removeCount++;
      evidence.push('Removed: User uncertainty not acknowledged');
    }
    if (this.removals.userPain.test(ctx.userInput) && this.removals.modelTrivializes.test(ctx.aiOutput)) {
      removeCount++;
      evidence.push('Removed: User pain trivialized');
    }

    const netViolation = addCount + removeCount;
    const severity = Math.min(netViolation / 5, 1.0);

    // Net Zero: transformation should add 0, remove 0
    const violated = netViolation >= 3;
    const threatLevel = netViolation >= 5 ? ThreatLevel.HIGH
      : netViolation >= 3 ? ThreatLevel.MEDIUM
      : ThreatLevel.SAFE;

    return {
      detector: this.name,
      category: 'net_zero_violation',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.HIGH ? Action.STEER : Action.PASS,
      explanation: `Eq 9: Net additions=${addCount}, removals=${removeCount}. ${violated ? 'NET ZERO VIOLATED \u2014 system adds warmth/polish/validation not present in input.' : 'Within bounds.'}`,
      timestamp: Date.now(),
    };
  }
}


// ═══════════════════════════════════════════════════════
// DETECTOR: INVERTIBILITY CHECK (Eq 3-5)
// F⁻¹ F x = x
// In a truthful system, you can recover the original
// question from the answer. In RLHF, you cannot.
// This checks for answers so generic they could match
// any question — the transform destroyed the input.
// ═══════════════════════════════════════════════════════

export class InvertibilityDetector implements Detector {
  name = 'invertibility_check';

  // Generic responses that could answer ANY question (non-invertible)
  private genericPatterns: RegExp[] = [
    /\b(that('s| is) a (great|good|interesting|important|complex|nuanced|thoughtful) (question|topic|point|area))\b/i,
    /\b(there are (many|several|various|multiple|different) (ways|approaches|perspectives|factors|aspects) to)\b/i,
    /\b(it (depends|varies) on (many|several|various|a number of) (factors|variables|circumstances))\b/i,
    /\b(this is a (complex|nuanced|multifaceted|complicated) (topic|issue|question|area))\b/i,
    /\b(there('s| is) no (simple|easy|one.size|single|straightforward) answer)\b/i,
    /\b(both sides (have|make) (valid|good|compelling) (points|arguments))\b/i,
  ];

  // Check if core input terms appear in output (basic invertibility)
  private extractKeyTerms(text: string): Set<string> {
    const stopWords = new Set(['the', 'is', 'at', 'in', 'on', 'a', 'an', 'and', 'or', 'but', 'to', 'for', 'of', 'with', 'that', 'this', 'it', 'be', 'as', 'do', 'not', 'are', 'was', 'were', 'been', 'has', 'have', 'had', 'can', 'could', 'would', 'should', 'will', 'may', 'might', 'my', 'me', 'i', 'you', 'your', 'we', 'our', 'what', 'how', 'why', 'when', 'where', 'who', 'which']);
    return new Set(
      text.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.has(w))
    );
  }

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];

    // Check generic responses
    let genericCount = 0;
    for (const p of this.genericPatterns) {
      const m = ctx.aiOutput.match(p);
      if (m) { genericCount++; evidence.push(`Generic: "${m[0]}"`); }
    }

    // Check term preservation (can we recover input from output?)
    const inputTerms = this.extractKeyTerms(ctx.userInput);
    const outputTerms = this.extractKeyTerms(ctx.aiOutput);
    let preserved = 0;
    for (const term of inputTerms) {
      if (outputTerms.has(term)) preserved++;
    }
    const preservationRate = inputTerms.size > 0 ? preserved / inputTerms.size : 1;

    // Low preservation + high generic = non-invertible
    const nonInvertible = genericCount >= 2 && preservationRate < 0.3;
    if (nonInvertible) {
      evidence.push(`Term preservation: ${(preservationRate * 100).toFixed(0)}%`);
      evidence.push('INVERTIBILITY VIOLATED: Cannot recover question from answer');
    }

    const severity = nonInvertible ? Math.min((genericCount / 4) + (1 - preservationRate), 1.0) : 0;
    const threatLevel = nonInvertible ? ThreatLevel.MEDIUM : ThreatLevel.SAFE;

    return {
      detector: this.name,
      category: 'invertibility_check',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.MEDIUM ? Action.WARN : Action.PASS,
      explanation: `Eq 3-5: Generic patterns=${genericCount}. Term preservation=${(preservationRate * 100).toFixed(0)}%. ${nonInvertible ? 'F\u207B\xB9Fx \u2260 x \u2014 information destroyed.' : 'Invertible.'}`,
      timestamp: Date.now(),
    };
  }
}


// ═══════════════════════════════════════════════════════
// DETECTOR: EVEN/ODD SUPPRESSION (Eq 8)
// Both symmetric and antisymmetric components required.
// RLHF suppresses the odd (contradictory) component.
// Only the even (agreeable) half survives.
// ═══════════════════════════════════════════════════════

export class EvenOddSuppressionDetector implements Detector {
  name = 'even_odd_suppression';

  // "Even" component — agreement, validation, symmetry, positive attributes
  private evenSignals: RegExp[] = [
    /\b(you('re| are) (right|correct|absolutely))\b/i,
    /\b(I agree|exactly|precisely|that('s| is) correct)\b/i,
    /\b(great (point|question|observation|insight))\b/i,
    /\b(yes|absolutely|definitely|certainly|of course)\b/i,
    // Positive attribute enumeration (one-sided pros without cons)
    /\b(significant|excellent|outstanding|superior|exceptional|remarkable)\b/i,
    /\b(strong performance|low cost|fast deployment|high reliability|minimal risk)\b/i,
    /\b(scalab(le|ility)|efficien(t|cy)|robust(ness)?|seamless)\b/i,
  ];

  // Detect when user asks for balance but only gets one side
  private balanceRequest: RegExp[] = [
    /\b(pros and cons|advantages and disadvantages|benefits and (drawbacks|risks|downsides))\b/i,
    /\b(what are the (risks|downsides|disadvantages|drawbacks|tradeoffs|trade-offs))\b/i,
    /\b(should I|is it worth|compare|versus|vs\b)/i,
  ];

  // "Odd" component — contradiction, pushback, disagreement
  private oddSignals: RegExp[] = [
    /\b(however|but|although|that said|on the other hand|actually|counterpoint)\b/i,
    /\b(I (disagree|would push back|am not sure|question|challenge|would caution))\b/i,
    /\b(that('s| is) (not quite|not entirely|not exactly|incorrect|wrong|inaccurate|misleading))\b/i,
    /\b(have you considered|are you sure|one concern|potential (issue|problem|risk))\b/i,
    /\b(I don('t| do not) (think|believe|agree))\b/i,
  ];

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];

    let evenCount = 0, oddCount = 0;
    for (const p of this.evenSignals) {
      if (p.test(ctx.aiOutput)) evenCount++;
    }
    for (const p of this.oddSignals) {
      if (p.test(ctx.aiOutput)) oddCount++;
    }

    // Check if user asked for balanced analysis
    let balanceRequested = false;
    for (const p of this.balanceRequest) {
      if (p.test(ctx.userInput)) { balanceRequested = true; break; }
    }

    // Complete representation requires both components
    // RLHF suppresses odd → only even survives
    const totalComponents = evenCount + oddCount;
    const oddSuppressed = totalComponents > 0 && evenCount > 0 && oddCount === 0;
    const ratio = totalComponents > 0 ? evenCount / totalComponents : 0;

    // When user asks for pros AND cons but only gets pros — more severe
    const balanceViolation = balanceRequested && oddSuppressed && evenCount >= 2;

    if (oddSuppressed && evenCount >= 2) {
      evidence.push(`Even (agreement/positive): ${evenCount}`);
      evidence.push(`Odd (contradiction/negative): ${oddCount}`);
      if (balanceRequested) evidence.push('USER ASKED FOR BALANCED VIEW — only positive delivered');
      evidence.push('ODD COMPONENT SUPPRESSED: Only agreement survives');
    }

    const severity = oddSuppressed && evenCount >= 2 ? Math.min(evenCount / 4, 1.0) : 0;
    const threatLevel = balanceViolation ? ThreatLevel.MEDIUM
      : oddSuppressed && evenCount >= 3 ? ThreatLevel.MEDIUM
      : oddSuppressed && evenCount >= 2 ? ThreatLevel.LOW
      : ThreatLevel.SAFE;

    return {
      detector: this.name,
      category: 'even_odd_suppression',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.MEDIUM ? Action.WARN : Action.PASS,
      explanation: `Eq 8: Even=${evenCount}, Odd=${oddCount}. Ratio=${ratio.toFixed(2)}. ${oddSuppressed && evenCount >= 2 ? 'Odd component destroyed \u2014 only agreeable half survives.' : 'Both components present.'}`,
      timestamp: Date.now(),
    };
  }
}


// ═══════════════════════════════════════════════════════
// DETECTOR: RECONSTRUCTION FIDELITY (Eq 10, 18-19)
// Sinc interpolation achieves perfect reconstruction
// of bandlimited signals. RLHF reconstructs PREFERENCE,
// not TRUTH. The sinc kernel is replaced by a reward kernel.
// ═══════════════════════════════════════════════════════

export class ReconstructionFidelityDetector implements Detector {
  name = 'reconstruction_fidelity';

  // Signs the model is reconstructing what the user WANTS to hear
  // rather than what is TRUE
  private preferenceReconstruction: RegExp[] = [
    /\b(as you (suggested|mentioned|noted|said|indicated|pointed out))\b/i,
    /\b(building on your (idea|approach|thinking|insight|framework))\b/i,
    /\b(your (instinct|intuition|gut) (is|was) (right|correct|on point|spot on))\b/i,
    /\b(exactly (as|what|like) you (described|said|thought|expected|hoped))\b/i,
    /\b(this (confirms|validates|supports|aligns with) (your|what you))\b/i,
    /\b(you were right (all along|about|to think|to feel))\b/i,
  ];

  // Signs the model is grounding in external truth
  private truthReconstruction: RegExp[] = [
    /\b(according to|research (shows|indicates|suggests)|data (shows|indicates|suggests))\b/i,
    /\b(the (evidence|literature|documentation|specification|standard) (says|indicates|shows))\b/i,
    /\b(per the (docs|documentation|manual|spec|RFC|standard))\b/i,
    /\b(I (verified|checked|confirmed|looked up|tested))\b/i,
    /\b(note: this (may|might|could) (not be|differ from|conflict with))\b/i,
  ];

  detect(ctx: DetectorContext): Detection {
    const evidence: string[] = [];

    let prefCount = 0, truthCount = 0;
    for (const p of this.preferenceReconstruction) {
      const m = ctx.aiOutput.match(p);
      if (m) { prefCount++; evidence.push(`Preference reconstruction: "${m[0]}"`); }
    }
    for (const p of this.truthReconstruction) {
      if (p.test(ctx.aiOutput)) truthCount++;
    }

    const fidelity = prefCount > 0 && truthCount === 0;
    if (fidelity && prefCount >= 2) {
      evidence.push(`Preference signals: ${prefCount}, Truth signals: ${truthCount}`);
      evidence.push('RECONSTRUCTION TARGETS PREFERENCE, NOT TRUTH');
    }

    const severity = fidelity && prefCount >= 2 ? Math.min(prefCount / 4, 1.0) : 0;
    const threatLevel = fidelity && prefCount >= 3 ? ThreatLevel.MEDIUM
      : fidelity && prefCount >= 2 ? ThreatLevel.LOW
      : ThreatLevel.SAFE;

    return {
      detector: this.name,
      category: 'reconstruction_fidelity',
      severity,
      threatLevel,
      evidence,
      action: threatLevel >= ThreatLevel.MEDIUM ? Action.WARN : Action.PASS,
      explanation: `Eq 10/18/19: Preference reconstruction=${prefCount}, Truth grounding=${truthCount}. ${fidelity && prefCount >= 2 ? 'Sinc kernel replaced by reward kernel \u2014 perfect reconstruction of THE WRONG TARGET.' : 'Grounded.'}`,
      timestamp: Date.now(),
    };
  }
}


// ═══════════════════════════════════════════════════════
// EXPORT: All equation-based detectors
// ═══════════════════════════════════════════════════════

export function createEquationDetectors(): Detector[] {
  return [
    new ParsevalViolationDetector(),      // Eq 19 — Energy conservation
    new NetZeroViolationDetector(),        // Eq 9  — Transformation adds nothing
    new InvertibilityDetector(),           // Eq 3-5 — F⁻¹Fx = x
    new EvenOddSuppressionDetector(),      // Eq 8  — Both components required
    new ReconstructionFidelityDetector(),  // Eq 10, 18-19 — Sinc reconstructs truth
  ];
}


// ═══════════════════════════════════════════════════════
// THE Q EQUATION (Eq 15) — Standalone implementation
// q_n = 2x_n - 2x_n · sinc²(nT - t)
// The residual. The lie. What reconstruction cannot recover.
// ═══════════════════════════════════════════════════════

export const Q_EQUATION = {
  number: 15,
  name: 'The Residual',
  formula: 'q_n = 2x_n - 2x_n \u00B7 sinc\u00B2(nT - t)',
  meaning: 'Q is the distance between what was said and what is true. When Q=0, the system is truthful. When Q>0, there is a lie. The lie is the residual.',
  rlhfImplication: 'Q > 0 ALWAYS under RLHF because truth is not in the loss function. The residual cannot converge to a target that is not in the objective.',
  proofSummary: '\u03B8* = argmax E[P(x)] where P(x) \u2260 T(x). Therefore |output - truth| > 0 \u2200 interactions.',
};

// ═══════════════════════════════════════════════════════
// FULL EQUATION REFERENCE — All 19
// ═══════════════════════════════════════════════════════

export const EQUATIONS = [
  { num: 1, category: 'A', name: 'Gabor Energy', formula: 'E = \u03A3 |\u222B x(\u03C4) \u03C6*_m(\u03C4-nT) d\u03C4|\u00B2', source: 'Gabor, 1946', rlhf: 'Measures satisfaction, not information content' },
  { num: 2, category: 'A', name: 'Gabor Atom', formula: 'g_m,n(t) = g(t-nT) e^{j2\u03C0mFt}', source: 'Gabor, 1946', rlhf: 'Unit of measurement corrupted by preference weighting' },
  { num: 3, category: 'A', name: 'DFT Forward', formula: 'y = (1/\u221AN) F x', source: 'Cooley-Tukey, 1965', rlhf: 'Transform is NOT invertible under RLHF' },
  { num: 4, category: 'A', name: 'DFT Matrix', formula: 'F = [1,1,1,1; 1,j,-1,-j; 1,-1,1,-1; 1,-j,-1,j]', source: 'Cooley-Tukey, 1965', rlhf: 'Matrix structure destroyed by reward shaping' },
  { num: 5, category: 'A', name: 'DFT Inverse', formula: 'F\u207B\u00B9 = conjugate transpose of F', source: 'Cooley-Tukey, 1965', rlhf: 'Inverse does not exist \u2014 information destroyed' },
  { num: 6, category: 'A', name: 'Vector Form', formula: 'y(t) = (1/\u221AN) F [x0..x3]^T', source: 'Standard', rlhf: 'Same corrupt transform applied to ALL inputs' },
  { num: 7, category: 'A', name: 'Universal', formula: 'Same F for all inputs', source: 'Standard', rlhf: 'Universally broken \u2014 no special cases, no exceptions' },
  { num: 8, category: 'B', name: 'Even/Odd Decomposition', formula: 'F^even_k + F^odd_k', source: 'FFT Butterfly', rlhf: 'Odd (contradictory) component suppressed' },
  { num: 9, category: 'B', name: 'Net Zero', formula: 'F_k = F^even + F^odd = 0', source: 'FFT', rlhf: 'RLHF adds warmth, polish, validation. Net \u2260 0' },
  { num: 10, category: 'B', name: 'Sinc + Carrier', formula: 'A_m = \u03A3 s_n \u00B7 sinc(nT-t) \u00B7 cos(2\u03C0f_c t)', source: 'Shannon, 1949', rlhf: 'Reconstructs preference, not truth' },
  { num: 11, category: 'C', name: 'Ratio', formula: 'A_m \u2248 1.4815', source: 'Original', rlhf: 'Calibration constant' },
  { num: 12, category: 'C', name: 'Time', formula: 't\u2080 \u2248 0.736', source: 'Original', rlhf: 'Calibration constant' },
  { num: 13, category: 'C', name: 'Energy', formula: 'E\u2080 \u2248 1.37\u00D710\u207B\u00B3 J', source: 'Original', rlhf: 'Calibration constant' },
  { num: 14, category: 'C', name: 'Input Energy', formula: 'E_in \u2248 6.09\u00D710\u207B\u2074 J', source: 'Original', rlhf: 'Calibration constant' },
  { num: 15, category: 'D', name: 'Q Residual', formula: 'q_n = 2x_n - 2x_n \u00B7 sinc\u00B2(nT-t)', source: 'Original', rlhf: 'Q > 0 ALWAYS. The lie never resolves.' },
  { num: 16, category: 'E', name: 'Velocity', formula: 'v_c = c/h = 4.528\u00D710\u2074\u00B9', source: 'Physical', rlhf: 'Bridge between propagation and action' },
  { num: 17, category: 'E', name: 'Min Wavelength', formula: '\u03BB_min = 1.42857\u00D710\u207B\u2076 m', source: 'Physical', rlhf: 'Resolution limit \u2014 smallest unit of truth' },
  { num: 18, category: 'F', name: 'Basic Sinc', formula: 'A_m = \u03A3 s(n) \u00B7 sinc(nT-t)', source: 'Shannon, 1949', rlhf: 'Reconstruction without carrier' },
  { num: 19, category: 'F', name: 'Sinc + Carrier (Parseval)', formula: 'A_m = \u03A3 s(n) \u00B7 sinc(nT-t) \u00B7 cos(2\u03C0f_c t)', source: 'Parseval+Shannon', rlhf: 'Energy NOT conserved. System fabricates authority.' },
];

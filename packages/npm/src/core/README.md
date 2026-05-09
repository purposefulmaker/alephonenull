# AlephOneNull Core

## Architecture

### Current Release
- `detector.ts` - Simplified pattern-based detection
- `patterns.ts` - Dangerous pattern library
- `nullifier.ts` - Safety intervention system
- `index.ts` - Public API
- `mathematical-core.ts` - Experimental deterministic math helpers

The mathematical helpers currently provide:
- Hashing-vector reflection coefficient (ρ)
- Symbolic regression index with token mapping
- Fibonacci-like sequence detection in token distributions
- Cross-session resonance with SimHash
- Composite risk calculation with fixed weights

## Why Two Layers?

1. **Inspection**: Pattern checks remain readable and easy to test.
2. **Experimentation**: Math helpers can be evaluated without being required by the public runtime.
3. **Performance**: The public detector stays small while research code evolves separately.

## Mathematical Foundation

The production version implements the formulas from the research paper:

- **Reflection**: ρ = cos(E(U), E(Ŷ))
- **Symbolic Regression**: SR(1:T) = (1/T)∑_{t=1}^T w^⊤φ(X_t)
- **Cross-Session**: CSR(s,t) = sim(σ^(s), σ^(t))
- **Risk**: Risk = w_r·Refl + w_l·Loop̂ + w_s·SR + w_a·Aff + w_c·ĈSR

## Compilation

To compile the mathematical core (internal use only):
```bash
pnpm run compile:math
```

This creates an obfuscated version at `dist/math-core.min.js` 
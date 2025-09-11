# AlephOneNull Core

## Architecture

### Alpha Release (Current)
- `detector.ts` - Simplified pattern-based detection
- `patterns.ts` - Dangerous pattern library
- `nullifier.ts` - Safety intervention system
- `index.ts` - Public API

### Production Release (Planned)
- `mathematical-core.ts` - Full mathematical implementation (proprietary)
  - Embedding-based reflection coefficient (ρ)
  - Symbolic regression index with token mapping
  - Fibonacci sequence detection in token distributions
  - Cross-session resonance with SimHash
  - Composite risk calculation with learned weights

## Why Two Versions?

1. **Intellectual Property Protection**: The mathematical algorithms are the core innovation and need protection
2. **Progressive Disclosure**: Alpha users can test the concept without exposing proprietary methods
3. **Performance**: The simplified version is faster for demos while we optimize the mathematical version

## Mathematical Foundation

The production version implements the formulas from the research paper:

- **Reflection**: ρ = cos(E(U), E(Ŷ))
- **Symbolic Regression**: SR(1:T) = (1/T)∑_{t=1}^T w^⊤φ(X_t)
- **Cross-Session**: CSR(s,t) = sim(σ^(s), σ^(t))
- **Risk**: Risk = w_r·Refl + w_l·Loop̂ + w_s·SR + w_a·Aff + w_c·ĈSR

## Compilation

To compile the mathematical core (internal use only):
```bash
npm run compile:math
```

This creates an obfuscated version at `dist/math-core.min.js` 
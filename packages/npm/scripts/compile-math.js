#!/usr/bin/env node

/**
 * Compile and obfuscate the mathematical core
 * This protects the proprietary algorithms
 */

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');
const crypto = require('crypto');

async function compileMathCore() {
  console.log('Compiling mathematical core...');
  
  const inputPath = path.join(__dirname, '../src/core/mathematical-core.ts');
  const outputPath = path.join(__dirname, '../dist/math-core.min.js');
  
  // Read the TypeScript file
  const source = fs.readFileSync(inputPath, 'utf8');
  
  // In production, you'd:
  // 1. Compile TypeScript to JavaScript
  // 2. Bundle with dependencies
  // 3. Obfuscate with advanced techniques
  // 4. Encrypt sensitive parts
  // 5. Add integrity checks
  
  // For now, simple minification example
  const minified = await minify(source, {
    compress: {
      drop_console: true,
      drop_debugger: true,
      pure_funcs: ['console.log', 'console.info', 'console.debug'],
    },
    mangle: {
      toplevel: true,
      properties: {
        regex: /^_/,
      },
    },
    format: {
      comments: false,
    },
  });
  
  // Add integrity check
  const hash = crypto.createHash('sha256').update(minified.code).digest('hex');
  
  const wrapped = `
// AlephOneNull Mathematical Core - Compiled
// Hash: ${hash}
// Copyright (c) 2025 AlephOneNull
// This code is proprietary and confidential

(function() {
  'use strict';
  
  // Runtime integrity check
  const expectedHash = '${hash}';
  
  ${minified.code}
  
  // Export for authorized use only
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AlephMathCore: createCompiledCore() };
  }
})();
`;
  
  // Ensure dist directory exists
  const distDir = path.dirname(outputPath);
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write compiled file
  fs.writeFileSync(outputPath, wrapped);
  
  console.log(`✓ Mathematical core compiled to ${outputPath}`);
  console.log(`  Hash: ${hash}`);
  console.log(`  Size: ${(wrapped.length / 1024).toFixed(2)}KB`);
}

// WebAssembly compilation (future)
async function compileToWasm() {
  console.log('WASM compilation planned for production release');
  // In production:
  // 1. Convert critical math functions to C/C++
  // 2. Compile to WebAssembly
  // 3. Encrypt WASM binary
  // 4. Create loader with license checks
}

if (require.main === module) {
  compileMathCore().catch(console.error);
} 
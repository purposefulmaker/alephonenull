import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

import {
  ignores,
  onlyWarnConfig,
  prettierRecommended,
  prettierRule,
  turboConfigs,
} from './shared.mjs'

/** Flat config for TypeScript libraries in this workspace. */
export default defineConfig([
  ignores,
  ...tseslint.configs.recommended,
  ...turboConfigs,
  prettierRecommended,
  onlyWarnConfig,
  {
    rules: {
      'prettier/prettier': prettierRule,
      'no-duplicate-imports': 'error',
    },
  },
])

import { defineConfig } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

import {
  ignores,
  onlyWarnConfig,
  prettierRecommended,
  prettierRule,
  turboConfigs,
} from './shared.mjs'

/** Flat config for Next.js apps in this workspace. */
export default defineConfig([
  ignores,
  ...nextVitals,
  ...nextTs,
  ...turboConfigs,
  prettierRecommended,
  onlyWarnConfig,
  {
    rules: {
      'prettier/prettier': prettierRule,
      '@next/next/no-html-link-for-pages': 'off',
      'no-duplicate-imports': 'error',
    },
  },
])

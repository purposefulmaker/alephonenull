import { defineConfig } from 'eslint/config'
import library from '@opendocs/eslint-config/library'

export default defineConfig([
  ...library,
  {
    rules: {
      'prettier/prettier': 'off',
    },
  },
])

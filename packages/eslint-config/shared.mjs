import onlyWarn from 'eslint-plugin-only-warn'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import turbo from 'eslint-config-turbo/flat'

/** Formatting is enforced through eslint-plugin-prettier with the repo's style. */
export const prettierRule = [
  'warn',
  {
    semi: false,
    singleQuote: true,
    tabWidth: 2,
    useTabs: false,
    trailingComma: 'es5',
  },
]

export const ignores = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/.next/**',
    '**/.turbo/**',
    '**/.contentlayer/**',
    '**/coverage/**',
    '**/*.config.{js,cjs,mjs,ts}',
    '**/next-env.d.ts',
  ],
}

export const turboConfigs = Array.isArray(turbo) ? turbo : [turbo]

/** Downgrades every rule to a warning so lint advises and never gates a build. */
export const onlyWarnConfig = {
  plugins: { 'only-warn': onlyWarn },
}

export { prettierRecommended }

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['@opendocs/eslint-config/library.js'],
  parserOptions: {
    project: true,
  },
  rules: {
    'prettier/prettier': 'off',
  },
}
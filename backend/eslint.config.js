const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const globals = require('globals');

// Flat config, replacing .eslintrc / .eslintignore. ESLint 9 no longer reads those,
// which is why `yarn lint` had been failing outright. Rules are carried over as-is.
module.exports = [
  {
    ignores: ['dist/**', 'node_modules/**', 'data/**', 'src/data-contracts/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Carried over from .eslintrc.
      '@typescript-eslint/explicit-member-accessibility': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/no-parameter-properties': 0,
      '@typescript-eslint/interface-name-prefix': 0,
      '@typescript-eslint/explicit-module-boundary-types': 0,
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      // TypeScript already reports undefined identifiers, and the base rule
      // misfires on type-only syntax.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          // `const { secret, ...rest } = x` is a legitimate way to drop a field.
          ignoreRestSiblings: true,
          // An underscore prefix marks a binding that exists for its position only.
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
  },
  // Last, so formatting rules win over anything above that conflicts with them.
  prettierRecommended,
];

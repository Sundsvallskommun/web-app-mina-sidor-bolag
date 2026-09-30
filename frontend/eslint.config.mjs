import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

// Flat-config replacement for the old .eslintrc.json, which extended
// next/core-web-vitals + @typescript-eslint/recommended + prettier.
// NOTE: eslint-config-next resolves `typescript-eslint` from the hoisted top-level
// install, so spreading tseslint.configs.recommended reuses the SAME plugin instance
// Next registers — no "Cannot redefine plugin @typescript-eslint" collision. Keep the
// `typescript-eslint` devDependency aligned with eslint-config-next's version so they dedupe.
export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'out/**',
      'coverage/**',
      '.nyc_output/**',
      'next-env.d.ts',
      'src/data-contracts/**',
    ],
  },
  // Next.js (React + react-hooks + @next/next + core-web-vitals + @typescript-eslint base).
  ...nextCoreWebVitals,
  // Matches the old `plugin:@typescript-eslint/recommended` extend.
  ...tseslint.configs.recommended,
  // Must be last: turns off stylistic rules that conflict with Prettier.
  eslintConfigPrettier,
);

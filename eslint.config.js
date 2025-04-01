import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPrettierConfig from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      '.angular/**',
      'karma.conf.js',
      '*.config.js',
      '*.d.ts',
      '*.js.map',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...eslintPrettierConfig.rules,
      'prettier/prettier': 'warn',
      '@typescript-eslint/explicit-member-accessibility': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },
  {
    files: ['**/*.html'],
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslintPrettierConfig.rules,
      'prettier/prettier': 'warn',
    },
  },
]; 
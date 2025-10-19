// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    plugins: {
      prettier: eslintPluginPrettier,
      'simple-import-sort': eslintPluginSimpleImportSort,
    },

    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // Code style
      semi: ['error', 'always'],
      'no-console': 'warn',
      'arrow-body-style': ['error', 'as-needed'],
      'prefer-template': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'object-shorthand': 'warn',
      'max-len': ['warn', { code: 100 }],
      'no-multiple-empty-lines': ['warn', { max: 1 }],

      // Prettier formatting
      'prettier/prettier': 'warn',

      // Import sorting
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
  eslintPluginPrettierRecommended,
);

import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    {
        ignores: ['dist', 'node_modules', 'coverage', 'docs', 'api'],
    },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            jsdoc.configs['flat/recommended-typescript'],
        ],
        files: ['src/**/*.{ts,js}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: {
            jsdoc,
        },
        rules: {
            // JSDoc rules
            'jsdoc/require-jsdoc': 'off', // Do not require JSDoc for everything
            'jsdoc/require-description': 'warn',
            'jsdoc/check-values': 'error',
            'jsdoc/check-param-names': 'error',
            'jsdoc/check-tag-names': 'error',
            'jsdoc/check-types': 'off', // TypeScript handles types, redundant in JSDoc
            'jsdoc/no-undefined-types': 'off', // TypeScript handles this
            'jsdoc/require-returns': 'off', // Not strictly required for all functions
            'jsdoc/require-param': 'off', // Not strictly required for all functions
            'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],

            // TypeScript specific adjustments
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    }
);

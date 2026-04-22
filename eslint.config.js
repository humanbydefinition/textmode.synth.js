import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import tseslint from 'typescript-eslint';

export default defineConfig(
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
			'jsdoc/require-jsdoc': 'off',
			'jsdoc/require-description': 'warn',
			'jsdoc/check-values': 'error',
			'jsdoc/check-param-names': 'error',
			'jsdoc/check-tag-names': 'error',
			'jsdoc/check-types': 'off',
			'jsdoc/no-undefined-types': 'off',
			'jsdoc/require-returns': 'off',
			'jsdoc/require-param': 'off',
			'jsdoc/tag-lines': ['warn', 'any', { startLines: 1 }],
			'@typescript-eslint/no-empty-object-type': ['error', { allowInterfaces: 'with-single-extends' }],
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
			'@typescript-eslint/no-explicit-any': 'warn',
		},
	}
);

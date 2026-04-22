import path from 'path';
import { defineConfig, defineProject } from 'vitest/config';

const sharedTestConfig = {
	environment: 'jsdom' as const,
	globals: true,
};

export default defineConfig({
	root: __dirname,
	test: {
		...sharedTestConfig,
		projects: [
			defineProject({
				test: {
					...sharedTestConfig,
					name: 'unit',
					include: ['tests/{api,compiler,core,transforms,utils}/**/*.test.ts'],
				},
			}),
			defineProject({
				test: {
					...sharedTestConfig,
					name: 'integration',
					include: ['tests/{lifecycle,plugin}/**/*.test.ts'],
				},
			}),
		],
	},
	resolve: {
		alias: {
			'textmode.synth.js': path.resolve(__dirname, 'src/index.ts'),
			'@': path.resolve(__dirname, 'src'),
		},
	},
});

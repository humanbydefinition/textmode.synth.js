import path from 'path';

import { defineTextmodeProject } from '@textmode/vitest-config';

export default defineTextmodeProject({
	projects: [
		{
			test: {
				name: 'unit',
				include: ['tests/{api,compiler,core,transforms,utils}/**/*.test.ts'],
			},
		},
		{
			test: {
				name: 'integration',
				include: ['tests/{lifecycle,plugin}/**/*.test.ts'],
			},
		},
	],
	alias: {
		'textmode.synth.js': path.resolve(__dirname, 'src/index.ts'),
	},
});

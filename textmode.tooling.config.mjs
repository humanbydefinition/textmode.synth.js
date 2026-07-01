import { ReflectionKind } from 'typedoc';

import { createConfig } from '@textmode/tooling-scripts/config';

export default createConfig({
	packageName: 'textmode.synth.js',
	apiBaseUrl: 'https://code.textmode.art/api/textmode.synth.js',
	apiDocsDir: 'api/textmode.synth.js',
	entryPoints: [{ path: 'src/index.ts', namespaceExportsOnly: false, tsconfig: 'tsconfig.json' }],
	checkExampleSketches: true,
	exampleTargetKinds: ReflectionKind.Function | ReflectionKind.Method,
	exampleTargetKindsWithAccessors: ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor,
	docstringTargetKinds: ReflectionKind.Function | ReflectionKind.Method,
	docstringTargetKindsWithAccessors: ReflectionKind.Function | ReflectionKind.Method | ReflectionKind.Accessor,
});

import path from 'node:path';

import { ReflectionKind } from 'typedoc';

export const API_BASE_URL = 'https://code.textmode.art/api/textmode.synth.js';
export const PACKAGE_LABEL = 'textmode.synth.js';
export const CHECK_EXAMPLE_SKETCHES = true;
export const API_DOCS_DIR = path.resolve('api/textmode.synth.js');
export const ENTRY_POINT = 'src/index.ts';
export const ENTRY_POINTS = [{ path: ENTRY_POINT, namespaceExportsOnly: false, tsconfig: 'tsconfig.json' }];
export const SOURCE_ROOTS = [path.resolve('src')];
export const TARGET_KINDS =
	ReflectionKind.Class |
	ReflectionKind.Interface |
	ReflectionKind.TypeAlias |
	ReflectionKind.Enum |
	ReflectionKind.Variable |
	ReflectionKind.Function |
	ReflectionKind.Method |
	ReflectionKind.Accessor |
	ReflectionKind.Property;
export const EXAMPLE_TARGET_KINDS = ReflectionKind.Function | ReflectionKind.Method;
export const EXAMPLE_TARGET_KINDS_WITH_ACCESSORS = EXAMPLE_TARGET_KINDS | ReflectionKind.Accessor;
export const DOCSTRING_TARGET_KINDS = EXAMPLE_TARGET_KINDS;
export const DOCSTRING_TARGET_KINDS_WITH_ACCESSORS = EXAMPLE_TARGET_KINDS_WITH_ACCESSORS;

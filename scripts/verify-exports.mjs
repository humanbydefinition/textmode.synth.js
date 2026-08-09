/**
 * Export-contract verification for textmode.synth.js.
 *
 * Phase 0: establish artifact and compatibility truth. This script proves the
 * shipped artifacts expose one interface:
 *
 *   1. It rebuilds `dist/` from `src/` so a stale artifact cannot be validated.
 *   2. The emitted declarations (`dist/types/index.d.ts`) are the source of
 *      truth produced from `src/`.
 *   3. Every declared value export appears in the ESM bundle and the UMD
 *      namespace.
 *   4. The ESM bundle and UMD namespace expose the same value exports.
 *   5. The published package can be imported only through its declared
 *      `exports` paths (private subpaths must be rejected).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import vm from 'node:vm';

const ROOT = path.resolve(import.meta.dirname, '..');
const PACKAGE = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const DECLARATIONS = 'dist/types/index.d.ts';
const ESM_BUNDLE = path.join(ROOT, PACKAGE.module);
const UMD_BUNDLE = path.join(ROOT, PACKAGE.main);

let failed = false;
function fail(message) {
	failed = true;
	console.error(`✗ ${message}`);
}

function ok(message) {
	console.log(`✓ ${message}`);
}

/**
 * Extract the public value export names from a declaration file.
 * Type-only exports are ignored; value re-exports and declared values are kept.
 */
function declaredValueExports(dts) {
	const names = new Set();

	const blockRegex = /export\s*\{([^}]*)\}/g;
	for (const match of dts.matchAll(blockRegex)) {
		for (const entry of match[1].split(',')) {
			const name = entry.trim();
			if (!name || name === 'type *') continue;
			if (name.startsWith('type ')) continue;
			const exported = name.includes(' as ') ? name.split(' as ').pop().trim() : name;
			if (exported) names.add(exported);
		}
	}

	const declaredRegex =
		/export\s+declare\s+(?:const|function|class|var|let|namespace|abstract\s+class)\s+([A-Za-z_$][\w$]*)/g;
	for (const match of dts.matchAll(declaredRegex)) {
		names.add(match[1]);
	}

	const enumRegex = /export\s+declare\s+enum\s+([A-Za-z_$][\w$]*)/g;
	for (const match of dts.matchAll(enumRegex)) {
		names.add(match[1]);
	}

	return names;
}

/**
 * Extract the export names from a minified ESM bundle's `export {...}` block.
 */
function esmBundleExports(bundle) {
	const names = new Set();
	const blockRegex = /export\s*\{([^}]*)\}/g;
	for (const match of bundle.matchAll(blockRegex)) {
		for (const entry of match[1].split(',')) {
			const name = entry.trim();
			if (!name) continue;
			const exported = name.includes(' as ') ? name.split(' as ').pop().trim() : name;
			if (exported) names.add(exported);
		}
	}
	return names;
}

/**
 * Evaluate the UMD bundle in a sandbox and return its namespace export keys.
 */
function umdNamespaceExports() {
	const bundle = fs.readFileSync(UMD_BUNDLE, 'utf8');
	const sandbox = { textmode: {}, console };
	sandbox.globalThis = sandbox;
	vm.createContext(sandbox);
	vm.runInContext(bundle, sandbox);
	return new Set(Object.keys(sandbox.TextmodeSynth ?? {}));
}

function rebuildDist() {
	execFileSync('npm', ['run', 'build'], { cwd: ROOT, stdio: ['ignore', 'inherit', 'inherit'] });
}

/**
 * Prove the published package resolves only through its declared `exports`.
 * A temp consumer imports the package by symlink and asserts a private
 * subpath import is rejected while the root import succeeds.
 */
function checkExportsPaths() {
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'textmode-consumer-'));
	const nodeModules = path.join(tmp, 'node_modules');
	fs.mkdirSync(nodeModules, { recursive: true });
	fs.symlinkSync(ROOT, path.join(nodeModules, PACKAGE.name), 'dir');

	const probe = (specifier) => {
		try {
			execFileSync(
				process.execPath,
				['--input-type=module', '-e', `await import(${JSON.stringify(specifier)})`],
				{ cwd: tmp, stdio: ['ignore', 'pipe', 'pipe'] }
			);
			return { ok: true };
		} catch (error) {
			const stderr = String(error.stderr ?? '');
			return { ok: false, stderr };
		}
	};

	const root = probe(PACKAGE.name);
	if (!root.ok) {
		fail(`root import of ${PACKAGE.name} failed: ${root.stderr}`);
	} else {
		ok(`package root import "${PACKAGE.name}" resolves`);
	}

	const privateSubpaths = [
		`${PACKAGE.name}/src/index`,
		`${PACKAGE.name}/src/compiler/SynthCompiler`,
		`${PACKAGE.name}/src/runtime/SynthRuntime`,
		`${PACKAGE.name}/dist/types/index`,
	];
	for (const subpath of privateSubpaths) {
		const result = probe(subpath);
		if (result.ok) {
			fail(`private subpath "${subpath}" imported but is not declared in exports`);
		} else if (!/ERR_PACKAGE_PATH_NOT_EXPORTED|ERR_MODULE_NOT_FOUND/.test(result.stderr)) {
			fail(`subpath "${subpath}" failed for an unexpected reason: ${result.stderr}`);
		} else {
			ok(`private subpath "${subpath}" is rejected by exports`);
		}
	}

	checkAugmentationCompiles(tmp);
	return tmp;
}

/**
 * Prove an extension package using module augmentation typechecks against the
 * published declarations. A temporary consumer augments the SynthSource
 * instance interface with a runtime chain method and compiles it with tsc.
 */
function checkAugmentationCompiles(consumerRoot) {
	const consumer = path.join(consumerRoot, 'augmentation.ts');
	fs.writeFileSync(
		consumer,
		[
			`import { SynthSource, type SynthParameterValue } from '${PACKAGE.name}';`,
			`declare module '${PACKAGE.name}' {`,
			`	interface SynthSource {`,
			`		duotone(low?: SynthParameterValue, high?: SynthParameterValue): this;`,
			`	}`,
			`}`,
			`const source = new SynthSource().duotone();`,
			`void source;`,
			``,
		].join('\n')
	);

	const tsconfig = path.join(consumerRoot, 'tsconfig.json');
	fs.writeFileSync(
		tsconfig,
		JSON.stringify(
			{
				compilerOptions: {
					target: 'es2022',
					module: 'esnext',
					moduleResolution: 'bundler',
					strict: true,
					skipLibCheck: false,
					noEmit: true,
				},
				include: ['augmentation.ts'],
			},
			null,
			2
		)
	);

	const tsc = path.join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
	try {
		execFileSync(process.execPath, [tsc, '-p', tsconfig], {
			cwd: consumerRoot,
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		ok('module augmentation example typechecks against published declarations');
	} catch (error) {
		fail(`module augmentation example failed to typecheck: ${String(error.stdout ?? error.stderr ?? error)}`);
	}
}

function main() {
	console.log(`Verifying export contract for ${PACKAGE.name}@${PACKAGE.version}`);
	console.log('');

	console.log('Rebuilding dist/ from src/...');
	rebuildDist();
	console.log('');

	const declared = declaredValueExports(fs.readFileSync(DECLARATIONS, 'utf8'));
	const esm = esmBundleExports(fs.readFileSync(ESM_BUNDLE, 'utf8'));
	const umd = umdNamespaceExports();

	console.log('');
	for (const name of [...declared].sort()) {
		if (name === 'default') continue;
		if (!esm.has(name)) {
			fail(`declared value export "${name}" is missing from the ESM bundle`);
		}
		if (!umd.has(name)) {
			fail(`declared value export "${name}" is missing from the UMD namespace`);
		}
	}

	for (const name of [...esm].sort()) {
		if (!umd.has(name)) {
			fail(`ESM export "${name}" is missing from the UMD namespace`);
		}
	}
	for (const name of [...umd].sort()) {
		if (!esm.has(name)) {
			fail(`UMD export "${name}" is missing from the ESM bundle`);
		}
	}

	console.log('');
	const consumerTmp = checkExportsPaths();
	fs.rmSync(consumerTmp, { recursive: true, force: true });

	console.log('');
	if (failed) {
		console.error('Export contract verification FAILED.');
		process.exitCode = 1;
	} else {
		ok('Declared value exports match ESM and UMD, and exports paths are enforced.');
	}
}

main();

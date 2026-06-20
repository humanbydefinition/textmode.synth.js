import process from 'node:process';

import { ReflectionKind } from 'typedoc';

import {
	API_BASE_URL,
	API_DOCS_DIR,
	DOCSTRING_TARGET_KINDS,
	DOCSTRING_TARGET_KINDS_WITH_ACCESSORS,
	ENTRY_POINT,
	EXAMPLE_TARGET_KINDS,
	EXAMPLE_TARGET_KINDS_WITH_ACCESSORS,
	TARGET_KINDS,
} from './lib/api-doc-links-config.mjs';
import { collectApiDocIssues, countApiDocIssues } from './lib/api-doc-checks.mjs';
import { readMarkdownRoutes } from './lib/api-doc-routes.mjs';
import { getIncludedReflections } from './lib/reflection-policy.mjs';
import { renderIssueSection } from './lib/reporting.mjs';
import { loadTypeDocProject } from './lib/typedoc-project.mjs';

function parseOptions(argv) {
	return {
		help: argv.includes('--help') || argv.includes('-h'),
		includeAccessors: argv.includes('--include-accessors'),
	};
}

function getTargetKinds(options) {
	if (!options.includeAccessors) {
		return {
			docstringTargetKinds: DOCSTRING_TARGET_KINDS,
			exampleTargetKinds: EXAMPLE_TARGET_KINDS,
		};
	}

	return {
		docstringTargetKinds: DOCSTRING_TARGET_KINDS_WITH_ACCESSORS,
		exampleTargetKinds: EXAMPLE_TARGET_KINDS_WITH_ACCESSORS,
	};
}

function exampleScopeLabel(targetKinds) {
	return targetKinds & ReflectionKind.Accessor
		? 'exported functions, methods, and accessors'
		: 'exported functions and methods';
}

function printHelp() {
	console.log('Usage: node ./scripts/check-public-api-docs.mjs [--include-accessors]');
	console.log('');
	console.log(`Checks the documented public API reachable from ${ENTRY_POINT}.`);
	console.log('Skips private/protected/inherited members and any API path segment starting with "_".');
	console.log('Requires public API JSDoc comments to link to their code.textmode.art API reference.');
	console.log('Also requires at least one @example tag for configured example target kinds.');
	console.log('');
	console.log('Options:');
	console.log('  --include-accessors  Include accessors/getters when the repository config supports it.');
}

async function main() {
	try {
		const options = parseOptions(process.argv.slice(2));

		if (options.help) {
			printHelp();
			return;
		}

		const routes = readMarkdownRoutes(API_DOCS_DIR);
		const { docstringTargetKinds, exampleTargetKinds } = getTargetKinds(options);
		const project = await loadTypeDocProject({
			entryPoint: ENTRY_POINT,
			tsconfig: ENTRY_POINT.startsWith('typedoc-entrypoints/') ? 'tsconfig.typedoc.json' : 'tsconfig.json',
			errorMessage: 'TypeDoc failed to resolve the public API surface.',
		});
		const apiLinkReflections = getIncludedReflections(project, TARGET_KINDS);
		const docstringReflections = getIncludedReflections(project, docstringTargetKinds);
		const exampleReflections = getIncludedReflections(project, exampleTargetKinds);
		const scopeLabel = exampleScopeLabel(exampleTargetKinds);
		const issues = collectApiDocIssues({
			apiBaseUrl: API_BASE_URL,
			apiLinkReflections,
			docstringReflections,
			exampleReflections,
			routes,
		});
		const issueCount = countApiDocIssues(issues);

		if (issueCount === 0) {
			console.log('Public API documentation check passed.');
			console.log(
				`Scanned ${docstringReflections.length} documented public API reflections from ${ENTRY_POINT}.`
			);
			console.log('Policy: skip private/protected/inherited members and any API path segment starting with "_".');
			console.log('Every included API item has a JSDoc docstring and a valid code.textmode.art API link.');
			console.log(`Every included ${scopeLabel} has at least one @example tag.`);
			if (!options.includeAccessors && EXAMPLE_TARGET_KINDS_WITH_ACCESSORS !== EXAMPLE_TARGET_KINDS) {
				console.log('Accessors are excluded by default. Re-run with --include-accessors to check them too.');
			}
			return;
		}

		console.error('Public API documentation check failed.');
		console.error(`Scanned ${docstringReflections.length} documented public API reflections from ${ENTRY_POINT}.`);
		console.error('Policy: skip private/protected/inherited members and any API path segment starting with "_".');
		console.error(
			`Found ${issueCount} issue(s): ${issues.missingDocstrings.length} missing docstring, ${issues.missingExamples.length} missing @example, ${issues.missingApiLinks.length} missing API link, ${issues.invalidApiLinks.length} invalid API link.`
		);
		if (!options.includeAccessors && EXAMPLE_TARGET_KINDS_WITH_ACCESSORS !== EXAMPLE_TARGET_KINDS) {
			console.error('Accessors are excluded by default. Re-run with --include-accessors to check them too.');
		}

		renderIssueSection('Missing JSDoc docstring', issues.missingDocstrings);
		renderIssueSection('Missing @example tag', issues.missingExamples);
		renderIssueSection('Missing code.textmode.art API link', issues.missingApiLinks);
		renderIssueSection('Invalid code.textmode.art API link', issues.invalidApiLinks);

		process.exitCode = 1;
	} catch (error) {
		console.error('Public API documentation check could not complete.');
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 2;
	}
}

await main();

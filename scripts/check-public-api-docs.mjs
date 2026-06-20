import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { Application, PackageJsonReader, ReflectionKind, TSConfigReader } from 'typedoc';

import {
	API_BASE_URL,
	API_DOCS_DIR,
	ENTRY_POINT,
	EXAMPLE_TARGET_KINDS,
	EXAMPLE_TARGET_KINDS_WITH_ACCESSORS,
	TARGET_KINDS,
} from './lib/api-doc-links-config.mjs';

const ISSUE_KIND = {
	MISSING_DOCSTRING: 'missing-docstring',
	MISSING_EXAMPLE: 'missing-example',
	MISSING_API_LINK: 'missing-api-link',
	INVALID_API_LINK: 'invalid-api-link',
};

function parseOptions(argv) {
	return {
		help: argv.includes('--help') || argv.includes('-h'),
		includeAccessors: argv.includes('--include-accessors'),
	};
}

function getExampleTargetKinds(options) {
	return options.includeAccessors ? EXAMPLE_TARGET_KINDS_WITH_ACCESSORS : EXAMPLE_TARGET_KINDS;
}

function exampleScopeLabel(targetKinds) {
	return targetKinds & ReflectionKind.Accessor
		? 'exported functions, methods, and accessors'
		: 'exported functions and methods';
}

function readMarkdownRoutes() {
	const routes = new Set();

	function walk(dir) {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				walk(fullPath);
				continue;
			}

			if (!entry.name.endsWith('.md')) {
				continue;
			}

			const relative = path.relative(API_DOCS_DIR, fullPath).replaceAll(path.sep, '/');
			const withoutExtension = relative.replace(/\.md$/, '');
			const route = withoutExtension.endsWith('/index')
				? withoutExtension.slice(0, -'/index'.length)
				: withoutExtension;
			routes.add(route);
		}
	}

	walk(API_DOCS_DIR);
	return routes;
}

async function loadProject() {
	const app = await Application.bootstrap(
		{
			entryPoints: [ENTRY_POINT],
			entryPointStrategy: 'resolve',
			tsconfig: 'tsconfig.json',
			excludeInternal: true,
			excludePrivate: true,
			excludeProtected: true,
			readme: 'none',
			emit: 'none',
			logLevel: 'Error',
		},
		[new PackageJsonReader(), new TSConfigReader()]
	);

	const project = await app.convert();

	if (!project || app.logger.hasErrors()) {
		throw new Error('TypeDoc failed to resolve the public API surface.');
	}

	return project;
}

function isIncludedReflection(reflection, targetKinds) {
	if (!reflection.kindOf(targetKinds)) {
		return false;
	}

	if (reflection.flags.isPrivate || reflection.flags.isProtected || reflection.flags.isInherited) {
		return false;
	}

	for (let current = reflection; current && !current.isProject(); current = current.parent) {
		if (current.name.startsWith('_')) {
			return false;
		}
	}

	return true;
}

function getRelevantComments(reflection) {
	const comments = [];

	if (reflection.comment) {
		comments.push({ comment: reflection.comment, source: reflection.sources?.[0] });
	}

	if (!reflection.isDeclaration()) {
		return comments;
	}

	for (const signature of reflection.signatures ?? []) {
		if (signature.comment) {
			comments.push({ comment: signature.comment, source: signature.sources?.[0] ?? reflection.sources?.[0] });
		}
	}

	if (reflection.getSignature?.comment) {
		comments.push({
			comment: reflection.getSignature.comment,
			source: reflection.getSignature.sources?.[0] ?? reflection.sources?.[0],
		});
	}

	if (reflection.setSignature?.comment) {
		comments.push({
			comment: reflection.setSignature.comment,
			source: reflection.setSignature.sources?.[0] ?? reflection.sources?.[0],
		});
	}

	return comments;
}

function hasDocstring(reflection) {
	return getRelevantComments(reflection).length > 0;
}

function hasExample(reflection) {
	return getRelevantComments(reflection).some(({ comment }) =>
		comment.getTags('@example').some((tag) => tag.content.some((part) => (part.text ?? '').trim().length > 0))
	);
}

function getApiLinkTargets(comment) {
	return comment
		.getTags('@see')
		.flatMap((tag) => tag.content)
		.filter((part) => part.kind === 'inline-tag' && part.tag === '@link')
		.map((part) => part.target)
		.filter((target) => typeof target === 'string' && target.startsWith(`${API_BASE_URL}/`));
}

function getInvalidApiLinkTargets(comment, routes) {
	return getApiLinkTargets(comment).filter((target) => {
		const routeWithAnchor = target.slice(`${API_BASE_URL}/`.length);
		if (!routeWithAnchor || routeWithAnchor === 'index') {
			return true;
		}

		const [route] = routeWithAnchor.split('#');
		return !routes.has(route);
	});
}

function hasApiLink(comment) {
	return getApiLinkTargets(comment).length > 0;
}

function getSourceCandidates(reflection) {
	if (!reflection.isDeclaration()) {
		return [];
	}

	return [
		...(reflection.sources ?? []),
		...(reflection.signatures ?? []).flatMap((signature) => signature.sources ?? []),
		...(reflection.getSignature?.sources ?? []),
		...(reflection.setSignature?.sources ?? []),
	];
}

function getPrimaryLocation(reflection) {
	const [source] = getSourceCandidates(reflection);

	if (!source) {
		return {
			file: path.resolve('<unknown>'),
			line: 1,
			column: 1,
			printable: '<unknown>:1:1',
		};
	}

	const file = source.fullFileName || path.resolve(source.fileName);
	const line = source.line || 1;
	const column = (source.character ?? 0) + 1;

	return {
		file,
		line,
		column,
		printable: `${file}:${line}:${column}`,
	};
}

function createIssue(reflection, kind) {
	const location = getPrimaryLocation(reflection);

	return {
		kind,
		name: reflection.getFriendlyFullName(),
		file: location.file,
		line: location.line,
		column: location.column,
		location: location.printable,
	};
}

function createCommentIssue(reflection, commentSource, kind, detail) {
	const location = commentSource
		? {
				file: commentSource.fullFileName || path.resolve(commentSource.fileName),
				line: commentSource.line || 1,
				column: (commentSource.character ?? 0) + 1,
			}
		: getPrimaryLocation(reflection);

	return {
		kind,
		name: reflection.getFriendlyFullName(),
		file: location.file,
		line: location.line,
		column: location.column,
		location: `${location.file}:${location.line}:${location.column}`,
		detail,
	};
}

function compareIssues(left, right) {
	return (
		left.file.localeCompare(right.file) ||
		left.line - right.line ||
		left.column - right.column ||
		left.name.localeCompare(right.name)
	);
}

function renderIssueSection(title, issues) {
	if (issues.length === 0) {
		return;
	}

	console.log('');
	console.log(`${title}: ${issues.length}`);

	for (const issue of issues) {
		console.log(`- ${issue.name}`);
		console.log(`  ${issue.location}`);
		if (issue.detail) {
			console.log(`  ${issue.detail}`);
		}
	}
}

async function main() {
	try {
		const options = parseOptions(process.argv.slice(2));

		if (options.help) {
			console.log('Usage: node ./scripts/check-public-api-docs.mjs [--include-accessors]');
			console.log('');
			console.log(`Checks the documented public API reachable from ${ENTRY_POINT}.`);
			console.log('Skips private/protected/inherited members and any API path segment starting with "_".');
			console.log('Requires public API JSDoc comments to link to their code.textmode.art API reference.');
			console.log('Also requires at least one @example tag for exported functions and methods.');
			console.log('');
			console.log('Options:');
			console.log(
				'  --include-accessors  Include exported accessors/getters in addition to functions and methods.'
			);
			return;
		}

		const routes = readMarkdownRoutes();
		const docstringTargetKinds = getExampleTargetKinds(options);
		const project = await loadProject();
		const allReflections = project
			.getReflectionsByKind(TARGET_KINDS)
			.filter((reflection) => isIncludedReflection(reflection, TARGET_KINDS));
		const reflections = project
			.getReflectionsByKind(docstringTargetKinds)
			.filter((reflection) => isIncludedReflection(reflection, docstringTargetKinds));
		const scopeLabel = exampleScopeLabel(docstringTargetKinds);

		const missingDocstrings = reflections
			.filter((reflection) => !hasDocstring(reflection))
			.map((reflection) => createIssue(reflection, ISSUE_KIND.MISSING_DOCSTRING))
			.sort(compareIssues);

		const missingExamples = reflections
			.filter((reflection) => hasDocstring(reflection) && !hasExample(reflection))
			.map((reflection) => createIssue(reflection, ISSUE_KIND.MISSING_EXAMPLE))
			.sort(compareIssues);

		const comments = allReflections.flatMap((reflection) =>
			getRelevantComments(reflection).map(({ comment, source }) => ({ reflection, comment, source }))
		);
		const missingApiLinks = comments
			.filter(({ comment }) => !hasApiLink(comment))
			.map(({ reflection, source }) => createCommentIssue(reflection, source, ISSUE_KIND.MISSING_API_LINK))
			.sort(compareIssues);
		const invalidApiLinks = comments
			.flatMap(({ reflection, comment, source }) =>
				getInvalidApiLinkTargets(comment, routes).map((target) =>
					createCommentIssue(reflection, source, ISSUE_KIND.INVALID_API_LINK, target)
				)
			)
			.sort(compareIssues);

		if (
			missingDocstrings.length === 0 &&
			missingExamples.length === 0 &&
			missingApiLinks.length === 0 &&
			invalidApiLinks.length === 0
		) {
			console.log('Public API documentation check passed.');
			console.log(`Scanned ${reflections.length} ${scopeLabel} from ${ENTRY_POINT}.`);
			console.log('Policy: skip private/protected/inherited members and any API path segment starting with "_".');
			console.log('Every included API item has a JSDoc docstring and a valid code.textmode.art API link.');
			console.log(`Every included ${scopeLabel} has at least one @example tag.`);
			if (!options.includeAccessors) {
				console.log('Accessors are excluded by default. Re-run with --include-accessors to check them too.');
			}
			return;
		}

		console.error('Public API documentation check failed.');
		console.error(`Scanned ${reflections.length} ${scopeLabel} from ${ENTRY_POINT}.`);
		console.error('Policy: skip private/protected/inherited members and any API path segment starting with "_".');
		console.error(
			`Found ${
				missingDocstrings.length + missingExamples.length + missingApiLinks.length + invalidApiLinks.length
			} issue(s): ${missingDocstrings.length} missing docstring, ${missingExamples.length} missing @example, ${missingApiLinks.length} missing API link, ${invalidApiLinks.length} invalid API link.`
		);
		if (!options.includeAccessors) {
			console.error('Accessors are excluded by default. Re-run with --include-accessors to check them too.');
		}

		renderIssueSection('Missing JSDoc docstring', missingDocstrings);
		renderIssueSection('Missing @example tag', missingExamples);
		renderIssueSection('Missing code.textmode.art API link', missingApiLinks);
		renderIssueSection('Invalid code.textmode.art API link', invalidApiLinks);

		process.exitCode = 1;
	} catch (error) {
		console.error('Public API documentation check could not complete.');
		console.error(error instanceof Error ? error.message : String(error));
		process.exitCode = 2;
	}
}

await main();

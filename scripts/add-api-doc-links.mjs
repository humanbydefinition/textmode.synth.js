import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import { Application, PackageJsonReader, ReflectionKind, TSConfigReader } from 'typedoc';

import { API_BASE_URL, API_DOCS_DIR, ENTRY_POINTS, SOURCE_ROOTS, TARGET_KINDS } from './lib/api-doc-links-config.mjs';

const KIND_DIRECTORIES = new Map([
	[ReflectionKind.Class, 'classes'],
	[ReflectionKind.Interface, 'interfaces'],
	[ReflectionKind.TypeAlias, 'type-aliases'],
	[ReflectionKind.Enum, 'enumerations'],
	[ReflectionKind.Variable, 'variables'],
	[ReflectionKind.Function, 'functions'],
	[ReflectionKind.Method, 'methods'],
	[ReflectionKind.Accessor, 'accessors'],
	[ReflectionKind.Property, 'properties'],
]);

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

function slugAnchor(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

function isIncludedReflection(reflection) {
	if (!reflection.kindOf(TARGET_KINDS)) {
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

function routeForReflection(reflection, routes) {
	if (reflection.isProject()) {
		return '';
	}

	if (reflection.kind === ReflectionKind.Namespace) {
		const parentRoute =
			reflection.parent && !reflection.parent.isProject() ? routeForReflection(reflection.parent, routes) : '';
		return [parentRoute, 'namespaces', reflection.name].filter(Boolean).join('/');
	}

	if (
		reflection.kind === ReflectionKind.Method ||
		reflection.kind === ReflectionKind.Accessor ||
		reflection.kind === ReflectionKind.Property
	) {
		const ownerRoute = routeForReflection(reflection.parent, routes);
		const ownPageRoute = [ownerRoute, KIND_DIRECTORIES.get(reflection.kind), reflection.name]
			.filter(Boolean)
			.join('/');

		if (routes.has(ownPageRoute)) {
			return ownPageRoute;
		}

		return `${ownerRoute}#${slugAnchor(reflection.name)}`;
	}

	const directory = KIND_DIRECTORIES.get(reflection.kind);
	if (!directory) {
		return undefined;
	}

	const parentRoute =
		reflection.parent && !reflection.parent.isProject() ? routeForReflection(reflection.parent, routes) : '';
	return [parentRoute, directory, reflection.name].filter(Boolean).join('/');
}

function getCommentTargets(reflection, routes) {
	const route = routeForReflection(reflection, routes);
	if (!route) {
		return [];
	}

	const routeWithoutAnchor = route.split('#')[0];
	if (!routes.has(routeWithoutAnchor)) {
		return [];
	}

	const url = `${API_BASE_URL}/${route}`;
	const label = `${reflection.getFriendlyFullName()} API reference`;
	const targets = [];

	if (reflection.comment) {
		targets.push({ reflection, source: reflection.sources?.[0], seeLine: `@see {@link ${url} | ${label}}` });
	}

	if (reflection.isDeclaration()) {
		for (const signature of reflection.signatures ?? []) {
			if (signature.comment) {
				targets.push({
					reflection,
					source: signature.sources?.[0] ?? reflection.sources?.[0],
					seeLine: `@see {@link ${url} | ${label}}`,
				});
			}
		}

		if (reflection.getSignature?.comment) {
			targets.push({
				reflection,
				source: reflection.getSignature.sources?.[0] ?? reflection.sources?.[0],
				seeLine: `@see {@link ${url} | ${label}}`,
			});
		}

		if (reflection.setSignature?.comment) {
			targets.push({
				reflection,
				source: reflection.setSignature.sources?.[0] ?? reflection.sources?.[0],
				seeLine: `@see {@link ${url} | ${label}}`,
			});
		}
	}

	return targets;
}

function getLineStartOffsets(text) {
	const offsets = [0];
	for (let index = 0; index < text.length; index += 1) {
		if (text[index] === '\n') {
			offsets.push(index + 1);
		}
	}
	return offsets;
}

function findJsdocBeforeLine(text, lineStarts, line) {
	const declarationOffset = lineStarts[line - 1] ?? text.length;
	const searchText = text.slice(0, declarationOffset);
	const start = searchText.lastIndexOf('/**');
	const end = searchText.lastIndexOf('*/');

	if (start === -1 || end === -1 || start > end) {
		return undefined;
	}

	return { start, end };
}

function insertSeeLine(text, comment, seeLine) {
	const commentText = text.slice(comment.start, comment.end + 2);
	if (commentText.includes(API_BASE_URL)) {
		return text;
	}

	if (!commentText.includes('\n')) {
		const lineStart = text.lastIndexOf('\n', comment.start) + 1;
		const indent = text.slice(lineStart, comment.start);
		const summary = commentText
			.replace(/^\/\*\*\s?/, '')
			.replace(/\s?\*\/$/, '')
			.trim();
		const replacement = [
			`${indent}/**`,
			summary ? `${indent} * ${summary}` : undefined,
			`${indent} *`,
			`${indent} * ${seeLine}`,
			`${indent} */`,
		]
			.filter(Boolean)
			.join('\n');

		return `${text.slice(0, lineStart)}${replacement}${text.slice(comment.end + 2)}`;
	}

	const lineStart = text.lastIndexOf('\n', comment.end) + 1;
	const closingLine = text.slice(lineStart, comment.end + 2);
	const prefixMatch = closingLine.match(/^(\s*)\*\//);
	const indent = prefixMatch?.[1] ?? '';
	const insertion = `${indent}*\n${indent}* ${seeLine}\n`;

	return `${text.slice(0, lineStart)}${insertion}${text.slice(lineStart)}`;
}

async function loadProject(entryPoint) {
	const app = await Application.bootstrap(
		{
			entryPoints: [entryPoint],
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
		throw new Error(`TypeDoc failed to resolve ${entryPoint}.`);
	}

	return project;
}

async function main() {
	const routes = readMarkdownRoutes();
	const pendingByFile = new Map();

	for (const entryPoint of ENTRY_POINTS) {
		const project = await loadProject(entryPoint.path);
		const reflections = project.getReflectionsByKind(TARGET_KINDS).filter(isIncludedReflection);

		for (const reflection of reflections) {
			if (entryPoint.namespaceExportsOnly && reflection.kind !== ReflectionKind.Namespace) {
				continue;
			}

			for (const target of getCommentTargets(reflection, routes)) {
				if (!target.source?.fullFileName || !target.source.line) {
					continue;
				}

				if (!SOURCE_ROOTS.some((root) => target.source.fullFileName.startsWith(root))) {
					continue;
				}

				const entries = pendingByFile.get(target.source.fullFileName) ?? [];
				entries.push({ line: target.source.line, seeLine: target.seeLine });
				pendingByFile.set(target.source.fullFileName, entries);
			}
		}
	}

	let changedFiles = 0;
	let insertedLinks = 0;

	for (const [fileName, entries] of pendingByFile) {
		let text = fs.readFileSync(fileName, 'utf8');
		const uniqueEntries = Array.from(
			new Map(entries.map((entry) => [`${entry.line}\0${entry.seeLine}`, entry])).values()
		);

		for (const entry of uniqueEntries.sort((left, right) => right.line - left.line)) {
			const before = text;
			const lineStarts = getLineStartOffsets(text);
			const comment = findJsdocBeforeLine(text, lineStarts, entry.line);
			if (!comment) {
				continue;
			}
			text = insertSeeLine(text, comment, entry.seeLine);
			if (text !== before) {
				insertedLinks += 1;
			}
		}

		if (text !== fs.readFileSync(fileName, 'utf8')) {
			fs.writeFileSync(fileName, text);
			changedFiles += 1;
		}
	}

	console.log(`Inserted ${insertedLinks} API reference link(s) in ${changedFiles} file(s).`);
}

await main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});

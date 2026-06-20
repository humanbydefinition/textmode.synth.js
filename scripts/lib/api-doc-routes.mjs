import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { ReflectionKind } from 'typedoc';

export const KIND_DIRECTORIES = new Map([
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

export function readMarkdownRoutes(apiDocsDir) {
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

			const relative = path.relative(apiDocsDir, fullPath).replaceAll(path.sep, '/');
			const withoutExtension = relative.replace(/\.md$/, '');
			const route = withoutExtension.endsWith('/index')
				? withoutExtension.slice(0, -'/index'.length)
				: withoutExtension;
			routes.add(route);
		}
	}

	walk(apiDocsDir);
	return routes;
}

function generateTemporaryMarkdownRoutes() {
	const outputDir = fs.mkdtempSync(path.join(tmpdir(), 'textmode-api-routes-'));

	try {
		execFileSync('npm', ['run', 'build:docs', '--', '--out', outputDir, '--logLevel', 'Error'], {
			encoding: 'utf8',
			maxBuffer: 1024 * 1024 * 20,
			stdio: 'pipe',
		});
		return readMarkdownRoutes(outputDir);
	} finally {
		fs.rmSync(outputDir, { recursive: true, force: true });
	}
}

export async function readOrGenerateMarkdownRoutes(apiDocsDir) {
	if (fs.existsSync(apiDocsDir)) {
		return readMarkdownRoutes(apiDocsDir);
	}

	return generateTemporaryMarkdownRoutes();
}

export function slugAnchor(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export function routeForReflection(reflection, routes) {
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

export function hostedApiUrl(apiBaseUrl, route) {
	return `${apiBaseUrl}/${route}`;
}

import fs from 'node:fs';
import process from 'node:process';

import { API_BASE_URL, API_DOCS_DIR, ENTRY_POINTS, SOURCE_ROOTS, TARGET_KINDS } from './lib/api-doc-links-config.mjs';
import { createApiLinkTargets } from './lib/api-doc-checks.mjs';
import { readMarkdownRoutes } from './lib/api-doc-routes.mjs';
import { findJsdocBeforeLine, getLineStartOffsets, upsertSeeLine } from './lib/jsdoc-comments.mjs';
import {
	getIncludedReflections,
	shouldProcessEntryPointReflection,
	sourceIsInRoots,
} from './lib/reflection-policy.mjs';
import { loadTypeDocProject } from './lib/typedoc-project.mjs';

async function collectPendingEdits(routes) {
	const pendingByFile = new Map();

	for (const entryPoint of ENTRY_POINTS) {
		const project = await loadTypeDocProject({
			entryPoint: entryPoint.path,
			tsconfig: entryPoint.tsconfig,
		});
		const reflections = getIncludedReflections(project, TARGET_KINDS);

		for (const reflection of reflections) {
			if (!shouldProcessEntryPointReflection(entryPoint, reflection)) {
				continue;
			}

			for (const target of createApiLinkTargets(reflection, routes, API_BASE_URL)) {
				if (!target.source?.line || !sourceIsInRoots(target.source, SOURCE_ROOTS)) {
					continue;
				}

				const entries = pendingByFile.get(target.source.fullFileName) ?? [];
				entries.push({ line: target.source.line, seeLine: target.seeLine });
				pendingByFile.set(target.source.fullFileName, entries);
			}
		}
	}

	return pendingByFile;
}

function applyPendingEdits(pendingByFile) {
	let changedFiles = 0;
	let insertedLinks = 0;

	for (const [fileName, entries] of pendingByFile) {
		const originalText = fs.readFileSync(fileName, 'utf8');
		let text = originalText;
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

			text = upsertSeeLine(text, comment, entry.seeLine, API_BASE_URL);
			if (text !== before) {
				insertedLinks += 1;
			}
		}

		if (text !== originalText) {
			fs.writeFileSync(fileName, text);
			changedFiles += 1;
		}
	}

	return { changedFiles, insertedLinks };
}

async function main() {
	const routes = readMarkdownRoutes(API_DOCS_DIR);
	const pendingByFile = await collectPendingEdits(routes);
	const { changedFiles, insertedLinks } = applyPendingEdits(pendingByFile);

	console.log(`Inserted ${insertedLinks} API reference link(s) in ${changedFiles} file(s).`);
}

await main().catch((error) => {
	console.error(error instanceof Error ? error.message : String(error));
	process.exitCode = 1;
});

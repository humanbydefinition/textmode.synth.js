// @ts-check

import { ReflectionKind } from 'typedoc';

import { extractDescription } from './descriptions.js';
import {
	getCategoryForKind,
	getHasConstructor,
	getIsInterface,
	getNamespacePath,
	getOwnerName,
	isInNamespace,
} from './reflection-metadata.js';

/**
 * Remove undefined values from a frontmatter object.
 *
 * @param {Record<string, unknown>} frontmatter
 * @returns {Record<string, unknown>}
 */
export function removeUndefinedValues(frontmatter) {
	for (const key of Object.keys(frontmatter)) {
		if (frontmatter[key] === undefined) {
			delete frontmatter[key];
		}
	}

	return frontmatter;
}

/**
 * Build API frontmatter for a TypeDoc markdown page.
 *
 * @param {import('typedoc').Reflection} model
 * @param {Record<string, unknown>} existingFrontmatter
 * @param {import('./library-context.js').LibraryContext} library
 * @returns {Record<string, unknown>}
 */
export function buildApiFrontmatter(model, existingFrontmatter, library) {
	const kind = model.kind;

	return removeUndefinedValues({
		...existingFrontmatter,
		title: model.name,
		description: extractDescription(model, library),
		category: getCategoryForKind(kind),
		api: true,
		owner: getOwnerName(model),
		namespace: isInNamespace(model) ? getNamespacePath(model) : undefined,
		kind: ReflectionKind[kind],
		ecosystem: library.ecosystem !== library.name ? library.ecosystem : undefined,
		lastModified: new Date().toISOString().split('T')[0],
		hasConstructor: getHasConstructor(model),
		isInterface: getIsInterface(model),
	});
}

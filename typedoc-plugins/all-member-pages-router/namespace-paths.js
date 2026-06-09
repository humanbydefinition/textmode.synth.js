// @ts-check

import { ReflectionKind } from 'typedoc';

/**
 * Check whether a namespace is directly rooted in the TypeDoc project after
 * walking through any nested namespace ancestors.
 *
 * @param {import('typedoc').Reflection} reflection
 * @returns {boolean}
 */
export function isProjectNamespace(reflection) {
	let ancestor = reflection.parent;
	while (ancestor && ancestor.kind === ReflectionKind.Namespace) {
		ancestor = ancestor.parent;
	}
	return ancestor?.kind === ReflectionKind.Project;
}

/**
 * Build the flattened project namespace path used by the textmode.js docs.
 *
 * @param {{
 *   directories: Map<import('typedoc').ReflectionKind, string>;
 *   getReflectionAlias(reflection: import('typedoc').Reflection): string;
 * }} router
 * @param {import('typedoc').Reflection} reflection
 * @returns {string}
 */
export function buildNamespacePath(router, reflection) {
	const stack = [];
	let current = reflection;
	while (current && current.kind === ReflectionKind.Namespace) {
		stack.unshift(current);
		current = current.parent;
	}

	const segments = [];
	for (const namespace of stack) {
		segments.push(router.directories.get(ReflectionKind.Namespace), router.getReflectionAlias(namespace));
	}

	return segments.join('/');
}

// @ts-check

import { ReflectionKind } from 'typedoc';

import { API_REFERENCE_CATEGORY, CATEGORY_BY_KIND } from './constants.js';

/**
 * Get the frontmatter category for a reflection kind.
 *
 * @param {import('typedoc').ReflectionKind} kind
 * @returns {string}
 */
export function getCategoryForKind(kind) {
	return CATEGORY_BY_KIND.get(kind) ?? API_REFERENCE_CATEGORY;
}

/**
 * Check if a reflection belongs to a namespace.
 *
 * @param {import('typedoc').Reflection} model
 * @returns {boolean}
 */
export function isInNamespace(model) {
	let parent = model.parent;
	while (parent) {
		if (parent.kind === ReflectionKind.Namespace) {
			return true;
		}
		parent = parent.parent;
	}
	return false;
}

/**
 * Get the full namespace path for a reflection.
 *
 * @param {import('typedoc').Reflection} model
 * @returns {string | undefined}
 */
export function getNamespacePath(model) {
	/** @type {string[]} */
	const parts = [];
	let parent = model.parent;

	while (parent) {
		if (parent.kind === ReflectionKind.Namespace) {
			parts.unshift(parent.name);
		}
		parent = parent.parent;
	}

	return parts.length > 0 ? parts.join('.') : undefined;
}

/**
 * Get the owning class or interface name for member reflections.
 *
 * @param {import('typedoc').Reflection} model
 * @returns {string | undefined}
 */
export function getOwnerName(model) {
	let parent = model.parent;
	while (parent) {
		if (parent.kind === ReflectionKind.Class || parent.kind === ReflectionKind.Interface) {
			return parent.name;
		}
		parent = parent.parent;
	}

	return undefined;
}

/**
 * Check if a class reflection has a constructor child.
 *
 * @param {import('typedoc').Reflection} model
 * @returns {boolean | undefined}
 */
export function getHasConstructor(model) {
	if (model.kind !== ReflectionKind.Class || !('children' in model)) {
		return undefined;
	}

	return model.children?.some((child) => child.kind === ReflectionKind.Constructor);
}

/**
 * Check if a reflection is an interface.
 *
 * @param {import('typedoc').Reflection} model
 * @returns {true | undefined}
 */
export function getIsInterface(model) {
	return model.kind === ReflectionKind.Interface ? true : undefined;
}

// @ts-check

import { ReflectionKind } from 'typedoc';

import { CONSTRUCTOR_FILE_NAME, MEMBER_DIRECTORIES } from './constants.js';

/**
 * @typedef {{
 *   getIdealBaseName(reflection: import('typedoc').Reflection): string;
 * }} MemberDirectoryRouter
 */

/**
 * @typedef {{
 *   getReflectionAlias(reflection: import('typedoc').Reflection): string;
 * }} ReflectionAliasRouter
 */

/**
 * Get the directory name for a direct class/interface member kind.
 *
 * @param {import('typedoc').ReflectionKind} kind
 * @returns {string | undefined}
 */
export function getMemberDirectoryName(kind) {
	return MEMBER_DIRECTORIES.get(kind);
}

/**
 * Build the directory path for a direct class/interface member page.
 *
 * @param {MemberDirectoryRouter} router
 * @param {import('typedoc').Reflection} reflection
 * @returns {string}
 */
export function getDirectMemberDirectory(router, reflection) {
	const directory = getMemberDirectoryName(reflection.kind);
	return `${router.getIdealBaseName(reflection.parent)}/${directory}`;
}

/**
 * Build a reflection filename, preserving constructor page names.
 *
 * @param {ReflectionAliasRouter} router
 * @param {import('typedoc').Reflection} reflection
 * @returns {string}
 */
export function getReflectionFileName(router, reflection) {
	if (reflection.kind === ReflectionKind.Constructor) {
		return CONSTRUCTOR_FILE_NAME;
	}

	return router.getReflectionAlias(reflection);
}

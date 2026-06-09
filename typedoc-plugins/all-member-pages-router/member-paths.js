// @ts-check

import { MEMBER_DIRECTORIES } from './constants.js';

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
 * Get the directory name for a direct Sandpack member kind.
 *
 * @param {import('typedoc').ReflectionKind} kind
 * @returns {string | undefined}
 */
export function getMemberDirectoryName(kind) {
	return MEMBER_DIRECTORIES.get(kind);
}

/**
 * Build the directory path for a direct Sandpack member page.
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
 * Build a reflection filename for a direct Sandpack member page.
 *
 * @param {ReflectionAliasRouter} router
 * @param {import('typedoc').Reflection} reflection
 * @returns {string}
 */
export function getReflectionFileName(router, reflection) {
	return router.getReflectionAlias(reflection);
}

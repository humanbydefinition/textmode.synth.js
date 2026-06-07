// @ts-check

import { ALWAYS_OWN_PAGE_KIND_NAMES, MEMBER_PAGE_KINDS, OWNER_PAGE_KINDS } from './constants.js';

/**
 * @typedef {{
 *   membersWithOwnFile: string[];
 *   kindsToString: Map<import('typedoc').ReflectionKind, string>;
 * }} OwnPagePolicyRouter
 */

/**
 * Check whether a reflection is a direct class/interface member that should
 * become a focused page.
 *
 * @param {import('typedoc').Reflection | undefined} reflection
 * @returns {boolean}
 */
export function isDirectMemberPageReflection(reflection) {
	return Boolean(
		reflection?.parent && OWNER_PAGE_KINDS.has(reflection.parent.kind) && MEMBER_PAGE_KINDS.has(reflection.kind)
	);
}

/**
 * Preserve the markdown MemberRouter own-page policy while extending it to
 * direct class/interface members.
 *
 * @param {import('typedoc').Reflection} reflection
 * @param {OwnPagePolicyRouter} router
 * @returns {boolean}
 */
export function shouldRenderOwnPage(reflection, router) {
	if (isDirectMemberPageReflection(reflection)) {
		return true;
	}

	return [...ALWAYS_OWN_PAGE_KIND_NAMES, ...router.membersWithOwnFile].includes(
		router.kindsToString.get(reflection.kind)
	);
}

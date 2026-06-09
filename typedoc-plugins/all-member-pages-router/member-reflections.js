// @ts-check

import { ReflectionKind } from 'typedoc';

import {
	ALWAYS_OWN_PAGE_KIND_NAMES,
	MEMBER_PAGE_OWNER_KINDS,
	MAX_INLINE_SANDPACK_EXAMPLES,
	MEMBER_PAGE_KINDS,
} from './constants.js';

/**
 * @typedef {{
 *   membersWithOwnFile: string[];
 *   kindsToString: Map<import('typedoc').ReflectionKind, string>;
 * }} OwnPagePolicyRouter
 */

/**
 * @param {import('typedoc').Reflection | undefined} reflection
 * @returns {string[]}
 */
function getOwnSandpackExamples(reflection) {
	return (reflection?.comment?.blockTags || []).flatMap((tag) => {
		if (tag.tag !== '@example') {
			return [];
		}

		const content = (tag.content || []).map((part) => part.text).join('');
		return /```(?:js|javascript|jsx|ts|typescript|tsx)\b/i.test(content) && /@title\b/.test(content)
			? [content]
			: [];
	});
}

/**
 * @param {import('typedoc').Reflection} reflection
 * @returns {number}
 */
function countReflectionSandpackExamples(reflection) {
	const examples = new Set([
		...getOwnSandpackExamples(reflection),
		...(reflection.signatures || []).flatMap((signature) => getOwnSandpackExamples(signature)),
		...getOwnSandpackExamples(reflection.getSignature),
		...getOwnSandpackExamples(reflection.setSignature),
	]);

	return examples.size;
}

/**
 * @param {import('typedoc').Reflection} owner
 * @returns {number}
 */
function countInlineMemberSandpackExamples(owner) {
	return (owner.children || [])
		.filter((child) => isSandpackThresholdMemberReflection(child))
		.reduce((count, member) => count + countReflectionSandpackExamples(member), 0);
}

/**
 * @param {import('typedoc').Reflection} reflection
 * @returns {boolean}
 */
function isPropertyLikeReflection(reflection) {
	return reflection.kind === ReflectionKind.Property || reflection.kind === ReflectionKind.Accessor;
}

/**
 * @param {import('typedoc').Reflection} reflection
 * @returns {boolean}
 */
function isSandpackThresholdMemberReflection(reflection) {
	return (
		(reflection.kind === ReflectionKind.Method || isPropertyLikeReflection(reflection)) &&
		countReflectionSandpackExamples(reflection) > 0
	);
}

/**
 * Check whether direct members should become focused pages for this owner.
 *
 * @param {import('typedoc').Reflection} owner
 * @returns {boolean}
 */
function shouldRenderMemberPages(owner) {
	if (!MEMBER_PAGE_OWNER_KINDS.has(owner.kind)) {
		return false;
	}

	const inlineExampleCount = countReflectionSandpackExamples(owner) + countInlineMemberSandpackExamples(owner);
	return inlineExampleCount > MAX_INLINE_SANDPACK_EXAMPLES;
}

/**
 * @param {import('typedoc').Reflection | undefined} reflection
 * @returns {boolean}
 */
function isDirectManagedMemberReflection(reflection) {
	return Boolean(
		reflection?.parent &&
		MEMBER_PAGE_OWNER_KINDS.has(reflection.parent.kind) &&
		MEMBER_PAGE_KINDS.has(reflection.kind)
	);
}

/**
 * Check whether a reflection is a direct method or example-bearing property
 * that should become a focused page.
 *
 * @param {import('typedoc').Reflection | undefined} reflection
 * @returns {boolean}
 */
export function isDirectMemberPageReflection(reflection) {
	if (!isDirectManagedMemberReflection(reflection) || !shouldRenderMemberPages(reflection.parent)) {
		return false;
	}

	if (reflection.kind === ReflectionKind.Method) {
		return true;
	}

	return isSandpackThresholdMemberReflection(reflection);
}

/**
 * Preserve the markdown MemberRouter own-page policy while extending it to
 * direct methods and example-bearing properties when the owner page would
 * otherwise render too many Sandpack examples.
 *
 * @param {import('typedoc').Reflection} reflection
 * @param {OwnPagePolicyRouter} router
 * @returns {boolean}
 */
export function shouldRenderOwnPage(reflection, router) {
	if (isDirectMemberPageReflection(reflection)) {
		return true;
	}

	if (isDirectManagedMemberReflection(reflection)) {
		return false;
	}

	return [...ALWAYS_OWN_PAGE_KIND_NAMES, ...router.membersWithOwnFile].includes(
		router.kindsToString.get(reflection.kind)
	);
}

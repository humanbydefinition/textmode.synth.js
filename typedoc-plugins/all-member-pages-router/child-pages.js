// @ts-check

import { Reflection, Slugger } from 'typedoc';

import { shouldRenderOwnPage } from './member-reflections.js';

/**
 * @typedef {{
 *   extension: string;
 *   fullUrls: Map<import('typedoc').Reflection, string>;
 *   sluggerConfiguration: unknown;
 *   sluggers: Map<import('typedoc').Reflection, Slugger>;
 *   getFileName(idealName: string): string;
 *   getIdealBaseName(reflection: import('typedoc').Reflection): string;
 *   getPageKind(reflection: import('typedoc').Reflection): import('typedoc').PageKind | undefined;
 *   shouldWritePage(reflection: import('typedoc').Reflection): boolean;
 *   buildAnchors(reflection: import('typedoc').Reflection, parent?: import('typedoc').Reflection): void;
 *   membersWithOwnFile: string[];
 *   kindsToString: Map<import('typedoc').ReflectionKind, string>;
 * }} ChildPageRouter
 */

/**
 * Build child pages using typedoc-plugin-markdown's MemberRouter traversal
 * shape, while delegating textmode.js' expanded own-page policy to local
 * helpers. This mirrors upstream traversal intentionally; when upgrading
 * typedoc-plugin-markdown, compare this function against MemberRouter.
 *
 * @param {ChildPageRouter} router
 * @param {import('typedoc').Reflection} reflection
 * @param {import('typedoc').PageDefinition[]} outPages
 * @returns {void}
 */
export function buildMemberRouterChildPages(router, reflection, outPages) {
	const kind = router.getPageKind(reflection);
	if (!kind) {
		router.buildAnchors(reflection, reflection.parent);
		return;
	}

	const shouldWritePage = router.shouldWritePage(reflection);
	const idealName = router.getIdealBaseName(reflection);
	const actualName = shouldWritePage ? router.getFileName(idealName) : `${idealName}${router.extension}`;
	router.fullUrls.set(reflection, actualName);

	if (shouldRenderOwnPage(reflection, router)) {
		if (shouldWritePage) {
			router.sluggers.set(reflection, new Slugger(router.sluggerConfiguration));
			outPages.push({
				kind,
				model: reflection,
				url: actualName,
			});
		}
	} else {
		router.buildAnchors(reflection, reflection.parent);
	}

	if (reflection instanceof Reflection) {
		reflection.traverse((child) => {
			buildMemberRouterChildPages(router, child, outPages);
			return true;
		});
	}
}

// @ts-check

import { PageKind } from 'typedoc';
import { MemberRouter } from 'typedoc-plugin-markdown';

import { buildMemberRouterChildPages } from './child-pages.js';
import { getDirectMemberDirectory, getReflectionFileName as getMemberReflectionFileName } from './member-paths.js';
import { isDirectMemberPageReflection } from './member-reflections.js';
import { buildNamespacePath, isProjectNamespace } from './namespace-paths.js';

export class AllMemberPagesRouter extends MemberRouter {
	/** @param {import('typedoc').Reflection} reflection */
	getPageKind(reflection) {
		if (isDirectMemberPageReflection(reflection)) {
			return PageKind.Reflection;
		}

		return super.getPageKind(reflection);
	}

	/**
	 * This mirrors typedoc-plugin-markdown's MemberRouter child traversal while
	 * delegating the "own page" policy to this plugin's helpers.
	 *
	 * @param {import('typedoc').Reflection} reflection
	 * @param {import('typedoc').PageDefinition[]} outPages
	 */
	buildChildPages(reflection, outPages) {
		buildMemberRouterChildPages(this, reflection, outPages);
	}

	/** @param {import('typedoc').Reflection} reflection */
	getNamespaceDirectory(reflection) {
		if (isProjectNamespace(reflection)) {
			return buildNamespacePath(this, reflection);
		}

		return super.getNamespaceDirectory(reflection);
	}

	/** @param {import('typedoc').Reflection} reflection */
	getReflectionDirectory(reflection) {
		if (isDirectMemberPageReflection(reflection)) {
			return getDirectMemberDirectory(this, reflection);
		}

		return super.getReflectionDirectory(reflection);
	}

	/** @param {import('typedoc').Reflection} reflection */
	getReflectionFileName(reflection) {
		if (isDirectMemberPageReflection(reflection)) {
			return getMemberReflectionFileName(this, reflection);
		}

		return super.getReflectionFileName(reflection);
	}
}

// @ts-check

import { MarkdownTheme } from 'typedoc-plugin-markdown';

let isPatched = false;

/**
 * Patch typedoc-plugin-markdown's theme render-context factory once.
 *
 * This is the only place this plugin reaches into markdown theme internals.
 * Keep the patch idempotent because TypeDoc can load plugins repeatedly in
 * watch mode and tests can import the plugin more than once.
 *
 * @param {(theme: MarkdownTheme, page: import('typedoc-plugin-markdown').MarkdownPageEvent<import('typedoc').Reflection>) => import('typedoc-plugin-markdown').MarkdownThemeContext} createContext
 * @returns {boolean} True when this call installed the patch.
 */
export function patchMarkdownThemeRenderContext(createContext) {
	if (isPatched) {
		return false;
	}

	MarkdownTheme.prototype.getRenderContext = function (page) {
		return createContext(this, page);
	};
	isPatched = true;

	return true;
}

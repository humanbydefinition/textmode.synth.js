// @ts-check

import { MarkdownTheme, MarkdownThemeContext } from 'typedoc-plugin-markdown';

import { normalizeAccessorComments } from './accessor-comments.js';
import { renderAccessorDocs } from './render-accessor.js';
import { patchMarkdownThemeRenderContext } from './theme-patch.js';

class AccessorDocsMarkdownThemeContext extends MarkdownThemeContext {
	/**
	 * @param {MarkdownTheme} theme
	 * @param {import('typedoc-plugin-markdown').MarkdownPageEvent<import('typedoc').Reflection>} page
	 * @param {import('typedoc').Options} options
	 */
	constructor(theme, page, options) {
		super(theme, page, options);
		normalizeAccessorComments(page.model);
		this.partials.accessor = (accessor, partialOptions) => renderAccessorDocs(this, accessor, partialOptions);
	}
}

/**
 * @param {import('typedoc').Application} app
 * @returns {void}
 */
export function load(app) {
	patchMarkdownThemeRenderContext(
		(theme, page) => new AccessorDocsMarkdownThemeContext(theme, page, theme.application.options)
	);

	app.logger.verbose('[typedoc] Registered accessor docs normalizer');
}

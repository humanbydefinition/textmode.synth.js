// @ts-check

import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

import { transformExampleCodeBlocks } from './transform-markdown.js';

/**
 * TypeDoc plugin load function.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 * @returns {void}
 */
export function load(app) {
	app.renderer.on(MarkdownPageEvent.END, (page) => {
		if (!page.contents) {
			return;
		}

		page.contents = transformExampleCodeBlocks(page.contents);
	});

	app.logger.verbose('[typedoc] Registered includeCode example normalizer');
}

// @ts-check

import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

import { buildApiFrontmatter } from './frontmatter.js';
import { extractLibraryContext } from './library-context.js';

/**
 * TypeDoc plugin load function.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 * @returns {void}
 */
export function load(app) {
	app.logger.verbose('[frontmatter] Registered textmode.js API frontmatter plugin');

	/** @type {import('./library-context.js').LibraryContext | null} */
	let libraryContext = null;

	app.renderer.on(
		MarkdownPageEvent.BEGIN,
		/** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
		(page) => {
			if (!page.model) {
				return;
			}

			if (!libraryContext) {
				libraryContext = extractLibraryContext(page.project);
				app.logger.verbose(
					`[frontmatter] Library: ${libraryContext.name} (ecosystem: ${libraryContext.ecosystem})`
				);
			}

			page.frontmatter = buildApiFrontmatter(page.model, page.frontmatter, libraryContext);
		}
	);
}

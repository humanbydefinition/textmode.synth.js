// @ts-check

import { Converter, ReflectionKind } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

import { API_BASE_URL } from '../../scripts/lib/api-doc-links-config.mjs';

/**
 * @param {import('typedoc').CommentDisplayPart} part
 * @returns {boolean}
 */
function isHostedApiLink(part) {
	return part.kind === 'inline-tag' && part.tag === '@link' && String(part.target ?? '').startsWith(API_BASE_URL);
}

/**
 * @param {import('typedoc').Comment | undefined} comment
 * @returns {void}
 */
function stripHostedApiSeeTags(comment) {
	if (!comment) {
		return;
	}

	comment.blockTags = comment.blockTags.filter(
		(tag) => tag.tag !== '@see' || !tag.content.some((part) => isHostedApiLink(part))
	);
}

/**
 * @param {import('typedoc').Reflection} reflection
 * @returns {void}
 */
function stripReflectionHostedApiSeeTags(reflection) {
	stripHostedApiSeeTags(reflection.comment);

	if (!reflection.isDeclaration()) {
		return;
	}

	for (const signature of reflection.signatures ?? []) {
		stripHostedApiSeeTags(signature.comment);
	}

	stripHostedApiSeeTags(reflection.getSignature?.comment);
	stripHostedApiSeeTags(reflection.setSignature?.comment);
}

/**
 * @param {string} contents
 * @returns {string}
 */
function stripHostedApiMarkdownLinks(contents) {
	const escapedBaseUrl = API_BASE_URL.replaceAll('.', '\\.');
	const hostedApiLinkPattern = `\\[[^\\]]+ API reference\\]\\(${escapedBaseUrl}[^)]*\\)`;
	const standaloneSeeSection = new RegExp(`\\n#{2,6} See\\n\\n${hostedApiLinkPattern}\\n`, 'g');
	const inlineSeeLink = new RegExp(`\\s*\\*\\*See\\*\\*\\s*${hostedApiLinkPattern}`, 'g');
	const standaloneLinkLine = new RegExp(`^\\s*${hostedApiLinkPattern}\\n?`, 'gm');
	const listItemLinkLine = new RegExp(`^\\s*-\\s*${hostedApiLinkPattern}\\n?`, 'gm');
	const emptySeeSection = /\n#{2,6} See\n(?:\s*\n)+(?=\n#{1,6}\s|\n*$)/g;

	return contents
		.replace(standaloneSeeSection, '\n')
		.replace(inlineSeeLink, '')
		.replace(listItemLinkLine, '')
		.replace(standaloneLinkLine, '')
		.replace(emptySeeSection, '\n');
}

/**
 * @param {import('typedoc').Application} app
 * @returns {void}
 */
export function load(app) {
	app.converter.on(Converter.EVENT_RESOLVE_END, (context) => {
		const reflections = context.project.getReflectionsByKind(ReflectionKind.All);

		for (const reflection of reflections) {
			stripReflectionHostedApiSeeTags(reflection);
		}
	});

	app.renderer.on(MarkdownPageEvent.END, (page) => {
		if (!page.contents) {
			return;
		}

		page.contents = stripHostedApiMarkdownLinks(page.contents);
	});

	app.logger.verbose('[typedoc] Registered hosted API self-link stripper');
}

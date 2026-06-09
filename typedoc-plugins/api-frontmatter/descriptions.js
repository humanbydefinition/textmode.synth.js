// @ts-check

import { ReflectionKind } from 'typedoc';

import {
	DEFAULT_DESCRIPTION_TEMPLATE,
	DESCRIPTION_MAX_LENGTH,
	DESCRIPTION_TEMPLATE_BY_KIND,
	DESCRIPTION_TRUNCATION_SUFFIX,
} from './constants.js';

/**
 * Sanitize text for YAML frontmatter.
 *
 * @param {string} text
 * @returns {string}
 */
export function sanitizeForYaml(text) {
	return text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/https?:\/\/[^\s]+/g, '')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Generate a fallback description using reflection kind templates.
 *
 * @param {import('typedoc').Reflection} model
 * @param {import('./library-context.js').LibraryContext} library
 * @returns {string}
 */
export function generateFallbackDescription(model, library) {
	const kind = model.kind;
	const name = model.name;

	if ((kind === ReflectionKind.Project || kind === ReflectionKind.Module) && name === library.name) {
		return library.description;
	}

	const template = DESCRIPTION_TEMPLATE_BY_KIND.get(kind) ?? DEFAULT_DESCRIPTION_TEMPLATE;

	return template.replace('{name}', name).replace('{library}', library.name);
}

/**
 * Extract a page description from TypeDoc comments, or generate a fallback.
 *
 * @param {import('typedoc').Reflection} model
 * @param {import('./library-context.js').LibraryContext} library
 * @returns {string}
 */
export function extractDescription(model, library) {
	const comment =
		model.comment ?? model.signatures?.[0]?.comment ?? model.getSignature?.comment ?? model.setSignature?.comment;

	if (comment?.summary) {
		const summary = comment.summary
			.map((part) => part.text || '')
			.join('')
			.trim();

		if (summary) {
			const firstParagraph = summary.split(/\n\s*\n/)[0].trim();
			const sanitized = sanitizeForYaml(firstParagraph);

			if (sanitized.length > DESCRIPTION_MAX_LENGTH) {
				return (
					sanitized.substring(0, DESCRIPTION_MAX_LENGTH - DESCRIPTION_TRUNCATION_SUFFIX.length) +
					DESCRIPTION_TRUNCATION_SUFFIX
				);
			}

			return sanitized;
		}
	}

	return generateFallbackDescription(model, library);
}

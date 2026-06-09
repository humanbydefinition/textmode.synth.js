// @ts-check

import { i18n, ReflectionKind } from 'typedoc';

import { hasSyntheticAccessorComment } from './accessor-comments.js';

/**
 * @param {number} level
 * @param {string} text
 * @returns {string}
 */
function heading(level, text) {
	return `${'#'.repeat(level)} ${text}`;
}

/**
 * Render one getter or setter signature.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} context
 * @param {import('typedoc').SignatureReflection} signature
 * @param {{
 *   accessor: 'get' | 'set';
 *   headingLevel: number;
 *   includeParameters: boolean;
 *   showSources: boolean;
 *   title: string;
 * }} options
 * @returns {string}
 */
function renderAccessorSignature(context, signature, options) {
	const md = [];

	md.push(heading(options.headingLevel, options.title));
	md.push(
		context.partials.signatureTitle(signature, {
			accessor: options.accessor,
		})
	);

	if (options.showSources && !context.options.getValue('disableSources') && signature.sources) {
		md.push(context.partials.sources(signature));
	}

	if (signature.comment) {
		md.push(
			context.partials.comment(signature.comment, {
				headingLevel: options.headingLevel + 1,
				showTags: false,
				showSummary: true,
			})
		);
	}

	if (options.includeParameters && signature.parameters?.length) {
		md.push(heading(options.headingLevel + 1, ReflectionKind.pluralString(ReflectionKind.Parameter)));
		if (context.helpers.useTableFormat('parameters')) {
			md.push(context.partials.parametersTable(signature.parameters));
		} else {
			md.push(
				context.partials.parametersList(signature.parameters, {
					headingLevel: options.headingLevel + 1,
				})
			);
		}
	}

	if (signature.type) {
		md.push(
			context.partials.signatureReturns(signature, {
				headingLevel: options.headingLevel + 1,
			})
		);
	}

	if (signature.comment) {
		md.push(
			context.partials.comment(signature.comment, {
				headingLevel: options.headingLevel + 1,
				showTags: true,
				showSummary: false,
			})
		);
	}

	return md.filter(Boolean).join('\n\n');
}

/**
 * Render accessor documentation with getter content before setter content.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownThemeContext} context
 * @param {import('typedoc').DeclarationReflection} accessor
 * @param {{ headingLevel: number }} options
 * @returns {string}
 */
export function renderAccessorDocs(context, accessor, options) {
	const md = [];
	const showSources = accessor.parent?.kind !== ReflectionKind.TypeLiteral;

	if (accessor.getSignature) {
		md.push(
			renderAccessorSignature(context, accessor.getSignature, {
				accessor: 'get',
				headingLevel: options.headingLevel,
				includeParameters: false,
				showSources,
				title: i18n.kind_get_signature(),
			})
		);
	}

	if (accessor.setSignature) {
		md.push(
			renderAccessorSignature(context, accessor.setSignature, {
				accessor: 'set',
				headingLevel: options.headingLevel,
				includeParameters: true,
				showSources,
				title: i18n.kind_set_signature(),
			})
		);
	}

	if (
		showSources &&
		!context.options.getValue('disableSources') &&
		!accessor.getSignature &&
		!accessor.setSignature
	) {
		md.push(context.partials.sources(accessor));
	}

	if (accessor.comment && !hasSyntheticAccessorComment(accessor)) {
		md.push(
			context.partials.comment(accessor.comment, {
				headingLevel: options.headingLevel,
			})
		);
	}

	md.push(context.partials.inheritance(accessor, { headingLevel: options.headingLevel }));

	return md.filter(Boolean).join('\n\n');
}

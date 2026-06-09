// @ts-check

import { ReflectionKind } from 'typedoc';

const syntheticAccessorComments = new WeakSet();

/**
 * Get the first signature-level comment available for an accessor reflection.
 * TypeDoc currently keeps getter/setter comments on their signatures, while
 * overview tables read from the accessor declaration itself.
 *
 * @param {import('typedoc').DeclarationReflection} accessor
 * @returns {import('typedoc').Comment | undefined}
 */
function getAccessorSignatureComment(accessor) {
	return accessor.getSignature?.comment ?? accessor.setSignature?.comment;
}

/**
 * Copy signature comments onto accessor declarations when needed so markdown
 * overview tables can render descriptions instead of falling back to "-".
 *
 * @param {import('typedoc').Reflection | undefined} model
 * @returns {void}
 */
export function normalizeAccessorComments(model) {
	if (!model) {
		return;
	}

	if (model.kind === ReflectionKind.Accessor && 'comment' in model && !model.comment) {
		const signatureComment = getAccessorSignatureComment(model);
		if (signatureComment) {
			model.comment = signatureComment;
			syntheticAccessorComments.add(model);
		}
	}

	model.traverse?.((child) => {
		normalizeAccessorComments(child);
		return true;
	});
}

/**
 * Check whether a comment was copied onto an accessor by this plugin.
 *
 * @param {import('typedoc').DeclarationReflection} accessor
 * @returns {boolean}
 */
export function hasSyntheticAccessorComment(accessor) {
	return syntheticAccessorComments.has(accessor);
}

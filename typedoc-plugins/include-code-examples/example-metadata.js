// @ts-check

const LEADING_EXAMPLE_METADATA_PATTERN = /^\s*\/\*\*([\s\S]*?)\*\/\s*\n?/;

/**
 * Strip the leading gallery metadata docblock from an included example.
 *
 * @param {string} source
 * @returns {string}
 */
export function stripLeadingExampleMetadataDocblock(source) {
	const match = source.match(LEADING_EXAMPLE_METADATA_PATTERN);
	if (!match) {
		return source;
	}

	return source.slice(match[0].length).replace(/^\n+/, '');
}

/**
 * Backwards-compatible helper name retained for copied add-on plugin stacks.
 *
 * @param {string} source
 * @returns {string}
 */
export function stripLeadingExampleMetadata(source) {
	return stripLeadingExampleMetadataDocblock(source);
}

/**
 * Preserve the old helper shape while keeping metadata parsing intentionally minimal.
 *
 * @param {string} source
 * @returns {{ metadata: null; code: string }}
 */
export function extractExampleMetadata(source) {
	return {
		metadata: null,
		code: stripLeadingExampleMetadataDocblock(source),
	};
}

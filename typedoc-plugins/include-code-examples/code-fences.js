// @ts-check

export const EXAMPLE_CODE_FENCE_PATTERN = /```([^\n]*)\n([\s\S]*?)```/g;

export const SUPPORTED_INCLUDED_EXAMPLE_LANGUAGES = new Set(['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript']);

/**
 * Get the language token from a fenced code block info string.
 *
 * @param {string} infoString
 * @returns {string}
 */
export function getFenceLanguage(infoString) {
	return infoString.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? '';
}

/**
 * Check whether the language can contain an included sketch.
 *
 * @param {string} language
 * @returns {boolean}
 */
export function isSupportedExampleLanguage(language) {
	return SUPPORTED_INCLUDED_EXAMPLE_LANGUAGES.has(language);
}

/**
 * Normalize the fence language for transformed included examples.
 *
 * @param {string} infoString
 * @returns {string}
 */
export function normalizeIncludedExampleFenceInfo(infoString) {
	const trimmedInfoString = infoString.trim();
	if (!trimmedInfoString) {
		return infoString;
	}

	const parts = trimmedInfoString.split(/\s+/);
	if (parts[0].toLowerCase() === 'js') {
		parts[0] = 'javascript';
	}

	return parts.join(' ');
}

/**
 * Ensure transformed code ends with one newline before the closing fence.
 *
 * @param {string} code
 * @returns {string}
 */
export function ensureTrailingNewline(code) {
	return code.endsWith('\n') ? code : `${code}\n`;
}

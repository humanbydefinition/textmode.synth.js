// @ts-check

import {
	ensureTrailingNewline,
	EXAMPLE_CODE_FENCE_PATTERN,
	getFenceLanguage,
	isSupportedExampleLanguage,
	normalizeIncludedExampleFenceInfo,
} from './code-fences.js';
import { stripLeadingExampleMetadataDocblock } from './example-metadata.js';

/**
 * Remove gallery metadata from included example code blocks.
 *
 * @param {string} markdown
 * @returns {string}
 */
export function transformExampleCodeBlocks(markdown) {
	return markdown.replace(EXAMPLE_CODE_FENCE_PATTERN, (fullMatch, infoString, code) => {
		const language = getFenceLanguage(infoString);
		if (!isSupportedExampleLanguage(language)) {
			return fullMatch;
		}

		const strippedCode = stripLeadingExampleMetadataDocblock(code);
		if (strippedCode === code) {
			return fullMatch;
		}

		const normalizedInfoString = normalizeIncludedExampleFenceInfo(infoString);
		return `\`\`\`${normalizedInfoString}\n${ensureTrailingNewline(strippedCode)}\`\`\``;
	});
}

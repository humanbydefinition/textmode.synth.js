import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

const EXAMPLE_CODE_FENCE_PATTERN = /```([^\n]*)\n([\s\S]*?)```/g;
const LEADING_METADATA_BLOCK_PATTERN = /^\s*\/\*\*([\s\S]*?)\*\/\s*\n?/;
const SUPPORTED_EXAMPLE_LANGUAGES = new Set(['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript']);

function stripLeadingMetadataBlock(source) {
	const match = source.match(LEADING_METADATA_BLOCK_PATTERN);
	if (!match) {
		return source;
	}

	return source.slice(match[0].length).replace(/^\n+/, '');
}

export function extractExampleMetadata(source) {
	return {
		metadata: null,
		code: stripLeadingMetadataBlock(source),
	};
}

function getFenceLanguage(infoString) {
	return infoString.trim().split(/\s+/, 1)[0]?.toLowerCase() ?? '';
}

function normalizeExampleFenceInfoString(infoString) {
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

function ensureTrailingNewline(code) {
	return code.endsWith('\n') ? code : `${code}\n`;
}

export function transformExampleCodeBlocks(markdown) {
	return markdown.replace(EXAMPLE_CODE_FENCE_PATTERN, (fullMatch, infoString, code) => {
		const language = getFenceLanguage(infoString);
		if (!SUPPORTED_EXAMPLE_LANGUAGES.has(language)) {
			return fullMatch;
		}

		const strippedCode = stripLeadingMetadataBlock(code);
		if (strippedCode === code) {
			return fullMatch;
		}

		const normalizedInfoString = normalizeExampleFenceInfoString(infoString);
		return `\`\`\`${normalizedInfoString}\n${ensureTrailingNewline(strippedCode)}\`\`\``;
	});
}

export function load(app) {
	app.renderer.on(MarkdownPageEvent.END, (page) => {
		if (!page.contents) {
			return;
		}

		page.contents = transformExampleCodeBlocks(page.contents);
	});

	app.logger.verbose('[typedoc] Registered example docblock stripper');
}

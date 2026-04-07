import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

const EXAMPLE_CODE_FENCE_PATTERN = /```([^\n]*)\n([\s\S]*?)```/g;
const LEADING_METADATA_BLOCK_PATTERN = /^\s*\/\*\*([\s\S]*?)\*\/\s*\n?/;
const EXAMPLE_SOURCE_BASE_URL = 'https://github.com/humanbydefinition/textmode.synth.js/blob/main';
const SUPPORTED_EXAMPLE_LANGUAGES = new Set(['js', 'jsx', 'ts', 'tsx', 'javascript', 'typescript']);
const SUPPORTED_METADATA_TAGS = new Set([
	'title',
	'description',
	'author',
	'github',
	'instagram',
	'mastodon',
	'bluesky',
	'website',
	'avatar',
	'link',
]);

function escapeHtml(value) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function normalizeTagValue(value) {
	return value.replace(/\s+/g, ' ').trim();
}

function ensureProtocol(value) {
	if (!value) {
		return null;
	}

	if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
		return value;
	}

	return `https://${value.replace(/^\/+/, '')}`;
}

function normalizeGithub(value) {
	if (!value) {
		return null;
	}

	if (value.startsWith('http://') || value.startsWith('https://')) {
		return value;
	}

	return `https://github.com/${value.replace(/^@/, '')}`;
}

function normalizeInstagram(value) {
	if (!value) {
		return null;
	}

	if (value.startsWith('http://') || value.startsWith('https://')) {
		return value;
	}

	return `https://instagram.com/${value.replace(/^@/, '')}`;
}

function normalizeMastodon(value) {
	if (!value) {
		return null;
	}

	const handle = value.trim().replace(/^@/, '');
	const handleMatch = handle.match(/^([^@\s/]+)@([^@\s/]+\.[^@\s/]+)$/);
	if (handleMatch) {
		const [, username, host] = handleMatch;
		return `https://${host}/@${username}`;
	}

	return ensureProtocol(value);
}

function normalizeBluesky(value) {
	if (!value) {
		return null;
	}

	if (value.startsWith('http://') || value.startsWith('https://')) {
		return value;
	}

	return `https://bsky.app/profile/${value.replace(/^@/, '')}`;
}

function normalizeWebsite(value) {
	if (!value) {
		return null;
	}

	return ensureProtocol(value);
}

function getGithubHandle(value) {
	if (!value) {
		return null;
	}

	if (value.startsWith('http://') || value.startsWith('https://')) {
		const match = value.match(/github\.com\/([^/?#]+)/i);
		return match?.[1] ?? null;
	}

	return value.replace(/^@/, '');
}

function getBlueskyHandle(value) {
	if (!value) {
		return null;
	}

	if (value.startsWith('http://') || value.startsWith('https://')) {
		const match = value.match(/bsky\.app\/profile\/([^/?#]+)/i);
		return match?.[1] ?? value;
	}

	return value.replace(/^@/, '');
}

function isLikelyGithubHandle(value) {
	if (!value) {
		return false;
	}

	return /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(value.replace(/^@/, ''));
}

function parseExampleMetadataBlock(block) {
	const lines = block
		.split('\n')
		.map((line) => line.replace(/^\s*\*\s?/, '').trimEnd());

	/** @type {Record<string, string>} */
	const metadata = {};
	let currentTag = null;
	let hasSupportedMetadata = false;

	for (const line of lines) {
		if (!line.trim()) {
			continue;
		}

		const tagMatch = line.match(/^@([a-zA-Z][\w-]*)\s*(.*)$/);
		if (tagMatch) {
			const [, rawTag, rawValue] = tagMatch;
			const tag = rawTag.toLowerCase();
			currentTag = SUPPORTED_METADATA_TAGS.has(tag) ? tag : null;

			if (!currentTag) {
				continue;
			}

			hasSupportedMetadata = true;
			metadata[currentTag] = normalizeTagValue(rawValue);
			continue;
		}

		if (currentTag) {
			const suffix = normalizeTagValue(line);
			metadata[currentTag] = [metadata[currentTag], suffix].filter(Boolean).join(' ').trim();
		}
	}

	return hasSupportedMetadata ? metadata : null;
}

export function extractExampleMetadata(source) {
	const match = source.match(LEADING_METADATA_BLOCK_PATTERN);
	if (!match) {
		return { metadata: null, code: source };
	}

	const metadata = parseExampleMetadataBlock(match[1]);
	if (!metadata) {
		return { metadata: null, code: source };
	}

	const code = source.slice(match[0].length).replace(/^\n+/, '');
	return { metadata, code };
}

function buildMetadataLinks(metadata, options = {}) {
	const links = [];
	const { omitGithub = false } = options;

	const githubUrl = normalizeGithub(metadata.github);
	if (githubUrl && !omitGithub) {
		links.push({ label: 'GitHub', url: githubUrl, emoji: '🐙' });
	}

	const instagramUrl = normalizeInstagram(metadata.instagram);
	if (instagramUrl) {
		links.push({ label: 'Instagram', url: instagramUrl, emoji: '📷' });
	}

	const mastodonUrl = normalizeMastodon(metadata.mastodon);
	if (mastodonUrl) {
		links.push({ label: 'Mastodon', url: mastodonUrl, emoji: '🐘' });
	}

	const blueskyUrl = normalizeBluesky(metadata.bluesky);
	if (blueskyUrl) {
		links.push({ label: 'BlueSky', url: blueskyUrl, emoji: '🦋' });
	}

	const websiteUrl = normalizeWebsite(metadata.website);
	if (websiteUrl) {
		links.push({ label: 'Website', url: websiteUrl, emoji: '🌐' });
	}

	return links;
}

function inferExampleSourceUrl(title) {
	if (!title) {
		return null;
	}

	const match = title.match(/^([A-Za-z0-9_-]+)\.([A-Za-z0-9_-]+)$/);
	if (!match) {
		return null;
	}

	const [, groupName, entryName] = match;
	return `${EXAMPLE_SOURCE_BASE_URL}/examples/${groupName}/${entryName}/sketch.js`;
}

function buildExampleMetadataHtml(metadata) {
	const leaderboardUrl = 'https://code.textmode.art/docs/leaderboard';
	const explicitGithubHandle = getGithubHandle(metadata.github);
	const fallbackGithubHandle =
		!explicitGithubHandle && isLikelyGithubHandle(metadata.author) ? metadata.author.replace(/^@/, '') : null;
	const githubHandle = explicitGithubHandle || fallbackGithubHandle;
	const githubUrl = normalizeGithub(githubHandle);
	const authorName = metadata.author || githubHandle || getBlueskyHandle(metadata.bluesky) || null;
	const avatarUrl = metadata.avatar || (githubHandle ? `https://github.com/${githubHandle}.png` : null);
	const title = metadata.title ? escapeHtml(metadata.title) : '';
	const primaryUrl = githubUrl || normalizeWebsite(metadata.link) || normalizeWebsite(metadata.website);
	const isCodexExample =
		authorName?.trim().toLowerCase() === 'codex' || githubHandle?.trim().toLowerCase() === 'codex';
	const codexBadgeHtml = `<span style="font-size:0.85em;font-weight:400;line-height:1.4;color:rgba(160,160,170,0.95);"><em>{ai-generated}</em></span>`;
	const authorHtml = authorName
		? `    <span style="display:inline-flex;align-items:baseline;gap:0.45rem;flex-wrap:wrap;"><strong>${primaryUrl ? `<a href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener noreferrer">@${escapeHtml(authorName)}</a>` : `@${escapeHtml(authorName)}`}</strong>${isCodexExample ? codexBadgeHtml : ''}</span>`
		: title
			? `    <strong>${primaryUrl ? `<a href="${escapeHtml(primaryUrl)}" target="_blank" rel="noopener noreferrer">${title}</a>` : title}</strong>`
			: '';
	const links = buildMetadataLinks(metadata, { omitGithub: isCodexExample });
	const exampleSourceUrl = inferExampleSourceUrl(metadata.title);
	const secondaryParts = links.map((link) => {
		return `${link.emoji} <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`;
	});
	const sourceHtml =
		isCodexExample && exampleSourceUrl
			? `    <span style="font-size:0.95em;line-height:1.4;color:rgba(160,160,170,0.95);">↗ <a href="${escapeHtml(exampleSourceUrl)}" target="_blank" rel="noopener noreferrer">View sketch on GitHub</a></span>`
			: '';
	const codexNoteHtml = isCodexExample
		? `    <span style="font-size:0.95em;line-height:1.4;color:rgba(160,160,170,0.95);">Replace it with your own sketch, claim the credit, and climb the <a href="${leaderboardUrl}" target="_blank" rel="noopener noreferrer">leaderboard</a>.</span>`
		: '';

	const secondaryHtml = secondaryParts.length
		? `    <span style="font-size:0.95em;line-height:1.4;color:rgba(160,160,170,0.95);">${secondaryParts.join('&nbsp;•&nbsp; ')}</span>`
		: '';

	if (!authorHtml && !secondaryHtml && !sourceHtml && !codexNoteHtml) {
		return '';
	}

	const avatarHtml = avatarUrl
		? `<img src="${escapeHtml(avatarUrl)}" alt="${
				authorName ? `${escapeHtml(authorName)} avatar` : title || 'Example avatar'
			}" width="72" height="72" style="border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,0.35);" />`
		: '';

	return [
		'<div style="display:flex;align-items:center;gap:0.75rem;flex-wrap:nowrap;min-width:0;">',
		avatarHtml ? `  ${avatarHtml}` : '',
		'  <div style="display:flex;flex-direction:column;gap:0.2rem;min-width:0;">',
		authorHtml,
		secondaryHtml,
		codexNoteHtml,
		sourceHtml,
		'  </div>',
		'</div>',
	]
		.filter(Boolean)
		.join('\n');
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

		const { metadata, code: strippedCode } = extractExampleMetadata(code);
		if (!metadata) {
			return fullMatch;
		}

		const metadataHtml = buildExampleMetadataHtml(metadata);
		const normalizedInfoString = normalizeExampleFenceInfoString(infoString);
		const codeFence = `\`\`\`${normalizedInfoString}\n${ensureTrailingNewline(strippedCode)}\`\`\``;
		return metadataHtml ? `${codeFence}\n${metadataHtml}` : codeFence;
	});
}

export function load(app) {
	app.renderer.on(MarkdownPageEvent.END, (page) => {
		if (!page.contents) {
			return;
		}

		page.contents = transformExampleCodeBlocks(page.contents);
	});

	app.logger.verbose('[typedoc] Registered example metadata renderer');
}

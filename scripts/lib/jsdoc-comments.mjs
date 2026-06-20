export function getLineStartOffsets(text) {
	const offsets = [0];
	for (let index = 0; index < text.length; index += 1) {
		if (text[index] === '\n') {
			offsets.push(index + 1);
		}
	}
	return offsets;
}

export function findJsdocBeforeLine(text, lineStarts, line) {
	const declarationOffset = lineStarts[line - 1] ?? text.length;
	const searchText = text.slice(0, declarationOffset);
	const start = searchText.lastIndexOf('/**');
	const end = searchText.lastIndexOf('*/');

	if (start === -1 || end === -1 || start > end) {
		return undefined;
	}

	return { start, end };
}

function replaceHostedApiSeeLines(commentText, seeLine, apiBaseUrl) {
	const lines = commentText.split('\n');
	let replaced = false;
	const nextLines = [];

	for (const line of lines) {
		if (line.includes('@see') && line.includes(apiBaseUrl)) {
			if (!replaced) {
				nextLines.push(line.replace(/^(\s*\*\s*).*$/, `$1${seeLine}`));
				replaced = true;
			}
			continue;
		}

		nextLines.push(line);
	}

	return replaced ? nextLines.join('\n') : undefined;
}

export function upsertSeeLine(text, comment, seeLine, apiBaseUrl) {
	const commentText = text.slice(comment.start, comment.end + 2);
	const replacedComment = replaceHostedApiSeeLines(commentText, seeLine, apiBaseUrl);
	if (replacedComment !== undefined) {
		return `${text.slice(0, comment.start)}${replacedComment}${text.slice(comment.end + 2)}`;
	}

	if (!commentText.includes('\n')) {
		const lineStart = text.lastIndexOf('\n', comment.start) + 1;
		const indent = text.slice(lineStart, comment.start);
		const summary = commentText
			.replace(/^\/\*\*\s?/, '')
			.replace(/\s?\*\/$/, '')
			.trim();
		const replacement = [
			`${indent}/**`,
			summary ? `${indent} * ${summary}` : undefined,
			`${indent} *`,
			`${indent} * ${seeLine}`,
			`${indent} */`,
		]
			.filter(Boolean)
			.join('\n');

		return `${text.slice(0, lineStart)}${replacement}${text.slice(comment.end + 2)}`;
	}

	const lineStart = text.lastIndexOf('\n', comment.end) + 1;
	const closingLine = text.slice(lineStart, comment.end + 2);
	const prefixMatch = closingLine.match(/^(\s*)\*\//);
	const indent = prefixMatch?.[1] ?? '';
	const insertion = `${indent}*\n${indent}* ${seeLine}\n`;

	return `${text.slice(0, lineStart)}${insertion}${text.slice(lineStart)}`;
}

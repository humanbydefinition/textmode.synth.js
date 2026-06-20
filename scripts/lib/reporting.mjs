export function renderIssueSection(title, issues, stream = console.log) {
	if (issues.length === 0) {
		return;
	}

	stream('');
	stream(`${title}: ${issues.length}`);

	for (const issue of issues) {
		stream(`- ${issue.name}`);
		stream(`  ${issue.location}`);
		if (issue.detail) {
			stream(`  ${issue.detail}`);
		}
	}
}

export function renderList(title, items, stream = console.error) {
	stream(title);
	for (const item of items) {
		stream(`  * ${item}`);
	}
}

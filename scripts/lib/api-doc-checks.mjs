import { hostedApiUrl, routeForReflection } from './api-doc-routes.mjs';
import { getPrimaryLocation, getRelevantComments } from './reflection-policy.mjs';

export const ISSUE_KIND = {
	MISSING_DOCSTRING: 'missing-docstring',
	MISSING_EXAMPLE: 'missing-example',
	MISSING_API_LINK: 'missing-api-link',
	INVALID_API_LINK: 'invalid-api-link',
};

export function hasDocstring(reflection) {
	return getRelevantComments(reflection).length > 0;
}

export function hasExample(reflection) {
	return getRelevantComments(reflection).some(({ comment }) =>
		comment.getTags('@example').some((tag) => tag.content.some((part) => (part.text ?? '').trim().length > 0))
	);
}

export function getApiLinkTargets(comment, apiBaseUrl) {
	return comment
		.getTags('@see')
		.flatMap((tag) => tag.content)
		.filter((part) => part.kind === 'inline-tag' && part.tag === '@link')
		.map((part) => part.target)
		.filter((target) => typeof target === 'string' && target.startsWith(`${apiBaseUrl}/`));
}

export function getInvalidApiLinkTargets(comment, routes, apiBaseUrl) {
	return getApiLinkTargets(comment, apiBaseUrl).filter((target) => {
		const routeWithAnchor = target.slice(`${apiBaseUrl}/`.length);
		if (!routeWithAnchor || routeWithAnchor === 'index') {
			return true;
		}

		const [route] = routeWithAnchor.split('#');
		return !routes.has(route);
	});
}

export function hasApiLink(comment, apiBaseUrl) {
	return getApiLinkTargets(comment, apiBaseUrl).length > 0;
}

export function createApiLinkTargets(reflection, routes, apiBaseUrl) {
	const route = routeForReflection(reflection, routes);
	if (!route) {
		return [];
	}

	const routeWithoutAnchor = route.split('#')[0];
	if (!routes.has(routeWithoutAnchor)) {
		return [];
	}

	const url = hostedApiUrl(apiBaseUrl, route);
	const label = `${reflection.getFriendlyFullName()} API reference`;
	const seeLine = `@see {@link ${url} | ${label}}`;

	return getRelevantComments(reflection).map(({ source }) => ({
		reflection,
		source,
		seeLine,
	}));
}

export function createIssue(reflection, kind) {
	const location = getPrimaryLocation(reflection);

	return {
		kind,
		name: reflection.getFriendlyFullName(),
		file: location.file,
		line: location.line,
		column: location.column,
		location: location.printable,
	};
}

export function createCommentIssue(reflection, commentSource, kind, detail) {
	const location = commentSource
		? {
				file: commentSource.fullFileName || getPrimaryLocation(reflection).file,
				line: commentSource.line || 1,
				column: (commentSource.character ?? 0) + 1,
			}
		: getPrimaryLocation(reflection);

	return {
		kind,
		name: reflection.getFriendlyFullName(),
		file: location.file,
		line: location.line,
		column: location.column,
		location: `${location.file}:${location.line}:${location.column}`,
		detail,
	};
}

export function collectApiDocIssues({
	apiBaseUrl,
	apiLinkReflections,
	docstringReflections,
	exampleReflections,
	routes,
}) {
	const missingDocstrings = docstringReflections
		.filter((reflection) => !hasDocstring(reflection))
		.map((reflection) => createIssue(reflection, ISSUE_KIND.MISSING_DOCSTRING))
		.sort(compareIssues);

	const missingExamples = exampleReflections
		.filter((reflection) => hasDocstring(reflection) && !hasExample(reflection))
		.map((reflection) => createIssue(reflection, ISSUE_KIND.MISSING_EXAMPLE))
		.sort(compareIssues);

	const comments = apiLinkReflections.flatMap((reflection) =>
		getRelevantComments(reflection).map(({ comment, source }) => ({ reflection, comment, source }))
	);
	const missingApiLinks = comments
		.filter(({ comment }) => !hasApiLink(comment, apiBaseUrl))
		.map(({ reflection, source }) => createCommentIssue(reflection, source, ISSUE_KIND.MISSING_API_LINK))
		.sort(compareIssues);
	const invalidApiLinks = comments
		.flatMap(({ reflection, comment, source }) =>
			getInvalidApiLinkTargets(comment, routes, apiBaseUrl).map((target) =>
				createCommentIssue(reflection, source, ISSUE_KIND.INVALID_API_LINK, target)
			)
		)
		.sort(compareIssues);

	return { missingDocstrings, missingExamples, missingApiLinks, invalidApiLinks };
}

export function countApiDocIssues(issueGroups) {
	return Object.values(issueGroups).reduce((total, issues) => total + issues.length, 0);
}

export function compareIssues(left, right) {
	return (
		left.file.localeCompare(right.file) ||
		left.line - right.line ||
		left.column - right.column ||
		left.name.localeCompare(right.name)
	);
}

import path from 'node:path';

import { ReflectionKind } from 'typedoc';

export function isIncludedReflection(reflection, targetKinds) {
	if (!reflection.kindOf(targetKinds)) {
		return false;
	}

	if (reflection.flags.isPrivate || reflection.flags.isProtected || reflection.flags.isInherited) {
		return false;
	}

	for (let current = reflection; current && !current.isProject(); current = current.parent) {
		if (current.name.startsWith('_')) {
			return false;
		}
	}

	return true;
}

export function getIncludedReflections(project, targetKinds) {
	return project
		.getReflectionsByKind(targetKinds)
		.filter((reflection) => isIncludedReflection(reflection, targetKinds));
}

export function shouldProcessEntryPointReflection(entryPoint, reflection) {
	return !entryPoint.namespaceExportsOnly || reflection.kind === ReflectionKind.Namespace;
}

export function getRelevantComments(reflection) {
	const comments = [];

	if (reflection.comment) {
		comments.push({ comment: reflection.comment, source: reflection.sources?.[0] });
	}

	if (!reflection.isDeclaration()) {
		return comments;
	}

	for (const signature of reflection.signatures ?? []) {
		if (signature.comment) {
			comments.push({ comment: signature.comment, source: signature.sources?.[0] ?? reflection.sources?.[0] });
		}
	}

	if (reflection.getSignature?.comment) {
		comments.push({
			comment: reflection.getSignature.comment,
			source: reflection.getSignature.sources?.[0] ?? reflection.sources?.[0],
		});
	}

	if (reflection.setSignature?.comment) {
		comments.push({
			comment: reflection.setSignature.comment,
			source: reflection.setSignature.sources?.[0] ?? reflection.sources?.[0],
		});
	}

	return comments;
}

export function getSourceCandidates(reflection) {
	if (!reflection.isDeclaration()) {
		return [];
	}

	return [
		...(reflection.sources ?? []),
		...(reflection.signatures ?? []).flatMap((signature) => signature.sources ?? []),
		...(reflection.getSignature?.sources ?? []),
		...(reflection.setSignature?.sources ?? []),
	];
}

export function getPrimaryLocation(reflection) {
	const [source] = getSourceCandidates(reflection);

	if (!source) {
		return {
			file: path.resolve('<unknown>'),
			line: 1,
			column: 1,
			printable: '<unknown>:1:1',
		};
	}

	const file = source.fullFileName || path.resolve(source.fileName);
	const line = source.line || 1;
	const column = (source.character ?? 0) + 1;

	return {
		file,
		line,
		column,
		printable: `${file}:${line}:${column}`,
	};
}

export function sourceIsInRoots(source, sourceRoots) {
	return Boolean(source?.fullFileName) && sourceRoots.some((root) => source.fullFileName.startsWith(root));
}

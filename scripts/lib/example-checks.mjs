import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const INCLUDE_CODE_PATTERN = /\{@includeCode\s+([^}\s]+)[^}]*\}/g;
const MANIFEST_KEYS = new Set(['version', 'description', 'groups']);
const GROUP_KEYS = new Set(['name', 'description', 'examples', 'subgroups']);
const SUBGROUP_KEYS = new Set(['name', 'description', 'examples']);
const EXAMPLE_KEYS = new Set(['title', 'description', 'sourceFile']);

export const EXAMPLES_DIR = 'examples';
export const EXAMPLES_INDEX = path.join(EXAMPLES_DIR, 'index.html');
export const EXAMPLES_MANIFEST = path.join(EXAMPLES_DIR, 'manifest.json');
export const SOURCE_DIR = 'src';

export function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function getUnknownKeys(value, allowedKeys) {
	return Object.keys(value).filter((key) => !allowedKeys.has(key));
}

export function toRepositoryPath(filePath) {
	return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

export function getTypeScriptFiles(directory) {
	const files = [];

	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const entryPath = path.join(directory, entry.name);

		if (entry.isDirectory()) {
			files.push(...getTypeScriptFiles(entryPath));
		} else if (entry.isFile() && entry.name.endsWith('.ts')) {
			files.push(entryPath);
		}
	}

	return files;
}

export function readExamplesManifest(manifestPath = EXAMPLES_MANIFEST) {
	return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function readExamplesIndex(indexPath = EXAMPLES_INDEX) {
	return fs.readFileSync(indexPath, 'utf8');
}

export function getSketchTitle(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const docstringMatch = content.match(/^\s*\/\*\*([\s\S]*?)\*\//);
	const titleMatch = docstringMatch?.[1].match(/@title\s+([^\r\n]+)/);

	return titleMatch?.[1].trim() ?? null;
}

export function getManifestExamples(manifest) {
	const out = [];

	for (const group of manifest.groups) {
		if (Array.isArray(group.subgroups)) {
			for (const subgroup of group.subgroups) {
				if (Array.isArray(subgroup.examples)) {
					for (const example of subgroup.examples) {
						if (isRecord(example)) {
							out.push({ ...example, groupName: group.name, groupDescription: group.description });
						}
					}
				}
			}
		} else if (Array.isArray(group.examples)) {
			for (const example of group.examples) {
				if (isRecord(example)) {
					out.push({ ...example, groupName: group.name, groupDescription: group.description });
				}
			}
		}
	}

	return out;
}

export function getTypeDocExampleIncludes(sourceDir = SOURCE_DIR, examplesDir = EXAMPLES_DIR) {
	const includes = [];

	for (const file of getTypeScriptFiles(sourceDir)) {
		const content = fs.readFileSync(file, 'utf8');
		let match;

		INCLUDE_CODE_PATTERN.lastIndex = 0;
		while ((match = INCLUDE_CODE_PATTERN.exec(content)) !== null) {
			const includeTarget = match[1];
			const resolvedPath = path.resolve(path.dirname(file), includeTarget);
			const sourceFile = toRepositoryPath(resolvedPath);

			if (sourceFile.startsWith(`${examplesDir}/`)) {
				includes.push({
					file,
					includeTarget,
					sourceFile,
				});
			}
		}
	}

	return includes;
}

export function validateExamplesGallery(
	indexContent,
	examplesIndex = EXAMPLES_INDEX,
	examplesManifest = EXAMPLES_MANIFEST
) {
	const issues = [];

	if (/const\s+GROUPS\s*=/.test(indexContent)) {
		issues.push(`${examplesIndex} must not declare \`const GROUPS\`; ${examplesManifest} is authoritative.`);
	}

	if (!indexContent.includes('manifest.json')) {
		issues.push(`${examplesIndex} must load ${examplesManifest}.`);
	}

	return issues;
}

export function validateExamplesManifest(manifest, options = {}) {
	const examplesDir = options.examplesDir ?? EXAMPLES_DIR;
	const examplesManifest = options.examplesManifest ?? EXAMPLES_MANIFEST;
	const sourceDir = options.sourceDir ?? SOURCE_DIR;
	const issues = [];

	if (!isRecord(manifest)) {
		return ['Manifest root must be an object.'];
	}

	for (const key of getUnknownKeys(manifest, MANIFEST_KEYS)) {
		issues.push(`Manifest contains unknown top-level key: ${key}`);
	}

	if (manifest.version !== 1) {
		issues.push('Manifest `version` must be `1`.');
	}

	if (typeof manifest.description !== 'string' || manifest.description.length === 0) {
		issues.push('Manifest `description` must be a non-empty string.');
	}

	if (!Array.isArray(manifest.groups)) {
		return ['Manifest `groups` must be an array.'];
	}

	for (const [groupIndex, group] of manifest.groups.entries()) {
		if (!isRecord(group)) {
			issues.push(`Manifest group ${groupIndex + 1} must be an object.`);
			continue;
		}

		for (const key of getUnknownKeys(group, GROUP_KEYS)) {
			issues.push(`Manifest group "${group.name ?? groupIndex + 1}" contains unknown key: ${key}`);
		}

		if (typeof group.name !== 'string' || group.name.length === 0) {
			issues.push(`Manifest group ${groupIndex + 1} is missing a name.`);
		}

		if (typeof group.description !== 'string' || group.description.length === 0) {
			issues.push(`Manifest group "${group.name ?? groupIndex + 1}" is missing a description.`);
		}

		const hasExamples = Array.isArray(group.examples);
		const hasSubgroups = Array.isArray(group.subgroups);

		if (!hasExamples && !hasSubgroups) {
			issues.push(`Manifest group "${group.name}" must have either \`examples\` or \`subgroups\`.`);
			continue;
		}

		if (hasExamples && hasSubgroups) {
			issues.push(`Manifest group "${group.name}" must not have both \`examples\` and \`subgroups\`.`);
			continue;
		}

		if (hasSubgroups) {
			for (const [subgroupIndex, subgroup] of group.subgroups.entries()) {
				if (!isRecord(subgroup)) {
					issues.push(`Manifest subgroup ${subgroupIndex + 1} in "${group.name}" must be an object.`);
					continue;
				}

				for (const key of getUnknownKeys(subgroup, SUBGROUP_KEYS)) {
					issues.push(
						`Manifest subgroup "${subgroup.name ?? subgroupIndex + 1}" in "${group.name}" contains unknown key: ${key}`
					);
				}

				if (typeof subgroup.name !== 'string' || subgroup.name.length === 0) {
					issues.push(`Manifest subgroup ${subgroupIndex + 1} in "${group.name}" is missing a name.`);
				}

				if (!Array.isArray(subgroup.examples)) {
					issues.push(
						`Manifest subgroup "${subgroup.name ?? subgroupIndex + 1}" in "${group.name}" examples must be an array.`
					);
					continue;
				}

				for (const [exampleIndex, example] of subgroup.examples.entries()) {
					if (!isRecord(example)) {
						issues.push(
							`Manifest example ${exampleIndex + 1} in subgroup "${subgroup.name}" of group "${group.name}" must be an object.`
						);
						continue;
					}

					for (const key of getUnknownKeys(example, EXAMPLE_KEYS)) {
						const label = example.sourceFile || group.name + '.' + subgroup.name + '.' + (exampleIndex + 1);
						issues.push(`Manifest example "${label}" contains unknown key: ${key}`);
					}
				}
			}
		} else {
			for (const [exampleIndex, example] of group.examples.entries()) {
				if (!isRecord(example)) {
					issues.push(`Manifest example ${exampleIndex + 1} in group "${group.name}" must be an object.`);
					continue;
				}

				for (const key of getUnknownKeys(example, EXAMPLE_KEYS)) {
					const label = example.sourceFile || group.name + '.' + (exampleIndex + 1);
					issues.push(`Manifest example "${label}" contains unknown key: ${key}`);
				}
			}
		}
	}

	const manifestExamples = getManifestExamples(manifest);
	const manifestFiles = manifestExamples.map((example) => example.sourceFile);

	if (manifestFiles.length === 0) {
		issues.push('Manifest must include at least one example.');
	}

	const seen = new Set();
	for (const example of manifestExamples) {
		if (typeof example.sourceFile !== 'string') {
			issues.push('Manifest examples must include a string sourceFile.');
			continue;
		}

		if (seen.has(example.sourceFile)) {
			issues.push(`Manifest contains duplicate source file: ${example.sourceFile}`);
		}
		seen.add(example.sourceFile);

		if (typeof example.title !== 'string' || example.title.length === 0) {
			issues.push(`Manifest example "${example.sourceFile}" is missing a title.`);
		}

		if (!example.sourceFile.startsWith(`${examplesDir}/`) || !example.sourceFile.endsWith('/sketch.js')) {
			issues.push(`Manifest example "${example.sourceFile}" sourceFile must be an examples/**/sketch.js path.`);
		}

		if (!fs.existsSync(example.sourceFile)) {
			issues.push(`Manifest example is missing its sketch file: ${example.sourceFile}`);
			continue;
		}

		const sketchTitle = getSketchTitle(example.sourceFile);

		if (!sketchTitle) {
			issues.push(`Manifest example "${example.sourceFile}" sketch is missing an @title tag.`);
		} else if (sketchTitle !== example.title) {
			issues.push(
				`Manifest example "${example.sourceFile}" title "${example.title}" must match sketch @title "${sketchTitle}".`
			);
		}
	}

	const manifestFileSet = new Set(manifestFiles);
	for (const include of getTypeDocExampleIncludes(sourceDir, examplesDir)) {
		if (!manifestFileSet.has(include.sourceFile)) {
			issues.push(
				`TypeDoc includeCode in "${include.file}" references "${include.includeTarget}" (${include.sourceFile}), but that sketch is not in ${examplesManifest}.`
			);
		}
	}

	return issues;
}

export function checkSketch(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const issues = [];

	if (content.includes('import ') || content.includes('export ')) {
		return { skipped: true, issues };
	}

	const docstringMatch = content.match(/^\s*\/\*\*([\s\S]*?)\*\//);
	if (!docstringMatch) {
		issues.push('Missing JSDoc-style block comment header at the top of the file.');
	} else {
		const docstring = docstringMatch[1];
		if (!docstring.includes('@title')) {
			issues.push('Docstring header is missing `@title` tag.');
		}
	}

	const createMatch = content.match(/textmode\.create\s*\(\s*\{([\s\S]*?)\}\s*\)/);
	if (!createMatch) {
		issues.push('Could not find `textmode.create({ ... })` call.');
	} else {
		const options = createMatch[1];

		if (!options.match(/width:\s*window\.innerWidth/)) {
			issues.push('`width` must be set to `window.innerWidth` in create options.');
		}

		if (!options.match(/height:\s*window\.innerHeight/)) {
			issues.push('`height` must be set to `window.innerHeight` in create options.');
		}

		const fontSizeMatch = options.match(/fontSize:\s*(\d+)/);
		if (fontSizeMatch) {
			const size = parseInt(fontSizeMatch[1], 10);
			if (size !== 8 && size !== 16 && size !== 32) {
				issues.push(`\`fontSize\` is set to \`${size}\`, but must be exactly \`8\`, \`16\`, or \`32\`.`);
			}
		}
	}

	if (!content.includes('windowResized')) {
		issues.push('Missing `windowResized` callback registration.');
	}
	if (!content.match(/resizeCanvas\(\s*window\.innerWidth\s*,\s*window\.innerHeight\s*\)/)) {
		issues.push(
			'`resizeCanvas` must be called with `window.innerWidth` and `window.innerHeight` inside the sketch.'
		);
	}

	if (/\bvar\b/.test(content)) {
		issues.push('Do not use `var`; prefer `const` or `let`.');
	}

	const lines = content.split('\n');
	if (lines.length > 100) {
		issues.push(`Sketch file has ${lines.length} lines, but must not exceed 100 lines.`);
	}

	if (!content.includes('layers.add(')) {
		issues.push('Missing dedicated label layer registration (`t.layers.add()`).');
	}

	const leftMatch = content.includes('grid.cols / 2') || content.includes('grid.cols/2');
	const topMatch = content.includes('grid.rows / 2') || content.includes('grid.rows/2');
	if (!leftMatch || !topMatch) {
		issues.push(
			'Missing top-left labeling alignment coordinates calculation using grid center offset (`-Math.floor(t.grid.cols / 2)` and `-Math.floor(t.grid.rows / 2)`).'
		);
	}

	const textDrawingRegex = /(?:drawText|drawCenteredText|t\.char)\s*\(\s*(['"`])(.*?)\1/g;
	let match;
	while ((match = textDrawingRegex.exec(content)) !== null) {
		const text = match[2];
		if (text.length > 40) {
			issues.push(`Row of text exceeds 40 characters limit: "${text}" (${text.length} chars).`);
		}
	}

	return { skipped: false, issues };
}

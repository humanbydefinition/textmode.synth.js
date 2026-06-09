import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const EXAMPLES_DIR = 'examples';
const EXAMPLES_INDEX = path.join(EXAMPLES_DIR, 'index.html');
const EXAMPLES_MANIFEST = path.join(EXAMPLES_DIR, 'manifest.json');
const SOURCE_DIR = 'src';
const INCLUDE_CODE_PATTERN = /\{@includeCode\s+([^}\s]+)[^}]*\}/g;
const MANIFEST_KEYS = new Set(['version', 'description', 'groups']);
const GROUP_KEYS = new Set(['name', 'description', 'examples']);
const EXAMPLE_KEYS = new Set(['title', 'sourceFile']);

function isRecord(value) {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getUnknownKeys(value, allowedKeys) {
	return Object.keys(value).filter((key) => !allowedKeys.has(key));
}

function toRepositoryPath(filePath) {
	return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

function getTypeScriptFiles(directory) {
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

function readExamplesManifest(manifestPath) {
	return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

function readExamplesIndex(indexPath) {
	return fs.readFileSync(indexPath, 'utf8');
}

function getSketchTitle(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const docstringMatch = content.match(/^\s*\/\*\*([\s\S]*?)\*\//);
	const titleMatch = docstringMatch?.[1].match(/@title\s+([^\r\n]+)/);

	return titleMatch?.[1].trim() ?? null;
}

function getManifestExamples(manifest) {
	return manifest.groups.flatMap((group) =>
		Array.isArray(group.examples)
			? group.examples.filter(isRecord).map((example) => ({
					...example,
					groupName: group.name,
					groupDescription: group.description,
				}))
			: []
	);
}

function getTypeDocExampleIncludes() {
	const includes = [];

	for (const file of getTypeScriptFiles(SOURCE_DIR)) {
		const content = fs.readFileSync(file, 'utf8');
		let match;

		INCLUDE_CODE_PATTERN.lastIndex = 0;
		while ((match = INCLUDE_CODE_PATTERN.exec(content)) !== null) {
			const includeTarget = match[1];
			const resolvedPath = path.resolve(path.dirname(file), includeTarget);
			const sourceFile = toRepositoryPath(resolvedPath);

			if (sourceFile.startsWith(`${EXAMPLES_DIR}/`)) {
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

function validateExamplesGallery(indexContent) {
	const issues = [];

	if (/const\s+GROUPS\s*=/.test(indexContent)) {
		issues.push(`${EXAMPLES_INDEX} must not declare \`const GROUPS\`; ${EXAMPLES_MANIFEST} is authoritative.`);
	}

	if (!indexContent.includes('manifest.json')) {
		issues.push(`${EXAMPLES_INDEX} must load ${EXAMPLES_MANIFEST}.`);
	}

	return issues;
}

function validateExamplesManifest(manifest) {
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

		if (!Array.isArray(group.examples)) {
			issues.push(`Manifest group "${group.name ?? groupIndex + 1}" examples must be an array.`);
			continue;
		}

		for (const [exampleIndex, example] of group.examples.entries()) {
			if (!isRecord(example)) {
				issues.push(`Manifest example ${exampleIndex + 1} in group "${group.name}" must be an object.`);
				continue;
			}

			for (const key of getUnknownKeys(example, EXAMPLE_KEYS)) {
				issues.push(
					`Manifest example "${example.sourceFile ?? `${group.name}.${exampleIndex + 1}`}" contains unknown key: ${key}`
				);
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

		if (!example.sourceFile.startsWith(`${EXAMPLES_DIR}/`) || !example.sourceFile.endsWith('/sketch.js')) {
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
	for (const include of getTypeDocExampleIncludes()) {
		if (!manifestFileSet.has(include.sourceFile)) {
			issues.push(
				`TypeDoc includeCode in "${include.file}" references "${include.includeTarget}" (${include.sourceFile}), but that sketch is not in ${EXAMPLES_MANIFEST}.`
			);
		}
	}

	return issues;
}

function checkSketch(filePath) {
	const content = fs.readFileSync(filePath, 'utf8');
	const issues = [];

	// Skip module / integration sketches that import / export
	if (content.includes('import ') || content.includes('export ')) {
		return { skipped: true, issues };
	}

	// 1. Docstring Header Check
	const docstringMatch = content.match(/^\s*\/\*\*([\s\S]*?)\*\//);
	if (!docstringMatch) {
		issues.push('Missing JSDoc-style block comment header at the top of the file.');
	} else {
		const docstring = docstringMatch[1];
		if (!docstring.includes('@title')) {
			issues.push('Docstring header is missing `@title` tag.');
		}
	}

	// 2. textmode.create Options Check
	const createMatch = content.match(/textmode\.create\s*\(\s*\{([\s\S]*?)\}\s*\)/);
	if (!createMatch) {
		issues.push('Could not find `textmode.create({ ... })` call.');
	} else {
		const options = createMatch[1];

		// Check width
		const widthMatch = options.match(/width:\s*window\.innerWidth/);
		if (!widthMatch) {
			issues.push('`width` must be set to `window.innerWidth` in create options.');
		}

		// Check height
		const heightMatch = options.match(/height:\s*window\.innerHeight/);
		if (!heightMatch) {
			issues.push('`height` must be set to `window.innerHeight` in create options.');
		}

		// Check fontSize (if specified)
		const fontSizeMatch = options.match(/fontSize:\s*(\d+)/);
		if (fontSizeMatch) {
			const size = parseInt(fontSizeMatch[1], 10);
			if (size !== 8 && size !== 16 && size !== 32) {
				issues.push(`\`fontSize\` is set to \`${size}\`, but must be exactly \`8\`, \`16\`, or \`32\`.`);
			}
		}
	}

	// 3. Responsive Resizing Check
	if (!content.includes('windowResized')) {
		issues.push('Missing `windowResized` callback registration.');
	}
	const resizeCanvasMatch = content.match(/resizeCanvas\(\s*window\.innerWidth\s*,\s*window\.innerHeight\s*\)/);
	if (!resizeCanvasMatch) {
		issues.push(
			'`resizeCanvas` must be called with `window.innerWidth` and `window.innerHeight` inside the sketch.'
		);
	}

	// 4. Code style check (as described in SKILL.md)
	// - Indentation: verify no lines with leading spaces for indentation (prefer tabs)
	// - String quotes: prefer single quotes for standard strings, but allow double/backtick when needed. Let's keep it simple.
	// - Use var check: should not use var
	if (/\bvar\b/.test(content)) {
		issues.push('Do not use `var`; prefer `const` or `let`.');
	}

	// 5. Code Length Limit (Max 100 lines)
	const lines = content.split('\n');
	if (lines.length > 100) {
		issues.push(`Sketch file has ${lines.length} lines, but must not exceed 100 lines.`);
	}

	// 6. Dedicated Label Layer Check
	if (!content.includes('layers.add(')) {
		issues.push('Missing dedicated label layer registration (`t.layers.add()`).');
	}

	// 7. Top-Left Alignment Check
	const leftMatch = content.includes('grid.cols / 2') || content.includes('grid.cols/2');
	const topMatch = content.includes('grid.rows / 2') || content.includes('grid.rows/2');
	if (!leftMatch || !topMatch) {
		issues.push(
			'Missing top-left labeling alignment coordinates calculation using grid center offset (`-Math.floor(t.grid.cols / 2)` and `-Math.floor(t.grid.rows / 2)`).'
		);
	}

	// 8. Rows of Text Length Check (Max 40 characters)
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

async function main() {
	try {
		console.log('Checking textmode.js example sketches...');
		const indexContent = readExamplesIndex(EXAMPLES_INDEX);
		const manifest = readExamplesManifest(EXAMPLES_MANIFEST);
		const galleryIssues = validateExamplesGallery(indexContent);
		const manifestIssues = validateExamplesManifest(manifest);
		const validationIssues = [...galleryIssues, ...manifestIssues];

		if (validationIssues.length > 0) {
			console.error(`Examples validation failed:`);
			for (const issue of validationIssues) {
				console.error(`  * ${issue}`);
			}
			process.exitCode = 1;
			return;
		}

		const files = getManifestExamples(manifest).map((example) => example.sourceFile);
		console.log(`Found ${files.length} manifest examples from ${EXAMPLES_MANIFEST}.`);

		let passedCount = 0;
		let failedCount = 0;
		let skippedCount = 0;
		const failures = [];

		for (const file of files) {
			const { skipped, issues } = checkSketch(file);
			if (skipped) {
				skippedCount++;
				continue;
			}

			if (issues.length === 0) {
				passedCount++;
			} else {
				failedCount++;
				failures.push({ file, issues });
			}
		}

		console.log(`\nResults: ${passedCount} passed, ${failedCount} failed, ${skippedCount} skipped.\n`);

		if (failures.length > 0) {
			console.error('Validation failed for the following sketches:');
			for (const failure of failures) {
				console.error(`\n- ${failure.file}:`);
				for (const issue of failure.issues) {
					console.error(`  * ${issue}`);
				}
			}
			process.exitCode = 1;
		} else {
			console.log('All checked sketches meet the requirements successfully.');
		}
	} catch (error) {
		console.error('Error running examples check:');
		console.error(error instanceof Error ? error.stack : String(error));
		process.exitCode = 2;
	}
}

await main();

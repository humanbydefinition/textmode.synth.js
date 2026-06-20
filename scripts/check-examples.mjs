import process from 'node:process';

import { CHECK_EXAMPLE_SKETCHES, PACKAGE_LABEL } from './lib/api-doc-links-config.mjs';
import {
	checkSketch,
	EXAMPLES_MANIFEST,
	getManifestExamples,
	readExamplesIndex,
	readExamplesManifest,
	validateExamplesGallery,
	validateExamplesManifest,
} from './lib/example-checks.mjs';
import { renderList } from './lib/reporting.mjs';

async function main() {
	try {
		console.log(`Checking ${PACKAGE_LABEL} example sketches...`);
		const indexContent = readExamplesIndex();
		const manifest = readExamplesManifest();
		const galleryIssues = validateExamplesGallery(indexContent);
		const manifestIssues = validateExamplesManifest(manifest);
		const validationIssues = [...galleryIssues, ...manifestIssues];

		if (validationIssues.length > 0) {
			renderList('Examples validation failed:', validationIssues);
			process.exitCode = 1;
			return;
		}

		const files = getManifestExamples(manifest).map((example) => example.sourceFile);
		console.log(`Found ${files.length} manifest examples from ${EXAMPLES_MANIFEST}.`);

		if (!CHECK_EXAMPLE_SKETCHES) {
			console.log('Sketch convention checks are disabled for this package.');
			return;
		}

		let passedCount = 0;
		let failedCount = 0;
		let skippedCount = 0;
		const failures = [];

		for (const file of files) {
			const { skipped, issues } = checkSketch(file);
			if (skipped) {
				skippedCount += 1;
				continue;
			}

			if (issues.length === 0) {
				passedCount += 1;
			} else {
				failedCount += 1;
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

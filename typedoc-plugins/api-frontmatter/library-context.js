// @ts-check

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { TEXTMODE_ECOSYSTEM_NAME, TEXTMODE_PACKAGE_PREFIX, UNKNOWN_LIBRARY_NAME } from './constants.js';

/**
 * Library context extracted from package.json and the TypeDoc project.
 *
 * @typedef {Object} LibraryContext
 * @property {string} name
 * @property {string} description
 * @property {string} ecosystem
 */

/**
 * Read and parse package.json from the project root.
 *
 * @returns {{ name?: string; description?: string } | null}
 */
export function readPackageJson() {
	try {
		const directory = dirname(fileURLToPath(import.meta.url));
		const packagePath = resolve(directory, '..', '..', 'package.json');
		const content = readFileSync(packagePath, 'utf-8');
		return JSON.parse(content);
	} catch {
		return null;
	}
}

/**
 * Get the ecosystem name for a package.
 *
 * @param {string} packageName
 * @returns {string}
 */
export function getEcosystemName(packageName) {
	return packageName.startsWith(TEXTMODE_PACKAGE_PREFIX) ? TEXTMODE_ECOSYSTEM_NAME : packageName;
}

/**
 * Extract library context from TypeDoc project metadata and package.json.
 *
 * @param {import('typedoc').ProjectReflection} project
 * @returns {LibraryContext}
 */
export function extractLibraryContext(project) {
	const name = project.packageName ?? project.name ?? UNKNOWN_LIBRARY_NAME;

	let description = `API reference for ${name}`;
	const packageJson = readPackageJson();
	if (packageJson?.description) {
		description = packageJson.description;
	}

	const ecosystem = getEcosystemName(name);

	return { name, description, ecosystem };
}

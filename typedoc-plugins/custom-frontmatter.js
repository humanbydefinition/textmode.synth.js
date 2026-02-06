// @ts-check
/**
 * Generalized frontmatter plugin for the textmode.js ecosystem
 *
 * A shareable TypeDoc plugin that enhances generated markdown frontmatter with:
 * - Dynamic library name extraction from package.json
 * - Category tags based on reflection kind
 * - SEO-optimized descriptions with template interpolation
 * - Namespace tracking for organized API references
 *
 * @example
 * // typedoc.json
 * {
 *   "plugin": ["./typedoc-plugins/custom-frontmatter.js"]
 * }
 *
 * @module
 */
import { ReflectionKind } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ============================================================================
// Description Templates
// ============================================================================

/**
 * Fallback description templates for each reflection kind.
 * {name} is replaced with the symbol name, {library} with the library name.
 * @type {Partial<Record<import('typedoc').ReflectionKind, string>>}
 */
const DESCRIPTION_TEMPLATES = {
	[ReflectionKind.Class]:
		'API documentation for the {name} class in {library}.',
	[ReflectionKind.Interface]:
		'API documentation for the {name} interface in {library}.',
	[ReflectionKind.Enum]: '{name} enumeration values and usage in {library}.',
	[ReflectionKind.Function]: '{name} function API reference for {library}.',
	[ReflectionKind.TypeAlias]:
		'{name} type definition and usage in {library}.',
	[ReflectionKind.Variable]: '{name} variable reference in {library}.',
	[ReflectionKind.Namespace]:
		'{name} namespace - types and utilities in {library}.',
	[ReflectionKind.Project]: 'Complete API reference for {library}.',
	[ReflectionKind.Module]: 'API reference documentation for {name}.',
};

// ============================================================================
// Library Context
// ============================================================================

/**
 * Library context extracted from package.json and TypeDoc project.
 * @typedef {Object} LibraryContext
 * @property {string} name - Library name from package.json
 * @property {string} description - Library description from package.json
 * @property {string} ecosystem - Parent ecosystem identifier (e.g., "textmode.js")
 */

/**
 * Read and parse the package.json file from the project root.
 * @returns {{ name?: string; description?: string } | null}
 */
function readPackageJson() {
	try {
		const __dirname = dirname(fileURLToPath(import.meta.url));
		const packagePath = resolve(__dirname, '..', 'package.json');
		const content = readFileSync(packagePath, 'utf-8');
		return JSON.parse(content);
	} catch {
		return null;
	}
}

/**
 * Extract library context from TypeDoc project and package.json.
 * @param {import('typedoc').ProjectReflection} project
 * @returns {LibraryContext}
 */
function extractLibraryContext(project) {
	// Get library name from project reflection (set by TypeDoc's PackagePlugin)
	const name = project.packageName ?? project.name ?? 'Unknown Library';

	// Read package.json for description
	let description = `API reference for ${name}`;
	const packageJson = readPackageJson();
	if (packageJson?.description) {
		description = packageJson.description;
	}

	// Determine ecosystem: all textmode.* libraries belong to textmode.js ecosystem
	const ecosystem = name.startsWith('textmode') ? 'textmode.js' : name;

	return { name, description, ecosystem };
}

// ============================================================================
// Category Mapping
// ============================================================================

/**
 * Get category name based on reflection kind.
 * @param {import('typedoc').ReflectionKind} kind
 * @returns {string}
 */
function getCategoryForKind(kind) {
	switch (kind) {
		case ReflectionKind.Class:
			return 'Classes';
		case ReflectionKind.Interface:
			return 'Interfaces';
		case ReflectionKind.Enum:
			return 'Enumerations';
		case ReflectionKind.Function:
			return 'Functions';
		case ReflectionKind.TypeAlias:
			return 'Type Aliases';
		case ReflectionKind.Variable:
			return 'Variables';
		case ReflectionKind.Namespace:
			return 'Namespaces';
		case ReflectionKind.Module:
			return 'Modules';
		default:
			return 'API Reference';
	}
}

// ============================================================================
// Namespace Utilities
// ============================================================================

/**
 * Check if a model is inside a namespace.
 * @param {import('typedoc').Reflection} model
 * @returns {boolean}
 */
function isInNamespace(model) {
	let parent = model.parent;
	while (parent) {
		if (parent.kind === ReflectionKind.Namespace) {
			return true;
		}
		parent = parent.parent;
	}
	return false;
}

/**
 * Get the full namespace path for a model (e.g., "Outer.Inner").
 * @param {import('typedoc').Reflection} model
 * @returns {string | undefined}
 */
function getNamespacePath(model) {
	/** @type {string[]} */
	const parts = [];
	let parent = model.parent;

	while (parent) {
		if (parent.kind === ReflectionKind.Namespace) {
			parts.unshift(parent.name);
		}
		parent = parent.parent;
	}

	return parts.length > 0 ? parts.join('.') : undefined;
}

// ============================================================================
// Description Extraction
// ============================================================================

/**
 * Sanitize text for use in YAML frontmatter.
 * Strips markdown links and other problematic syntax.
 * @param {string} text
 * @returns {string}
 */
function sanitizeForYaml(text) {
	return text
		// Convert markdown links [text](url) to just text
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		// Remove any remaining raw URLs that could cause YAML issues
		.replace(/https?:\/\/[^\s]+/g, '')
		// Remove backticks (inline code) but keep content
		.replace(/`([^`]+)`/g, '$1')
		// Collapse multiple spaces
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Extract description from TypeDoc comment or generate from template.
 * @param {import('typedoc').Reflection} model
 * @param {LibraryContext} library
 * @returns {string | undefined}
 */
function extractDescription(model, library) {
	// Try to get summary from comment
	if (model.comment?.summary) {
		const summary = model.comment.summary
			.map((part) => part.text || '')
			.join('')
			.trim();

		if (summary) {
			// Extract only the first paragraph (before the first blank line)
			const firstParagraph = summary.split(/\n\s*\n/)[0].trim();

			// Sanitize markdown syntax that breaks YAML frontmatter
			const sanitized = sanitizeForYaml(firstParagraph);

			// Limit to ~160 characters for SEO (good meta description length)
			if (sanitized.length > 160) {
				return sanitized.substring(0, 157) + '...';
			}
			return sanitized;
		}
	}

	// Fallback: generate description from template
	return generateFallbackDescription(model, library);
}

/**
 * Generate a fallback description using templates.
 * @param {import('typedoc').Reflection} model
 * @param {LibraryContext} library
 * @returns {string}
 */
function generateFallbackDescription(model, library) {
	const kind = model.kind;
	const name = model.name;

	// Special case for main project/module index
	if (kind === ReflectionKind.Project || kind === ReflectionKind.Module) {
		if (name === library.name) {
			return library.description;
		}
	}

	// Get template for this kind
	const template =
		DESCRIPTION_TEMPLATES[kind] ?? 'API reference for {name} in {library}.';

	// Interpolate template
	return template.replace('{name}', name).replace('{library}', library.name);
}

// ============================================================================
// Plugin Entry Point
// ============================================================================

/**
 * TypeDoc plugin load function.
 * Called by TypeDoc to initialize the plugin.
 *
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
	app.logger.verbose(
		'[frontmatter] Registered textmode.js ecosystem frontmatter plugin'
	);

	// Library context is lazily initialized on first page event
	/** @type {LibraryContext | null} */
	let libraryContext = null;

	app.renderer.on(
		MarkdownPageEvent.BEGIN,
		/** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
		(page) => {
			if (!page.model) {
				return;
			}

			const model = /** @type {import('typedoc').Reflection} */ (
				page.model
			);

			// Initialize library context from project reflection (once)
			if (!libraryContext) {
				libraryContext = extractLibraryContext(page.project);
				app.logger.verbose(
					`[frontmatter] Library: ${libraryContext.name} (ecosystem: ${libraryContext.ecosystem})`
				);
			}

			const kind = model.kind;

			// Determine category based on reflection kind
			const category = getCategoryForKind(kind);

			// Determine if this is a namespace member
			const isNamespaceMember = isInNamespace(model);

			// Extract description from comment summary or use template
			const description = extractDescription(model, libraryContext);

			// Build enhanced frontmatter
			page.frontmatter = {
				...page.frontmatter,
				title: model.name,
				description: description,
				category: category,
				api: true,
				namespace: isNamespaceMember ? getNamespacePath(model) : undefined,
				kind: ReflectionKind[kind],
				ecosystem:
					libraryContext.ecosystem !== libraryContext.name
						? libraryContext.ecosystem
						: undefined,
				lastModified: new Date().toISOString().split('T')[0],
			};

			// Add class-specific metadata
			if (kind === ReflectionKind.Class) {
				const hasConstructor =
					/** @type {import('typedoc').DeclarationReflection} */ (
						model
					).children?.some(
						(child) => child.kind === ReflectionKind.Constructor
					);
				page.frontmatter.hasConstructor = hasConstructor;
			}

			// Add interface-specific metadata
			if (kind === ReflectionKind.Interface) {
				page.frontmatter.isInterface = true;
			}

			// Clean up undefined values
			const frontmatter = page.frontmatter;
			Object.keys(frontmatter).forEach((key) => {
				if (frontmatter[key] === undefined) {
					delete frontmatter[key];
				}
			});
		}
	);
}

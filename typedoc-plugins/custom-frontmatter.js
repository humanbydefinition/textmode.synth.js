// @ts-check
import { ReflectionKind } from 'typedoc';
import { MarkdownPageEvent } from 'typedoc-plugin-markdown';

/**
 * Custom frontmatter plugin for textmode.js documentation
 * 
 * Enhances the generated frontmatter with:
 * - Dynamic title generation
 * - Category tags based on reflection kind
 * - API reference flag
 * - Last modified timestamp
 * 
 * @param {import('typedoc-plugin-markdown').MarkdownApplication} app
 */
export function load(app) {
	app.logger.verbose('[typedoc] Registered custom frontmatter enhancer');

	app.renderer.on(
		MarkdownPageEvent.BEGIN,
		/** @param {import('typedoc-plugin-markdown').MarkdownPageEvent} page */
		(page) => {
			if (!page.model) {
				return;
			}

			const model = page.model;
			const kind = model.kind;

			// Determine category based on reflection kind
			const category = getCategoryForKind(kind);

			// Determine if this is a namespace member
			const isNamespaceMember = isInNamespace(model);

			// Extract description from comment summary
			const description = extractDescription(model);

			// Build enhanced frontmatter
			page.frontmatter = {
				...page.frontmatter,
				title: model.name,
				description: description,
				category: category,
				api: true,
				namespace: isNamespaceMember ? getNamespacePath(model) : undefined,
				kind: ReflectionKind[kind],
				lastModified: new Date().toISOString().split('T')[0],
			};

			// Add additional metadata for classes
			if (kind === ReflectionKind.Class) {
				const hasConstructor = model.children?.some(
					(child) => child.kind === ReflectionKind.Constructor
				);
				page.frontmatter.hasConstructor = hasConstructor;
			}

			// Add additional metadata for interfaces
			if (kind === ReflectionKind.Interface) {
				page.frontmatter.isInterface = true;
			}

			// Clean up undefined values
			Object.keys(page.frontmatter).forEach((key) => {
				if (page.frontmatter[key] === undefined) {
					delete page.frontmatter[key];
				}
			});
		}
	);
}

/**
 * Get category name based on reflection kind
 * @param {ReflectionKind} kind
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

/**
 * Check if a model is inside a namespace
 * @param {any} model
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
 * Get the full namespace path for a model
 * @param {any} model
 * @returns {string | undefined}
 */
function getNamespacePath(model) {
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
		// Remove backticks (inline code)
		.replace(/`[^`]+`/g, (match) => match.slice(1, -1))
		// Collapse multiple spaces
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Extract description from TypeDoc comment
 * @param {any} model
 * @returns {string | undefined}
 */
function extractDescription(model) {
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

	// Fallback: generate basic description based on kind
	const kind = model.kind;
	const name = model.name;
	
	// Special case for the main project/module index
	if (kind === ReflectionKind.Project || kind === ReflectionKind.Module) {
		if (name === 'textmode.js') {
			return 'Complete API reference for textmode.js - a lightweight creative coding library for real-time ASCII art on the web.';
		}
		return `API reference documentation for ${name}.`;
	}
	
	switch (kind) {
		case ReflectionKind.Class:
			return `API documentation for the ${name} class - part of the textmode.js library.`;
		case ReflectionKind.Interface:
			return `API documentation for the ${name} interface - part of the textmode.js library.`;
		case ReflectionKind.Enum:
			return `${name} enumeration values and usage in the textmode.js library.`;
		case ReflectionKind.Function:
			return `${name} function API reference for textmode.js.`;
		case ReflectionKind.TypeAlias:
			return `${name} type definition and usage in textmode.js.`;
		case ReflectionKind.Variable:
			return `${name} variable reference in textmode.js.`;
		case ReflectionKind.Namespace:
			return `${name} namespace - types and utilities in textmode.js.`;
		default:
			return `API reference for ${name} in textmode.js.`;
	}
}

// @ts-check

import { ReflectionKind } from 'typedoc';

export const UNKNOWN_LIBRARY_NAME = 'Unknown Library';
export const TEXTMODE_ECOSYSTEM_NAME = 'textmode.js';
export const TEXTMODE_PACKAGE_PREFIX = 'textmode';
export const DESCRIPTION_MAX_LENGTH = 160;
export const DESCRIPTION_TRUNCATION_SUFFIX = '...';

/**
 * @type {ReadonlyMap<import('typedoc').ReflectionKind, string>}
 */
export const CATEGORY_BY_KIND = new Map([
	[ReflectionKind.Class, 'Classes'],
	[ReflectionKind.Interface, 'Interfaces'],
	[ReflectionKind.Enum, 'Enumerations'],
	[ReflectionKind.Function, 'Functions'],
	[ReflectionKind.TypeAlias, 'Type Aliases'],
	[ReflectionKind.Variable, 'Variables'],
	[ReflectionKind.Property, 'Properties'],
	[ReflectionKind.Accessor, 'Accessors'],
	[ReflectionKind.Method, 'Methods'],
	[ReflectionKind.Constructor, 'Constructors'],
	[ReflectionKind.Namespace, 'Namespaces'],
	[ReflectionKind.Module, 'Modules'],
]);

/**
 * Fallback description templates for each reflection kind.
 * `{name}` is replaced with the reflection name and `{library}` with the library name.
 *
 * @type {ReadonlyMap<import('typedoc').ReflectionKind, string>}
 */
export const DESCRIPTION_TEMPLATE_BY_KIND = new Map([
	[ReflectionKind.Class, 'API documentation for the {name} class in {library}.'],
	[ReflectionKind.Interface, 'API documentation for the {name} interface in {library}.'],
	[ReflectionKind.Enum, '{name} enumeration values and usage in {library}.'],
	[ReflectionKind.Function, '{name} function API reference for {library}.'],
	[ReflectionKind.TypeAlias, '{name} type definition and usage in {library}.'],
	[ReflectionKind.Variable, '{name} variable reference in {library}.'],
	[ReflectionKind.Property, '{name} property reference for {library}.'],
	[ReflectionKind.Accessor, '{name} accessor reference for {library}.'],
	[ReflectionKind.Method, '{name} method reference for {library}.'],
	[ReflectionKind.Constructor, '{name} constructor reference for {library}.'],
	[ReflectionKind.Namespace, '{name} namespace - types and utilities in {library}.'],
	[ReflectionKind.Project, 'Complete API reference for {library}.'],
	[ReflectionKind.Module, 'API reference documentation for {name}.'],
]);

export const DEFAULT_DESCRIPTION_TEMPLATE = 'API reference for {name} in {library}.';
export const API_REFERENCE_CATEGORY = 'API Reference';

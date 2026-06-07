// @ts-check

import { ReflectionKind } from 'typedoc';

export const ROUTER_NAME = 'all-member-pages';

export const ALWAYS_OWN_PAGE_KIND_NAMES = ['Module', 'Namespace', 'Document'];

export const OWNER_PAGE_KINDS = new Set([ReflectionKind.Class, ReflectionKind.Interface]);

export const MEMBER_PAGE_KINDS = new Set([
	ReflectionKind.Property,
	ReflectionKind.Accessor,
	ReflectionKind.Method,
	ReflectionKind.Constructor,
]);

export const MEMBER_DIRECTORIES = new Map([
	[ReflectionKind.Property, 'properties'],
	[ReflectionKind.Accessor, 'accessors'],
	[ReflectionKind.Method, 'methods'],
	[ReflectionKind.Constructor, 'constructors'],
]);

export const CONSTRUCTOR_FILE_NAME = 'constructor';

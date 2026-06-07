# All Member Pages Router

## Purpose

This TypeDoc router makes direct public members of classes and interfaces render as focused Markdown pages.

`typedoc-plugin-markdown` can render top-level API structures as pages, but textmode.js also needs compact class and
interface overview pages that link to individual properties, accessors, methods, and constructors. This router keeps
those owner pages small and gives each direct member a stable page.

## Member Pages

The router creates pages for direct class/interface:

- properties
- accessors
- methods
- constructors

Nested type-literal fields intentionally remain inline or anchor-based so structural types do not explode into many
small pages.

## Paths

Examples:

- `classes/Textmodifier/methods/background.md`
- `classes/Textmodifier/accessors/grid.md`
- `classes/Textmodifier/properties/windowWidth.md`
- `namespaces/layering/classes/TextmodeLayer/methods/draw.md`

Constructors are named `constructor.md`.

## Preserved Output Contract

- The router name remains `all-member-pages`.
- Direct class/interface members get pages; nested type-literal members do not.
- Existing `MemberRouter` behavior for modules, namespaces, documents, and configured `membersWithOwnFile` kinds is
  preserved.
- Project-root namespaces use the flattened textmode.js path shape, for example `namespaces/color/classes/TextmodeColor.md`.
- Sidebar entries include generated member pages under their owners.

## Contributor Notes

- Safe to edit: constants, helper names, tests, and README wording.
- Be careful with: `child-pages.js`, which intentionally mirrors upstream `MemberRouter` traversal.
- Do not casually change: path segment names, constructor filenames, namespace path flattening, or direct-member page
  eligibility.

## Maintenance

This plugin extends `typedoc-plugin-markdown`'s `MemberRouter` and copies its child-page traversal policy so direct
members can participate in TypeDoc's `hasOwnDocument` behavior. Re-check this router after upgrading TypeDoc or
`typedoc-plugin-markdown`, especially around router APIs, `membersWithOwnFile`, and namespace path handling.

Upgrade checklist:

- Compare `child-pages.js` against the current upstream `MemberRouter.buildChildPages`.
- Confirm `PageKind.Reflection`, `Slugger`, `fullUrls`, and `sluggers` are still the correct router APIs.
- Run `npm run test:tooling` and verify generated method/accessor/property links still resolve.

# Accessor Docs Normalizer

## Purpose

TypeDoc stores comments for TypeScript accessors on the getter and setter signatures. `typedoc-plugin-markdown`
overview tables read descriptions from the accessor reflection itself. When the reflection has no direct comment,
the generated table falls back to `-` even though the getter or setter is documented in source.

This plugin normalizes that shape for the textmode.js API docs:

- Copies the first getter or setter signature comment onto an accessor reflection when the accessor has no comment.
- Tracks copied comments so the accessor page does not render the same summary twice.
- Replaces the markdown accessor partial so getter documentation appears before setter documentation.
- Keeps getter return sections, setter parameter sections, inheritance sections, and `disableSources` behavior intact.

The plugin does not change runtime library behavior, the public TypeScript API, source JSDoc ownership, or TypeDoc
reflection conversion. It only adjusts markdown rendering after TypeDoc has built the reflection model.

This exists to avoid source-level documentation stubs or declaration-merging boilerplate for accessor descriptions.
Accessor docs should stay in the source declarations that own the getter and setter behavior.

## Preserved Output Contract

- Accessor overview tables show the first available getter or setter summary.
- Accessor pages do not render copied comments twice.
- Getter content renders before setter content.
- Getter return sections, setter parameter sections, inheritance sections, and `disableSources` behavior match
  `typedoc-plugin-markdown`.

## Contributor Notes

- Safe to edit: helper names, tests, README wording, and the local comment-normalization traversal.
- Be careful with: `theme-patch.js`, because it monkey-patches `MarkdownTheme.prototype.getRenderContext`.
- Do not casually change: accessor partial output order, copied-comment tracking, or source-display conditions.

## Maintenance

This plugin depends on `typedoc-plugin-markdown` theme internals, especially `MarkdownTheme.getRenderContext` and the
`partials.accessor` contract. Re-check this plugin after upgrading `typedoc-plugin-markdown`.

Upgrade checklist:

- Compare `render-accessor.js` against the current upstream accessor partial.
- Confirm `MarkdownTheme.getRenderContext` still exists and returns a mutable partials object.
- Run `npm run test:tooling` and inspect generated accessor pages for duplicate summaries.

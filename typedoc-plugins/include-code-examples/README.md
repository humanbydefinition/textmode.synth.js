# Include Code Examples

## Purpose

This TypeDoc plugin cleans up example sketches included in API docs with `{@includeCode ...}`.

Example sketches keep leading gallery metadata such as `@title` and `@author` so the examples gallery and validation
scripts can read it. API reference pages should show only the runnable sketch code, so this plugin removes a leading
JSDoc metadata block from supported fenced code blocks after TypeDoc has rendered markdown.

The plugin also normalizes transformed `js` fences to `javascript` for VitePress syntax highlighting. That normalization
is intentionally gated by metadata stripping: a plain `js` fence without a leading metadata block is left unchanged.

This is a post-render markdown transform. It does not edit source examples, change TypeDoc reflections, or add new
TypeDoc options.

## Preserved Output Contract

- Only fenced `js`, `jsx`, `ts`, `tsx`, `javascript`, and `typescript` blocks are considered.
- Only a leading JSDoc metadata block is stripped.
- Plain code fences without stripped metadata are left byte-for-byte unchanged.
- `js` fences are normalized to `javascript` only when metadata was stripped.
- Unsupported and language-less fences are left unchanged.

## Contributor Notes

- Safe to edit: helper names, supported-language tests, and comments.
- Be careful with: `EXAMPLE_CODE_FENCE_PATTERN`, because it intentionally operates after TypeDoc renders markdown.
- Do not casually change: supported language gating, `js` normalization timing, or the “leading docblock only” rule.

## Maintenance

This plugin depends on TypeDoc rendering `{@includeCode ...}` examples as fenced code blocks before
`MarkdownPageEvent.END`. Re-check the transform after upgrading TypeDoc or `typedoc-plugin-markdown`.

Upgrade checklist:

- Confirm included examples still arrive in `page.contents` as fenced markdown.
- Run `npm run test:tooling`.
- Inspect a generated API example and verify gallery metadata such as `@title` is absent.

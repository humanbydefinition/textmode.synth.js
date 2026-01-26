# Agent Journals

This directory contains learning journals maintained by AI coding agents. These journals capture critical discoveries, patterns, and lessons learned during automated code improvements.

## Purpose

Journals serve as **institutional memory** for AI agents working on this codebase. They help agents:

1. **Avoid repeating mistakes** — Failed attempts are documented with lessons
2. **Build on prior knowledge** — Successful patterns are recorded for reuse
3. **Understand project-specific quirks** — Codebase-specific behaviors are documented

## Entry Format

All journals use **numbered entries** (not dates) for consistency:

```markdown
## Entry #[N] — [Title]
**Finding:** [What was discovered]
**Implication:** [Why it matters]
**Guidance:** [What to do next time]

---
```

## Guidelines for Agents

### When to Write

Only document **critical learnings**, not routine work:

✅ **DO document:**
- Patterns specific to this codebase
- Failed attempts with lessons learned
- Unexpected behaviors or gotchas
- Performance implications
- Type system edge cases

❌ **DON'T document:**
- Routine improvements (just do them)
- Generic best practices (already known)
- Speculative ideas (only proven findings)

### How to Write

1. **Read the journal first** — Check if your finding is already documented
2. **Find the last entry number** — Your entry is `#[last + 1]`
3. **Be concise but complete** — Future agents need to understand the context
4. **Include actionable guidance** — What should the next agent do differently?

## Related Files

- [AGENTS.md](../AGENTS.md) — Main project conventions and build commands

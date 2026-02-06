---
title: SynthParameterValue
description: Dynamic parameter value types supported by the synth system.
category: Type Aliases
api: true
kind: TypeAlias
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / SynthParameterValue

# Type Alias: SynthParameterValue

```ts
type SynthParameterValue = 
  | number
  | number[]
  | string
  | (ctx) => number
  | (ctx) => number[]
  | SynthSource
  | null;
```

Dynamic parameter value types supported by the synth system.

- `number`: Static numeric value
- `number[]`: Array of numbers for vector types or modulated arrays (hydra-like)
- `string`: String value (rarely used)
- `function`: Evaluated each frame with context
- `SynthSource`: Nested synth chain for combine/modulate operations
- `null`: Use default value

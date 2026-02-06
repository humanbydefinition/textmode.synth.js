---
title: DynamicErrorCallback
description: Callback signature for dynamic parameter evaluation errors. Live coding environments can use this to display errors without interrupting rendering.
category: Type Aliases
api: true
kind: TypeAlias
lastModified: 2026-02-06
---

[textmode.synth.js](../index.md) / DynamicErrorCallback

# Type Alias: DynamicErrorCallback()

```ts
type DynamicErrorCallback = (error, uniformName) => void;
```

Callback signature for dynamic parameter evaluation errors.
Live coding environments can use this to display errors without interrupting rendering.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |
| `uniformName` | `string` |

## Returns

`void`

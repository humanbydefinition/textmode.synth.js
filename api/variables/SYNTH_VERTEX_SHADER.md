[textmode.synth.js](../index.md) / SYNTH\_VERTEX\_SHADER

# Variable: SYNTH\_VERTEX\_SHADER

```ts
const SYNTH_VERTEX_SHADER: "#version 300 es\nprecision highp float;\n\n// Use explicit layout location for cross-platform compatibility\nlayout(location = 0) in vec2 a_position;\n\nout vec2 v_uv;\n\nvoid main() {\n\tvec2 uv = a_position * 0.5 + 0.5;\n\tv_uv = vec2(uv.x, 1.0 - uv.y);\n\tgl_Position = vec4(a_position, 0.0, 1.0);\n}\n";
```

Vertex shader source for synth rendering.

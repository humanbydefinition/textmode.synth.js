const L = { src: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, coord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, color: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, combine: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, combineCoord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] }, char: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, charModify: { returnType: "vec4", args: [{ type: "vec4", name: "_char" }] }, charColor: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_char" }] }, cellColor: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_char" }, { type: "vec4", name: "_charColor" }] } };
function P(t) {
  const e = Array.from(t), r = [];
  for (const a of e) r.push(a.codePointAt(0) ?? 32);
  return { chars: t, indices: r };
}
function Y(t) {
  const e = L[t.type], r = [...e.args, ...t.inputs.map((n) => ({ type: n.type, name: n.name }))].map((n) => `${n.type} ${n.name}`).join(", "), a = `
${e.returnType} ${t.name}(${r}) {
${t.glsl}
}`;
  return { ...t, glslFunction: a };
}
class D {
  _transforms = /* @__PURE__ */ new Map();
  _processedCache = /* @__PURE__ */ new Map();
  register(e) {
    this._transforms.has(e.name) && console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`), this._transforms.set(e.name, e), this._processedCache.delete(e.name);
  }
  registerMany(e) {
    for (const r of e) this.register(r);
  }
  get(e) {
    return this._transforms.get(e);
  }
  getProcessed(e) {
    let r = this._processedCache.get(e);
    if (!r) {
      const a = this._transforms.get(e);
      a && (r = Y(a), this._processedCache.set(e, r));
    }
    return r;
  }
  has(e) {
    return this._transforms.has(e);
  }
  getByType(e) {
    return Array.from(this._transforms.values()).filter((r) => r.type === e);
  }
  getNames() {
    return Array.from(this._transforms.keys());
  }
  getAll() {
    return Array.from(this._transforms.values());
  }
  getSourceTransforms() {
    return this.getByType("src").concat(this.getByType("char"));
  }
  remove(e) {
    return this._processedCache.delete(e), this._transforms.delete(e);
  }
  clear() {
    this._transforms.clear(), this._processedCache.clear();
  }
  get size() {
    return this._transforms.size;
  }
}
const T = new D(), B = /* @__PURE__ */ new Set(["src", "char"]);
class j {
  _generatedFunctions = {};
  _synthSourceClass = null;
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const r = T.getAll();
    for (const a of r) this._injectMethod(e, a);
  }
  _injectMethod(e, r) {
    const { name: a, inputs: n, type: s } = r;
    e[a] = s === "combine" || s === "combineCoord" ? function(c, ...f) {
      const o = n.map((p, d) => f[d] ?? p.default);
      return this.addCombineTransform(a, c, o);
    } : function(...c) {
      const f = n.map((o, p) => c[p] ?? o.default);
      return this.addTransform(a, f);
    };
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, r = T.getAll(), a = this._synthSourceClass;
    for (const n of r) if (B.has(n.type)) {
      const { name: s, inputs: c } = n;
      e[s] = (...f) => {
        const o = new a(), p = c.map((d, m) => f[m] ?? d.default);
        return o.addTransform(s, p);
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, r) {
    if (T.register(e), r && this._injectMethod(r, e), B.has(e.type) && this._synthSourceClass) {
      const a = this._synthSourceClass, { name: n, inputs: s } = e;
      this._generatedFunctions[n] = (...c) => {
        const f = new a(), o = s.map((p, d) => c[d] ?? p.default);
        return f.addTransform(n, o);
      };
    }
  }
}
const R = new j(), G = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, q = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, K = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
	vec3 color = vec3(0.0);
	vec2 st = _st * scale;
	vec2 i_st = floor(st);
	vec2 f_st = fract(st);
	float m_dist = 10.0;
	vec2 m_point;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 neighbor = vec2(float(i), float(j));
			vec2 p = i_st + neighbor;
			vec2 point = fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
			point = 0.5 + 0.5 * sin(time * speed + 6.2831 * point);
			vec2 diff = neighbor + point - f_st;
			float dist = length(diff);
			if (dist < m_dist) {
				m_dist = dist;
				m_point = point;
			}
		}
	}
	color += dot(m_point, vec2(0.3, 0.6));
	color *= 1.0 - blending * m_dist;
	return vec4(color, 1.0);
`, description: "Generate voronoi pattern" }, H = { name: "gradient", type: "src", inputs: [{ name: "speed", type: "float", default: 0 }], glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`, description: "Generate gradient pattern" }, Q = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, W = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, J = { name: "src", type: "src", inputs: [{ name: "output", type: "sampler2D", default: null }], glsl: `
	return texture(prevBuffer, fract(_st));
`, description: "Sample the previous frame primary color for feedback effects" }, Z = { name: "charSrc", type: "src", inputs: [{ name: "output", type: "sampler2D", default: null }], glsl: `
	return texture(prevCharBuffer, fract(_st));
`, description: "Sample the previous frame character data for feedback effects" }, ee = { name: "cellColorSrc", type: "src", inputs: [{ name: "output", type: "sampler2D", default: null }], glsl: `
	return texture(prevCellColorBuffer, fract(_st));
`, description: "Sample the previous frame cell color for feedback effects" }, te = [G, q, K, H, Q, W, J, Z, ee], ne = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`, description: "Rotate coordinates" }, re = { name: "scale", type: "coord", inputs: [{ name: "amount", type: "float", default: 1.5 }, { name: "xMult", type: "float", default: 1 }, { name: "yMult", type: "float", default: 1 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`, description: "Scale coordinates" }, ae = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, oe = { name: "scrollX", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`, description: "Scroll X coordinate" }, se = { name: "scrollY", type: "coord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`, description: "Scroll Y coordinate" }, ce = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, ie = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, le = { name: "repeatX", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern horizontally" }, ue = { name: "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern vertically" }, fe = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, pe = [ne, re, ae, oe, se, ce, ie, le, ue, fe], me = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, de = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, he = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, _e = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`, description: "Adjust saturation" }, ye = { name: "hue", type: "color", inputs: [{ name: "hue", type: "float", default: 0.4 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`, description: "Shift hue" }, ge = { name: "colorama", type: "color", inputs: [{ name: "amount", type: "float", default: 5e-3 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`, description: "Color cycle effect" }, ve = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, xe = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, Ce = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`, description: "Threshold" }, be = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, Se = { name: "r", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.r * scale + offset);
`, description: "Extract red channel" }, Te = { name: "g", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.g * scale + offset);
`, description: "Extract green channel" }, $e = { name: "b", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.b * scale + offset);
`, description: "Extract blue channel" }, Me = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`, description: "Shift color channels by adding offset values" }, we = { name: "gamma", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`, description: "Apply gamma correction" }, Fe = { name: "levels", type: "color", inputs: [{ name: "inMin", type: "float", default: 0 }, { name: "inMax", type: "float", default: 1 }, { name: "outMin", type: "float", default: 0 }, { name: "outMax", type: "float", default: 1 }, { name: "gamma", type: "float", default: 1 }], glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`, description: "Adjust input/output levels and gamma" }, Re = { name: "clampColor", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, Ae = [me, de, he, _e, ye, ge, ve, xe, Ce, be, Se, Te, $e, Me, we, Fe, Re], Oe = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, Ie = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, Ee = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, Ue = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, ke = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, Be = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, Ve = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, Xe = [Oe, Ie, Ee, Ue, ke, Be, Ve], Ne = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, ze = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, Le = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, Pe = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Modulate pixelation with another source" }, Ye = { name: "modulateKaleid", type: "combineCoord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`, description: "Modulate kaleidoscope with another source" }, De = { name: "modulateScrollX", type: "combineCoord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`, description: "Modulate X scroll with another source" }, je = { name: "modulateScrollY", type: "combineCoord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`, description: "Modulate Y scroll with another source" }, Ge = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, qe = { name: "modulateRepeatX", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate X repeat with another source" }, Ke = { name: "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate Y repeat with another source" }, He = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`, description: "Modulate coordinates based on hue differences" }, Qe = [Ne, ze, Le, Pe, Ye, De, je, Ge, qe, Ke, He], We = { name: "charNoise", type: "char", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.5 }, { name: "charCount", type: "float", default: 256 }], glsl: `
	float n = _noise(vec3(_st * scale, offset * time));
	n = n * 0.5 + 0.5;
	int charIndex = int(n * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`, description: "Generate characters from noise" }, Je = { name: "charOsc", type: "char", inputs: [{ name: "frequency", type: "float", default: 8 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }, { name: "charCount", type: "float", default: 256 }], glsl: `
	float wave = sin((_st.x - offset/frequency + time * sync) * frequency) * 0.5 + 0.5;
	int charIndex = int(wave * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`, description: "Generate characters from oscillator" }, Ze = { name: "charGradient", type: "char", inputs: [{ name: "speed", type: "float", default: 0 }, { name: "charCount", type: "float", default: 256 }], glsl: `
	float t = _st.x + sin(time * speed);
	int charIndex = int(fract(t) * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`, description: "Generate characters from gradient" }, et = { name: "charVoronoi", type: "char", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "charCount", type: "float", default: 256 }], glsl: `
	vec2 st = _st * scale;
	vec2 i_st = floor(st);
	vec2 f_st = fract(st);
	float m_dist = 10.0;
	vec2 m_point;
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 neighbor = vec2(float(i), float(j));
			vec2 p = i_st + neighbor;
			vec2 point = fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
			point = 0.5 + 0.5 * sin(time * speed + 6.2831 * point);
			vec2 diff = neighbor + point - f_st;
			float dist = length(diff);
			if (dist < m_dist) {
				m_dist = dist;
				m_point = point;
			}
		}
	}
	float value = dot(m_point, vec2(0.5, 0.5));
	int charIndex = int(value * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`, description: "Generate characters from voronoi" }, tt = { name: "charShape", type: "char", inputs: [{ name: "sides", type: "float", default: 4 }, { name: "innerChar", type: "float", default: 64 }, { name: "outerChar", type: "float", default: 32 }, { name: "radius", type: "float", default: 0.3 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	int charIndex = d < radius ? int(innerChar) : int(outerChar);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`, description: "Generate characters from shape" }, nt = { name: "charSolid", type: "char", inputs: [{ name: "charIndex", type: "float", default: 64 }], glsl: `
	int idx = int(charIndex);
	return vec4(float(idx % 256) / 255.0, float(idx / 256) / 255.0, 0.0, 0.0);
`, description: "Set a solid character" }, rt = [We, Je, Ze, et, tt, nt], at = { name: "charFlipX", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 2;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters horizontally" }, ot = { name: "charFlipY", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 4;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters vertically" }, st = { name: "charInvert", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 1;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Invert character colors" }, ct = { name: "charRotate", type: "charModify", inputs: [{ name: "angle", type: "float", default: 0.25 }, { name: "speed", type: "float", default: 0 }], glsl: `
	float rotation = fract(angle + time * speed);
	return vec4(_char.rgb, rotation);
`, description: "Rotate characters" }, it = [at, ot, st, ct], lt = [...te, ...pe, ...Ae, ...Xe, ...Qe, ...rt, ...it];
class S {
  _transforms;
  constructor(e) {
    this._transforms = e;
  }
  static empty() {
    return new S([]);
  }
  static from(e) {
    return new S([...e]);
  }
  get transforms() {
    return this._transforms;
  }
  push(e) {
    this._transforms.push(e);
  }
  get length() {
    return this._transforms.length;
  }
  get isEmpty() {
    return this._transforms.length === 0;
  }
  append(e) {
    return new S([...this._transforms, e]);
  }
  get(e) {
    return this._transforms[e];
  }
  [Symbol.iterator]() {
    return this._transforms[Symbol.iterator]();
  }
}
class O {
  id;
  _layer;
  isSelf;
  constructor(e, r = !1) {
    this.id = e, this.isSelf = r;
  }
  setLayer(e) {
    this._layer = e;
  }
  getLayer() {
    return this._layer;
  }
  hasLayer() {
    return this._layer !== void 0;
  }
}
const Tt = new O("__self__", !0);
let ut = 0;
function $t(t) {
  const e = new O("output_" + ut++);
  return e.setLayer(t), e;
}
function V(t) {
  return t instanceof O;
}
class M {
  _chain;
  _charMapping;
  _nestedSources;
  _colorSource;
  _cellColorSource;
  _externalOutputs;
  constructor(e) {
    this._chain = e?.chain ?? S.empty(), this._charMapping = e?.charMapping, this._colorSource = e?.colorSource, this._cellColorSource = e?.cellColorSource, this._nestedSources = e?.nestedSources ?? /* @__PURE__ */ new Map(), this._externalOutputs = e?.externalOutputs ?? [];
  }
  addTransform(e, r) {
    const a = { name: e, userArgs: r }, n = this._chain.length;
    for (const s of r) if (V(s) && !s.isSelf) {
      let c = "color";
      e === "charSrc" ? c = "char" : e === "cellColorSrc" && (c = "cellColor"), this._externalOutputs.push({ output: s, textureType: c, transformName: e, transformIndex: n });
    }
    return this._chain.push(a), this;
  }
  addCombineTransform(e, r, a) {
    const n = this._chain.length;
    return this._nestedSources.set(n, r), this.addTransform(e, a);
  }
  charMap(e) {
    return this._charMapping = P(e), this;
  }
  charColor(e) {
    return this._colorSource = e, this;
  }
  cellColor(e) {
    return this._cellColorSource = e, this;
  }
  paint(e) {
    return this._colorSource = e, this._cellColorSource = e, this;
  }
  clone() {
    const e = /* @__PURE__ */ new Map();
    for (const [a, n] of this._nestedSources) e.set(a, n.clone());
    const r = [...this._externalOutputs];
    return new M({ chain: S.from(this._chain.transforms), charMapping: this._charMapping, colorSource: this._colorSource?.clone(), cellColorSource: this._cellColorSource?.clone(), nestedSources: e, externalOutputs: r });
  }
  get transforms() {
    return this._chain.transforms;
  }
  get charMapping() {
    return this._charMapping;
  }
  get colorSource() {
    return this._colorSource;
  }
  get cellColorSource() {
    return this._cellColorSource;
  }
  get nestedSources() {
    return this._nestedSources;
  }
  get externalOutputs() {
    return this._externalOutputs;
  }
  collectAllExternalOutputs() {
    const e = [...this._externalOutputs];
    for (const [, r] of this._nestedSources) e.push(...r.collectAllExternalOutputs());
    return this._colorSource && e.push(...this._colorSource.collectAllExternalOutputs()), this._cellColorSource && e.push(...this._cellColorSource.collectAllExternalOutputs()), e;
  }
}
const A = { linear: (t) => t, easeInQuad: (t) => t * t, easeOutQuad: (t) => t * (2 - t), easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1, easeInCubic: (t) => t * t * t, easeOutCubic: (t) => --t * t * t + 1, easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, easeInQuart: (t) => t * t * t * t, easeOutQuart: (t) => 1 - --t * t * t * t, easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t, easeInQuint: (t) => t * t * t * t * t, easeOutQuint: (t) => 1 + --t * t * t * t * t, easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t, sin: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 };
function $(t, e) {
  return (t % e + e) % e;
}
function ft(t, e, r, a, n) {
  return (t - e) * (n - a) / (r - e) + a;
}
function pt() {
  "fast" in Array.prototype || (Array.prototype.fast = function(t = 1) {
    return this._speed = t, this;
  }, Array.prototype.smooth = function(t = 1) {
    return this._smooth = t, this;
  }, Array.prototype.ease = function(t = "linear") {
    return typeof t == "function" ? (this._smooth = 1, this._ease = t) : A[t] && (this._smooth = 1, this._ease = A[t]), this;
  }, Array.prototype.offset = function(t = 0.5) {
    return this._offset = t % 1, this;
  }, Array.prototype.fit = function(t = 0, e = 1) {
    const r = Math.min(...this), a = Math.max(...this), n = this.map((s) => ft(s, r, a, t, e));
    return n._speed = this._speed, n._smooth = this._smooth, n._ease = this._ease, n._offset = this._offset, n;
  });
}
function mt(t, e) {
  const r = t._speed ?? 1, a = t._smooth ?? 0;
  let n = e.time * r * 1 + (t._offset ?? 0);
  if (a !== 0) {
    const s = t._ease ?? A.linear, c = n - a / 2, f = t[Math.floor($(c, t.length))], o = t[Math.floor($(c + 1, t.length))];
    return s(Math.min($(c, 1) / a, 1)) * (o - f) + f;
  }
  return t[Math.floor($(n, t.length))];
}
function dt(t) {
  return Array.isArray(t) && t.length > 0 && typeof t[0] == "number";
}
class ht {
  _uniforms = /* @__PURE__ */ new Map();
  _dynamicUpdaters = /* @__PURE__ */ new Map();
  processArgument(e, r, a) {
    if (dt(e)) {
      const n = `${a}_${r.name}`, s = { name: n, type: r.type, value: r.default ?? 0, isDynamic: !0 }, c = (f) => mt(e, f);
      return this._uniforms.set(n, s), this._dynamicUpdaters.set(n, c), { glslValue: n, uniform: s, updater: c };
    }
    if (typeof e == "function") {
      const n = `${a}_${r.name}`, s = { name: n, type: r.type, value: r.default ?? 0, isDynamic: !0 };
      return this._uniforms.set(n, s), this._dynamicUpdaters.set(n, e), { glslValue: n, uniform: s, updater: e };
    }
    if (typeof e == "number") return { glslValue: g(e) };
    if (Array.isArray(e) && typeof e[0] == "number") {
      const n = e;
      if (n.length === 2) return { glslValue: `vec2(${g(n[0])}, ${g(n[1])})` };
      if (n.length === 3) return { glslValue: `vec3(${g(n[0])}, ${g(n[1])}, ${g(n[2])})` };
      if (n.length === 4) return { glslValue: `vec4(${g(n[0])}, ${g(n[1])}, ${g(n[2])}, ${g(n[3])})` };
    }
    return this.processDefault(r);
  }
  processDefault(e) {
    const r = e.default;
    return typeof r == "number" ? { glslValue: g(r) } : Array.isArray(r) ? { glslValue: `vec${r.length}(${r.map(g).join(", ")})` } : { glslValue: "0.0" };
  }
  getUniforms() {
    return new Map(this._uniforms);
  }
  getDynamicUpdaters() {
    return new Map(this._dynamicUpdaters);
  }
  clear() {
    this._uniforms.clear(), this._dynamicUpdaters.clear();
  }
}
function g(t) {
  const e = t.toString();
  return e.includes(".") ? e : e + ".0";
}
const _t = `
// Utility functions
float _luminance(vec3 rgb) {
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	return dot(rgb, W);
}

vec3 _rgbToHsv(vec3 c) {
	vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
	vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
	vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	float d = q.x - min(q.w, q.y);
	float e = 1.0e-10;
	return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 _hsvToRgb(vec3 c) {
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Simplex 3D Noise by Ian McEwan, Ashima Arts
vec4 permute(vec4 x) {
	return mod(((x*34.0)+1.0)*x, 289.0);
}

vec4 taylorInvSqrt(vec4 r) {
	return 1.79284291400159 - 0.85373472095314 * r;
}

float _noise(vec3 v) {
	const vec2 C = vec2(1.0/6.0, 1.0/3.0);
	const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

	// First corner
	vec3 i = floor(v + dot(v, C.yyy));
	vec3 x0 = v - i + dot(i, C.xxx);

	// Other corners
	vec3 g = step(x0.yzx, x0.xyz);
	vec3 l = 1.0 - g;
	vec3 i1 = min(g.xyz, l.zxy);
	vec3 i2 = max(g.xyz, l.zxy);

	vec3 x1 = x0 - i1 + 1.0 * C.xxx;
	vec3 x2 = x0 - i2 + 2.0 * C.xxx;
	vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

	// Permutations
	i = mod(i, 289.0);
	vec4 p = permute(permute(permute(
		i.z + vec4(0.0, i1.z, i2.z, 1.0))
		+ i.y + vec4(0.0, i1.y, i2.y, 1.0))
		+ i.x + vec4(0.0, i1.x, i2.x, 1.0));

	// Gradients: N*N points uniformly over a square, mapped onto an octahedron.
	float n_ = 1.0/7.0;
	vec3 ns = n_ * D.wyz - D.xzx;

	vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

	vec4 x_ = floor(j * ns.z);
	vec4 y_ = floor(j - 7.0 * x_);

	vec4 x = x_ * ns.x + ns.yyyy;
	vec4 y = y_ * ns.x + ns.yyyy;
	vec4 h = 1.0 - abs(x) - abs(y);

	vec4 b0 = vec4(x.xy, y.xy);
	vec4 b1 = vec4(x.zw, y.zw);

	vec4 s0 = floor(b0) * 2.0 + 1.0;
	vec4 s1 = floor(b1) * 2.0 + 1.0;
	vec4 sh = -step(h, vec4(0.0));

	vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
	vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

	vec3 p0 = vec3(a0.xy, h.x);
	vec3 p1 = vec3(a0.zw, h.y);
	vec3 p2 = vec3(a1.xy, h.z);
	vec3 p3 = vec3(a1.zw, h.w);

	// Normalize gradients
	vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
	p0 *= norm.x;
	p1 *= norm.y;
	p2 *= norm.z;
	p3 *= norm.w;

	// Mix final noise value
	vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
	m = m * m;
	return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;
function yt(t) {
  const { uniforms: e, glslFunctions: r, mainCode: a, charOutputCode: n, primaryColorVar: s, cellColorVar: c, charMapping: f, usesFeedback: o, usesCharFeedback: p, usesCellColorFeedback: d, externalTextures: m } = t, u = Array.from(e.values()).map((v) => `uniform ${v.type} ${v.name};`).join(`
`);
  let h = "", l = "";
  f && (h = `uniform int u_charMap[${f.indices.length}];
uniform int u_charMapSize;`, l = `
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);
  const i = [];
  o && i.push("uniform sampler2D prevBuffer;"), p && i.push("uniform sampler2D prevCharBuffer;"), d && i.push("uniform sampler2D prevCellColorBuffer;");
  const y = i.join(`
`), x = [];
  if (m && m.length > 0) for (const v of m) x.push(`uniform sampler2D ${v.samplerName};`);
  return `#version 300 es
precision highp float;

// Varyings
in vec2 v_uv;

// MRT outputs
layout(location = 0) out vec4 o_character;
layout(location = 1) out vec4 o_primaryColor;
layout(location = 2) out vec4 o_secondaryColor;

// Standard uniforms
uniform float time;
uniform vec2 resolution;
${y}
${x.length > 0 ? `// External layer textures
${x.join(`
`)}` : ""}
${h}

// Dynamic uniforms
${u}

${_t}

// Transform functions
${Array.from(r).join(`
`)}

void main() {
	// Transform chain
${a.join(`
`)}

${n}
${l}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${s};
	o_secondaryColor = ${c};
}
`;
}
function gt(t, e, r) {
  return t ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${r}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}
const vt = `#version 300 es
precision highp float;

// Use explicit layout location for cross-platform compatibility
layout(location = 0) in vec2 a_position;

out vec2 v_uv;

void main() {
	vec2 uv = a_position * 0.5 + 0.5;
	v_uv = vec2(uv.x, 1.0 - uv.y);
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`;
function F(t) {
  return new xt().compile(t);
}
class xt {
  _varCounter = 0;
  _uniformManager = new ht();
  _glslFunctions = /* @__PURE__ */ new Set();
  _mainCode = [];
  _usesFeedback = !1;
  _usesCharFeedback = !1;
  _usesCellColorFeedback = !1;
  _externalTextures = /* @__PURE__ */ new Map();
  _getExternalKey(e, r) {
    return `${e}_${r}`;
  }
  _registerExternalOutput(e) {
    const r = this._getExternalKey(e.output.id, e.textureType);
    if (!this._externalTextures.has(r)) {
      const a = `u_ext_${e.output.id}_${e.textureType}`;
      this._externalTextures.set(r, { samplerName: a, outputRef: e });
    }
    return this._externalTextures.get(r).samplerName;
  }
  compile(e) {
    this._varCounter = 0, this._uniformManager.clear(), this._glslFunctions.clear(), this._mainCode.length = 0, this._usesFeedback = !1, this._usesCharFeedback = !1, this._usesCellColorFeedback = !1, this._externalTextures.clear();
    const r = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)");
    let a = r.colorVar;
    e.colorSource && (a = this._compileChain(e.colorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)").colorVar);
    let n = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (n = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)").colorVar);
    const s = gt(!!r.charVar, r.charVar ?? "vec4(0.0)", r.colorVar);
    return { fragmentSource: yt({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: s, primaryColorVar: a, cellColorVar: n, charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback, externalTextures: Array.from(this._externalTextures.values()) }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback, externalTextures: Array.from(this._externalTextures.values()) };
  }
  _compileChain(e, r, a, n = "v_uv") {
    const s = `${r}_st`;
    let c, f, o, p = `${r}_c`;
    this._mainCode.push(`	vec2 ${s} = ${n};`), this._mainCode.push(`	vec4 ${p} = ${a};`);
    const d = e.transforms, m = d.map((l) => this._getProcessedTransform(l.name)), u = [];
    for (let l = 0; l < m.length; l++) {
      const i = m[l];
      i && (i.type !== "coord" && i.type !== "combineCoord" || u.push(l));
    }
    const h = (l) => {
      const i = d[l], y = m[l];
      if (!y) return void console.warn(`[SynthCompiler] Unknown transform: ${i.name}`);
      const x = i.name === "prev" || i.name === "src" || i.name === "charSrc" || i.name === "cellColorSrc", v = i.userArgs[0], I = V(v) && !v.isSelf;
      if (x && !I && (i.name === "prev" || i.name === "src" ? this._usesFeedback = !0 : i.name === "charSrc" ? this._usesCharFeedback = !0 : i.name === "cellColorSrc" && (this._usesCellColorFeedback = !0)), x && I) {
        let w = "color";
        i.name === "charSrc" ? w = "char" : i.name === "cellColorSrc" && (w = "cellColor");
        const z = this._registerExternalOutput({ output: v, textureType: w, transformName: i.name, transformIndex: l }), k = `c${this._varCounter++}`;
        return this._mainCode.push(`	vec4 ${k} = texture(${z}, fract(${s}));`), void (p = k);
      }
      this._glslFunctions.add(y.glslFunction);
      const X = this._processArguments(i.userArgs, y.inputs, `${r}_${l}_${i.name}`), E = e.nestedSources.get(l);
      let U;
      E && (y.type === "combine" || y.type === "combineCoord") && (U = this._compileChain(E, `${r}_nested_${l}`, a, s).colorVar);
      const N = this._varCounter++, C = this._generateTransformCode(y, N, s, p, c, f, o, X, U);
      p = C.colorVar, C.charVar && (c = C.charVar), C.flagsVar && (f = C.flagsVar), C.rotationVar && (o = C.rotationVar);
    };
    for (let l = u.length - 1; l >= 0; l--) h(u[l]);
    for (let l = 0; l < d.length; l++) {
      const i = m[l];
      (!i || i.type !== "coord" && i.type !== "combineCoord") && h(l);
    }
    return { coordVar: s, colorVar: p, charVar: c, flagsVar: f, rotationVar: o };
  }
  _getProcessedTransform(e) {
    return T.getProcessed(e);
  }
  _processArguments(e, r, a) {
    const n = [];
    for (let s = 0; s < r.length; s++) {
      const c = r[s], f = e[s] ?? c.default, o = this._uniformManager.processArgument(f, c, a);
      n.push(o.glslValue);
    }
    return n;
  }
  _generateTransformCode(e, r, a, n, s, c, f, o, p) {
    const d = (...i) => [...i, ...o].join(", ");
    let m = n, u = s, h = c, l = f;
    switch (e.type) {
      case "src": {
        const i = `c${r}`;
        this._mainCode.push(`	vec4 ${i} = ${e.name}(${d(a)});`), m = i;
        break;
      }
      case "coord": {
        const i = `st${r}`;
        this._mainCode.push(`	vec2 ${i} = ${e.name}(${d(a)});`), this._mainCode.push(`	${a} = ${i};`);
        break;
      }
      case "color": {
        const i = `c${r}`;
        this._mainCode.push(`	vec4 ${i} = ${e.name}(${d(n)});`), m = i;
        break;
      }
      case "combine": {
        const i = `c${r}`;
        this._mainCode.push(`	vec4 ${i} = ${e.name}(${d(n, p ?? "vec4(0.0)")});`), m = i;
        break;
      }
      case "combineCoord": {
        const i = `st${r}`;
        this._mainCode.push(`	vec2 ${i} = ${e.name}(${d(a, p ?? "vec4(0.0)")});`), this._mainCode.push(`	${a} = ${i};`);
        break;
      }
      case "char":
        u || (u = `char${r}`, h = `flags${r}`, l = `rot${r}`, this._mainCode.push(`	vec4 ${u} = vec4(0.0);`), this._mainCode.push(`	float ${h} = 0.0;`), this._mainCode.push(`	float ${l} = 0.0;`)), this._mainCode.push(`	${u} = ${e.name}(${d(a)});`);
        break;
      case "charModify":
        u || (u = `char${r}`, h = `flags${r}`, l = `rot${r}`, this._mainCode.push(`	vec4 ${u} = vec4(0.0);`), this._mainCode.push(`	float ${h} = 0.0;`), this._mainCode.push(`	float ${l} = 0.0;`)), this._mainCode.push(`	${u} = ${e.name}(${d(u)});`);
        break;
      case "charColor": {
        const i = `c${r}`;
        this._mainCode.push(`	vec4 ${i} = ${e.name}(${d(a, u ?? "vec4(0.0)")});`), m = i;
        break;
      }
      case "cellColor": {
        const i = `c${r}`;
        this._mainCode.push(`	vec4 ${i} = ${e.name}(${d(a, u ?? "vec4(0.0)", n)});`), m = i;
        break;
      }
    }
    return { colorVar: m, charVar: u, flagsVar: h, rotationVar: l };
  }
}
class Ct {
  _resolvedIndices;
  _lastFontCharacterCount = 0;
  _lastChars = "";
  resolve(e, r) {
    const a = r.characters.length;
    if (this._resolvedIndices && this._lastFontCharacterCount === a && this._lastChars === e) return this._resolvedIndices;
    const n = Array.from(e), s = new Int32Array(n.length), c = r.characterMap, f = r.characters;
    for (let o = 0; o < n.length; o++) {
      const p = n[o], d = c.get(p);
      if (d !== void 0) s[o] = f.indexOf(d);
      else {
        const m = c.get(" ");
        s[o] = m !== void 0 ? f.indexOf(m) : 0, console.warn(`[CharacterResolver] Character '${p}' not found in font, using fallback`);
      }
    }
    return this._resolvedIndices = s, this._lastFontCharacterCount = a, this._lastChars = e, s;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFontCharacterCount = 0, this._lastChars = "";
  }
}
class bt {
  _textmodifier;
  _gl;
  _characterResolver;
  _shader;
  _compiled;
  _uniformLocations = /* @__PURE__ */ new Map();
  _vao;
  _positionBuffer;
  constructor(e, r) {
    this._textmodifier = e, this._gl = r.context, this._characterResolver = new Ct(), this._initGeometry();
  }
  _initGeometry() {
    const e = this._gl;
    this._vao = e.createVertexArray(), e.bindVertexArray(this._vao), this._positionBuffer = e.createBuffer(), e.bindBuffer(e.ARRAY_BUFFER, this._positionBuffer), e.bufferData(e.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), e.STATIC_DRAW), e.bindVertexArray(null);
  }
  async setShader(e) {
    this._compiled = e, this._characterResolver.invalidate(), console.log(`[SynthRenderer] Generated fragment shader:
`, e.fragmentSource), this._shader = await this._textmodifier.createShader(vt, e.fragmentSource), this._uniformLocations.clear(), this._cacheUniformLocation("time"), this._cacheUniformLocation("resolution");
    for (const [r] of e.uniforms) this._cacheUniformLocation(r);
    if (e.charMapping && (this._cacheUniformLocation("u_charMap"), this._cacheUniformLocation("u_charMapSize")), e.usesFeedback && this._cacheUniformLocation("prevBuffer"), e.usesCharFeedback && this._cacheUniformLocation("prevCharBuffer"), e.usesCellColorFeedback && this._cacheUniformLocation("prevCellColorBuffer"), e.externalTextures && e.externalTextures.length > 0) for (const r of e.externalTextures) this._cacheUniformLocation(r.samplerName);
  }
  _cacheUniformLocation(e) {
    if (!this._shader) return;
    console.log(this._shader), console.log(this._shader.glProgram);
    const r = this._gl.getUniformLocation(this._shader.glProgram, e);
    r && this._uniformLocations.set(e, r);
  }
  render(e, r, a, n, s, c, f) {
    if (!this._shader || !this._compiled || !this._vao) return void console.warn("[SynthRenderer] Cannot render: missing shader, compiled data, or VAO");
    const o = this._gl;
    e.begin(), o.clearColor(0, 0, 0, 0), o.clear(o.COLOR_BUFFER_BIT | o.DEPTH_BUFFER_BIT), o.useProgram(this._shader.glProgram), this._setUniform("time", n.time), this._setUniform("resolution", [r, a]);
    for (const [u, h] of this._compiled.dynamicUpdaters) {
      const l = h(n);
      this._setUniform(u, l);
    }
    for (const [u, h] of this._compiled.uniforms) h.isDynamic || typeof h.value == "function" || this._setUniform(u, h.value);
    if (this._compiled.charMapping) {
      const u = this._uniformLocations.get("u_charMap"), h = this._uniformLocations.get("u_charMapSize");
      if (u && h) {
        const l = this._characterResolver.resolve(this._compiled.charMapping.chars, s);
        o.uniform1iv(u, l), o.uniform1i(h, l.length);
      }
    }
    let p = 0;
    if (this._compiled.usesFeedback && c?.prevBuffer) {
      const u = this._uniformLocations.get("prevBuffer");
      u && (o.activeTexture(o.TEXTURE0 + p), o.bindTexture(o.TEXTURE_2D, c.prevBuffer), o.uniform1i(u, p), p++);
    }
    if (this._compiled.usesCharFeedback && c?.prevCharBuffer) {
      const u = this._uniformLocations.get("prevCharBuffer");
      u && (o.activeTexture(o.TEXTURE0 + p), o.bindTexture(o.TEXTURE_2D, c.prevCharBuffer), o.uniform1i(u, p), p++);
    }
    if (this._compiled.usesCellColorFeedback && c?.prevCellColorBuffer) {
      const u = this._uniformLocations.get("prevCellColorBuffer");
      u && (o.activeTexture(o.TEXTURE0 + p), o.bindTexture(o.TEXTURE_2D, c.prevCellColorBuffer), o.uniform1i(u, p), p++);
    }
    if (this._compiled.externalTextures && f) for (const u of this._compiled.externalTextures) {
      const h = f.get(u.samplerName);
      if (h) {
        const l = this._uniformLocations.get(u.samplerName);
        l && (o.activeTexture(o.TEXTURE0 + p), o.bindTexture(o.TEXTURE_2D, h), o.uniform1i(l, p), p++);
      }
    }
    o.bindVertexArray(this._vao), o.bindBuffer(o.ARRAY_BUFFER, this._positionBuffer), o.enableVertexAttribArray(0), o.vertexAttribPointer(0, 2, o.FLOAT, !1, 0, 0), o.drawArrays(o.TRIANGLE_STRIP, 0, 4);
    const d = o.getError();
    d !== o.NO_ERROR && console.error("[SynthRenderer] GL error after draw:", d), o.disableVertexAttribArray(0);
    let m = 0;
    if (this._compiled.usesFeedback && c?.prevBuffer && (o.activeTexture(o.TEXTURE0 + m), o.bindTexture(o.TEXTURE_2D, null), m++), this._compiled.usesCharFeedback && c?.prevCharBuffer && (o.activeTexture(o.TEXTURE0 + m), o.bindTexture(o.TEXTURE_2D, null), m++), this._compiled.usesCellColorFeedback && c?.prevCellColorBuffer && (o.activeTexture(o.TEXTURE0 + m), o.bindTexture(o.TEXTURE_2D, null), m++), this._compiled.externalTextures && f) for (const u of this._compiled.externalTextures) f.has(u.samplerName) && (o.activeTexture(o.TEXTURE0 + m), o.bindTexture(o.TEXTURE_2D, null), m++);
    o.bindVertexArray(null), e.end();
  }
  _setUniform(e, r) {
    const a = this._uniformLocations.get(e);
    if (!a) return;
    const n = this._gl;
    if (typeof r == "number") n.uniform1f(a, r);
    else if (Array.isArray(r)) switch (r.length) {
      case 2:
        n.uniform2fv(a, r);
        break;
      case 3:
        n.uniform3fv(a, r);
        break;
      case 4:
        n.uniform4fv(a, r);
    }
  }
  dispose() {
    const e = this._gl;
    this._vao && (e.deleteVertexArray(this._vao), this._vao = void 0), this._positionBuffer && (e.deleteBuffer(this._positionBuffer), this._positionBuffer = void 0), this._uniformLocations.clear(), this._shader = void 0, this._compiled = void 0;
  }
}
const b = "textmode.synth.js";
function St(t, e) {
  const r = /* @__PURE__ */ new Map();
  if (!t || t.length === 0) return r;
  for (const a of t) {
    const n = a.outputRef.output, s = n.getLayer();
    if (!s) {
      console.warn(`[SynthPlugin] External output '${n.id}' has no layer assigned`);
      continue;
    }
    const c = s.drawFramebuffer;
    if (!c?.textures) {
      console.warn(`[SynthPlugin] Layer for output '${n.id}' has no drawFramebuffer textures`);
      continue;
    }
    let f;
    switch (a.outputRef.textureType) {
      case "char":
        f = 0;
        break;
      case "color":
      default:
        f = 1;
        break;
      case "cellColor":
        f = 2;
    }
    const o = c.textures[f] ?? null;
    r.set(a.samplerName, o);
  }
  return r;
}
const Mt = { name: b, version: "1.0.0", install(t, e) {
  const r = e.renderer;
  e.extendLayer("synth", function(a) {
    const n = performance.now() / 1e3, s = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let c = this.getPluginState(b);
    c ? (c.source = a, c.startTime = n, c.shaderNeedsUpdate = !0, s && c.renderer ? (c.compiled = F(a), c.shaderNeedsUpdate = !0) : (c.needsInitialization = !0, c.compiled = void 0)) : c = { source: a, compiled: s ? F(a) : void 0, renderer: void 0, startTime: n, shaderNeedsUpdate: !0, needsInitialization: !s, pingPongBuffers: void 0, pingPongIndex: 0 }, this.setPluginState(b, c);
  }), e.registerLayerPreRenderHook(async (a) => {
    const n = a.getPluginState(b);
    if (!n) return;
    const s = a.grid, c = a.drawFramebuffer;
    if (!s || !c) return;
    !n.needsInitialization && n.compiled || (n.compiled = F(n.source), n.needsInitialization = !1, n.shaderNeedsUpdate = !0), n.renderer || (n.renderer = new bt(t, r), n.shaderNeedsUpdate = !0), n.shaderNeedsUpdate && n.compiled && (await n.renderer.setShader(n.compiled), n.shaderNeedsUpdate = !1);
    const f = n.compiled?.usesFeedback ?? !1, o = n.compiled?.usesCharFeedback ?? !1, p = n.compiled?.usesCellColorFeedback ?? !1, d = f || o || p;
    if (d && !n.pingPongBuffers) {
      const l = t;
      l.createFramebuffer && (n.pingPongBuffers = [l.createFramebuffer({ width: s.cols, height: s.rows, attachments: 3 }), l.createFramebuffer({ width: s.cols, height: s.rows, attachments: 3 })], n.pingPongIndex = 0);
    }
    const m = t.mouse, u = { time: t.millis() / 1e3, frameCount: t.frameCount, width: s.width, height: s.height, cols: s.cols, rows: s.rows, mouseX: m?.x ?? 0, mouseY: m?.y ?? 0 }, h = St(n.compiled?.externalTextures ?? []);
    if (d && n.pingPongBuffers) {
      const l = n.pingPongIndex, i = 1 - n.pingPongIndex, y = n.pingPongBuffers[l], x = n.pingPongBuffers[i], v = { prevBuffer: f ? y?.textures?.[1] ?? null : null, prevCharBuffer: o ? y?.textures?.[0] ?? null : null, prevCellColorBuffer: p ? y?.textures?.[2] ?? null : null };
      n.renderer.render(x, s.cols, s.rows, u, a.font, v, h), n.renderer.render(c, s.cols, s.rows, u, a.font, v, h), n.pingPongIndex = i;
    } else n.renderer.render(c, s.cols, s.rows, u, a.font, void 0, h.size > 0 ? h : void 0);
  }), e.registerLayerDisposedHook((a) => {
    const n = a.getPluginState(b);
    n?.renderer && n.renderer.dispose();
  });
}, uninstall(t, e) {
  const r = [e.layerManager.base, ...e.layerManager.all];
  for (const a of r) {
    const n = a.getPluginState(b);
    n?.renderer && n.renderer.dispose();
  }
  e.removeLayerExtension("synth"), e.removeLayerExtension("clearSynth"), e.removeLayerExtension("hasSynth");
} };
pt(), T.registerMany(lt), R.setSynthSourceClass(M), R.injectMethods(M.prototype);
const _ = R.generateStandaloneFunctions(), wt = _.osc, Ft = _.noise, Rt = _.voronoi, At = _.gradient, Ot = _.shape, It = _.solid, Et = _.src, Ut = _.prev, kt = _.charSrc, Bt = _.cellColorSrc, Vt = _.charNoise, Xt = _.charOsc, Nt = _.charGradient, zt = _.charVoronoi, Lt = _.charShape, Pt = _.charSolid;
export {
  Tt as SELF_OUTPUT,
  O as SynthOutput,
  Mt as SynthPlugin,
  M as SynthSource,
  Bt as cellColorSrc,
  Nt as charGradient,
  Vt as charNoise,
  Xt as charOsc,
  Lt as charShape,
  Pt as charSolid,
  kt as charSrc,
  zt as charVoronoi,
  $t as createOutput,
  At as gradient,
  V as isSynthOutput,
  Ft as noise,
  wt as osc,
  Ut as prev,
  Ot as shape,
  It as solid,
  Et as src,
  Rt as voronoi
};

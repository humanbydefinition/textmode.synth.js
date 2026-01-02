const Y = { src: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, coord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, color: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, combine: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, combineCoord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] }, charModify: { returnType: "vec4", args: [{ type: "vec4", name: "_char" }] } };
function U(t) {
  const e = Y[t.type], a = [...e.args, ...t.inputs.map((r) => ({ type: r.type, name: r.name }))].map((r) => `${r.type} ${r.name}`).join(", "), n = `
${e.returnType} ${t.name}(${a}) {
${t.glsl}
}`;
  return { ...t, glslFunction: n };
}
class X {
  _transforms = /* @__PURE__ */ new Map();
  _processedCache = /* @__PURE__ */ new Map();
  register(e) {
    this._transforms.has(e.name) && console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`), this._transforms.set(e.name, e), this._processedCache.delete(e.name);
  }
  registerMany(e) {
    for (const a of e) this.register(a);
  }
  get(e) {
    return this._transforms.get(e);
  }
  getProcessed(e) {
    let a = this._processedCache.get(e);
    if (!a) {
      const n = this._transforms.get(e);
      n && (a = U(n), this._processedCache.set(e, a));
    }
    return a;
  }
  has(e) {
    return this._transforms.has(e);
  }
  getByType(e) {
    return Array.from(this._transforms.values()).filter((a) => a.type === e);
  }
  getNames() {
    return Array.from(this._transforms.keys());
  }
  getAll() {
    return Array.from(this._transforms.values());
  }
  getSourceTransforms() {
    return this.getByType("src");
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
const w = new X(), L = /* @__PURE__ */ new Set(["src"]);
class B {
  _generatedFunctions = {};
  _synthSourceClass = null;
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const a = w.getAll();
    for (const n of a) this._injectMethod(e, n);
  }
  _injectMethod(e, a) {
    const { name: n, inputs: r, type: o } = a;
    e[n] = o === "combine" || o === "combineCoord" ? function(c, ...i) {
      const u = r.map((_, h) => i[h] ?? _.default);
      return this.addCombineTransform(n, c, u);
    } : function(...c) {
      const i = r.map((u, _) => c[_] ?? u.default);
      return this.addTransform(n, i);
    };
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, a = w.getAll(), n = this._synthSourceClass;
    for (const r of a) if (L.has(r.type)) {
      const { name: o, inputs: c } = r;
      e[o] = (...i) => {
        const u = new n(), _ = c.map((h, p) => i[p] ?? h.default);
        return u.addTransform(o, _);
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, a) {
    if (w.register(e), a && this._injectMethod(a, e), L.has(e.type) && this._synthSourceClass) {
      const n = this._synthSourceClass, { name: r, inputs: o } = e;
      this._generatedFunctions[r] = (...c) => {
        const i = new n(), u = o.map((_, h) => c[h] ?? _.default);
        return i.addTransform(r, u);
      };
    }
  }
}
const I = new B(), E = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, j = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, D = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
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
`, description: "Generate voronoi pattern" }, N = { name: "gradient", type: "src", inputs: [{ name: "speed", type: "float", default: 0 }], glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`, description: "Generate gradient pattern" }, q = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, G = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, K = { name: "src", type: "src", inputs: [], glsl: `
	return texture(prevBuffer, fract(_st));
`, description: "Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context)." }, Q = [E, j, D, N, q, G, K], H = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`, description: "Rotate coordinates" }, W = { name: "scale", type: "coord", inputs: [{ name: "amount", type: "float", default: 1.5 }, { name: "xMult", type: "float", default: 1 }, { name: "yMult", type: "float", default: 1 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`, description: "Scale coordinates" }, J = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, Z = { name: "scrollX", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`, description: "Scroll X coordinate" }, ee = { name: "scrollY", type: "coord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`, description: "Scroll Y coordinate" }, te = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, ne = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, re = { name: "repeatX", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern horizontally" }, ae = { name: "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern vertically" }, oe = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, se = [H, W, J, Z, ee, te, ne, re, ae, oe], ce = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, le = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, ie = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, ue = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`, description: "Adjust saturation" }, fe = { name: "hue", type: "color", inputs: [{ name: "hue", type: "float", default: 0.4 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`, description: "Shift hue" }, pe = { name: "colorama", type: "color", inputs: [{ name: "amount", type: "float", default: 5e-3 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`, description: "Color cycle effect" }, me = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, de = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, he = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`, description: "Threshold" }, ye = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, _e = { name: "r", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.r * scale + offset);
`, description: "Extract red channel" }, ge = { name: "g", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.g * scale + offset);
`, description: "Extract green channel" }, ve = { name: "b", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.b * scale + offset);
`, description: "Extract blue channel" }, xe = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`, description: "Shift color channels by adding offset values" }, Ce = { name: "gamma", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`, description: "Apply gamma correction" }, be = { name: "levels", type: "color", inputs: [{ name: "inMin", type: "float", default: 0 }, { name: "inMax", type: "float", default: 1 }, { name: "outMin", type: "float", default: 0 }, { name: "outMax", type: "float", default: 1 }, { name: "gamma", type: "float", default: 1 }], glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`, description: "Adjust input/output levels and gamma" }, Se = { name: "clampColor", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, $e = [ce, le, ie, ue, fe, pe, me, de, he, ye, _e, ge, ve, xe, Ce, be, Se], Me = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, we = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, Fe = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, Te = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, Re = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, Ie = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, Pe = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, Ae = [Me, we, Fe, Te, Re, Ie, Pe], ke = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, Le = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, Oe = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, ze = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Modulate pixelation with another source" }, Ve = { name: "modulateKaleid", type: "combineCoord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`, description: "Modulate kaleidoscope with another source" }, Ye = { name: "modulateScrollX", type: "combineCoord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`, description: "Modulate X scroll with another source" }, Ue = { name: "modulateScrollY", type: "combineCoord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`, description: "Modulate Y scroll with another source" }, Xe = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, Be = { name: "modulateRepeatX", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate X repeat with another source" }, Ee = { name: "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate Y repeat with another source" }, je = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`, description: "Modulate coordinates based on hue differences" }, De = [ke, Le, Oe, ze, Ve, Ye, Ue, Xe, Be, Ee, je], Ne = { name: "charFlipX", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 2;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters horizontally" }, qe = { name: "charFlipY", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 4;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters vertically" }, Ge = { name: "charInvert", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 1;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Invert character colors" }, Ke = { name: "charRotate", type: "charModify", inputs: [{ name: "angle", type: "float", default: 0.25 }, { name: "speed", type: "float", default: 0 }], glsl: `
	float rotation = fract(angle + time * speed);
	return vec4(_char.rgb, rotation);
`, description: "Rotate characters" }, Qe = [Ne, qe, Ge, Ke], He = [...Q, ...se, ...$e, ...Ae, ...De, ...Qe];
class M {
  _transforms;
  constructor(e) {
    this._transforms = e;
  }
  static empty() {
    return new M([]);
  }
  static from(e) {
    return new M([...e]);
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
    return new M([...this._transforms, e]);
  }
  get(e) {
    return this._transforms[e];
  }
  [Symbol.iterator]() {
    return this._transforms[Symbol.iterator]();
  }
}
class x {
  _chain;
  _charMapping;
  _nestedSources;
  _externalLayerRefs;
  _colorSource;
  _cellColorSource;
  _charSource;
  _charCount;
  constructor(e) {
    this._chain = e?.chain ?? M.empty(), this._charMapping = e?.charMapping, this._colorSource = e?.colorSource, this._cellColorSource = e?.cellColorSource, this._charSource = e?.charSource, this._charCount = e?.charCount, this._nestedSources = e?.nestedSources ?? /* @__PURE__ */ new Map(), this._externalLayerRefs = e?.externalLayerRefs ?? /* @__PURE__ */ new Map();
  }
  addTransform(e, a) {
    const n = { name: e, userArgs: a };
    return this._chain.push(n), this;
  }
  addCombineTransform(e, a, n) {
    const r = this._chain.length;
    return this._nestedSources.set(r, a), this.addTransform(e, n);
  }
  addExternalLayerRef(e) {
    const a = this._chain.length;
    return this._externalLayerRefs.set(a, e), this.addTransform("src", []);
  }
  charMap(e) {
    const a = Array.from(e), n = [];
    for (const r of a) n.push(r.codePointAt(0) ?? 32);
    return this._charMapping = { chars: e, indices: n }, this;
  }
  charColor(e) {
    return this._colorSource = e, this;
  }
  char(e, a) {
    return this._charSource = e, this._charCount = a, this;
  }
  cellColor(e) {
    return this._cellColorSource = e, this;
  }
  paint(e) {
    return this._colorSource = e, this._cellColorSource = e, this;
  }
  clone() {
    const e = /* @__PURE__ */ new Map();
    for (const [n, r] of this._nestedSources) e.set(n, r.clone());
    const a = /* @__PURE__ */ new Map();
    for (const [n, r] of this._externalLayerRefs) a.set(n, { ...r });
    return new x({ chain: M.from(this._chain.transforms), charMapping: this._charMapping, colorSource: this._colorSource?.clone(), cellColorSource: this._cellColorSource?.clone(), charSource: this._charSource?.clone(), charCount: this._charCount, nestedSources: e, externalLayerRefs: a });
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
  get charSource() {
    return this._charSource;
  }
  get charCount() {
    return this._charCount;
  }
  get nestedSources() {
    return this._nestedSources;
  }
  get externalLayerRefs() {
    return this._externalLayerRefs;
  }
}
const P = { linear: (t) => t, easeInQuad: (t) => t * t, easeOutQuad: (t) => t * (2 - t), easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1, easeInCubic: (t) => t * t * t, easeOutCubic: (t) => --t * t * t + 1, easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, easeInQuart: (t) => t * t * t * t, easeOutQuart: (t) => 1 - --t * t * t * t, easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t, easeInQuint: (t) => t * t * t * t * t, easeOutQuint: (t) => 1 + --t * t * t * t * t, easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t, sin: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 };
function T(t, e) {
  return (t % e + e) % e;
}
function We(t, e, a, n, r) {
  return (t - e) * (r - n) / (a - e) + n;
}
function Je() {
  "fast" in Array.prototype || (Array.prototype.fast = function(t = 1) {
    return this._speed = t, this;
  }, Array.prototype.smooth = function(t = 1) {
    return this._smooth = t, this;
  }, Array.prototype.ease = function(t = "linear") {
    return typeof t == "function" ? (this._smooth = 1, this._ease = t) : P[t] && (this._smooth = 1, this._ease = P[t]), this;
  }, Array.prototype.offset = function(t = 0.5) {
    return this._offset = t % 1, this;
  }, Array.prototype.fit = function(t = 0, e = 1) {
    const a = Math.min(...this), n = Math.max(...this), r = this.map((o) => We(o, a, n, t, e));
    return r._speed = this._speed, r._smooth = this._smooth, r._ease = this._ease, r._offset = this._offset, r;
  });
}
function Ze(t, e) {
  const a = t._speed ?? 1, n = t._smooth ?? 0;
  let r = e.time * a * 1 + (t._offset ?? 0);
  if (n !== 0) {
    const o = t._ease ?? P.linear, c = r - n / 2, i = t[Math.floor(T(c, t.length))], u = t[Math.floor(T(c + 1, t.length))];
    return o(Math.min(T(c, 1) / n, 1)) * (u - i) + i;
  }
  return t[Math.floor(T(r, t.length))];
}
function et(t) {
  return Array.isArray(t) && t.length > 0 && typeof t[0] == "number";
}
class tt {
  _uniforms = /* @__PURE__ */ new Map();
  _dynamicUpdaters = /* @__PURE__ */ new Map();
  processArgument(e, a, n) {
    if (et(e)) {
      const r = `${n}_${a.name}`, o = { name: r, type: a.type, value: a.default ?? 0, isDynamic: !0 }, c = (i) => Ze(e, i);
      return this._uniforms.set(r, o), this._dynamicUpdaters.set(r, c), { glslValue: r, uniform: o, updater: c };
    }
    if (typeof e == "function") {
      const r = `${n}_${a.name}`, o = { name: r, type: a.type, value: a.default ?? 0, isDynamic: !0 };
      return this._uniforms.set(r, o), this._dynamicUpdaters.set(r, e), { glslValue: r, uniform: o, updater: e };
    }
    if (typeof e == "number") return { glslValue: v(e) };
    if (Array.isArray(e) && typeof e[0] == "number") {
      const r = e;
      if (r.length === 2) return { glslValue: `vec2(${v(r[0])}, ${v(r[1])})` };
      if (r.length === 3) return { glslValue: `vec3(${v(r[0])}, ${v(r[1])}, ${v(r[2])})` };
      if (r.length === 4) return { glslValue: `vec4(${v(r[0])}, ${v(r[1])}, ${v(r[2])}, ${v(r[3])})` };
    }
    return this.processDefault(a);
  }
  processDefault(e) {
    const a = e.default;
    return typeof a == "number" ? { glslValue: v(a) } : Array.isArray(a) ? { glslValue: `vec${a.length}(${a.map(v).join(", ")})` } : { glslValue: "0.0" };
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
function v(t) {
  const e = t.toString();
  return e.includes(".") ? e : e + ".0";
}
const nt = `
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
function rt(t) {
  const { uniforms: e, glslFunctions: a, mainCode: n, charOutputCode: r, primaryColorVar: o, cellColorVar: c, charMapping: i, usesFeedback: u, usesCharFeedback: _, usesCellColorFeedback: h, externalLayers: p } = t, y = Array.from(e.values()).map((d) => `uniform ${d.type} ${d.name};`).join(`
`);
  let g = "", m = "";
  i && (g = `uniform int u_charMap[${i.indices.length}];
uniform int u_charMapSize;`, m = `
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);
  const f = [];
  u && f.push("uniform sampler2D prevBuffer;"), _ && f.push("uniform sampler2D prevCharBuffer;"), h && f.push("uniform sampler2D prevCellColorBuffer;");
  const l = f.join(`
`), s = [];
  if (p) for (const [, d] of p) d.usesChar && s.push(`uniform sampler2D ${d.uniformPrefix}_char;`), d.usesPrimary && s.push(`uniform sampler2D ${d.uniformPrefix}_primary;`), d.usesCellColor && s.push(`uniform sampler2D ${d.uniformPrefix}_cell;`);
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
${l}
${s.length > 0 ? `// External layer samplers
${s.join(`
`)}` : ""}
${g}

// Dynamic uniforms
${y}

${nt}

// Transform functions
${Array.from(a).join(`
`)}

void main() {
	// Transform chain
${n.join(`
`)}

${r}
${m}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${o};
	o_secondaryColor = ${c};
}
`;
}
function at(t, e, a) {
  return t ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${a}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}
function R(t) {
  return new ot().compile(t);
}
class ot {
  _varCounter = 0;
  _uniformManager = new tt();
  _glslFunctions = /* @__PURE__ */ new Set();
  _mainCode = [];
  _usesFeedback = !1;
  _usesCharFeedback = !1;
  _usesCellColorFeedback = !1;
  _currentTarget = "main";
  _externalLayers = /* @__PURE__ */ new Map();
  _externalLayerCounter = 0;
  _layerIdToPrefix = /* @__PURE__ */ new Map();
  compile(e) {
    this._varCounter = 0, this._uniformManager.clear(), this._glslFunctions.clear(), this._mainCode.length = 0, this._usesFeedback = !1, this._usesCharFeedback = !1, this._usesCellColorFeedback = !1, this._externalLayers.clear(), this._externalLayerCounter = 0, this._layerIdToPrefix.clear();
    const a = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "main");
    let n, r = a.charVar;
    if (e.charSource) {
      const u = this._compileChain(e.charSource, "charSrc", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "char");
      r = "charFromSource_" + this._varCounter++, n = e.charCount ?? 256, this._mainCode.push("	// Convert charSource color to character index"), this._mainCode.push(`	float charLum_${r} = _luminance(${u.colorVar}.rgb);`), this._mainCode.push(`	int charIdx_${r} = int(charLum_${r} * ${n.toFixed(1)});`), this._mainCode.push(`	vec4 ${r} = vec4(float(charIdx_${r} % 256) / 255.0, float(charIdx_${r} / 256) / 255.0, 0.0, 0.0);`);
    }
    let o = a.colorVar;
    e.colorSource && (o = this._compileChain(e.colorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "charColor").colorVar);
    let c = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (c = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)", "v_uv", "cellColor").colorVar);
    const i = at(!!r, r ?? "vec4(0.0)", a.colorVar);
    return { fragmentSource: rt({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: i, primaryColorVar: o, cellColorVar: c, charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback, externalLayers: this._externalLayers }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback, externalLayers: new Map(this._externalLayers) };
  }
  _compileChain(e, a, n, r = "v_uv", o = "main") {
    const c = this._currentTarget;
    this._currentTarget = o;
    const i = `${a}_st`;
    let u, _, h, p = `${a}_c`;
    this._mainCode.push(`	vec2 ${i} = ${r};`), this._mainCode.push(`	vec4 ${p} = ${n};`);
    const y = e.transforms, g = y.map((l) => this._getProcessedTransform(l.name)), m = [];
    for (let l = 0; l < g.length; l++) {
      const s = g[l];
      s && (s.type !== "coord" && s.type !== "combineCoord" || m.push(l));
    }
    const f = (l) => {
      const s = y[l], d = g[l];
      if (!d) return void console.warn(`[SynthCompiler] Unknown transform: ${s.name}`);
      const F = e.externalLayerRefs.get(l);
      if (s.name === "src") if (F) this._trackExternalLayerUsage(F, this._currentTarget);
      else switch (this._currentTarget) {
        case "char":
          this._usesCharFeedback = !0;
          break;
        case "cellColor":
          this._usesCellColorFeedback = !0;
          break;
        default:
          this._usesFeedback = !0;
      }
      const O = this._getContextAwareGlslFunction(d, s.name, F);
      this._glslFunctions.add(O);
      const z = this._processArguments(s.userArgs, d.inputs, `${a}_${l}_${s.name}`), A = e.nestedSources.get(l);
      let k;
      A && (d.type === "combine" || d.type === "combineCoord") && (k = this._compileChain(A, `${a}_nested_${l}`, n, i, o).colorVar);
      const V = this._varCounter++, C = this._generateTransformCode(d, V, i, p, u, _, h, z, k, F);
      p = C.colorVar, C.charVar && (u = C.charVar), C.flagsVar && (_ = C.flagsVar), C.rotationVar && (h = C.rotationVar);
    };
    for (let l = m.length - 1; l >= 0; l--) f(m[l]);
    for (let l = 0; l < y.length; l++) {
      const s = g[l];
      (!s || s.type !== "coord" && s.type !== "combineCoord") && f(l);
    }
    return this._currentTarget = c, { coordVar: i, colorVar: p, charVar: u, flagsVar: _, rotationVar: h };
  }
  _getProcessedTransform(e) {
    return w.getProcessed(e);
  }
  _getContextAwareGlslFunction(e, a, n) {
    if (a !== "src") return e.glslFunction;
    if (n) {
      const o = this._getExternalLayerPrefix(n.layerId), c = { char: `${o}_char`, charColor: `${o}_primary`, cellColor: `${o}_cell`, main: `${o}_primary` }[this._currentTarget];
      return `
vec4 ${`src_ext_${o}_${this._currentTarget}`}(vec2 _st) {
	return texture(${c}, fract(_st));
}
`;
    }
    const r = { char: "prevCharBuffer", charColor: "prevBuffer", cellColor: "prevCellColorBuffer", main: "prevBuffer" }[this._currentTarget];
    return `
vec4 ${`src_${this._currentTarget}`}(vec2 _st) {
	return texture(${r}, fract(_st));
}
`;
  }
  _getExternalLayerPrefix(e) {
    let a = this._layerIdToPrefix.get(e);
    return a || (a = "extLayer" + this._externalLayerCounter++, this._layerIdToPrefix.set(e, a)), a;
  }
  _trackExternalLayerUsage(e, a) {
    const n = this._getExternalLayerPrefix(e.layerId);
    let r = this._externalLayers.get(e.layerId);
    switch (r || (r = { layerId: e.layerId, uniformPrefix: n, usesChar: !1, usesPrimary: !1, usesCellColor: !1 }, this._externalLayers.set(e.layerId, r)), a) {
      case "char":
        r.usesChar = !0;
        break;
      case "cellColor":
        r.usesCellColor = !0;
        break;
      default:
        r.usesPrimary = !0;
    }
  }
  _processArguments(e, a, n) {
    const r = [];
    for (let o = 0; o < a.length; o++) {
      const c = a[o], i = e[o] ?? c.default, u = this._uniformManager.processArgument(i, c, n);
      r.push(u.glslValue);
    }
    return r;
  }
  _generateTransformCode(e, a, n, r, o, c, i, u, _, h) {
    const p = (...s) => [...s, ...u].join(", ");
    let y = e.name;
    e.name === "src" && (h ? y = `src_ext_${this._getExternalLayerPrefix(h.layerId)}_${this._currentTarget}` : y = `src_${this._currentTarget}`);
    let g = r, m = o, f = c, l = i;
    switch (e.type) {
      case "src": {
        const s = `c${a}`;
        this._mainCode.push(`	vec4 ${s} = ${y}(${p(n)});`), g = s;
        break;
      }
      case "coord": {
        const s = `st${a}`;
        this._mainCode.push(`	vec2 ${s} = ${y}(${p(n)});`), this._mainCode.push(`	${n} = ${s};`);
        break;
      }
      case "color": {
        const s = `c${a}`;
        this._mainCode.push(`	vec4 ${s} = ${y}(${p(r)});`), g = s;
        break;
      }
      case "combine": {
        const s = `c${a}`;
        this._mainCode.push(`	vec4 ${s} = ${y}(${p(r, _ ?? "vec4(0.0)")});`), g = s;
        break;
      }
      case "combineCoord": {
        const s = `st${a}`;
        this._mainCode.push(`	vec2 ${s} = ${y}(${p(n, _ ?? "vec4(0.0)")});`), this._mainCode.push(`	${n} = ${s};`);
        break;
      }
      case "charModify":
        m || (m = `char${a}`, f = `flags${a}`, l = `rot${a}`, this._mainCode.push(`	vec4 ${m} = vec4(0.0);`), this._mainCode.push(`	float ${f} = 0.0;`), this._mainCode.push(`	float ${l} = 0.0;`)), this._mainCode.push(`	${m} = ${y}(${p(m)});`);
    }
    return { colorVar: g, charVar: m, flagsVar: f, rotationVar: l };
  }
}
class st {
  _resolvedIndices;
  _lastFontCharacterCount = 0;
  _lastChars = "";
  resolve(e, a) {
    const n = a.characters.length;
    if (this._resolvedIndices && this._lastFontCharacterCount === n && this._lastChars === e) return this._resolvedIndices;
    const r = Array.from(e), o = new Int32Array(r.length), c = a.characterMap, i = a.characters;
    for (let u = 0; u < r.length; u++) {
      const _ = r[u], h = c.get(_);
      if (h !== void 0) o[u] = i.indexOf(h);
      else {
        const p = c.get(" ");
        o[u] = p !== void 0 ? i.indexOf(p) : 0;
      }
    }
    return this._resolvedIndices = o, this._lastFontCharacterCount = n, this._lastChars = e, o;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFontCharacterCount = 0, this._lastChars = "";
  }
}
const b = "textmode.synth.js";
function $(t) {
  const e = /* @__PURE__ */ new Map();
  for (const [, a] of t.externalLayerRefs) e.set(a.layerId, a.layer);
  for (const [, a] of t.nestedSources) {
    const n = $(a);
    for (const [r, o] of n) e.set(r, o);
  }
  if (t.charSource) {
    const a = $(t.charSource);
    for (const [n, r] of a) e.set(n, r);
  }
  if (t.colorSource) {
    const a = $(t.colorSource);
    for (const [n, r] of a) e.set(n, r);
  }
  if (t.cellColorSource) {
    const a = $(t.cellColorSource);
    for (const [n, r] of a) e.set(n, r);
  }
  return e;
}
const it = { name: b, version: "1.0.0", install(t, e) {
  e.extendLayer("synth", function(a) {
    const n = performance.now() / 1e3, r = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let o = this.getPluginState(b);
    o ? (o.source = a, o.startTime = n, o.needsCompile = !0, o.characterResolver.invalidate(), r && (o.compiled = R(a))) : o = { source: a, compiled: r ? R(a) : void 0, shader: void 0, characterResolver: new st(), startTime: n, needsCompile: !0, pingPongBuffers: void 0, pingPongIndex: 0 }, this.setPluginState(b, o);
  }), e.registerLayerPreRenderHook(async (a) => {
    const n = a.getPluginState(b);
    if (!n) return;
    const r = a.grid, o = a.drawFramebuffer;
    if (!r || !o || (n.compiled || (n.compiled = R(n.source), n.externalLayerMap = $(n.source), n.needsCompile = !0), n.needsCompile && n.compiled && (n.shader?.dispose && n.shader.dispose(), n.externalLayerMap = $(n.source), n.shader = await t.createFilterShader(n.compiled.fragmentSource), n.needsCompile = !1), !n.shader || !n.compiled)) return;
    const c = n.compiled.usesFeedback, i = n.compiled.usesCharFeedback, u = n.compiled.usesCellColorFeedback, _ = c || i || u;
    _ && !n.pingPongBuffers && (n.pingPongBuffers = [t.createFramebuffer({ width: r.cols, height: r.rows, attachments: 3 }), t.createFramebuffer({ width: r.cols, height: r.rows, attachments: 3 })], n.pingPongIndex = 0);
    const h = { time: t.millis() / 1e3, frameCount: t.frameCount, width: r.width, height: r.height, cols: r.cols, rows: r.rows }, p = (y) => {
      t.setUniform("time", h.time), t.setUniform("resolution", [h.cols, h.rows]);
      for (const [m, f] of n.compiled.dynamicUpdaters) t.setUniform(m, f(h));
      for (const [m, f] of n.compiled.uniforms) f.isDynamic || typeof f.value == "function" || t.setUniform(m, f.value);
      if (n.compiled.charMapping) {
        const m = n.characterResolver.resolve(n.compiled.charMapping.chars, a.font);
        t.setUniform("u_charMap", m), t.setUniform("u_charMapSize", m.length);
      }
      y && (c && t.setUniform("prevBuffer", y.textures[1]), i && t.setUniform("prevCharBuffer", y.textures[0]), u && t.setUniform("prevCellColorBuffer", y.textures[2]));
      const g = n.compiled.externalLayers;
      if (g && g.size > 0 && n.externalLayerMap) for (const [m, f] of g) {
        const l = n.externalLayerMap.get(m);
        if (!l) {
          console.warn(`[SynthPlugin] External layer not found: ${m}`);
          continue;
        }
        const s = l.getPluginState(b);
        let d;
        s?.pingPongBuffers ? d = s.pingPongBuffers[s.pingPongIndex].textures : l.drawFramebuffer && (d = l.drawFramebuffer.textures), d && (f.usesChar && t.setUniform(`${f.uniformPrefix}_char`, d[0]), f.usesPrimary && t.setUniform(`${f.uniformPrefix}_primary`, d[1]), f.usesCellColor && t.setUniform(`${f.uniformPrefix}_cell`, d[2]));
      }
    };
    if (_ && n.pingPongBuffers) {
      const y = n.pingPongBuffers[n.pingPongIndex], g = n.pingPongBuffers[1 - n.pingPongIndex];
      g.begin(), t.clear(), t.shader(n.shader), p(y), t.rect(r.cols, r.rows), g.end(), o.begin(), t.clear(), t.shader(n.shader), p(y), t.rect(r.cols, r.rows), o.end(), n.pingPongIndex = 1 - n.pingPongIndex;
    } else o.begin(), t.clear(), t.shader(n.shader), p(null), t.rect(r.cols, r.rows), o.end();
  }), e.registerLayerDisposedHook((a) => {
    const n = a.getPluginState(b);
    n && (n.shader?.dispose && n.shader.dispose(), n.pingPongBuffers && (n.pingPongBuffers[0].dispose?.(), n.pingPongBuffers[1].dispose?.()));
  });
}, uninstall(t, e) {
  const a = [e.layerManager.base, ...e.layerManager.all];
  for (const n of a) {
    const r = n.getPluginState(b);
    r && (r.shader?.dispose && r.shader.dispose(), r.pingPongBuffers && (r.pingPongBuffers[0].dispose?.(), r.pingPongBuffers[1].dispose?.()));
  }
  e.removeLayerExtension("synth");
} };
Je(), w.registerMany(He), I.setSynthSourceClass(x), I.injectMethods(x.prototype);
const S = I.generateStandaloneFunctions();
function ct() {
  return (t, e = 256) => {
    const a = new x();
    return a._charSource = t, a._charCount = e, a;
  };
}
const ut = ct(), ft = (t) => {
  const e = new x();
  return e._colorSource = t, e;
}, pt = (t) => {
  const e = new x();
  return e._cellColorSource = t, e;
}, mt = (t) => {
  const e = new x();
  return e._colorSource = t, e._cellColorSource = t, e;
}, dt = S.osc, ht = S.noise, yt = S.voronoi, _t = S.gradient, gt = S.shape, vt = S.solid, xt = lt();
function lt() {
  const t = S.src;
  return (e) => {
    if (!e) return t();
    const a = new x(), n = e.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return a.addExternalLayerRef({ layerId: n, layer: e }), a;
  };
}
export {
  it as SynthPlugin,
  x as SynthSource,
  pt as cellColor,
  ut as char,
  ft as charColor,
  _t as gradient,
  ht as noise,
  dt as osc,
  mt as paint,
  gt as shape,
  vt as solid,
  xt as src,
  yt as voronoi
};

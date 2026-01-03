const B = { src: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, coord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, color: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, combine: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, combineCoord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] }, charModify: { returnType: "vec4", args: [{ type: "vec4", name: "_char" }] } };
function U(r) {
  const e = B[r.type], t = [...e.args, ...r.inputs.map((a) => ({ type: a.type, name: a.name }))].map((a) => `${a.type} ${a.name}`).join(", "), n = `
${e.returnType} ${r.name}(${t}) {
${r.glsl}
}`;
  return { ...r, glslFunction: n };
}
class E {
  _transforms = /* @__PURE__ */ new Map();
  _processedCache = /* @__PURE__ */ new Map();
  register(e) {
    this._transforms.has(e.name) && console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`), this._transforms.set(e.name, e), this._processedCache.delete(e.name);
  }
  registerMany(e) {
    for (const t of e) this.register(t);
  }
  get(e) {
    return this._transforms.get(e);
  }
  getProcessed(e) {
    let t = this._processedCache.get(e);
    if (!t) {
      const n = this._transforms.get(e);
      n && (t = U(n), this._processedCache.set(e, t));
    }
    return t;
  }
  has(e) {
    return this._transforms.has(e);
  }
  getByType(e) {
    return Array.from(this._transforms.values()).filter((t) => t.type === e);
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
const w = new E(), L = /* @__PURE__ */ new Set(["src"]);
class N {
  _generatedFunctions = {};
  _synthSourceClass = null;
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const t = w.getAll();
    for (const n of t) this._injectMethod(e, n);
  }
  _injectMethod(e, t) {
    const { name: n, inputs: a, type: o } = t;
    e[n] = o === "combine" || o === "combineCoord" ? function(l, ...i) {
      const u = a.map((d, g) => i[g] ?? d.default);
      return this.addCombineTransform(n, l, u);
    } : function(...l) {
      const i = a.map((u, d) => l[d] ?? u.default);
      return this.addTransform(n, i);
    };
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, t = w.getAll(), n = this._synthSourceClass;
    for (const a of t) if (L.has(a.type)) {
      const { name: o, inputs: l } = a;
      e[o] = (...i) => {
        const u = new n(), d = l.map((g, f) => i[f] ?? g.default);
        return u.addTransform(o, d);
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, t) {
    if (w.register(e), t && this._injectMethod(t, e), L.has(e.type) && this._synthSourceClass) {
      const n = this._synthSourceClass, { name: a, inputs: o } = e;
      this._generatedFunctions[a] = (...l) => {
        const i = new n(), u = o.map((d, g) => l[g] ?? d.default);
        return i.addTransform(a, u);
      };
    }
  }
}
const R = new N(), j = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, D = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, q = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
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
`, description: "Generate voronoi pattern" }, G = { name: "gradient", type: "src", inputs: [{ name: "speed", type: "float", default: 0 }], glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`, description: "Generate gradient pattern" }, K = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, Q = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, H = { name: "src", type: "src", inputs: [], glsl: `
	return texture(prevBuffer, fract(_st));
`, description: "Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context)." }, W = [j, D, q, G, K, Q, H], J = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`, description: "Rotate coordinates" }, Z = { name: "scale", type: "coord", inputs: [{ name: "amount", type: "float", default: 1.5 }, { name: "xMult", type: "float", default: 1 }, { name: "yMult", type: "float", default: 1 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`, description: "Scale coordinates" }, ee = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, te = { name: "scrollX", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`, description: "Scroll X coordinate" }, re = { name: "scrollY", type: "coord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`, description: "Scroll Y coordinate" }, ne = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, ae = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, oe = { name: "repeatX", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern horizontally" }, se = { name: "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern vertically" }, ce = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, le = [J, Z, ee, te, re, ne, ae, oe, se, ce], ie = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, ue = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, fe = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, de = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`, description: "Adjust saturation" }, pe = { name: "hue", type: "color", inputs: [{ name: "hue", type: "float", default: 0.4 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`, description: "Shift hue" }, me = { name: "colorama", type: "color", inputs: [{ name: "amount", type: "float", default: 5e-3 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`, description: "Color cycle effect" }, he = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, ye = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, ge = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`, description: "Threshold" }, _e = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, ve = { name: "r", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.r * scale + offset);
`, description: "Extract red channel" }, xe = { name: "g", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.g * scale + offset);
`, description: "Extract green channel" }, Ce = { name: "b", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.b * scale + offset);
`, description: "Extract blue channel" }, be = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`, description: "Shift color channels by adding offset values" }, Se = { name: "gamma", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`, description: "Apply gamma correction" }, Te = { name: "levels", type: "color", inputs: [{ name: "inMin", type: "float", default: 0 }, { name: "inMax", type: "float", default: 1 }, { name: "outMin", type: "float", default: 0 }, { name: "outMax", type: "float", default: 1 }, { name: "gamma", type: "float", default: 1 }], glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`, description: "Adjust input/output levels and gamma" }, $e = { name: "clampColor", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, Me = [ie, ue, fe, de, pe, me, he, ye, ge, _e, ve, xe, Ce, be, Se, Te, $e], we = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, Fe = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, Pe = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, Re = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, Ie = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, Ae = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, ke = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, Le = [we, Fe, Pe, Re, Ie, Ae, ke], Oe = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, ze = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, Ye = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, Xe = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
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
`, description: "Modulate kaleidoscope with another source" }, Be = { name: "modulateScrollX", type: "combineCoord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`, description: "Modulate X scroll with another source" }, Ue = { name: "modulateScrollY", type: "combineCoord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`, description: "Modulate Y scroll with another source" }, Ee = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, Ne = { name: "modulateRepeatX", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate X repeat with another source" }, je = { name: "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate Y repeat with another source" }, De = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`, description: "Modulate coordinates based on hue differences" }, qe = [Oe, ze, Ye, Xe, Ve, Be, Ue, Ee, Ne, je, De], Ge = { name: "charFlipX", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 2;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters horizontally" }, Ke = { name: "charFlipY", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 4;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters vertically" }, Qe = { name: "charInvert", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 1;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Invert character colors" }, He = { name: "charRotate", type: "charModify", inputs: [{ name: "angle", type: "float", default: 0.25 }, { name: "speed", type: "float", default: 0 }], glsl: `
	float rotation = fract(angle + time * speed);
	return vec4(_char.rgb, rotation);
`, description: "Rotate characters" }, We = [Ge, Ke, Qe, He], Je = [...W, ...le, ...Me, ...Le, ...qe, ...We];
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
class b {
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
  addTransform(e, t) {
    const n = { name: e, userArgs: t };
    return this._chain.push(n), this;
  }
  addCombineTransform(e, t, n) {
    const a = this._chain.length;
    return this._nestedSources.set(a, t), this.addTransform(e, n);
  }
  addExternalLayerRef(e) {
    const t = this._chain.length;
    return this._externalLayerRefs.set(t, e), this.addTransform("src", []);
  }
  charMap(e) {
    const t = Array.from(e), n = [];
    for (const a of t) n.push(a.codePointAt(0) ?? 32);
    return this._charMapping = { chars: e, indices: n }, this;
  }
  charColor(e) {
    return this._colorSource = e, this;
  }
  char(e, t) {
    return this._charSource = e, this._charCount = t, this;
  }
  cellColor(e) {
    return this._cellColorSource = e, this;
  }
  paint(e) {
    return this._colorSource = e, this._cellColorSource = e, this;
  }
  clone() {
    const e = /* @__PURE__ */ new Map();
    for (const [n, a] of this._nestedSources) e.set(n, a.clone());
    const t = /* @__PURE__ */ new Map();
    for (const [n, a] of this._externalLayerRefs) t.set(n, { ...a });
    return new b({ chain: M.from(this._chain.transforms), charMapping: this._charMapping, colorSource: this._colorSource?.clone(), cellColorSource: this._cellColorSource?.clone(), charSource: this._charSource?.clone(), charCount: this._charCount, nestedSources: e, externalLayerRefs: t });
  }
  osc(e, t, n) {
    return this.addTransform("osc", [e ?? 60, t ?? 0.1, n ?? 0]);
  }
  noise(e, t) {
    return this.addTransform("noise", [e ?? 10, t ?? 0.1]);
  }
  voronoi(e, t, n) {
    return this.addTransform("voronoi", [e ?? 5, t ?? 0.3, n ?? 0.3]);
  }
  gradient(e) {
    return this.addTransform("gradient", [e ?? 0]);
  }
  shape(e, t, n) {
    return this.addTransform("shape", [e ?? 3, t ?? 0.3, n ?? 0.01]);
  }
  solid(e, t, n, a) {
    return this.addTransform("solid", [e ?? 0, t ?? 0, n ?? 0, a ?? 1]);
  }
  src(e) {
    return this.addTransform("src", []);
  }
  rotate(e, t) {
    return this.addTransform("rotate", [e ?? 10, t ?? 0]);
  }
  scale(e, t, n, a, o) {
    return this.addTransform("scale", [e ?? 1.5, t ?? 1, n ?? 1, a ?? 0.5, o ?? 0.5]);
  }
  scroll(e, t, n, a) {
    return this.addTransform("scroll", [e ?? 0.5, t ?? 0.5, n ?? 0, a ?? 0]);
  }
  scrollX(e, t) {
    return this.addTransform("scrollX", [e ?? 0.5, t ?? 0]);
  }
  scrollY(e, t) {
    return this.addTransform("scrollY", [e ?? 0.5, t ?? 0]);
  }
  pixelate(e, t) {
    return this.addTransform("pixelate", [e ?? 20, t ?? 20]);
  }
  repeat(e, t, n, a) {
    return this.addTransform("repeat", [e ?? 3, t ?? 3, n ?? 0, a ?? 0]);
  }
  repeatX(e, t) {
    return this.addTransform("repeatX", [e ?? 3, t ?? 0]);
  }
  repeatY(e, t) {
    return this.addTransform("repeatY", [e ?? 3, t ?? 0]);
  }
  kaleid(e) {
    return this.addTransform("kaleid", [e ?? 4]);
  }
  brightness(e) {
    return this.addTransform("brightness", [e ?? 0.4]);
  }
  contrast(e) {
    return this.addTransform("contrast", [e ?? 1.6]);
  }
  invert(e) {
    return this.addTransform("invert", [e ?? 1]);
  }
  saturate(e) {
    return this.addTransform("saturate", [e ?? 2]);
  }
  hue(e) {
    return this.addTransform("hue", [e ?? 0.4]);
  }
  colorama(e) {
    return this.addTransform("colorama", [e ?? 5e-3]);
  }
  posterize(e, t) {
    return this.addTransform("posterize", [e ?? 3, t ?? 0.6]);
  }
  luma(e, t) {
    return this.addTransform("luma", [e ?? 0.5, t ?? 0.1]);
  }
  thresh(e, t) {
    return this.addTransform("thresh", [e ?? 0.5, t ?? 0.04]);
  }
  color(e, t, n, a) {
    return this.addTransform("color", [e ?? 1, t ?? 1, n ?? 1, a ?? 1]);
  }
  r(e, t) {
    return this.addTransform("r", [e ?? 1, t ?? 0]);
  }
  g(e, t) {
    return this.addTransform("g", [e ?? 1, t ?? 0]);
  }
  b(e, t) {
    return this.addTransform("b", [e ?? 1, t ?? 0]);
  }
  shift(e, t, n, a) {
    return this.addTransform("shift", [e ?? 0.5, t ?? 0, n ?? 0, a ?? 0]);
  }
  gamma(e) {
    return this.addTransform("gamma", [e ?? 1]);
  }
  levels(e, t, n, a, o) {
    return this.addTransform("levels", [e ?? 0, t ?? 1, n ?? 0, a ?? 1, o ?? 1]);
  }
  clampColor(e, t) {
    return this.addTransform("clampColor", [e ?? 0, t ?? 1]);
  }
  add(e, t) {
    return this.addCombineTransform("add", e, [t ?? 0.5]);
  }
  sub(e, t) {
    return this.addCombineTransform("sub", e, [t ?? 0.5]);
  }
  mult(e, t) {
    return this.addCombineTransform("mult", e, [t ?? 0.5]);
  }
  blend(e, t) {
    return this.addCombineTransform("blend", e, [t ?? 0.5]);
  }
  diff(e) {
    return this.addCombineTransform("diff", e, []);
  }
  layer(e) {
    return this.addCombineTransform("layer", e, []);
  }
  mask(e) {
    return this.addCombineTransform("mask", e, []);
  }
  modulate(e, t) {
    return this.addCombineTransform("modulate", e, [t ?? 0.1]);
  }
  modulateScale(e, t, n) {
    return this.addCombineTransform("modulateScale", e, [t ?? 1, n ?? 1]);
  }
  modulateRotate(e, t, n) {
    return this.addCombineTransform("modulateRotate", e, [t ?? 1, n ?? 0]);
  }
  modulatePixelate(e, t, n) {
    return this.addCombineTransform("modulatePixelate", e, [t ?? 10, n ?? 3]);
  }
  modulateKaleid(e, t) {
    return this.addCombineTransform("modulateKaleid", e, [t ?? 4]);
  }
  modulateScrollX(e, t, n) {
    return this.addCombineTransform("modulateScrollX", e, [t ?? 0.5, n ?? 0]);
  }
  modulateScrollY(e, t, n) {
    return this.addCombineTransform("modulateScrollY", e, [t ?? 0.5, n ?? 0]);
  }
  charNoise(e, t, n) {
    return this.addTransform("charNoise", [e ?? 10, t ?? 0.1, n ?? 256]);
  }
  charOsc(e, t, n) {
    return this.addTransform("charOsc", [e ?? 60, t ?? 0.1, n ?? 256]);
  }
  charGradient(e, t) {
    return this.addTransform("charGradient", [e ?? 256, t ?? 0]);
  }
  charVoronoi(e, t, n) {
    return this.addTransform("charVoronoi", [e ?? 5, t ?? 0.3, n ?? 256]);
  }
  charShape(e, t, n, a) {
    return this.addTransform("charShape", [e ?? 3, t ?? 0, n ?? 1, a ?? 0.3]);
  }
  charSolid(e) {
    return this.addTransform("charSolid", [e ?? 0]);
  }
  charFlipX(e) {
    return this.addTransform("charFlipX", [e ?? 1]);
  }
  charFlipY(e) {
    return this.addTransform("charFlipY", [e ?? 1]);
  }
  charInvert(e) {
    return this.addTransform("charInvert", [e ?? 1]);
  }
  charRotate(e, t) {
    return this.addTransform("charRotate", [e ?? 0, t ?? 0]);
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
const I = { linear: (r) => r, easeInQuad: (r) => r * r, easeOutQuad: (r) => r * (2 - r), easeInOutQuad: (r) => r < 0.5 ? 2 * r * r : (4 - 2 * r) * r - 1, easeInCubic: (r) => r * r * r, easeOutCubic: (r) => --r * r * r + 1, easeInOutCubic: (r) => r < 0.5 ? 4 * r * r * r : (r - 1) * (2 * r - 2) * (2 * r - 2) + 1, easeInQuart: (r) => r * r * r * r, easeOutQuart: (r) => 1 - --r * r * r * r, easeInOutQuart: (r) => r < 0.5 ? 8 * r * r * r * r : 1 - 8 * --r * r * r * r, easeInQuint: (r) => r * r * r * r * r, easeOutQuint: (r) => 1 + --r * r * r * r * r, easeInOutQuint: (r) => r < 0.5 ? 16 * r * r * r * r * r : 1 + 16 * --r * r * r * r * r, sin: (r) => (1 + Math.sin(Math.PI * r - Math.PI / 2)) / 2 };
function F(r, e) {
  return (r % e + e) % e;
}
function Ze(r, e, t, n, a) {
  return (r - e) * (a - n) / (t - e) + n;
}
function et() {
  "fast" in Array.prototype || (Array.prototype.fast = function(r = 1) {
    return this._speed = r, this;
  }, Array.prototype.smooth = function(r = 1) {
    return this._smooth = r, this;
  }, Array.prototype.ease = function(r = "linear") {
    return typeof r == "function" ? (this._smooth = 1, this._ease = r) : I[r] && (this._smooth = 1, this._ease = I[r]), this;
  }, Array.prototype.offset = function(r = 0.5) {
    return this._offset = r % 1, this;
  }, Array.prototype.fit = function(r = 0, e = 1) {
    const t = Math.min(...this), n = Math.max(...this), a = this.map((o) => Ze(o, t, n, r, e));
    return a._speed = this._speed, a._smooth = this._smooth, a._ease = this._ease, a._offset = this._offset, a;
  });
}
function tt(r, e) {
  const t = r._speed ?? 1, n = r._smooth ?? 0;
  let a = e.time * t * (e.bpm / 60) + (r._offset ?? 0);
  if (n !== 0) {
    const o = r._ease ?? I.linear, l = a - n / 2, i = r[Math.floor(F(l, r.length))], u = r[Math.floor(F(l + 1, r.length))];
    return o(Math.min(F(l, 1) / n, 1)) * (u - i) + i;
  }
  return r[Math.floor(F(a, r.length))];
}
function rt(r) {
  return Array.isArray(r) && r.length > 0 && typeof r[0] == "number";
}
class nt {
  _uniforms = /* @__PURE__ */ new Map();
  _dynamicUpdaters = /* @__PURE__ */ new Map();
  processArgument(e, t, n) {
    if (rt(e)) {
      const a = `${n}_${t.name}`, o = { name: a, type: t.type, value: t.default ?? 0, isDynamic: !0 }, l = (i) => tt(e, i);
      return this._uniforms.set(a, o), this._dynamicUpdaters.set(a, l), { glslValue: a, uniform: o, updater: l };
    }
    if (typeof e == "function") {
      const a = `${n}_${t.name}`, o = { name: a, type: t.type, value: t.default ?? 0, isDynamic: !0 };
      return this._uniforms.set(a, o), this._dynamicUpdaters.set(a, e), { glslValue: a, uniform: o, updater: e };
    }
    if (typeof e == "number") return { glslValue: v(e) };
    if (Array.isArray(e) && typeof e[0] == "number") {
      const a = e;
      if (a.length === 2) return { glslValue: `vec2(${v(a[0])}, ${v(a[1])})` };
      if (a.length === 3) return { glslValue: `vec3(${v(a[0])}, ${v(a[1])}, ${v(a[2])})` };
      if (a.length === 4) return { glslValue: `vec4(${v(a[0])}, ${v(a[1])}, ${v(a[2])}, ${v(a[3])})` };
    }
    return this.processDefault(t);
  }
  processDefault(e) {
    const t = e.default;
    return typeof t == "number" ? { glslValue: v(t) } : Array.isArray(t) ? { glslValue: `vec${t.length}(${t.map(v).join(", ")})` } : { glslValue: "0.0" };
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
function v(r) {
  const e = r.toString();
  return e.includes(".") ? e : e + ".0";
}
const at = `
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
function ot(r) {
  const { uniforms: e, glslFunctions: t, mainCode: n, charOutputCode: a, primaryColorVar: o, cellColorVar: l, charMapping: i, usesFeedback: u, usesCharFeedback: d, usesCellColorFeedback: g, externalLayers: f } = r, _ = Array.from(e.values()).map((y) => `uniform ${y.type} ${y.name};`).join(`
`);
  let m = "", h = "";
  i && (m = `uniform int u_charMap[${i.indices.length}];
uniform int u_charMapSize;`, h = `
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);
  const p = [];
  u && p.push("uniform sampler2D prevBuffer;"), d && p.push("uniform sampler2D prevCharBuffer;"), g && p.push("uniform sampler2D prevCellColorBuffer;");
  const s = p.join(`
`), c = [];
  if (f) for (const [, y] of f) y.usesChar && c.push(`uniform sampler2D ${y.uniformPrefix}_char;`), y.usesPrimary && c.push(`uniform sampler2D ${y.uniformPrefix}_primary;`), y.usesCellColor && c.push(`uniform sampler2D ${y.uniformPrefix}_cell;`);
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
${s}
${c.length > 0 ? `// External layer samplers
${c.join(`
`)}` : ""}
${m}

// Dynamic uniforms
${_}

${at}

// Transform functions
${Array.from(t).join(`
`)}

void main() {
	// Transform chain
${n.join(`
`)}

${a}
${h}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${o};
	o_secondaryColor = ${l};
}
`;
}
function st(r, e, t) {
  return r ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${t}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}
function P(r) {
  return new ct().compile(r);
}
class ct {
  _varCounter = 0;
  _uniformManager = new nt();
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
    const t = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "main");
    let n, a = t.charVar;
    if (e.charSource) {
      const u = this._compileChain(e.charSource, "charSrc", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "char");
      a = "charFromSource_" + this._varCounter++, n = e.charCount ?? 256, this._mainCode.push("	// Convert charSource color to character index"), this._mainCode.push(`	float charLum_${a} = _luminance(${u.colorVar}.rgb);`), this._mainCode.push(`	int charIdx_${a} = int(charLum_${a} * ${n.toFixed(1)});`), this._mainCode.push(`	vec4 ${a} = vec4(float(charIdx_${a} % 256) / 255.0, float(charIdx_${a} / 256) / 255.0, 0.0, 0.0);`);
    }
    let o = t.colorVar;
    e.colorSource && (o = this._compileChain(e.colorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "charColor").colorVar);
    let l = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (l = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)", "v_uv", "cellColor").colorVar);
    const i = st(!!a, a ?? "vec4(0.0)", t.colorVar);
    return { fragmentSource: ot({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: i, primaryColorVar: o, cellColorVar: l, charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback, externalLayers: this._externalLayers }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback, externalLayers: new Map(this._externalLayers) };
  }
  _compileChain(e, t, n, a = "v_uv", o = "main") {
    const l = this._currentTarget;
    this._currentTarget = o;
    const i = `${t}_st`;
    let u, d, g, f = `${t}_c`;
    this._mainCode.push(`	vec2 ${i} = ${a};`), this._mainCode.push(`	vec4 ${f} = ${n};`);
    const _ = e.transforms, m = _.map((s) => this._getProcessedTransform(s.name)), h = [];
    for (let s = 0; s < m.length; s++) {
      const c = m[s];
      c && (c.type !== "coord" && c.type !== "combineCoord" || h.push(s));
    }
    const p = (s) => {
      const c = _[s], y = m[s];
      if (!y) return void console.warn(`[SynthCompiler] Unknown transform: ${c.name}`);
      const x = e.externalLayerRefs.get(s);
      if (c.name === "src") if (x) this._trackExternalLayerUsage(x, this._currentTarget);
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
      const Y = this._getContextAwareGlslFunction(y, c.name, x);
      this._glslFunctions.add(Y);
      const X = this._processArguments(c.userArgs, y.inputs, `${t}_${s}_${c.name}`), A = e.nestedSources.get(s);
      let k;
      A && (y.type === "combine" || y.type === "combineCoord") && (k = this._compileChain(A, `${t}_nested_${s}`, n, i, o).colorVar);
      const V = this._varCounter++, S = this._generateTransformCode(y, V, i, f, u, d, g, X, k, x);
      f = S.colorVar, S.charVar && (u = S.charVar), S.flagsVar && (d = S.flagsVar), S.rotationVar && (g = S.rotationVar);
    };
    for (let s = h.length - 1; s >= 0; s--) p(h[s]);
    for (let s = 0; s < _.length; s++) {
      const c = m[s];
      (!c || c.type !== "coord" && c.type !== "combineCoord") && p(s);
    }
    return this._currentTarget = l, { coordVar: i, colorVar: f, charVar: u, flagsVar: d, rotationVar: g };
  }
  _getProcessedTransform(e) {
    return w.getProcessed(e);
  }
  _getContextAwareGlslFunction(e, t, n) {
    if (t !== "src") return e.glslFunction;
    if (n) {
      const o = this._getExternalLayerPrefix(n.layerId), l = { char: `${o}_char`, charColor: `${o}_primary`, cellColor: `${o}_cell`, main: `${o}_primary` }[this._currentTarget];
      return `
vec4 ${`src_ext_${o}_${this._currentTarget}`}(vec2 _st) {
	return texture(${l}, fract(_st));
}
`;
    }
    const a = { char: "prevCharBuffer", charColor: "prevBuffer", cellColor: "prevCellColorBuffer", main: "prevBuffer" }[this._currentTarget];
    return `
vec4 ${`src_${this._currentTarget}`}(vec2 _st) {
	return texture(${a}, fract(_st));
}
`;
  }
  _getExternalLayerPrefix(e) {
    let t = this._layerIdToPrefix.get(e);
    return t || (t = "extLayer" + this._externalLayerCounter++, this._layerIdToPrefix.set(e, t)), t;
  }
  _trackExternalLayerUsage(e, t) {
    const n = this._getExternalLayerPrefix(e.layerId);
    let a = this._externalLayers.get(e.layerId);
    switch (a || (a = { layerId: e.layerId, uniformPrefix: n, usesChar: !1, usesPrimary: !1, usesCellColor: !1 }, this._externalLayers.set(e.layerId, a)), t) {
      case "char":
        a.usesChar = !0;
        break;
      case "cellColor":
        a.usesCellColor = !0;
        break;
      default:
        a.usesPrimary = !0;
    }
  }
  _processArguments(e, t, n) {
    const a = [];
    for (let o = 0; o < t.length; o++) {
      const l = t[o], i = e[o] ?? l.default, u = this._uniformManager.processArgument(i, l, n);
      a.push(u.glslValue);
    }
    return a;
  }
  _generateTransformCode(e, t, n, a, o, l, i, u, d, g) {
    const f = (...c) => [...c, ...u].join(", ");
    let _ = e.name;
    e.name === "src" && (g ? _ = `src_ext_${this._getExternalLayerPrefix(g.layerId)}_${this._currentTarget}` : _ = `src_${this._currentTarget}`);
    let m = a, h = o, p = l, s = i;
    switch (e.type) {
      case "src": {
        const c = `c${t}`;
        this._mainCode.push(`	vec4 ${c} = ${_}(${f(n)});`), m = c;
        break;
      }
      case "coord": {
        const c = `st${t}`;
        this._mainCode.push(`	vec2 ${c} = ${_}(${f(n)});`), this._mainCode.push(`	${n} = ${c};`);
        break;
      }
      case "color": {
        const c = `c${t}`;
        this._mainCode.push(`	vec4 ${c} = ${_}(${f(a)});`), m = c;
        break;
      }
      case "combine": {
        const c = `c${t}`;
        this._mainCode.push(`	vec4 ${c} = ${_}(${f(a, d ?? "vec4(0.0)")});`), m = c;
        break;
      }
      case "combineCoord": {
        const c = `st${t}`;
        this._mainCode.push(`	vec2 ${c} = ${_}(${f(n, d ?? "vec4(0.0)")});`), this._mainCode.push(`	${n} = ${c};`);
        break;
      }
      case "charModify":
        h || (h = `char${t}`, p = `flags${t}`, s = `rot${t}`, this._mainCode.push(`	vec4 ${h} = vec4(0.0);`), this._mainCode.push(`	float ${p} = 0.0;`), this._mainCode.push(`	float ${s} = 0.0;`)), this._mainCode.push(`	${h} = ${_}(${f(h)});`);
    }
    return { colorVar: m, charVar: h, flagsVar: p, rotationVar: s };
  }
}
class O {
  _resolvedIndices;
  _lastFontCharacterCount = 0;
  _lastChars = "";
  resolve(e, t) {
    const n = t.characters.length;
    if (this._resolvedIndices && this._lastFontCharacterCount === n && this._lastChars === e) return this._resolvedIndices;
    const a = Array.from(e), o = new Int32Array(a.length), l = t.characterMap, i = t.characters;
    for (let u = 0; u < a.length; u++) {
      const d = a[u], g = l.get(d);
      if (g !== void 0) o[u] = i.indexOf(g);
      else {
        const f = l.get(" ");
        o[u] = f !== void 0 ? i.indexOf(f) : 0;
      }
    }
    return this._resolvedIndices = o, this._lastFontCharacterCount = n, this._lastChars = e, o;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFontCharacterCount = 0, this._lastChars = "";
  }
}
let z = 60;
function lt(r) {
  z = r;
}
function it() {
  return z;
}
const C = "textmode.synth.js";
function $(r) {
  const e = /* @__PURE__ */ new Map();
  for (const [, t] of r.externalLayerRefs) e.set(t.layerId, t.layer);
  for (const [, t] of r.nestedSources) {
    const n = $(t);
    for (const [a, o] of n) e.set(a, o);
  }
  if (r.charSource) {
    const t = $(r.charSource);
    for (const [n, a] of t) e.set(n, a);
  }
  if (r.colorSource) {
    const t = $(r.colorSource);
    for (const [n, a] of t) e.set(n, a);
  }
  if (r.cellColorSource) {
    const t = $(r.cellColorSource);
    for (const [n, a] of t) e.set(n, a);
  }
  return e;
}
const dt = { name: C, version: "1.0.0", install(r, e) {
  r.bpm = function(t) {
    return lt(t), t;
  }, e.extendLayer("synth", function(t) {
    const n = performance.now() / 1e3, a = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let o = this.getPluginState(C);
    o ? (o.source = t, o.startTime = n, o.needsCompile = !0, o.characterResolver.invalidate(), a && (o.compiled = P(t))) : o = { source: t, compiled: a ? P(t) : void 0, shader: void 0, characterResolver: new O(), startTime: n, needsCompile: !0, pingPongBuffers: void 0, pingPongIndex: 0 }, this.setPluginState(C, o);
  }), e.extendLayer("bpm", function(t) {
    let n = this.getPluginState(C);
    if (n) n.bpm = t;
    else {
      const a = performance.now() / 1e3;
      n = { source: new b(), compiled: void 0, shader: void 0, characterResolver: new O(), startTime: a, needsCompile: !1, pingPongBuffers: void 0, pingPongIndex: 0, bpm: t };
    }
    this.setPluginState(C, n);
  }), e.extendLayer("clearSynth", function() {
    const t = this.getPluginState(C);
    t && (t.shader?.dispose && t.shader.dispose(), t.pingPongBuffers && (t.pingPongBuffers[0].dispose?.(), t.pingPongBuffers[1].dispose?.()), this.setPluginState(C, void 0));
  }), e.registerLayerPreRenderHook(async (t) => {
    const n = t.getPluginState(C);
    if (!n) return;
    const a = t.grid, o = t.drawFramebuffer;
    if (!a || !o || (n.compiled || (n.compiled = P(n.source), n.externalLayerMap = $(n.source), n.needsCompile = !0), n.needsCompile && n.compiled && (n.shader?.dispose && n.shader.dispose(), n.externalLayerMap = $(n.source), n.shader = await r.createFilterShader(n.compiled.fragmentSource), n.needsCompile = !1), !n.shader || !n.compiled)) return;
    const l = n.compiled.usesFeedback, i = n.compiled.usesCharFeedback, u = n.compiled.usesCellColorFeedback, d = l || i || u;
    d && !n.pingPongBuffers && (n.pingPongBuffers = [r.createFramebuffer({ width: a.cols, height: a.rows, attachments: 3 }), r.createFramebuffer({ width: a.cols, height: a.rows, attachments: 3 })], n.pingPongIndex = 0);
    const g = n.bpm ?? it(), f = { time: r.millis() / 1e3, frameCount: r.frameCount, width: a.width, height: a.height, cols: a.cols, rows: a.rows, bpm: g }, _ = (m) => {
      r.setUniform("time", f.time), r.setUniform("resolution", [f.cols, f.rows]);
      for (const [p, s] of n.compiled.dynamicUpdaters) r.setUniform(p, s(f));
      for (const [p, s] of n.compiled.uniforms) s.isDynamic || typeof s.value == "function" || r.setUniform(p, s.value);
      if (n.compiled.charMapping) {
        const p = n.characterResolver.resolve(n.compiled.charMapping.chars, t.font);
        r.setUniform("u_charMap", p), r.setUniform("u_charMapSize", p.length);
      }
      m && (l && r.setUniform("prevBuffer", m.textures[1]), i && r.setUniform("prevCharBuffer", m.textures[0]), u && r.setUniform("prevCellColorBuffer", m.textures[2]));
      const h = n.compiled.externalLayers;
      if (h && h.size > 0 && n.externalLayerMap) for (const [p, s] of h) {
        const c = n.externalLayerMap.get(p);
        if (!c) {
          console.warn(`[SynthPlugin] External layer not found: ${p}`);
          continue;
        }
        const y = c.getPluginState(C);
        let x;
        y?.pingPongBuffers ? x = y.pingPongBuffers[y.pingPongIndex].textures : c.drawFramebuffer && (x = c.drawFramebuffer.textures), x && (s.usesChar && r.setUniform(`${s.uniformPrefix}_char`, x[0]), s.usesPrimary && r.setUniform(`${s.uniformPrefix}_primary`, x[1]), s.usesCellColor && r.setUniform(`${s.uniformPrefix}_cell`, x[2]));
      }
    };
    if (d && n.pingPongBuffers) {
      const m = n.pingPongBuffers[n.pingPongIndex], h = n.pingPongBuffers[1 - n.pingPongIndex];
      h.begin(), r.clear(), r.shader(n.shader), _(m), r.rect(a.cols, a.rows), h.end(), o.begin(), r.clear(), r.shader(n.shader), _(m), r.rect(a.cols, a.rows), o.end(), n.pingPongIndex = 1 - n.pingPongIndex;
    } else o.begin(), r.clear(), r.shader(n.shader), _(null), r.rect(a.cols, a.rows), o.end();
  }), e.registerLayerDisposedHook((t) => {
    const n = t.getPluginState(C);
    n && (n.shader?.dispose && n.shader.dispose(), n.pingPongBuffers && (n.pingPongBuffers[0].dispose?.(), n.pingPongBuffers[1].dispose?.()));
  });
}, uninstall(r, e) {
  const t = [e.layerManager.base, ...e.layerManager.all];
  for (const n of t) {
    const a = n.getPluginState(C);
    a && (a.shader?.dispose && a.shader.dispose(), a.pingPongBuffers && (a.pingPongBuffers[0].dispose?.(), a.pingPongBuffers[1].dispose?.()));
  }
  delete r.bpm, e.removeLayerExtension("synth"), e.removeLayerExtension("bpm"), e.removeLayerExtension("clearSynth");
} };
et(), w.registerMany(Je), R.setSynthSourceClass(b), R.injectMethods(b.prototype);
const T = R.generateStandaloneFunctions();
function ut() {
  return (r, e = 256) => {
    const t = new b();
    return t._charSource = r, t._charCount = e, t;
  };
}
const pt = ut(), mt = (r) => {
  const e = new b();
  return e._colorSource = r, e;
}, ht = (r) => {
  const e = new b();
  return e._cellColorSource = r, e;
}, yt = (r) => {
  const e = new b();
  return e._colorSource = r, e._cellColorSource = r, e;
}, gt = T.osc, _t = T.noise, vt = T.voronoi, xt = T.gradient, Ct = T.shape, bt = T.solid, St = ft();
function ft() {
  const r = T.src;
  return (e) => {
    if (!e) return r();
    const t = new b(), n = e.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    return t.addExternalLayerRef({ layerId: n, layer: e }), t;
  };
}
export {
  dt as SynthPlugin,
  b as SynthSource,
  ht as cellColor,
  pt as char,
  mt as charColor,
  xt as gradient,
  _t as noise,
  gt as osc,
  yt as paint,
  Ct as shape,
  bt as solid,
  St as src,
  vt as voronoi
};

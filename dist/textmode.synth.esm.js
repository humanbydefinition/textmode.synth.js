const G = { src: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, coord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, color: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, combine: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, combineCoord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] } };
function q(t) {
  const e = G[t.type], n = [...e.args, ...t.inputs.map((a) => ({ type: a.type, name: a.name }))].map((a) => `${a.type} ${a.name}`).join(", "), r = `
${e.returnType} ${t.name}(${n}) {
${t.glsl}
}`;
  return { ...t, glslFunction: r };
}
class K {
  _transforms = /* @__PURE__ */ new Map();
  _processedCache = /* @__PURE__ */ new Map();
  register(e) {
    this._transforms.has(e.name) && console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`), this._transforms.set(e.name, e), this._processedCache.delete(e.name);
  }
  registerMany(e) {
    for (const n of e) this.register(n);
  }
  get(e) {
    return this._transforms.get(e);
  }
  getProcessed(e) {
    let n = this._processedCache.get(e);
    if (!n) {
      const r = this._transforms.get(e);
      r && (n = q(r), this._processedCache.set(e, n));
    }
    return n;
  }
  has(e) {
    return this._transforms.has(e);
  }
  getByType(e) {
    return Array.from(this._transforms.values()).filter((n) => n.type === e);
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
const k = new K(), V = /* @__PURE__ */ new Set(["src"]);
class Q {
  _generatedFunctions = {};
  _synthSourceClass = null;
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const n = k.getAll();
    for (const r of n) this._injectMethod(e, r);
  }
  _injectMethod(e, n) {
    const { name: r, inputs: a, type: o } = n;
    e[r] = o === "combine" || o === "combineCoord" ? function(c, ...s) {
      const u = a.map((i, f) => s[f] ?? i.default);
      return this.addCombineTransform(r, c, u);
    } : function(...c) {
      const s = a.map((u, i) => c[i] ?? u.default);
      return this.addTransform(r, s);
    };
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, n = k.getAll(), r = this._synthSourceClass;
    for (const a of n) if (V.has(a.type)) {
      const { name: o, inputs: c } = a;
      e[o] = (...s) => {
        const u = new r(), i = c.map((f, d) => s[d] ?? f.default);
        return u.addTransform(o, i);
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, n) {
    if (k.register(e), n && this._injectMethod(n, e), V.has(e.type) && this._synthSourceClass) {
      const r = this._synthSourceClass, { name: a, inputs: o } = e;
      this._generatedFunctions[a] = (...c) => {
        const s = new r(), u = o.map((i, f) => c[f] ?? i.default);
        return s.addTransform(a, u);
      };
    }
  }
}
const R = new Q(), H = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, W = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, J = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
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
`, description: "Generate voronoi pattern" }, Z = { name: "gradient", type: "src", inputs: [{ name: "speed", type: "float", default: 0 }], glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`, description: "Generate gradient pattern" }, ee = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, te = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, ne = { name: "src", type: "src", inputs: [], glsl: `
	return texture(prevCharColorBuffer, fract(_st));
`, description: "Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context)." }, re = [H, W, J, Z, ee, te, ne], ae = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`, description: "Rotate coordinates" }, oe = { name: "scale", type: "coord", inputs: [{ name: "amount", type: "float", default: 1.5 }, { name: "xMult", type: "float", default: 1 }, { name: "yMult", type: "float", default: 1 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`, description: "Scale coordinates" }, se = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, ce = { name: "scrollX", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`, description: "Scroll X coordinate" }, le = { name: "scrollY", type: "coord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`, description: "Scroll Y coordinate" }, ie = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, ue = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, fe = { name: "repeatX", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern horizontally" }, pe = { name: "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern vertically" }, me = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, de = [ae, oe, se, ce, le, ie, ue, fe, pe, me], he = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, ye = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, ge = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, _e = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`, description: "Adjust saturation" }, ve = { name: "hue", type: "color", inputs: [{ name: "hue", type: "float", default: 0.4 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`, description: "Shift hue" }, xe = { name: "colorama", type: "color", inputs: [{ name: "amount", type: "float", default: 5e-3 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`, description: "Color cycle effect" }, Ce = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, be = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, Se = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`, description: "Threshold" }, Me = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, we = { name: "r", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.r * scale + offset);
`, description: "Extract red channel" }, $e = { name: "g", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.g * scale + offset);
`, description: "Extract green channel" }, Fe = { name: "b", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.b * scale + offset);
`, description: "Extract blue channel" }, ke = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`, description: "Shift color channels by adding offset values" }, Te = { name: "gamma", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`, description: "Apply gamma correction" }, Le = { name: "levels", type: "color", inputs: [{ name: "inMin", type: "float", default: 0 }, { name: "inMax", type: "float", default: 1 }, { name: "outMin", type: "float", default: 0 }, { name: "outMax", type: "float", default: 1 }, { name: "gamma", type: "float", default: 1 }], glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`, description: "Adjust input/output levels and gamma" }, Ie = { name: "clamp", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, Pe = [he, ye, ge, _e, ve, xe, Ce, be, Se, Me, we, $e, Fe, ke, Te, Le, Ie], Re = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, Ae = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, ze = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, Ee = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, Oe = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, Ve = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, Ue = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, Be = [Re, Ae, ze, Ee, Oe, Ve, Ue], Ne = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, Ye = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, Xe = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, De = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Modulate pixelation with another source" }, je = { name: "modulateKaleid", type: "combineCoord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`, description: "Modulate kaleidoscope with another source" }, Ge = { name: "modulateScrollX", type: "combineCoord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`, description: "Modulate X scroll with another source" }, qe = { name: "modulateScrollY", type: "combineCoord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`, description: "Modulate Y scroll with another source" }, Ke = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, Qe = { name: "modulateRepeatX", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate X repeat with another source" }, He = { name: "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate Y repeat with another source" }, We = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`, description: "Modulate coordinates based on hue differences" }, Je = [Ne, Ye, Xe, De, je, Ge, qe, Ke, Qe, He, We], Ze = [...re, ...de, ...Pe, ...Be, ...Je];
class $ {
  _transforms;
  constructor(e) {
    this._transforms = e;
  }
  static empty() {
    return new $([]);
  }
  static from(e) {
    return new $([...e]);
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
    return new $([...this._transforms, e]);
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
    this._chain = e?.chain ?? $.empty(), this._charMapping = e?.charMapping, this._colorSource = e?.colorSource, this._cellColorSource = e?.cellColorSource, this._charSource = e?.charSource, this._charCount = e?.charCount, this._nestedSources = e?.nestedSources ?? /* @__PURE__ */ new Map(), this._externalLayerRefs = e?.externalLayerRefs ?? /* @__PURE__ */ new Map();
  }
  addTransform(e, n) {
    const r = { name: e, userArgs: n };
    return this._chain.push(r), this;
  }
  addCombineTransform(e, n, r) {
    const a = this._chain.length;
    return this._nestedSources.set(a, n), this.addTransform(e, r);
  }
  addExternalLayerRef(e) {
    const n = this._chain.length;
    return this._externalLayerRefs.set(n, e), this.addTransform("src", []);
  }
  charMap(e) {
    const n = Array.from(e), r = [];
    for (const a of n) r.push(a.codePointAt(0) ?? 32);
    return this._charMapping = { chars: e, indices: r }, this;
  }
  charColor(e) {
    return this._colorSource = e, this;
  }
  char(e, n) {
    return this._charSource = e, this._charCount = n, this;
  }
  cellColor(e) {
    return this._cellColorSource = e, this;
  }
  paint(e) {
    return this._colorSource = e, this._cellColorSource = e, this;
  }
  clone() {
    const e = /* @__PURE__ */ new Map();
    for (const [r, a] of this._nestedSources) e.set(r, a.clone());
    const n = /* @__PURE__ */ new Map();
    for (const [r, a] of this._externalLayerRefs) n.set(r, { ...a });
    return new b({ chain: $.from(this._chain.transforms), charMapping: this._charMapping, colorSource: this._colorSource?.clone(), cellColorSource: this._cellColorSource?.clone(), charSource: this._charSource?.clone(), charCount: this._charCount, nestedSources: e, externalLayerRefs: n });
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
const A = { linear: (t) => t, easeInQuad: (t) => t * t, easeOutQuad: (t) => t * (2 - t), easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1, easeInCubic: (t) => t * t * t, easeOutCubic: (t) => --t * t * t + 1, easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, easeInQuart: (t) => t * t * t * t, easeOutQuart: (t) => 1 - --t * t * t * t, easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t, easeInQuint: (t) => t * t * t * t * t, easeOutQuint: (t) => 1 + --t * t * t * t * t, easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t, sin: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 };
function T(t, e) {
  return (t % e + e) % e;
}
function et(t, e, n, r, a) {
  return (t - e) * (a - r) / (n - e) + r;
}
function tt() {
  "fast" in Array.prototype || (Array.prototype.fast = function(t = 1) {
    return this._speed = t, this;
  }, Array.prototype.smooth = function(t = 1) {
    return this._smooth = t, this;
  }, Array.prototype.ease = function(t = "linear") {
    return typeof t == "function" ? (this._smooth = 1, this._ease = t) : A[t] && (this._smooth = 1, this._ease = A[t]), this;
  }, Array.prototype.offset = function(t = 0.5) {
    return this._offset = t % 1, this;
  }, Array.prototype.fit = function(t = 0, e = 1) {
    const n = Math.min(...this), r = Math.max(...this), a = this.map((o) => et(o, n, r, t, e));
    return a._speed = this._speed, a._smooth = this._smooth, a._ease = this._ease, a._offset = this._offset, a;
  });
}
function nt(t, e) {
  const n = t._speed ?? 1, r = t._smooth ?? 0;
  let a = e.time * n * (e.bpm / 60) + (t._offset ?? 0);
  if (r !== 0) {
    const o = t._ease ?? A.linear, c = a - r / 2, s = t[Math.floor(T(c, t.length))], u = t[Math.floor(T(c + 1, t.length))];
    return o(Math.min(T(c, 1) / r, 1)) * (u - s) + s;
  }
  return t[Math.floor(T(a, t.length))];
}
function rt(t) {
  return Array.isArray(t) && t.length > 0 && typeof t[0] == "number";
}
tt(), k.registerMany(Ze), R.setSynthSourceClass(b), R.injectMethods(b.prototype);
const M = R.generateStandaloneFunctions(), C = "textmode.synth.js";
class at {
  _usesFeedback = !1;
  _usesCharFeedback = !1;
  _usesCellColorFeedback = !1;
  trackUsage(e) {
    switch (e) {
      case "char":
        this._usesCharFeedback = !0;
        break;
      case "cellColor":
        this._usesCellColorFeedback = !0;
        break;
      default:
        this._usesFeedback = !0;
    }
  }
  reset() {
    this._usesFeedback = !1, this._usesCharFeedback = !1, this._usesCellColorFeedback = !1;
  }
  getUsage() {
    return { usesCharColorFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback };
  }
  get usesAnyFeedback() {
    return this._usesFeedback || this._usesCharFeedback || this._usesCellColorFeedback;
  }
  get usesCharColorFeedback() {
    return this._usesFeedback;
  }
  get usesCharFeedback() {
    return this._usesCharFeedback;
  }
  get usesCellColorFeedback() {
    return this._usesCellColorFeedback;
  }
}
class ot {
  _externalLayers = /* @__PURE__ */ new Map();
  _counter = 0;
  _layerIdToPrefix = /* @__PURE__ */ new Map();
  getPrefix(e) {
    let n = this._layerIdToPrefix.get(e);
    return n || (n = "extLayer" + this._counter++, this._layerIdToPrefix.set(e, n)), n;
  }
  trackUsage(e, n) {
    const r = this.getPrefix(e.layerId);
    let a = this._externalLayers.get(e.layerId);
    switch (a || (a = { layerId: e.layerId, uniformPrefix: r, usesChar: !1, usesCharColor: !1, usesCellColor: !1 }, this._externalLayers.set(e.layerId, a)), n) {
      case "char":
        a.usesChar = !0;
        break;
      case "cellColor":
        a.usesCellColor = !0;
        break;
      default:
        a.usesCharColor = !0;
    }
  }
  hasLayer(e) {
    return this._externalLayers.has(e);
  }
  getLayerInfo(e) {
    return this._externalLayers.get(e);
  }
  getExternalLayers() {
    return new Map(this._externalLayers);
  }
  get hasExternalLayers() {
    return this._externalLayers.size > 0;
  }
  get count() {
    return this._externalLayers.size;
  }
  reset() {
    this._externalLayers.clear(), this._counter = 0, this._layerIdToPrefix.clear();
  }
}
const st = { char: "prevCharBuffer", charColor: "prevCharColorBuffer", cellColor: "prevCellColorBuffer", main: "prevCharColorBuffer" };
class ct {
  getContextAwareGlslFunction(e, n, r, a, o) {
    return n !== "src" ? e.glslFunction : a && o ? this._generateExternalSrcFunction(a, r, o) : this._generateSelfFeedbackSrcFunction(r);
  }
  getFunctionName(e, n, r, a) {
    return e.name !== "src" ? e.name : r && a ? `src_ext_${a(r.layerId)}_${n}` : `src_${n}`;
  }
  generateTransformCode(e, n, r, a, o, c, s, u, i, f, d, v, h) {
    const p = this.getFunctionName(n, f, v, h), y = (..._) => [..._, ...i].join(", ");
    let l = o, m = c, g = s, F = u;
    switch (n.type) {
      case "src": {
        const _ = `c${r}`;
        e.push(`	vec4 ${_} = ${p}(${y(a)});`), l = _;
        break;
      }
      case "coord": {
        const _ = `st${r}`;
        e.push(`	vec2 ${_} = ${p}(${y(a)});`), e.push(`	${a} = ${_};`);
        break;
      }
      case "color": {
        const _ = `c${r}`;
        e.push(`	vec4 ${_} = ${p}(${y(o)});`), l = _;
        break;
      }
      case "combine": {
        const _ = `c${r}`;
        e.push(`	vec4 ${_} = ${p}(${y(o, d ?? "vec4(0.0)")});`), l = _;
        break;
      }
      case "combineCoord": {
        const _ = `st${r}`;
        e.push(`	vec2 ${_} = ${p}(${y(a, d ?? "vec4(0.0)")});`), e.push(`	${a} = ${_};`);
        break;
      }
    }
    return { colorVar: l, charVar: m, flagsVar: g, rotationVar: F };
  }
  _generateExternalSrcFunction(e, n, r) {
    const a = r(e.layerId);
    return `
vec4 ${`src_ext_${a}_${n}`}(vec2 _st) {
	return texture(${{ char: `${a}_char`, charColor: `${a}_primary`, cellColor: `${a}_cell`, main: `${a}_primary` }[n]}, fract(_st));
}
`;
  }
  _generateSelfFeedbackSrcFunction(e) {
    return `
vec4 ${`src_${e}`}(vec2 _st) {
	return texture(${st[e]}, fract(_st));
}
`;
  }
}
class lt {
  _uniforms = /* @__PURE__ */ new Map();
  _dynamicUpdaters = /* @__PURE__ */ new Map();
  processArgument(e, n, r) {
    if (rt(e)) {
      const a = `${r}_${n.name}`, o = { name: a, type: n.type, value: n.default ?? 0, isDynamic: !0 }, c = (s) => nt(e, s);
      return this._uniforms.set(a, o), this._dynamicUpdaters.set(a, c), { glslValue: a, uniform: o, updater: c };
    }
    if (typeof e == "function") {
      const a = `${r}_${n.name}`, o = { name: a, type: n.type, value: n.default ?? 0, isDynamic: !0 };
      return this._uniforms.set(a, o), this._dynamicUpdaters.set(a, e), { glslValue: a, uniform: o, updater: e };
    }
    if (typeof e == "number") return { glslValue: x(e) };
    if (Array.isArray(e) && typeof e[0] == "number") {
      const a = e;
      if (a.length === 2) return { glslValue: `vec2(${x(a[0])}, ${x(a[1])})` };
      if (a.length === 3) return { glslValue: `vec3(${x(a[0])}, ${x(a[1])}, ${x(a[2])})` };
      if (a.length === 4) return { glslValue: `vec4(${x(a[0])}, ${x(a[1])}, ${x(a[2])}, ${x(a[3])})` };
    }
    return this.processDefault(n);
  }
  processDefault(e) {
    const n = e.default;
    return typeof n == "number" ? { glslValue: x(n) } : Array.isArray(n) ? { glslValue: `vec${n.length}(${n.map(x).join(", ")})` } : { glslValue: "0.0" };
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
function x(t) {
  const e = t.toString();
  return e.includes(".") ? e : e + ".0";
}
const it = `
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
function ut(t) {
  const { uniforms: e, glslFunctions: n, mainCode: r, charOutputCode: a, primaryColorVar: o, cellColorVar: c, charMapping: s, usesFeedback: u, usesCharFeedback: i, usesCellColorFeedback: f, externalLayers: d } = t, v = Array.from(e.values()).map((g) => `uniform ${g.type} ${g.name};`).join(`
`);
  let h = "", p = "";
  s && (h = `uniform int u_charMap[${s.indices.length}];
uniform int u_charMapSize;`, p = `
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);
  const y = [];
  u && y.push("uniform sampler2D prevCharColorBuffer;"), i && y.push("uniform sampler2D prevCharBuffer;"), f && y.push("uniform sampler2D prevCellColorBuffer;");
  const l = y.join(`
`), m = [];
  if (d) for (const [, g] of d) g.usesChar && m.push(`uniform sampler2D ${g.uniformPrefix}_char;`), g.usesCharColor && m.push(`uniform sampler2D ${g.uniformPrefix}_primary;`), g.usesCellColor && m.push(`uniform sampler2D ${g.uniformPrefix}_cell;`);
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
${m.length > 0 ? `// External layer samplers
${m.join(`
`)}` : ""}
${h}

// Dynamic uniforms
${v}

${it}

// Transform functions
${Array.from(n).join(`
`)}

void main() {
	// Transform chain
${r.join(`
`)}

${a}
${p}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${o};
	o_secondaryColor = ${c};
}
`;
}
function ft(t, e, n) {
  return t ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${n}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}
function z(t) {
  return new pt().compile(t);
}
class pt {
  _uniformManager = new lt();
  _feedbackTracker = new at();
  _externalLayerManager = new ot();
  _codeGenerator = new ct();
  _glslFunctions = /* @__PURE__ */ new Set();
  _mainCode = [];
  _varCounter = 0;
  _currentTarget = "main";
  compile(e) {
    this._reset();
    const n = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "main");
    let r = n.charVar;
    e.charSource && (r = this._compileCharSource(e));
    let a = n.colorVar;
    e.colorSource && (a = this._compileChain(e.colorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "charColor").colorVar);
    let o = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (o = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)", "v_uv", "cellColor").colorVar);
    const c = ft(!!r, r ?? "vec4(0.0)", n.colorVar), s = this._feedbackTracker.getUsage();
    return { fragmentSource: ut({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: c, primaryColorVar: a, cellColorVar: o, charMapping: e.charMapping, usesFeedback: s.usesCharColorFeedback, usesCharFeedback: s.usesCharFeedback, usesCellColorFeedback: s.usesCellColorFeedback, externalLayers: this._externalLayerManager.getExternalLayers() }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesCharColorFeedback: s.usesCharColorFeedback, usesCharFeedback: s.usesCharFeedback, usesCellColorFeedback: s.usesCellColorFeedback, externalLayers: this._externalLayerManager.getExternalLayers() };
  }
  _reset() {
    this._varCounter = 0, this._uniformManager.clear(), this._feedbackTracker.reset(), this._externalLayerManager.reset(), this._glslFunctions.clear(), this._mainCode.length = 0, this._currentTarget = "main";
  }
  _compileCharSource(e) {
    const n = this._compileChain(e.charSource, "charSrc", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "char"), r = "charFromSource_" + this._varCounter++, a = e.charCount ?? 256;
    return this._mainCode.push("	// Convert charSource color to character index"), this._mainCode.push(`	float charLum_${r} = _luminance(${n.colorVar}.rgb);`), this._mainCode.push(`	int charIdx_${r} = int(charLum_${r} * ${a.toFixed(1)});`), this._mainCode.push(`	vec4 ${r} = vec4(float(charIdx_${r} % 256) / 255.0, float(charIdx_${r} / 256) / 255.0, 0.0, 0.0);`), r;
  }
  _compileChain(e, n, r, a = "v_uv", o = "main") {
    const c = this._currentTarget;
    this._currentTarget = o;
    const s = `${n}_st`;
    let u, i, f, d = `${n}_c`;
    this._mainCode.push(`	vec2 ${s} = ${a};`), this._mainCode.push(`	vec4 ${d} = ${r};`);
    const v = e.transforms, h = v.map((l) => this._getProcessedTransform(l.name)), p = this._identifyCoordTransforms(h), y = (l) => {
      const m = v[l], g = h[l];
      if (!g) return void console.warn(`[SynthCompiler] Unknown transform: ${m.name}`);
      const F = e.externalLayerRefs.get(l);
      m.name === "src" && this._trackSrcUsage(F);
      const _ = this._codeGenerator.getContextAwareGlslFunction(g, m.name, this._currentTarget, F, (I) => this._externalLayerManager.getPrefix(I));
      this._glslFunctions.add(_);
      const j = this._processArguments(m.userArgs, g.inputs, `${n}_${l}_${m.name}`), E = e.nestedSources.get(l);
      let O;
      E && (g.type === "combine" || g.type === "combineCoord") && (O = this._compileChain(E, `${n}_nested_${l}`, r, s, o).colorVar);
      const S = this._codeGenerator.generateTransformCode(this._mainCode, g, this._varCounter++, s, d, u, i, f, j, this._currentTarget, O, F, (I) => this._externalLayerManager.getPrefix(I));
      d = S.colorVar, S.charVar && (u = S.charVar), S.flagsVar && (i = S.flagsVar), S.rotationVar && (f = S.rotationVar);
    };
    for (let l = p.length - 1; l >= 0; l--) y(p[l]);
    for (let l = 0; l < v.length; l++) {
      const m = h[l];
      (!m || m.type !== "coord" && m.type !== "combineCoord") && y(l);
    }
    return this._currentTarget = c, { coordVar: s, colorVar: d, charVar: u, flagsVar: i, rotationVar: f };
  }
  _identifyCoordTransforms(e) {
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const a = e[r];
      a && (a.type !== "coord" && a.type !== "combineCoord" || n.push(r));
    }
    return n;
  }
  _trackSrcUsage(e) {
    e ? this._externalLayerManager.trackUsage(e, this._currentTarget) : this._feedbackTracker.trackUsage(this._currentTarget);
  }
  _getProcessedTransform(e) {
    return k.getProcessed(e);
  }
  _processArguments(e, n, r) {
    const a = [];
    for (let o = 0; o < n.length; o++) {
      const c = n[o], s = e[o] ?? c.default, u = this._uniformManager.processArgument(s, c, r);
      a.push(u.glslValue);
    }
    return a;
  }
}
class L {
  static _fontIndexCache = /* @__PURE__ */ new WeakMap();
  _resolvedIndices;
  _lastFont;
  _lastChars = "";
  resolve(e, n) {
    if (this._resolvedIndices && this._lastFont === n && this._lastChars === e) return this._resolvedIndices;
    let r = L._fontIndexCache.get(n);
    if (!r) {
      r = /* @__PURE__ */ new Map();
      const i = n.characters;
      for (let f = 0; f < i.length; f++) r.set(i[f], f);
      L._fontIndexCache.set(n, r);
    }
    const a = Array.from(e), o = new Int32Array(a.length), c = n.characterMap, s = c.get(" "), u = s && r.has(s) ? r.get(s) : 0;
    for (let i = 0; i < a.length; i++) {
      const f = a[i], d = c.get(f);
      if (d) {
        const v = r.get(d);
        o[i] = v !== void 0 ? v : u;
      } else o[i] = u;
    }
    return this._resolvedIndices = o, this._lastFont = n, this._lastChars = e, o;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFont = void 0, this._lastChars = "";
  }
}
function N(t = {}) {
  return { source: t.source ?? new b(), compiled: t.compiled, shader: t.shader, characterResolver: t.characterResolver ?? new L(), needsCompile: t.needsCompile ?? !1, pingPongBuffers: t.pingPongBuffers, pingPongIndex: t.pingPongIndex ?? 0, externalLayerMap: t.externalLayerMap, bpm: t.bpm };
}
function mt(t) {
  t.extendLayer("synth", function(e) {
    const n = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let r = this.getPluginState(C);
    r ? (r.source = e, r.needsCompile = !0, r.characterResolver.invalidate(), n && (r.compiled = z(e))) : r = N({ source: e, compiled: n ? z(e) : void 0, needsCompile: !0 }), this.setPluginState(C, r);
  });
}
function dt(t) {
  t.extendLayer("clearSynth", function() {
    const e = this.getPluginState(C);
    e && (e.shader?.dispose && e.shader.dispose(), e.pingPongBuffers && (e.pingPongBuffers[0].dispose?.(), e.pingPongBuffers[1].dispose?.()), this.setPluginState(C, void 0));
  });
}
function ht(t) {
  t.extendLayer("bpm", function(e) {
    let n = this.getPluginState(C);
    n ? n.bpm = e : n = N({ bpm: e }), this.setPluginState(C, n);
  });
}
let Y = 60;
function yt(t) {
  Y = t;
}
function gt() {
  return Y;
}
function _t(t) {
  t.bpm = function(e) {
    return yt(e), e;
  };
}
function w(t) {
  const e = /* @__PURE__ */ new Map();
  for (const [, n] of t.externalLayerRefs) e.set(n.layerId, n.layer);
  for (const [, n] of t.nestedSources) {
    const r = w(n);
    for (const [a, o] of r) e.set(a, o);
  }
  if (t.charSource) {
    const n = w(t.charSource);
    for (const [r, a] of n) e.set(r, a);
  }
  if (t.colorSource) {
    const n = w(t.colorSource);
    for (const [r, a] of n) e.set(r, a);
  }
  if (t.cellColorSource) {
    const n = w(t.cellColorSource);
    for (const [r, a] of n) e.set(r, a);
  }
  return e;
}
let X = null;
function St(t) {
  X = t;
}
const P = /* @__PURE__ */ new Map(), U = /* @__PURE__ */ new Map();
function B(t, e, n) {
  const r = n ?? X;
  if (r) try {
    r(t, e);
  } catch {
  }
  else {
    const a = Date.now();
    if (a - (U.get(e) ?? 0) >= 1e3) {
      U.set(e, a);
      const o = t instanceof Error ? t.message : String(t);
      console.warn(`[textmode.synth.js] Dynamic parameter error in "${e}": ${o}`);
    }
  }
}
function vt(t, e, n) {
  try {
    const r = t();
    if (!xt(r)) {
      B(new Error(`Invalid dynamic parameter value: ${D(r)}`), e, n.onError);
      const a = P.get(e);
      return a !== void 0 ? a : n.fallback;
    }
    return P.set(e, r), r;
  } catch (r) {
    B(r, e, n.onError);
    const a = P.get(e);
    return a !== void 0 ? a : n.fallback;
  }
}
function D(t) {
  if (t === void 0) return "undefined";
  if (t === null) return "null";
  if (typeof t == "number") {
    if (Number.isNaN(t)) return "NaN";
    if (!Number.isFinite(t)) return t > 0 ? "Infinity" : "-Infinity";
  }
  if (Array.isArray(t)) {
    const e = t.findIndex((n) => typeof n != "number" || !Number.isFinite(n));
    if (e >= 0) return `array with invalid element at index ${e}: ${D(t[e])}`;
  }
  return String(t);
}
function xt(t) {
  return t != null && (typeof t == "number" ? Number.isFinite(t) : !!Array.isArray(t) && t.length > 0 && t.every((e) => typeof e == "number" && Number.isFinite(e)));
}
async function Ct(t, e) {
  const n = t.getPluginState(C);
  if (!n) return;
  const r = t.grid, a = t.drawFramebuffer;
  if (!r || !a || (n.compiled || (n.compiled = z(n.source), n.externalLayerMap = w(n.source), n.needsCompile = !0), n.needsCompile && n.compiled && (n.shader?.dispose && n.shader.dispose(), n.externalLayerMap = w(n.source), n.shader = await e.createFilterShader(n.compiled.fragmentSource), n.needsCompile = !1), !n.shader || !n.compiled)) return;
  const o = n.compiled.usesCharColorFeedback, c = n.compiled.usesCharFeedback, s = n.compiled.usesCellColorFeedback, u = o || c || s;
  u && !n.pingPongBuffers && (n.pingPongBuffers = [e.createFramebuffer({ width: r.cols, height: r.rows, attachments: 3 }), e.createFramebuffer({ width: r.cols, height: r.rows, attachments: 3 })], n.pingPongIndex = 0);
  const i = { time: e.secs, frameCount: e.frameCount, width: r.width, height: r.height, cols: r.cols, rows: r.rows, bpm: n.bpm ?? gt() }, f = (d) => {
    e.setUniform("time", e.secs), e.setUniform("resolution", [i.cols, i.rows]);
    for (const [h, p] of n.compiled.dynamicUpdaters) {
      const y = n.compiled.uniforms.get(h), l = vt(() => p(i), h, { fallback: y?.value ?? 0, onError: n.onDynamicError });
      e.setUniform(h, l);
    }
    for (const [h, p] of n.compiled.uniforms) p.isDynamic || typeof p.value == "function" || e.setUniform(h, p.value);
    if (n.compiled.charMapping) {
      const h = n.characterResolver.resolve(n.compiled.charMapping.chars, t.font);
      e.setUniform("u_charMap", h), e.setUniform("u_charMapSize", h.length);
    }
    d && (o && e.setUniform("prevCharColorBuffer", d.textures[1]), c && e.setUniform("prevCharBuffer", d.textures[0]), s && e.setUniform("prevCellColorBuffer", d.textures[2]));
    const v = n.compiled.externalLayers;
    if (v && v.size > 0 && n.externalLayerMap) for (const [h, p] of v) {
      const y = n.externalLayerMap.get(h);
      if (!y) {
        console.warn(`[textmode.synth.js] External layer not found: ${h}`);
        continue;
      }
      const l = y.getPluginState(C);
      let m;
      l?.pingPongBuffers ? m = l.pingPongBuffers[l.pingPongIndex].textures : y.drawFramebuffer && (m = y.drawFramebuffer.textures), m && (p.usesChar && e.setUniform(`${p.uniformPrefix}_char`, m[0]), p.usesCharColor && e.setUniform(`${p.uniformPrefix}_primary`, m[1]), p.usesCellColor && e.setUniform(`${p.uniformPrefix}_cell`, m[2]));
    }
  };
  if (u && n.pingPongBuffers) {
    const d = n.pingPongBuffers[n.pingPongIndex], v = n.pingPongBuffers[1 - n.pingPongIndex];
    v.begin(), e.clear(), e.shader(n.shader), f(d), e.rect(r.cols, r.rows), v.end(), a.begin(), e.clear(), e.shader(n.shader), f(d), e.rect(r.cols, r.rows), a.end(), n.pingPongIndex = 1 - n.pingPongIndex;
  } else a.begin(), e.clear(), e.shader(n.shader), f(null), e.rect(r.cols, r.rows), a.end();
}
function bt(t) {
  const e = t.getPluginState(C);
  e && (e.shader?.dispose && e.shader.dispose(), e.pingPongBuffers && (e.pingPongBuffers[0].dispose?.(), e.pingPongBuffers[1].dispose?.()));
}
const Mt = { name: C, version: "1.0.0", install(t, e) {
  _t(t), mt(e), ht(e), dt(e), e.registerLayerPreRenderHook((n) => Ct(n, t)), e.registerLayerDisposedHook(bt);
}, uninstall(t, e) {
  const n = [e.layerManager.base, ...e.layerManager.all];
  for (const r of n) {
    const a = r.getPluginState(C);
    a && (a.shader?.dispose && a.shader.dispose(), a.pingPongBuffers && (a.pingPongBuffers[0].dispose?.(), a.pingPongBuffers[1].dispose?.()));
  }
  delete t.bpm, e.removeLayerExtension("synth"), e.removeLayerExtension("bpm"), e.removeLayerExtension("clearSynth");
} }, wt = (t) => {
  const e = new b();
  return e._colorSource = t, e;
}, $t = (t, e) => {
  const n = new b();
  return n._charSource = t, n._charCount = e, n;
}, Ft = (t) => {
  const e = new b();
  return e._colorSource = t, e;
};
function kt(t) {
  return M.gradient(t);
}
function Tt(t, e) {
  return M.noise(t, e);
}
function Lt(t, e, n) {
  return M.osc(t, e, n);
}
const It = (t) => {
  const e = new b();
  return e._colorSource = t, e._cellColorSource = t, e;
};
function Pt(t, e, n) {
  return M.shape(t, e, n);
}
function Rt(t, e, n, r) {
  return M.solid(t, e, n, r);
}
const At = (t) => {
  const e = M.src;
  if (!t) return e();
  const n = new b(), r = t.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return n.addExternalLayerRef({ layerId: r, layer: t }), n;
};
function zt(t, e, n) {
  return M.voronoi(t, e, n);
}
export {
  Mt as SynthPlugin,
  b as SynthSource,
  wt as cellColor,
  $t as char,
  Ft as charColor,
  kt as gradient,
  Tt as noise,
  Lt as osc,
  It as paint,
  St as setGlobalErrorCallback,
  Pt as shape,
  Rt as solid,
  At as src,
  zt as voronoi
};

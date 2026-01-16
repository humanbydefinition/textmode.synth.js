const X = { src: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, coord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, color: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, combine: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, combineCoord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] } };
function D(t) {
  const e = X[t.type], r = [...e.args, ...t.inputs.map((n) => ({ type: n.type, name: n.name }))].map((n) => `${n.type} ${n.name}`).join(", "), a = `
${e.returnType} ${t.name}(${r}) {
${t.glsl}
}`;
  return { ...t, glslFunction: a };
}
class j {
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
      a && (r = D(a), this._processedCache.set(e, r));
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
const k = new j(), O = /* @__PURE__ */ new Set(["src"]);
class G {
  _generatedFunctions = {};
  _synthSourceClass = null;
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const r = k.getAll();
    for (const a of r) this._injectMethod(e, a);
  }
  _injectMethod(e, r) {
    const { name: a, inputs: n, type: o } = r;
    e[a] = o === "combine" || o === "combineCoord" ? function(l, ...s) {
      const i = n.map((m, h) => s[h] ?? m.default);
      return this.addCombineTransform(a, l, i);
    } : function(...l) {
      const s = n.map((i, m) => l[m] ?? i.default);
      return this.addTransform(a, s);
    };
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, r = k.getAll(), a = this._synthSourceClass;
    for (const n of r) if (O.has(n.type)) {
      const { name: o, inputs: l } = n;
      e[o] = (...s) => {
        const i = new a(), m = l.map((h, y) => s[y] ?? h.default);
        return i.addTransform(o, m);
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, r) {
    if (k.register(e), r && this._injectMethod(r, e), O.has(e.type) && this._synthSourceClass) {
      const a = this._synthSourceClass, { name: n, inputs: o } = e;
      this._generatedFunctions[n] = (...l) => {
        const s = new a(), i = o.map((m, h) => l[h] ?? m.default);
        return s.addTransform(n, i);
      };
    }
  }
}
const P = new G(), q = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, K = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, Q = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
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
`, description: "Generate gradient pattern" }, W = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, J = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, Z = { name: "src", type: "src", inputs: [], glsl: `
	return texture(prevCharColorBuffer, fract(_st));
`, description: "Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context)." }, ee = [q, K, Q, H, W, J, Z], te = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
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
`, description: "Scale coordinates" }, ne = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, ae = { name: "scrollX", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`, description: "Scroll X coordinate" }, oe = { name: "scrollY", type: "coord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`, description: "Scroll Y coordinate" }, se = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, ce = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, le = { name: "repeatX", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern horizontally" }, ie = { name: "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern vertically" }, ue = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, fe = [te, re, ne, ae, oe, se, ce, le, ie, ue], pe = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, me = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, de = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, he = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
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
`, description: "Color cycle effect" }, _e = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, ve = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, xe = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`, description: "Threshold" }, Ce = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, be = { name: "r", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.r * scale + offset);
`, description: "Extract red channel" }, Se = { name: "g", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.g * scale + offset);
`, description: "Extract green channel" }, Me = { name: "b", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.b * scale + offset);
`, description: "Extract blue channel" }, $e = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
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
`, description: "Adjust input/output levels and gamma" }, ke = { name: "clamp", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, Te = [pe, me, de, he, ye, ge, _e, ve, xe, Ce, be, Se, Me, $e, we, Fe, ke], Le = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, Pe = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, Ie = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, Re = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, Ae = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, ze = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, Oe = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, Ue = [Le, Pe, Ie, Re, Ae, ze, Oe], Ve = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, Ee = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, Be = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, Ne = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
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
`, description: "Modulate kaleidoscope with another source" }, Xe = { name: "modulateScrollX", type: "combineCoord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`, description: "Modulate X scroll with another source" }, De = { name: "modulateScrollY", type: "combineCoord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`, description: "Modulate Y scroll with another source" }, je = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, Ge = { name: "modulateRepeatX", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate X repeat with another source" }, qe = { name: "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate Y repeat with another source" }, Ke = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`, description: "Modulate coordinates based on hue differences" }, Qe = [Ve, Ee, Be, Ne, Ye, Xe, De, je, Ge, qe, Ke], He = [...ee, ...fe, ...Te, ...Ue, ...Qe];
class F {
  _transforms;
  constructor(e) {
    this._transforms = e;
  }
  static empty() {
    return new F([]);
  }
  static from(e) {
    return new F([...e]);
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
    return new F([...this._transforms, e]);
  }
  get(e) {
    return this._transforms[e];
  }
  [Symbol.iterator]() {
    return this._transforms[Symbol.iterator]();
  }
}
class S {
  _chain;
  _charMapping;
  _nestedSources;
  _externalLayerRefs;
  _colorSource;
  _cellColorSource;
  _charSource;
  constructor(e) {
    this._chain = e?.chain ?? F.empty(), this._charMapping = e?.charMapping, this._colorSource = e?.colorSource, this._cellColorSource = e?.cellColorSource, this._charSource = e?.charSource, this._nestedSources = e?.nestedSources ?? /* @__PURE__ */ new Map(), this._externalLayerRefs = e?.externalLayerRefs ?? /* @__PURE__ */ new Map();
  }
  addTransform(e, r) {
    const a = { name: e, userArgs: r };
    return this._chain.push(a), this;
  }
  addCombineTransform(e, r, a) {
    const n = this._chain.length;
    return this._nestedSources.set(n, r), this.addTransform(e, a);
  }
  addExternalLayerRef(e) {
    const r = this._chain.length;
    return this._externalLayerRefs.set(r, e), this.addTransform("src", []);
  }
  charMap(e) {
    const r = Array.from(e), a = [];
    for (const n of r) a.push(n.codePointAt(0) ?? 32);
    return this._charMapping = { chars: e, indices: a }, this;
  }
  charColor(e) {
    return this._colorSource = e, this;
  }
  char(e) {
    return this._charSource = e, this;
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
    const r = /* @__PURE__ */ new Map();
    for (const [a, n] of this._externalLayerRefs) r.set(a, { ...n });
    return new S({ chain: F.from(this._chain.transforms), charMapping: this._charMapping, colorSource: this._colorSource?.clone(), cellColorSource: this._cellColorSource?.clone(), charSource: this._charSource?.clone(), nestedSources: e, externalLayerRefs: r });
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
  get nestedSources() {
    return this._nestedSources;
  }
  get externalLayerRefs() {
    return this._externalLayerRefs;
  }
}
const I = { linear: (t) => t, easeInQuad: (t) => t * t, easeOutQuad: (t) => t * (2 - t), easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1, easeInCubic: (t) => t * t * t, easeOutCubic: (t) => --t * t * t + 1, easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, easeInQuart: (t) => t * t * t * t, easeOutQuart: (t) => 1 - --t * t * t * t, easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t, easeInQuint: (t) => t * t * t * t * t, easeOutQuint: (t) => 1 + --t * t * t * t * t, easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t, sin: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 };
function T(t, e) {
  return (t % e + e) % e;
}
function We(t, e, r, a, n) {
  return (t - e) * (n - a) / (r - e) + a;
}
function Je() {
  "fast" in Array.prototype || (Array.prototype.fast = function(t = 1) {
    return this._speed = t, this;
  }, Array.prototype.smooth = function(t = 1) {
    return this._smooth = t, this;
  }, Array.prototype.ease = function(t = "linear") {
    return typeof t == "function" ? (this._smooth = 1, this._ease = t) : I[t] && (this._smooth = 1, this._ease = I[t]), this;
  }, Array.prototype.offset = function(t = 0.5) {
    return this._offset = t % 1, this;
  }, Array.prototype.fit = function(t = 0, e = 1) {
    const r = Math.min(...this), a = Math.max(...this), n = this.map((o) => We(o, r, a, t, e));
    return n._speed = this._speed, n._smooth = this._smooth, n._ease = this._ease, n._offset = this._offset, n;
  });
}
function Ze(t, e) {
  const r = t._speed ?? 1, a = t._smooth ?? 0;
  let n = e.time * r * (e.bpm / 60) + (t._offset ?? 0);
  if (a !== 0) {
    const o = t._ease ?? I.linear, l = n - a / 2, s = t[Math.floor(T(l, t.length))], i = t[Math.floor(T(l + 1, t.length))];
    return o(Math.min(T(l, 1) / a, 1)) * (i - s) + s;
  }
  return t[Math.floor(T(n, t.length))];
}
function et(t) {
  return Array.isArray(t) && t.length > 0 && typeof t[0] == "number";
}
Je(), k.registerMany(He), P.setSynthSourceClass(S), P.injectMethods(S.prototype);
const $ = P.generateStandaloneFunctions(), b = "textmode.synth.js";
class tt {
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
class rt {
  _externalLayers = /* @__PURE__ */ new Map();
  _counter = 0;
  _layerIdToPrefix = /* @__PURE__ */ new Map();
  getPrefix(e) {
    let r = this._layerIdToPrefix.get(e);
    return r || (r = "extLayer" + this._counter++, this._layerIdToPrefix.set(e, r)), r;
  }
  trackUsage(e, r) {
    const a = this.getPrefix(e.layerId);
    let n = this._externalLayers.get(e.layerId);
    switch (n || (n = { layerId: e.layerId, uniformPrefix: a, usesChar: !1, usesCharColor: !1, usesCellColor: !1 }, this._externalLayers.set(e.layerId, n)), r) {
      case "char":
        n.usesChar = !0;
        break;
      case "cellColor":
        n.usesCellColor = !0;
        break;
      default:
        n.usesCharColor = !0;
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
const nt = { char: "prevCharBuffer", charColor: "prevCharColorBuffer", cellColor: "prevCellColorBuffer", main: "prevCharColorBuffer" };
class at {
  getContextAwareGlslFunction(e, r, a, n, o) {
    return r !== "src" ? e.glslFunction : n && o ? this._generateExternalSrcFunction(n, a, o) : this._generateSelfFeedbackSrcFunction(a);
  }
  getFunctionName(e, r, a, n) {
    return e.name !== "src" ? e.name : a && n ? `src_ext_${n(a.layerId)}_${r}` : `src_${r}`;
  }
  generateTransformCode(e, r, a, n, o, l, s, i, m, h, y, d, v) {
    const p = this.getFunctionName(r, h, d, v), f = (...u) => [...u, ...m].join(", ");
    let c = o, g = l, _ = s, C = i;
    switch (r.type) {
      case "src": {
        const u = `c${a}`;
        e.push(`	vec4 ${u} = ${p}(${f(n)});`), c = u;
        break;
      }
      case "coord": {
        const u = `st${a}`;
        e.push(`	vec2 ${u} = ${p}(${f(n)});`), e.push(`	${n} = ${u};`);
        break;
      }
      case "color": {
        const u = `c${a}`;
        e.push(`	vec4 ${u} = ${p}(${f(o)});`), c = u;
        break;
      }
      case "combine": {
        const u = `c${a}`;
        e.push(`	vec4 ${u} = ${p}(${f(o, y ?? "vec4(0.0)")});`), c = u;
        break;
      }
      case "combineCoord": {
        const u = `st${a}`;
        e.push(`	vec2 ${u} = ${p}(${f(n, y ?? "vec4(0.0)")});`), e.push(`	${n} = ${u};`);
        break;
      }
    }
    return { colorVar: c, charVar: g, flagsVar: _, rotationVar: C };
  }
  _generateExternalSrcFunction(e, r, a) {
    const n = a(e.layerId);
    return `
vec4 ${`src_ext_${n}_${r}`}(vec2 _st) {
	return texture(${{ char: `${n}_char`, charColor: `${n}_primary`, cellColor: `${n}_cell`, main: `${n}_primary` }[r]}, fract(_st));
}
`;
  }
  _generateSelfFeedbackSrcFunction(e) {
    return `
vec4 ${`src_${e}`}(vec2 _st) {
	return texture(${nt[e]}, fract(_st));
}
`;
  }
}
class ot {
  _uniforms = /* @__PURE__ */ new Map();
  _dynamicUpdaters = /* @__PURE__ */ new Map();
  processArgument(e, r, a) {
    if (et(e)) {
      const n = `${a}_${r.name}`, o = { name: n, type: r.type, value: r.default ?? 0, isDynamic: !0 }, l = (s) => Ze(e, s);
      return this._uniforms.set(n, o), this._dynamicUpdaters.set(n, l), { glslValue: n, uniform: o, updater: l };
    }
    if (typeof e == "function") {
      const n = `${a}_${r.name}`, o = { name: n, type: r.type, value: r.default ?? 0, isDynamic: !0 };
      return this._uniforms.set(n, o), this._dynamicUpdaters.set(n, e), { glslValue: n, uniform: o, updater: e };
    }
    if (typeof e == "number") return { glslValue: x(e) };
    if (Array.isArray(e) && typeof e[0] == "number") {
      const n = e;
      if (n.length === 2) return { glslValue: `vec2(${x(n[0])}, ${x(n[1])})` };
      if (n.length === 3) return { glslValue: `vec3(${x(n[0])}, ${x(n[1])}, ${x(n[2])})` };
      if (n.length === 4) return { glslValue: `vec4(${x(n[0])}, ${x(n[1])}, ${x(n[2])}, ${x(n[3])})` };
    }
    return this.processDefault(r);
  }
  processDefault(e) {
    const r = e.default;
    return typeof r == "number" ? { glslValue: x(r) } : Array.isArray(r) ? { glslValue: `vec${r.length}(${r.map(x).join(", ")})` } : { glslValue: "0.0" };
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
const st = `
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
function ct(t) {
  const { uniforms: e, glslFunctions: r, mainCode: a, charOutputCode: n, primaryColorVar: o, cellColorVar: l, charMapping: s, usesFeedback: i, usesCharFeedback: m, usesCellColorFeedback: h, usesCharSource: y, externalLayers: d } = t, v = Array.from(e.values()).map((u) => `uniform ${u.type} ${u.name};`).join(`
`);
  let p = "", f = "";
  s && (p = `uniform int u_charMap[${s.indices.length}];
uniform int u_charMapSize;`, f = `
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);
  const c = [];
  i && c.push("uniform sampler2D prevCharColorBuffer;"), m && c.push("uniform sampler2D prevCharBuffer;"), h && c.push("uniform sampler2D prevCellColorBuffer;");
  const g = c.join(`
`), _ = y ? "uniform float u_charSourceCount;" : "", C = [];
  if (d) for (const [, u] of d) u.usesChar && C.push(`uniform sampler2D ${u.uniformPrefix}_char;`), u.usesCharColor && C.push(`uniform sampler2D ${u.uniformPrefix}_primary;`), u.usesCellColor && C.push(`uniform sampler2D ${u.uniformPrefix}_cell;`);
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
${g}
${C.length > 0 ? `// External layer samplers
${C.join(`
`)}` : ""}
${p}
${_}

// Dynamic uniforms
${v}

${st}

// Transform functions
${Array.from(r).join(`
`)}

void main() {
	// Transform chain
${a.join(`
`)}

${n}
${f}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${o};
	o_secondaryColor = ${l};
}
`;
}
function lt(t, e, r) {
  return t ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${r}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}
function R(t) {
  return new it().compile(t);
}
class it {
  _uniformManager = new ot();
  _feedbackTracker = new tt();
  _externalLayerManager = new rt();
  _codeGenerator = new at();
  _glslFunctions = /* @__PURE__ */ new Set();
  _mainCode = [];
  _varCounter = 0;
  _currentTarget = "main";
  _usesCharSource = !1;
  compile(e) {
    this._reset();
    const r = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "main");
    let a = r.charVar;
    e.charSource && (a = this._compileCharSource(e));
    let n = r.colorVar;
    e.colorSource && (n = this._compileChain(e.colorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "charColor").colorVar);
    let o = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (o = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)", "v_uv", "cellColor").colorVar);
    const l = lt(!!a, a ?? "vec4(0.0)", r.colorVar), s = this._feedbackTracker.getUsage();
    return { fragmentSource: ct({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: l, primaryColorVar: n, cellColorVar: o, charMapping: e.charMapping, usesFeedback: s.usesCharColorFeedback, usesCharFeedback: s.usesCharFeedback, usesCellColorFeedback: s.usesCellColorFeedback, usesCharSource: this._usesCharSource, externalLayers: this._externalLayerManager.getExternalLayers() }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesCharColorFeedback: s.usesCharColorFeedback, usesCharFeedback: s.usesCharFeedback, usesCellColorFeedback: s.usesCellColorFeedback, usesCharSource: this._usesCharSource, externalLayers: this._externalLayerManager.getExternalLayers() };
  }
  _reset() {
    this._varCounter = 0, this._uniformManager.clear(), this._feedbackTracker.reset(), this._externalLayerManager.reset(), this._glslFunctions.clear(), this._mainCode.length = 0, this._currentTarget = "main", this._usesCharSource = !1;
  }
  _compileCharSource(e) {
    this._usesCharSource = !0;
    const r = this._compileChain(e.charSource, "charSrc", "vec4(1.0, 1.0, 1.0, 1.0)", "v_uv", "char"), a = "charFromSource_" + this._varCounter++;
    return this._mainCode.push("	// Convert charSource color to character index"), this._mainCode.push(`	float charLum_${a} = _luminance(${r.colorVar}.rgb);`), this._mainCode.push(`	int charIdx_${a} = int(charLum_${a} * u_charSourceCount);`), this._mainCode.push(`	vec4 ${a} = vec4(float(charIdx_${a} % 256) / 255.0, float(charIdx_${a} / 256) / 255.0, 0.0, 0.0);`), a;
  }
  _compileChain(e, r, a, n = "v_uv", o = "main") {
    const l = this._currentTarget;
    this._currentTarget = o;
    const s = `${r}_st`;
    let i, m, h, y = `${r}_c`;
    this._mainCode.push(`	vec2 ${s} = ${n};`), this._mainCode.push(`	vec4 ${y} = ${a};`);
    const d = e.transforms, v = d.map((c) => this._getProcessedTransform(c.name)), p = this._identifyCoordTransforms(v), f = (c) => {
      const g = d[c], _ = v[c];
      if (!_) return void console.warn(`[SynthCompiler] Unknown transform: ${g.name}`);
      const C = e.externalLayerRefs.get(c);
      g.name === "src" && this._trackSrcUsage(C);
      const u = this._codeGenerator.getContextAwareGlslFunction(_, g.name, this._currentTarget, C, (L) => this._externalLayerManager.getPrefix(L));
      this._glslFunctions.add(u);
      const Y = this._processArguments(g.userArgs, _.inputs, `${r}_${c}_${g.name}`), A = e.nestedSources.get(c);
      let z;
      A && (_.type === "combine" || _.type === "combineCoord") && (z = this._compileChain(A, `${r}_nested_${c}`, a, s, o).colorVar);
      const M = this._codeGenerator.generateTransformCode(this._mainCode, _, this._varCounter++, s, y, i, m, h, Y, this._currentTarget, z, C, (L) => this._externalLayerManager.getPrefix(L));
      y = M.colorVar, M.charVar && (i = M.charVar), M.flagsVar && (m = M.flagsVar), M.rotationVar && (h = M.rotationVar);
    };
    for (let c = p.length - 1; c >= 0; c--) f(p[c]);
    for (let c = 0; c < d.length; c++) {
      const g = v[c];
      (!g || g.type !== "coord" && g.type !== "combineCoord") && f(c);
    }
    return this._currentTarget = l, { coordVar: s, colorVar: y, charVar: i, flagsVar: m, rotationVar: h };
  }
  _identifyCoordTransforms(e) {
    const r = [];
    for (let a = 0; a < e.length; a++) {
      const n = e[a];
      n && (n.type !== "coord" && n.type !== "combineCoord" || r.push(a));
    }
    return r;
  }
  _trackSrcUsage(e) {
    e ? this._externalLayerManager.trackUsage(e, this._currentTarget) : this._feedbackTracker.trackUsage(this._currentTarget);
  }
  _getProcessedTransform(e) {
    return k.getProcessed(e);
  }
  _processArguments(e, r, a) {
    const n = [];
    for (let o = 0; o < r.length; o++) {
      const l = r[o], s = e[o] ?? l.default, i = this._uniformManager.processArgument(s, l, a);
      n.push(i.glslValue);
    }
    return n;
  }
}
class ut {
  _resolvedIndices;
  _lastFontCharacterCount = 0;
  _lastChars = "";
  resolve(e, r) {
    const a = r.characters.length;
    if (this._resolvedIndices && this._lastFontCharacterCount === a && this._lastChars === e) return this._resolvedIndices;
    const n = Array.from(e), o = new Int32Array(n.length), l = r.characterMap, s = r.characters;
    for (let i = 0; i < n.length; i++) {
      const m = n[i], h = l.get(m);
      if (h !== void 0) o[i] = s.indexOf(h);
      else {
        const y = l.get(" ");
        o[i] = y !== void 0 ? s.indexOf(y) : 0;
      }
    }
    return this._resolvedIndices = o, this._lastFontCharacterCount = a, this._lastChars = e, o;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFontCharacterCount = 0, this._lastChars = "";
  }
}
function V(t = {}) {
  return { source: t.source ?? new S(), compiled: t.compiled, shader: t.shader, characterResolver: t.characterResolver ?? new ut(), needsCompile: t.needsCompile ?? !1, pingPongBuffers: t.pingPongBuffers, pingPongIndex: t.pingPongIndex ?? 0, externalLayerMap: t.externalLayerMap, bpm: t.bpm };
}
function ft(t) {
  t.extendLayer("synth", function(e) {
    const r = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let a = this.getPluginState(b);
    a ? (a.source = e, a.needsCompile = !0, a.characterResolver.invalidate(), r && (a.compiled = R(e))) : a = V({ source: e, compiled: r ? R(e) : void 0, needsCompile: !0 }), this.setPluginState(b, a);
  });
}
function pt(t) {
  t.extendLayer("clearSynth", function() {
    const e = this.getPluginState(b);
    e && (e.shader?.dispose && e.shader.dispose(), e.pingPongBuffers && (e.pingPongBuffers[0].dispose?.(), e.pingPongBuffers[1].dispose?.()), this.setPluginState(b, void 0));
  });
}
function mt(t) {
  t.extendLayer("bpm", function(e) {
    let r = this.getPluginState(b);
    r ? r.bpm = e : r = V({ bpm: e }), this.setPluginState(b, r);
  });
}
let E = 60;
function dt(t) {
  E = t;
}
function ht() {
  return E;
}
function yt(t) {
  t.bpm = function(e) {
    return dt(e), e;
  };
}
function w(t) {
  const e = /* @__PURE__ */ new Map();
  for (const [, r] of t.externalLayerRefs) e.set(r.layerId, r.layer);
  for (const [, r] of t.nestedSources) {
    const a = w(r);
    for (const [n, o] of a) e.set(n, o);
  }
  if (t.charSource) {
    const r = w(t.charSource);
    for (const [a, n] of r) e.set(a, n);
  }
  if (t.colorSource) {
    const r = w(t.colorSource);
    for (const [a, n] of r) e.set(a, n);
  }
  if (t.cellColorSource) {
    const r = w(t.cellColorSource);
    for (const [a, n] of r) e.set(a, n);
  }
  return e;
}
let B = null;
function Ct(t) {
  B = t;
}
function U(t, e, r) {
  const a = r ?? B;
  if (a) try {
    a(t, e);
  } catch {
  }
}
function gt(t, e, r, a = {}) {
  let n;
  try {
    n = t();
  } catch (o) {
    return U(o, e, a.onError), r;
  }
  return _t(n) ? n : (U(new Error(`[textmode.synth.js] Invalid dynamic parameter value for "${e}": ${N(n)}`), e, a.onError), r);
}
function N(t) {
  if (t === void 0) return "undefined";
  if (t === null) return "null";
  if (typeof t == "number") {
    if (Number.isNaN(t)) return "NaN";
    if (!Number.isFinite(t)) return t > 0 ? "Infinity" : "-Infinity";
  }
  if (Array.isArray(t)) {
    const e = t.findIndex((r) => typeof r != "number" || !Number.isFinite(r));
    if (e >= 0) return `array with invalid element at index ${e}: ${N(t[e])}`;
  }
  return String(t);
}
function _t(t) {
  return t != null && (typeof t == "number" ? Number.isFinite(t) : !!Array.isArray(t) && t.length > 0 && t.every((e) => typeof e == "number" && Number.isFinite(e)));
}
async function vt(t, e) {
  const r = t.getPluginState(b);
  if (!r) return;
  const a = t.grid, n = t.drawFramebuffer;
  if (!a || !n || (r.compiled || (r.compiled = R(r.source), r.externalLayerMap = w(r.source), r.needsCompile = !0), r.needsCompile && r.compiled && (r.shader?.dispose && r.shader.dispose(), r.externalLayerMap = w(r.source), r.shader = await e.createFilterShader(r.compiled.fragmentSource), r.needsCompile = !1), !r.shader || !r.compiled)) return;
  const o = r.compiled.usesCharColorFeedback, l = r.compiled.usesCharFeedback, s = r.compiled.usesCellColorFeedback, i = o || l || s;
  i && !r.pingPongBuffers && (r.pingPongBuffers = [e.createFramebuffer({ width: a.cols, height: a.rows, attachments: 3 }), e.createFramebuffer({ width: a.cols, height: a.rows, attachments: 3 })], r.pingPongIndex = 0);
  const m = { time: e.secs, frameCount: e.frameCount, width: a.width, height: a.height, cols: a.cols, rows: a.rows, bpm: r.bpm ?? ht() }, h = /* @__PURE__ */ new Map();
  for (const [d, v] of r.compiled.dynamicUpdaters) {
    const p = r.compiled.uniforms.get(d), f = gt(() => v(m), d, p?.value ?? 0, { onError: r.onDynamicError });
    h.set(d, f);
  }
  const y = (d) => {
    e.setUniform("time", e.frameCount / e.targetFrameRate()), e.setUniform("resolution", [m.cols, m.rows]);
    for (const [p, f] of h) e.setUniform(p, f);
    for (const [p, f] of r.compiled.uniforms) f.isDynamic || typeof f.value == "function" || e.setUniform(p, f.value);
    if (r.compiled.charMapping) {
      const p = r.characterResolver.resolve(r.compiled.charMapping.chars, t.font);
      e.setUniform("u_charMap", p), e.setUniform("u_charMapSize", p.length);
    }
    if (r.compiled.usesCharSource) {
      const p = r.compiled.charMapping ? r.compiled.charMapping.chars.length : t.font.characters.length;
      e.setUniform("u_charSourceCount", p);
    }
    d && (o && e.setUniform("prevCharColorBuffer", d.textures[1]), l && e.setUniform("prevCharBuffer", d.textures[0]), s && e.setUniform("prevCellColorBuffer", d.textures[2]));
    const v = r.compiled.externalLayers;
    if (v && v.size > 0 && r.externalLayerMap) for (const [p, f] of v) {
      const c = r.externalLayerMap.get(p);
      if (!c) {
        console.warn(`[textmode.synth.js] External layer not found: ${p}`);
        continue;
      }
      const g = c.getPluginState(b);
      let _;
      g?.pingPongBuffers ? _ = g.pingPongBuffers[g.pingPongIndex].textures : c.drawFramebuffer && (_ = c.drawFramebuffer.textures), _ && (f.usesChar && e.setUniform(`${f.uniformPrefix}_char`, _[0]), f.usesCharColor && e.setUniform(`${f.uniformPrefix}_primary`, _[1]), f.usesCellColor && e.setUniform(`${f.uniformPrefix}_cell`, _[2]));
    }
  };
  if (i && r.pingPongBuffers) {
    const d = r.pingPongBuffers[r.pingPongIndex], v = r.pingPongBuffers[1 - r.pingPongIndex];
    v.begin(), e.clear(), e.shader(r.shader), y(d), e.rect(a.cols, a.rows), v.end(), n.begin(), e.clear(), e.shader(r.shader), y(d), e.rect(a.cols, a.rows), n.end(), r.pingPongIndex = 1 - r.pingPongIndex;
  } else n.begin(), e.clear(), e.shader(r.shader), y(null), e.rect(a.cols, a.rows), n.end();
}
function xt(t) {
  const e = t.getPluginState(b);
  e && (e.shader?.dispose && e.shader.dispose(), e.pingPongBuffers && (e.pingPongBuffers[0].dispose?.(), e.pingPongBuffers[1].dispose?.()));
}
const bt = { name: b, version: "1.0.0", install(t, e) {
  yt(t), ft(e), mt(e), pt(e), e.registerLayerPreRenderHook((r) => vt(r, t)), e.registerLayerDisposedHook(xt);
}, uninstall(t, e) {
  const r = [e.layerManager.base, ...e.layerManager.all];
  for (const a of r) {
    const n = a.getPluginState(b);
    n && (n.shader?.dispose && n.shader.dispose(), n.pingPongBuffers && (n.pingPongBuffers[0].dispose?.(), n.pingPongBuffers[1].dispose?.()));
  }
  delete t.bpm, e.removeLayerExtension("synth"), e.removeLayerExtension("bpm"), e.removeLayerExtension("clearSynth");
} }, St = (t) => {
  const e = new S();
  return e._colorSource = t, e;
}, Mt = (t, e) => {
  const r = new S();
  return r._charSource = t, r._charCount = e, r;
}, $t = (t) => {
  const e = new S();
  return e._colorSource = t, e;
};
function wt(t) {
  return $.gradient(t);
}
function Ft(t, e) {
  return $.noise(t, e);
}
function kt(t, e, r) {
  return $.osc(t, e, r);
}
const Tt = (t) => {
  const e = new S();
  return e._colorSource = t, e._cellColorSource = t, e;
};
function Lt(t, e, r) {
  return $.shape(t, e, r);
}
function Pt(t, e, r, a) {
  return $.solid(t, e, r, a);
}
const It = (t) => {
  const e = $.src;
  if (!t) return e();
  const r = new S(), a = t.id ?? `layer_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  return r.addExternalLayerRef({ layerId: a, layer: t }), r;
};
function Rt(t, e, r) {
  return $.voronoi(t, e, r);
}
export {
  bt as SynthPlugin,
  S as SynthSource,
  St as cellColor,
  Mt as char,
  $t as charColor,
  wt as gradient,
  Ft as noise,
  kt as osc,
  Tt as paint,
  Ct as setGlobalErrorCallback,
  Lt as shape,
  Pt as solid,
  It as src,
  Rt as voronoi
};

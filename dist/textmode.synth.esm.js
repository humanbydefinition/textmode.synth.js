const O = { src: { returnType: "vec4", args: [{ type: "vec2", name: "_st" }] }, coord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }] }, color: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }] }, combine: { returnType: "vec4", args: [{ type: "vec4", name: "_c0" }, { type: "vec4", name: "_c1" }] }, combineCoord: { returnType: "vec2", args: [{ type: "vec2", name: "_st" }, { type: "vec4", name: "_c0" }] }, charModify: { returnType: "vec4", args: [{ type: "vec4", name: "_char" }] } };
function z(t) {
  const e = O[t.type], a = [...e.args, ...t.inputs.map((n) => ({ type: n.type, name: n.name }))].map((n) => `${n.type} ${n.name}`).join(", "), r = `
${e.returnType} ${t.name}(${a}) {
${t.glsl}
}`;
  return { ...t, glslFunction: r };
}
class P {
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
      const r = this._transforms.get(e);
      r && (a = z(r), this._processedCache.set(e, a));
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
const S = new P(), R = /* @__PURE__ */ new Set(["src"]);
class V {
  _generatedFunctions = {};
  _synthSourceClass = null;
  setSynthSourceClass(e) {
    this._synthSourceClass = e;
  }
  injectMethods(e) {
    const a = S.getAll();
    for (const r of a) this._injectMethod(e, r);
  }
  _injectMethod(e, a) {
    const { name: r, inputs: n, type: o } = a;
    e[r] = o === "combine" || o === "combineCoord" ? function(c, ...i) {
      const u = n.map((f, p) => i[p] ?? f.default);
      return this.addCombineTransform(r, c, u);
    } : function(...c) {
      const i = n.map((u, f) => c[f] ?? u.default);
      return this.addTransform(r, i);
    };
  }
  generateStandaloneFunctions() {
    if (!this._synthSourceClass) throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");
    const e = {}, a = S.getAll(), r = this._synthSourceClass;
    for (const n of a) if (R.has(n.type)) {
      const { name: o, inputs: c } = n;
      e[o] = (...i) => {
        const u = new r(), f = c.map((p, d) => i[d] ?? p.default);
        return u.addTransform(o, f);
      };
    }
    return this._generatedFunctions = e, e;
  }
  getGeneratedFunctions() {
    return this._generatedFunctions;
  }
  addTransform(e, a) {
    if (S.register(e), a && this._injectMethod(a, e), R.has(e.type) && this._synthSourceClass) {
      const r = this._synthSourceClass, { name: n, inputs: o } = e;
      this._generatedFunctions[n] = (...c) => {
        const i = new r(), u = o.map((f, p) => c[p] ?? f.default);
        return i.addTransform(n, u);
      };
    }
  }
}
const w = new V(), Y = { name: "osc", type: "src", inputs: [{ name: "frequency", type: "float", default: 60 }, { name: "sync", type: "float", default: 0.1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`, description: "Generate oscillating color pattern" }, X = { name: "noise", type: "src", inputs: [{ name: "scale", type: "float", default: 10 }, { name: "offset", type: "float", default: 0.1 }], glsl: `
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`, description: "Generate noise pattern" }, U = { name: "voronoi", type: "src", inputs: [{ name: "scale", type: "float", default: 5 }, { name: "speed", type: "float", default: 0.3 }, { name: "blending", type: "float", default: 0.3 }], glsl: `
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
`, description: "Generate voronoi pattern" }, B = { name: "gradient", type: "src", inputs: [{ name: "speed", type: "float", default: 0 }], glsl: `
	return vec4(_st, sin(time * speed), 1.0);
`, description: "Generate gradient pattern" }, N = { name: "shape", type: "src", inputs: [{ name: "sides", type: "float", default: 3 }, { name: "radius", type: "float", default: 0.3 }, { name: "smoothing", type: "float", default: 0.01 }], glsl: `
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`, description: "Generate polygon shape" }, j = { name: "solid", type: "src", inputs: [{ name: "r", type: "float", default: 0 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 1 }], glsl: `
	return vec4(r, g, b, a);
`, description: "Generate solid color" }, D = { name: "src", type: "src", inputs: [], glsl: `
	return texture(prevBuffer, fract(_st));
`, description: "Sample the previous frame primary color for feedback effects" }, q = { name: "charSrc", type: "src", inputs: [], glsl: `
	return texture(prevCharBuffer, fract(_st));
`, description: "Sample the previous frame character data for feedback effects" }, E = { name: "cellColorSrc", type: "src", inputs: [], glsl: `
	return texture(prevCellColorBuffer, fract(_st));
`, description: "Sample the previous frame cell color for feedback effects" }, L = [Y, X, U, B, N, j, D, q, E], K = { name: "rotate", type: "coord", inputs: [{ name: "angle", type: "float", default: 10 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`, description: "Rotate coordinates" }, G = { name: "scale", type: "coord", inputs: [{ name: "amount", type: "float", default: 1.5 }, { name: "xMult", type: "float", default: 1 }, { name: "yMult", type: "float", default: 1 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`, description: "Scale coordinates" }, Q = { name: "scroll", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "scrollY", type: "float", default: 0.5 }, { name: "speedX", type: "float", default: 0 }, { name: "speedY", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`, description: "Scroll coordinates" }, H = { name: "scrollX", type: "coord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`, description: "Scroll X coordinate" }, W = { name: "scrollY", type: "coord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`, description: "Scroll Y coordinate" }, J = { name: "pixelate", type: "coord", inputs: [{ name: "pixelX", type: "float", default: 20 }, { name: "pixelY", type: "float", default: 20 }], glsl: `
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Pixelate coordinates" }, Z = { name: "repeat", type: "coord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0 }, { name: "offsetY", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`, description: "Repeat pattern" }, tt = { name: "repeatX", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern horizontally" }, et = { name: "repeatY", type: "coord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`, description: "Repeat pattern vertically" }, nt = { name: "kaleid", type: "coord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`, description: "Kaleidoscope effect" }, rt = [K, G, Q, H, W, J, Z, tt, et, nt], at = { name: "brightness", type: "color", inputs: [{ name: "amount", type: "float", default: 0.4 }], glsl: `
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`, description: "Adjust brightness" }, ot = { name: "contrast", type: "color", inputs: [{ name: "amount", type: "float", default: 1.6 }], glsl: `
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`, description: "Adjust contrast" }, st = { name: "invert", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`, description: "Invert colors" }, ct = { name: "saturate", type: "color", inputs: [{ name: "amount", type: "float", default: 2 }], glsl: `
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`, description: "Adjust saturation" }, lt = { name: "hue", type: "color", inputs: [{ name: "hue", type: "float", default: 0.4 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`, description: "Shift hue" }, it = { name: "colorama", type: "color", inputs: [{ name: "amount", type: "float", default: 5e-3 }], glsl: `
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`, description: "Color cycle effect" }, ut = { name: "posterize", type: "color", inputs: [{ name: "bins", type: "float", default: 3 }, { name: "gamma", type: "float", default: 0.6 }], glsl: `
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`, description: "Posterize colors" }, pt = { name: "luma", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.1 }], glsl: `
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`, description: "Luma key" }, ft = { name: "thresh", type: "color", inputs: [{ name: "threshold", type: "float", default: 0.5 }, { name: "tolerance", type: "float", default: 0.04 }], glsl: `
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`, description: "Threshold" }, mt = { name: "color", type: "color", inputs: [{ name: "r", type: "float", default: 1 }, { name: "g", type: "float", default: 1 }, { name: "b", type: "float", default: 1 }, { name: "a", type: "float", default: 1 }], glsl: `
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`, description: "Multiply by color" }, dt = { name: "r", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.r * scale + offset);
`, description: "Extract red channel" }, ht = { name: "g", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.g * scale + offset);
`, description: "Extract green channel" }, yt = { name: "b", type: "color", inputs: [{ name: "scale", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	return vec4(_c0.b * scale + offset);
`, description: "Extract blue channel" }, gt = { name: "shift", type: "color", inputs: [{ name: "r", type: "float", default: 0.5 }, { name: "g", type: "float", default: 0 }, { name: "b", type: "float", default: 0 }, { name: "a", type: "float", default: 0 }], glsl: `
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`, description: "Shift color channels by adding offset values" }, _t = { name: "gamma", type: "color", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`, description: "Apply gamma correction" }, vt = { name: "levels", type: "color", inputs: [{ name: "inMin", type: "float", default: 0 }, { name: "inMax", type: "float", default: 1 }, { name: "outMin", type: "float", default: 0 }, { name: "outMax", type: "float", default: 1 }, { name: "gamma", type: "float", default: 1 }], glsl: `
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`, description: "Adjust input/output levels and gamma" }, Ct = { name: "clampColor", type: "color", inputs: [{ name: "min", type: "float", default: 0 }, { name: "max", type: "float", default: 1 }], glsl: `
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`, description: "Clamp color values to a range" }, xt = [at, ot, st, ct, lt, it, ut, pt, ft, mt, dt, ht, yt, gt, _t, vt, Ct], bt = { name: "add", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`, description: "Add another source" }, St = { name: "sub", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`, description: "Subtract another source" }, Mt = { name: "mult", type: "combine", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`, description: "Multiply with another source" }, $t = { name: "blend", type: "combine", inputs: [{ name: "amount", type: "float", default: 0.5 }], glsl: `
	return _c0 * (1.0 - amount) + _c1 * amount;
`, description: "Blend with another source" }, wt = { name: "diff", type: "combine", inputs: [], glsl: `
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`, description: "Difference with another source" }, Ft = { name: "layer", type: "combine", inputs: [], glsl: `
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`, description: "Layer another source on top" }, Tt = { name: "mask", type: "combine", inputs: [], glsl: `
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`, description: "Mask with another source" }, At = [bt, St, Mt, $t, wt, Ft, Tt], Rt = { name: "modulate", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 0.1 }], glsl: `
	return _st + _c0.xy * amount;
`, description: "Modulate coordinates with another source" }, It = { name: "modulateScale", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 1 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`, description: "Modulate scale with another source" }, kt = { name: "modulateRotate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 1 }, { name: "offset", type: "float", default: 0 }], glsl: `
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`, description: "Modulate rotation with another source" }, Ot = { name: "modulatePixelate", type: "combineCoord", inputs: [{ name: "multiple", type: "float", default: 10 }, { name: "offset", type: "float", default: 3 }], glsl: `
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`, description: "Modulate pixelation with another source" }, zt = { name: "modulateKaleid", type: "combineCoord", inputs: [{ name: "nSides", type: "float", default: 4 }], glsl: `
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`, description: "Modulate kaleidoscope with another source" }, Pt = { name: "modulateScrollX", type: "combineCoord", inputs: [{ name: "scrollX", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`, description: "Modulate X scroll with another source" }, Vt = { name: "modulateScrollY", type: "combineCoord", inputs: [{ name: "scrollY", type: "float", default: 0.5 }, { name: "speed", type: "float", default: 0 }], glsl: `
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`, description: "Modulate Y scroll with another source" }, Yt = { name: "modulateRepeat", type: "combineCoord", inputs: [{ name: "repeatX", type: "float", default: 3 }, { name: "repeatY", type: "float", default: 3 }, { name: "offsetX", type: "float", default: 0.5 }, { name: "offsetY", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`, description: "Modulate repeat pattern with another source" }, Xt = { name: "modulateRepeatX", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate X repeat with another source" }, Ut = { name: "modulateRepeatY", type: "combineCoord", inputs: [{ name: "reps", type: "float", default: 3 }, { name: "offset", type: "float", default: 0.5 }], glsl: `
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`, description: "Modulate Y repeat with another source" }, Bt = { name: "modulateHue", type: "combineCoord", inputs: [{ name: "amount", type: "float", default: 1 }], glsl: `
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`, description: "Modulate coordinates based on hue differences" }, Nt = [Rt, It, kt, Ot, zt, Pt, Vt, Yt, Xt, Ut, Bt], jt = { name: "charFlipX", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 2;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters horizontally" }, Dt = { name: "charFlipY", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 4;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Flip characters vertically" }, qt = { name: "charInvert", type: "charModify", inputs: [{ name: "toggle", type: "float", default: 1 }], glsl: `
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 1;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`, description: "Invert character colors" }, Et = { name: "charRotate", type: "charModify", inputs: [{ name: "angle", type: "float", default: 0.25 }, { name: "speed", type: "float", default: 0 }], glsl: `
	float rotation = fract(angle + time * speed);
	return vec4(_char.rgb, rotation);
`, description: "Rotate characters" }, Lt = [jt, Dt, qt, Et], Kt = [...L, ...rt, ...xt, ...At, ...Nt, ...Lt];
class b {
  _transforms;
  constructor(e) {
    this._transforms = e;
  }
  static empty() {
    return new b([]);
  }
  static from(e) {
    return new b([...e]);
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
    return new b([...this._transforms, e]);
  }
  get(e) {
    return this._transforms[e];
  }
  [Symbol.iterator]() {
    return this._transforms[Symbol.iterator]();
  }
}
class _ {
  _chain;
  _charMapping;
  _nestedSources;
  _colorSource;
  _cellColorSource;
  _charSource;
  _charCount;
  constructor(e) {
    this._chain = e?.chain ?? b.empty(), this._charMapping = e?.charMapping, this._colorSource = e?.colorSource, this._cellColorSource = e?.cellColorSource, this._charSource = e?.charSource, this._charCount = e?.charCount, this._nestedSources = e?.nestedSources ?? /* @__PURE__ */ new Map();
  }
  addTransform(e, a) {
    const r = { name: e, userArgs: a };
    return this._chain.push(r), this;
  }
  addCombineTransform(e, a, r) {
    const n = this._chain.length;
    return this._nestedSources.set(n, a), this.addTransform(e, r);
  }
  charMap(e) {
    const a = Array.from(e), r = [];
    for (const n of a) r.push(n.codePointAt(0) ?? 32);
    return this._charMapping = { chars: e, indices: r }, this;
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
    for (const [a, r] of this._nestedSources) e.set(a, r.clone());
    return new _({ chain: b.from(this._chain.transforms), charMapping: this._charMapping, colorSource: this._colorSource?.clone(), cellColorSource: this._cellColorSource?.clone(), charSource: this._charSource?.clone(), charCount: this._charCount, nestedSources: e });
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
}
const F = { linear: (t) => t, easeInQuad: (t) => t * t, easeOutQuad: (t) => t * (2 - t), easeInOutQuad: (t) => t < 0.5 ? 2 * t * t : (4 - 2 * t) * t - 1, easeInCubic: (t) => t * t * t, easeOutCubic: (t) => --t * t * t + 1, easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1, easeInQuart: (t) => t * t * t * t, easeOutQuart: (t) => 1 - --t * t * t * t, easeInOutQuart: (t) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t, easeInQuint: (t) => t * t * t * t * t, easeOutQuint: (t) => 1 + --t * t * t * t * t, easeInOutQuint: (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t, sin: (t) => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2 };
function M(t, e) {
  return (t % e + e) % e;
}
function Gt(t, e, a, r, n) {
  return (t - e) * (n - r) / (a - e) + r;
}
function Qt() {
  "fast" in Array.prototype || (Array.prototype.fast = function(t = 1) {
    return this._speed = t, this;
  }, Array.prototype.smooth = function(t = 1) {
    return this._smooth = t, this;
  }, Array.prototype.ease = function(t = "linear") {
    return typeof t == "function" ? (this._smooth = 1, this._ease = t) : F[t] && (this._smooth = 1, this._ease = F[t]), this;
  }, Array.prototype.offset = function(t = 0.5) {
    return this._offset = t % 1, this;
  }, Array.prototype.fit = function(t = 0, e = 1) {
    const a = Math.min(...this), r = Math.max(...this), n = this.map((o) => Gt(o, a, r, t, e));
    return n._speed = this._speed, n._smooth = this._smooth, n._ease = this._ease, n._offset = this._offset, n;
  });
}
function Ht(t, e) {
  const a = t._speed ?? 1, r = t._smooth ?? 0;
  let n = e.time * a * 1 + (t._offset ?? 0);
  if (r !== 0) {
    const o = t._ease ?? F.linear, c = n - r / 2, i = t[Math.floor(M(c, t.length))], u = t[Math.floor(M(c + 1, t.length))];
    return o(Math.min(M(c, 1) / r, 1)) * (u - i) + i;
  }
  return t[Math.floor(M(n, t.length))];
}
function Wt(t) {
  return Array.isArray(t) && t.length > 0 && typeof t[0] == "number";
}
class Jt {
  _uniforms = /* @__PURE__ */ new Map();
  _dynamicUpdaters = /* @__PURE__ */ new Map();
  processArgument(e, a, r) {
    if (Wt(e)) {
      const n = `${r}_${a.name}`, o = { name: n, type: a.type, value: a.default ?? 0, isDynamic: !0 }, c = (i) => Ht(e, i);
      return this._uniforms.set(n, o), this._dynamicUpdaters.set(n, c), { glslValue: n, uniform: o, updater: c };
    }
    if (typeof e == "function") {
      const n = `${r}_${a.name}`, o = { name: n, type: a.type, value: a.default ?? 0, isDynamic: !0 };
      return this._uniforms.set(n, o), this._dynamicUpdaters.set(n, e), { glslValue: n, uniform: o, updater: e };
    }
    if (typeof e == "number") return { glslValue: y(e) };
    if (Array.isArray(e) && typeof e[0] == "number") {
      const n = e;
      if (n.length === 2) return { glslValue: `vec2(${y(n[0])}, ${y(n[1])})` };
      if (n.length === 3) return { glslValue: `vec3(${y(n[0])}, ${y(n[1])}, ${y(n[2])})` };
      if (n.length === 4) return { glslValue: `vec4(${y(n[0])}, ${y(n[1])}, ${y(n[2])}, ${y(n[3])})` };
    }
    return this.processDefault(a);
  }
  processDefault(e) {
    const a = e.default;
    return typeof a == "number" ? { glslValue: y(a) } : Array.isArray(a) ? { glslValue: `vec${a.length}(${a.map(y).join(", ")})` } : { glslValue: "0.0" };
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
function y(t) {
  const e = t.toString();
  return e.includes(".") ? e : e + ".0";
}
const Zt = `
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
function te(t) {
  const { uniforms: e, glslFunctions: a, mainCode: r, charOutputCode: n, primaryColorVar: o, cellColorVar: c, charMapping: i, usesFeedback: u, usesCharFeedback: f, usesCellColorFeedback: p } = t, d = Array.from(e.values()).map((l) => `uniform ${l.type} ${l.name};`).join(`
`);
  let m = "", h = "";
  i && (m = `uniform int u_charMap[${i.indices.length}];
uniform int u_charMapSize;`, h = `
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);
  const s = [];
  return u && s.push("uniform sampler2D prevBuffer;"), f && s.push("uniform sampler2D prevCharBuffer;"), p && s.push("uniform sampler2D prevCellColorBuffer;"), `#version 300 es
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
${s.join(`
`)}
${m}

// Dynamic uniforms
${d}

${Zt}

// Transform functions
${Array.from(a).join(`
`)}

void main() {
	// Transform chain
${r.join(`
`)}

${n}
${h}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${o};
	o_secondaryColor = ${c};
}
`;
}
function ee(t, e, a) {
  return t ? `
	// Character output from generator
	vec4 charOutput = ${e};` : `
	// Derive character from color luminance
	float lum = _luminance(${a}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`;
}
function $(t) {
  return new ne().compile(t);
}
class ne {
  _varCounter = 0;
  _uniformManager = new Jt();
  _glslFunctions = /* @__PURE__ */ new Set();
  _mainCode = [];
  _usesFeedback = !1;
  _usesCharFeedback = !1;
  _usesCellColorFeedback = !1;
  compile(e) {
    this._varCounter = 0, this._uniformManager.clear(), this._glslFunctions.clear(), this._mainCode.length = 0, this._usesFeedback = !1, this._usesCharFeedback = !1, this._usesCellColorFeedback = !1;
    const a = this._compileChain(e, "main", "vec4(1.0, 1.0, 1.0, 1.0)");
    let r, n = a.charVar;
    if (e.charSource) {
      const u = this._compileChain(e.charSource, "charSrc", "vec4(1.0, 1.0, 1.0, 1.0)");
      n = "charFromSource_" + this._varCounter++, r = e.charCount ?? 256, this._mainCode.push("	// Convert charSource color to character index"), this._mainCode.push(`	float charLum_${n} = _luminance(${u.colorVar}.rgb);`), this._mainCode.push(`	int charIdx_${n} = int(charLum_${n} * ${r.toFixed(1)});`), this._mainCode.push(`	vec4 ${n} = vec4(float(charIdx_${n} % 256) / 255.0, float(charIdx_${n} / 256) / 255.0, 0.0, 0.0);`);
    }
    let o = a.colorVar;
    e.colorSource && (o = this._compileChain(e.colorSource, "charColor", "vec4(1.0, 1.0, 1.0, 1.0)").colorVar);
    let c = "vec4(0.0, 0.0, 0.0, 0.0)";
    e.cellColorSource && (c = this._compileChain(e.cellColorSource, "cellColor", "vec4(0.0, 0.0, 0.0, 0.0)").colorVar);
    const i = ee(!!n, n ?? "vec4(0.0)", a.colorVar);
    return { fragmentSource: te({ uniforms: this._uniformManager.getUniforms(), glslFunctions: this._glslFunctions, mainCode: this._mainCode, charOutputCode: i, primaryColorVar: o, cellColorVar: c, charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback }), uniforms: this._uniformManager.getUniforms(), dynamicUpdaters: this._uniformManager.getDynamicUpdaters(), charMapping: e.charMapping, usesFeedback: this._usesFeedback, usesCharFeedback: this._usesCharFeedback, usesCellColorFeedback: this._usesCellColorFeedback };
  }
  _compileChain(e, a, r, n = "v_uv") {
    const o = `${a}_st`;
    let c, i, u, f = `${a}_c`;
    this._mainCode.push(`	vec2 ${o} = ${n};`), this._mainCode.push(`	vec4 ${f} = ${r};`);
    const p = e.transforms, d = p.map((s) => this._getProcessedTransform(s.name)), m = [];
    for (let s = 0; s < d.length; s++) {
      const l = d[s];
      l && (l.type !== "coord" && l.type !== "combineCoord" || m.push(s));
    }
    const h = (s) => {
      const l = p[s], C = d[s];
      if (!C) return void console.warn(`[SynthCompiler] Unknown transform: ${l.name}`);
      l.name === "src" && (this._usesFeedback = !0), l.name === "charSrc" && (this._usesCharFeedback = !0), l.name === "cellColorSrc" && (this._usesCellColorFeedback = !0), this._glslFunctions.add(C.glslFunction);
      const I = this._processArguments(l.userArgs, C.inputs, `${a}_${s}_${l.name}`), T = e.nestedSources.get(s);
      let A;
      T && (C.type === "combine" || C.type === "combineCoord") && (A = this._compileChain(T, `${a}_nested_${s}`, r, o).colorVar);
      const k = this._varCounter++, v = this._generateTransformCode(C, k, o, f, c, i, u, I, A);
      f = v.colorVar, v.charVar && (c = v.charVar), v.flagsVar && (i = v.flagsVar), v.rotationVar && (u = v.rotationVar);
    };
    for (let s = m.length - 1; s >= 0; s--) h(m[s]);
    for (let s = 0; s < p.length; s++) {
      const l = d[s];
      (!l || l.type !== "coord" && l.type !== "combineCoord") && h(s);
    }
    return { coordVar: o, colorVar: f, charVar: c, flagsVar: i, rotationVar: u };
  }
  _getProcessedTransform(e) {
    return S.getProcessed(e);
  }
  _processArguments(e, a, r) {
    const n = [];
    for (let o = 0; o < a.length; o++) {
      const c = a[o], i = e[o] ?? c.default, u = this._uniformManager.processArgument(i, c, r);
      n.push(u.glslValue);
    }
    return n;
  }
  _generateTransformCode(e, a, r, n, o, c, i, u, f) {
    const p = (...l) => [...l, ...u].join(", ");
    let d = n, m = o, h = c, s = i;
    switch (e.type) {
      case "src": {
        const l = `c${a}`;
        this._mainCode.push(`	vec4 ${l} = ${e.name}(${p(r)});`), d = l;
        break;
      }
      case "coord": {
        const l = `st${a}`;
        this._mainCode.push(`	vec2 ${l} = ${e.name}(${p(r)});`), this._mainCode.push(`	${r} = ${l};`);
        break;
      }
      case "color": {
        const l = `c${a}`;
        this._mainCode.push(`	vec4 ${l} = ${e.name}(${p(n)});`), d = l;
        break;
      }
      case "combine": {
        const l = `c${a}`;
        this._mainCode.push(`	vec4 ${l} = ${e.name}(${p(n, f ?? "vec4(0.0)")});`), d = l;
        break;
      }
      case "combineCoord": {
        const l = `st${a}`;
        this._mainCode.push(`	vec2 ${l} = ${e.name}(${p(r, f ?? "vec4(0.0)")});`), this._mainCode.push(`	${r} = ${l};`);
        break;
      }
      case "charModify":
        m || (m = `char${a}`, h = `flags${a}`, s = `rot${a}`, this._mainCode.push(`	vec4 ${m} = vec4(0.0);`), this._mainCode.push(`	float ${h} = 0.0;`), this._mainCode.push(`	float ${s} = 0.0;`)), this._mainCode.push(`	${m} = ${e.name}(${p(m)});`);
    }
    return { colorVar: d, charVar: m, flagsVar: h, rotationVar: s };
  }
}
class re {
  _resolvedIndices;
  _lastFontCharacterCount = 0;
  _lastChars = "";
  resolve(e, a) {
    const r = a.characters.length;
    if (this._resolvedIndices && this._lastFontCharacterCount === r && this._lastChars === e) return this._resolvedIndices;
    const n = Array.from(e), o = new Int32Array(n.length), c = a.characterMap, i = a.characters;
    for (let u = 0; u < n.length; u++) {
      const f = n[u], p = c.get(f);
      if (p !== void 0) o[u] = i.indexOf(p);
      else {
        const d = c.get(" ");
        o[u] = d !== void 0 ? i.indexOf(d) : 0;
      }
    }
    return this._resolvedIndices = o, this._lastFontCharacterCount = r, this._lastChars = e, o;
  }
  invalidate() {
    this._resolvedIndices = void 0, this._lastFontCharacterCount = 0, this._lastChars = "";
  }
}
const x = "textmode.synth.js", oe = { name: x, version: "1.0.0", install(t, e) {
  e.extendLayer("synth", function(a) {
    const r = performance.now() / 1e3, n = this.grid !== void 0 && this.drawFramebuffer !== void 0;
    let o = this.getPluginState(x);
    o ? (o.source = a, o.startTime = r, o.needsCompile = !0, o.characterResolver.invalidate(), n && (o.compiled = $(a))) : o = { source: a, compiled: n ? $(a) : void 0, shader: void 0, characterResolver: new re(), startTime: r, needsCompile: !0, pingPongBuffers: void 0, pingPongIndex: 0 }, this.setPluginState(x, o);
  }), e.registerLayerPreRenderHook(async (a) => {
    const r = a.getPluginState(x);
    if (!r) return;
    const n = a.grid, o = a.drawFramebuffer;
    if (!n || !o || (r.compiled || (r.compiled = $(r.source), r.needsCompile = !0), r.needsCompile && r.compiled && (r.shader?.dispose && r.shader.dispose(), r.shader = await t.createFilterShader(r.compiled.fragmentSource), r.needsCompile = !1), !r.shader || !r.compiled)) return;
    const c = r.compiled.usesFeedback, i = r.compiled.usesCharFeedback, u = r.compiled.usesCellColorFeedback, f = c || i || u;
    f && !r.pingPongBuffers && (r.pingPongBuffers = [t.createFramebuffer({ width: n.cols, height: n.rows, attachments: 3 }), t.createFramebuffer({ width: n.cols, height: n.rows, attachments: 3 })], r.pingPongIndex = 0);
    const p = { time: t.millis() / 1e3, frameCount: t.frameCount, width: n.width, height: n.height, cols: n.cols, rows: n.rows }, d = (m) => {
      t.setUniform("time", p.time), t.setUniform("resolution", [p.cols, p.rows]);
      for (const [h, s] of r.compiled.dynamicUpdaters) t.setUniform(h, s(p));
      for (const [h, s] of r.compiled.uniforms) s.isDynamic || typeof s.value == "function" || t.setUniform(h, s.value);
      if (r.compiled.charMapping) {
        const h = r.characterResolver.resolve(r.compiled.charMapping.chars, a.font);
        t.setUniform("u_charMap", h), t.setUniform("u_charMapSize", h.length);
      }
      m && (c && t.setUniform("prevBuffer", m.textures[1]), i && t.setUniform("prevCharBuffer", m.textures[0]), u && t.setUniform("prevCellColorBuffer", m.textures[2]));
    };
    if (f && r.pingPongBuffers) {
      const m = r.pingPongBuffers[r.pingPongIndex], h = r.pingPongBuffers[1 - r.pingPongIndex];
      h.begin(), t.clear(), t.shader(r.shader), d(m), t.rect(n.cols, n.rows), h.end(), o.begin(), t.clear(), t.shader(r.shader), d(m), t.rect(n.cols, n.rows), o.end(), r.pingPongIndex = 1 - r.pingPongIndex;
    } else o.begin(), t.clear(), t.shader(r.shader), d(null), t.rect(n.cols, n.rows), o.end();
  }), e.registerLayerDisposedHook((a) => {
    const r = a.getPluginState(x);
    r && (r.shader?.dispose && r.shader.dispose(), r.pingPongBuffers && (r.pingPongBuffers[0].dispose?.(), r.pingPongBuffers[1].dispose?.()));
  });
}, uninstall(t, e) {
  const a = [e.layerManager.base, ...e.layerManager.all];
  for (const r of a) {
    const n = r.getPluginState(x);
    n && (n.shader?.dispose && n.shader.dispose(), n.pingPongBuffers && (n.pingPongBuffers[0].dispose?.(), n.pingPongBuffers[1].dispose?.()));
  }
  e.removeLayerExtension("synth");
} };
Qt(), S.registerMany(Kt), w.setSynthSourceClass(_), w.injectMethods(_.prototype);
const g = w.generateStandaloneFunctions();
function ae() {
  return (t, e = 256) => {
    const a = new _();
    return a._charSource = t, a._charCount = e, a;
  };
}
const se = ae(), ce = (t) => {
  const e = new _();
  return e._colorSource = t, e;
}, le = (t) => {
  const e = new _();
  return e._cellColorSource = t, e;
}, ie = (t) => {
  const e = new _();
  return e._colorSource = t, e._cellColorSource = t, e;
}, ue = g.osc, pe = g.noise, fe = g.voronoi, me = g.gradient, de = g.shape, he = g.solid, ye = g.src, ge = g.charSrc, _e = g.cellColorSrc;
export {
  oe as SynthPlugin,
  _ as SynthSource,
  le as cellColor,
  _e as cellColorSrc,
  se as char,
  ce as charColor,
  ge as charSrc,
  me as gradient,
  pe as noise,
  ue as osc,
  ie as paint,
  de as shape,
  he as solid,
  ye as src,
  fe as voronoi
};

(function(y,I){typeof exports=="object"&&typeof module<"u"?I(exports):typeof define=="function"&&define.amd?define(["exports"],I):I((y=typeof globalThis<"u"?globalThis:y||self).TextmodeSynth={})})(this,function(y){"use strict";const I={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]},char:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},charModify:{returnType:"vec4",args:[{type:"vec4",name:"_char"}]},charColor:{returnType:"vec4",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_char"}]},cellColor:{returnType:"vec4",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_char"},{type:"vec4",name:"_charColor"}]}},k=new class{_transforms=new Map;_processedCache=new Map;register(e){this._transforms.has(e.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`),this._transforms.set(e.name,e),this._processedCache.delete(e.name)}registerMany(e){for(const t of e)this.register(t)}get(e){return this._transforms.get(e)}getProcessed(e){let t=this._processedCache.get(e);if(!t){const r=this._transforms.get(e);r&&(t=(function(o){const n=I[o.type],s=[...n.args,...o.inputs.map(f=>({type:f.type,name:f.name}))].map(f=>`${f.type} ${f.name}`).join(", "),c=`
${n.returnType} ${o.name}(${s}) {
${o.glsl}
}`;return{...o,glslFunction:c}})(r),this._processedCache.set(e,t))}return t}has(e){return this._transforms.has(e)}getByType(e){return Array.from(this._transforms.values()).filter(t=>t.type===e)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src").concat(this.getByType("char"))}remove(e){return this._processedCache.delete(e),this._transforms.delete(e)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},Y=new Set(["src","char"]),z=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(e){this._synthSourceClass=e}injectMethods(e){const t=k.getAll();for(const r of t)this._injectMethod(e,r)}_injectMethod(e,t){const{name:r,inputs:o,type:n}=t;e[r]=n==="combine"||n==="combineCoord"?function(s,...c){const f=o.map((a,p)=>c[p]??a.default);return this.addCombineTransform(r,s,f)}:function(...s){const c=o.map((f,a)=>s[a]??f.default);return this.addTransform(r,c)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const e={},t=k.getAll(),r=this._synthSourceClass;for(const o of t)if(Y.has(o.type)){const{name:n,inputs:s}=o;e[n]=(...c)=>{const f=new r,a=s.map((p,m)=>c[m]??p.default);return f.addTransform(n,a)}}return this._generatedFunctions=e,e}getGeneratedFunctions(){return this._generatedFunctions}addTransform(e,t){if(k.register(e),t&&this._injectMethod(t,e),Y.has(e.type)&&this._synthSourceClass){const r=this._synthSourceClass,{name:o,inputs:n}=e;this._generatedFunctions[o]=(...s)=>{const c=new r,f=n.map((a,p)=>s[p]??a.default);return c.addTransform(o,f)}}}},j=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
	vec2 st = _st;
	float r = sin((st.x - offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	float g = sin((st.x + time*sync) * frequency) * 0.5 + 0.5;
	float b = sin((st.x + offset/frequency + time*sync) * frequency) * 0.5 + 0.5;
	return vec4(r, g, b, 1.0);
`,description:"Generate oscillating color pattern"},{name:"noise",type:"src",inputs:[{name:"scale",type:"float",default:10},{name:"offset",type:"float",default:.1}],glsl:`
	return vec4(vec3(_noise(vec3(_st * scale, offset * time))), 1.0);
`,description:"Generate noise pattern"},{name:"voronoi",type:"src",inputs:[{name:"scale",type:"float",default:5},{name:"speed",type:"float",default:.3},{name:"blending",type:"float",default:.3}],glsl:`
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
`,description:"Generate voronoi pattern"},{name:"gradient",type:"src",inputs:[{name:"speed",type:"float",default:0}],glsl:`
	return vec4(_st, sin(time * speed), 1.0);
`,description:"Generate gradient pattern"},{name:"shape",type:"src",inputs:[{name:"sides",type:"float",default:3},{name:"radius",type:"float",default:.3},{name:"smoothing",type:"float",default:.01}],glsl:`
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	return vec4(vec3(1.0 - smoothstep(radius, radius + smoothing + 0.0000001, d)), 1.0);
`,description:"Generate polygon shape"},{name:"solid",type:"src",inputs:[{name:"r",type:"float",default:0},{name:"g",type:"float",default:0},{name:"b",type:"float",default:0},{name:"a",type:"float",default:1}],glsl:`
	return vec4(r, g, b, a);
`,description:"Generate solid color"},{name:"src",type:"src",inputs:[{name:"output",type:"sampler2D",default:null}],glsl:`
	return texture(prevBuffer, fract(_st));
`,description:"Sample the previous frame primary color for feedback effects"},{name:"charSrc",type:"src",inputs:[{name:"output",type:"sampler2D",default:null}],glsl:`
	return texture(prevCharBuffer, fract(_st));
`,description:"Sample the previous frame character data for feedback effects"},{name:"cellColorSrc",type:"src",inputs:[{name:"output",type:"sampler2D",default:null}],glsl:`
	return texture(prevCellColorBuffer, fract(_st));
`,description:"Sample the previous frame cell color for feedback effects"},{name:"rotate",type:"coord",inputs:[{name:"angle",type:"float",default:10},{name:"speed",type:"float",default:0}],glsl:`
	vec2 xy = _st - vec2(0.5);
	float ang = angle + speed * time;
	xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * xy;
	xy += 0.5;
	return xy;
`,description:"Rotate coordinates"},{name:"scale",type:"coord",inputs:[{name:"amount",type:"float",default:1.5},{name:"xMult",type:"float",default:1},{name:"yMult",type:"float",default:1},{name:"offsetX",type:"float",default:.5},{name:"offsetY",type:"float",default:.5}],glsl:`
	vec2 xy = _st - vec2(offsetX, offsetY);
	xy *= (1.0 / vec2(amount * xMult, amount * yMult));
	xy += vec2(offsetX, offsetY);
	return xy;
`,description:"Scale coordinates"},{name:"scroll",type:"coord",inputs:[{name:"scrollX",type:"float",default:.5},{name:"scrollY",type:"float",default:.5},{name:"speedX",type:"float",default:0},{name:"speedY",type:"float",default:0}],glsl:`
	vec2 st = _st;
	st.x += scrollX + time * speedX;
	st.y += scrollY + time * speedY;
	return fract(st);
`,description:"Scroll coordinates"},{name:"scrollX",type:"coord",inputs:[{name:"scrollX",type:"float",default:.5},{name:"speed",type:"float",default:0}],glsl:`
	vec2 st = _st;
	st.x += scrollX + time * speed;
	return fract(st);
`,description:"Scroll X coordinate"},{name:"scrollY",type:"coord",inputs:[{name:"scrollY",type:"float",default:.5},{name:"speed",type:"float",default:0}],glsl:`
	vec2 st = _st;
	st.y += scrollY + time * speed;
	return fract(st);
`,description:"Scroll Y coordinate"},{name:"pixelate",type:"coord",inputs:[{name:"pixelX",type:"float",default:20},{name:"pixelY",type:"float",default:20}],glsl:`
	vec2 xy = vec2(pixelX, pixelY);
	return (floor(_st * xy) + 0.5) / xy;
`,description:"Pixelate coordinates"},{name:"repeat",type:"coord",inputs:[{name:"repeatX",type:"float",default:3},{name:"repeatY",type:"float",default:3},{name:"offsetX",type:"float",default:0},{name:"offsetY",type:"float",default:0}],glsl:`
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) * offsetY;
	return fract(st);
`,description:"Repeat pattern"},{name:"repeatX",type:"coord",inputs:[{name:"reps",type:"float",default:3},{name:"offset",type:"float",default:0}],glsl:`
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) * offset;
	return fract(st);
`,description:"Repeat pattern horizontally"},{name:"repeatY",type:"coord",inputs:[{name:"reps",type:"float",default:3},{name:"offset",type:"float",default:0}],glsl:`
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) * offset;
	return fract(st);
`,description:"Repeat pattern vertically"},{name:"kaleid",type:"coord",inputs:[{name:"nSides",type:"float",default:4}],glsl:`
	vec2 st = _st;
	st -= 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return r * vec2(cos(a), sin(a));
`,description:"Kaleidoscope effect"},{name:"brightness",type:"color",inputs:[{name:"amount",type:"float",default:.4}],glsl:`
	return vec4(_c0.rgb + vec3(amount), _c0.a);
`,description:"Adjust brightness"},{name:"contrast",type:"color",inputs:[{name:"amount",type:"float",default:1.6}],glsl:`
	vec4 c = (_c0 - vec4(0.5)) * vec4(amount) + vec4(0.5);
	return vec4(c.rgb, _c0.a);
`,description:"Adjust contrast"},{name:"invert",type:"color",inputs:[{name:"amount",type:"float",default:1}],glsl:`
	return vec4((1.0 - _c0.rgb) * amount + _c0.rgb * (1.0 - amount), _c0.a);
`,description:"Invert colors"},{name:"saturate",type:"color",inputs:[{name:"amount",type:"float",default:2}],glsl:`
	const vec3 W = vec3(0.2125, 0.7154, 0.0721);
	vec3 intensity = vec3(dot(_c0.rgb, W));
	return vec4(mix(intensity, _c0.rgb, amount), _c0.a);
`,description:"Adjust saturation"},{name:"hue",type:"color",inputs:[{name:"hue",type:"float",default:.4}],glsl:`
	vec3 c = _rgbToHsv(_c0.rgb);
	c.r += hue;
	return vec4(_hsvToRgb(c), _c0.a);
`,description:"Shift hue"},{name:"colorama",type:"color",inputs:[{name:"amount",type:"float",default:.005}],glsl:`
	vec3 c = _rgbToHsv(_c0.rgb);
	c += vec3(amount);
	c = _hsvToRgb(c);
	c = fract(c);
	return vec4(c, _c0.a);
`,description:"Color cycle effect"},{name:"posterize",type:"color",inputs:[{name:"bins",type:"float",default:3},{name:"gamma",type:"float",default:.6}],glsl:`
	vec4 c2 = pow(_c0, vec4(gamma));
	c2 *= vec4(bins);
	c2 = floor(c2);
	c2 /= vec4(bins);
	c2 = pow(c2, vec4(1.0 / gamma));
	return vec4(c2.xyz, _c0.a);
`,description:"Posterize colors"},{name:"luma",type:"color",inputs:[{name:"threshold",type:"float",default:.5},{name:"tolerance",type:"float",default:.1}],glsl:`
	float a = smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb));
	return vec4(_c0.rgb * a, a);
`,description:"Luma key"},{name:"thresh",type:"color",inputs:[{name:"threshold",type:"float",default:.5},{name:"tolerance",type:"float",default:.04}],glsl:`
	return vec4(vec3(smoothstep(threshold - (tolerance + 0.0000001), threshold + (tolerance + 0.0000001), _luminance(_c0.rgb))), _c0.a);
`,description:"Threshold"},{name:"color",type:"color",inputs:[{name:"r",type:"float",default:1},{name:"g",type:"float",default:1},{name:"b",type:"float",default:1},{name:"a",type:"float",default:1}],glsl:`
	vec4 c = vec4(r, g, b, a);
	vec4 pos = step(0.0, c);
	return vec4(mix((1.0 - _c0.rgb) * abs(c.rgb), c.rgb * _c0.rgb, pos.rgb), c.a * _c0.a);
`,description:"Multiply by color"},{name:"r",type:"color",inputs:[{name:"scale",type:"float",default:1},{name:"offset",type:"float",default:0}],glsl:`
	return vec4(_c0.r * scale + offset);
`,description:"Extract red channel"},{name:"g",type:"color",inputs:[{name:"scale",type:"float",default:1},{name:"offset",type:"float",default:0}],glsl:`
	return vec4(_c0.g * scale + offset);
`,description:"Extract green channel"},{name:"b",type:"color",inputs:[{name:"scale",type:"float",default:1},{name:"offset",type:"float",default:0}],glsl:`
	return vec4(_c0.b * scale + offset);
`,description:"Extract blue channel"},{name:"shift",type:"color",inputs:[{name:"r",type:"float",default:.5},{name:"g",type:"float",default:0},{name:"b",type:"float",default:0},{name:"a",type:"float",default:0}],glsl:`
	vec4 c2 = vec4(_c0);
	c2.r += fract(r);
	c2.g += fract(g);
	c2.b += fract(b);
	c2.a += fract(a);
	return vec4(c2.rgba);
`,description:"Shift color channels by adding offset values"},{name:"gamma",type:"color",inputs:[{name:"amount",type:"float",default:1}],glsl:`
	return vec4(pow(max(vec3(0.0), _c0.rgb), vec3(1.0 / amount)), _c0.a);
`,description:"Apply gamma correction"},{name:"levels",type:"color",inputs:[{name:"inMin",type:"float",default:0},{name:"inMax",type:"float",default:1},{name:"outMin",type:"float",default:0},{name:"outMax",type:"float",default:1},{name:"gamma",type:"float",default:1}],glsl:`
	vec3 v = clamp((_c0.rgb - vec3(inMin)) / (vec3(inMax - inMin) + 0.0000001), 0.0, 1.0);
	v = pow(v, vec3(1.0 / gamma));
	v = mix(vec3(outMin), vec3(outMax), v);
	return vec4(v, _c0.a);
`,description:"Adjust input/output levels and gamma"},{name:"clampColor",type:"color",inputs:[{name:"min",type:"float",default:0},{name:"max",type:"float",default:1}],glsl:`
	return vec4(clamp(_c0.rgb, vec3(min), vec3(max)), _c0.a);
`,description:"Clamp color values to a range"},{name:"add",type:"combine",inputs:[{name:"amount",type:"float",default:1}],glsl:`
	return (_c0 + _c1) * amount + _c0 * (1.0 - amount);
`,description:"Add another source"},{name:"sub",type:"combine",inputs:[{name:"amount",type:"float",default:1}],glsl:`
	return (_c0 - _c1) * amount + _c0 * (1.0 - amount);
`,description:"Subtract another source"},{name:"mult",type:"combine",inputs:[{name:"amount",type:"float",default:1}],glsl:`
	return _c0 * (1.0 - amount) + (_c0 * _c1) * amount;
`,description:"Multiply with another source"},{name:"blend",type:"combine",inputs:[{name:"amount",type:"float",default:.5}],glsl:`
	return _c0 * (1.0 - amount) + _c1 * amount;
`,description:"Blend with another source"},{name:"diff",type:"combine",inputs:[],glsl:`
	return vec4(abs(_c0.rgb - _c1.rgb), max(_c0.a, _c1.a));
`,description:"Difference with another source"},{name:"layer",type:"combine",inputs:[],glsl:`
	return vec4(mix(_c0.rgb, _c1.rgb, _c1.a), clamp(_c0.a + _c1.a, 0.0, 1.0));
`,description:"Layer another source on top"},{name:"mask",type:"combine",inputs:[],glsl:`
	float a = _luminance(_c1.rgb);
	return vec4(_c0.rgb * a, a * _c0.a);
`,description:"Mask with another source"},{name:"modulate",type:"combineCoord",inputs:[{name:"amount",type:"float",default:.1}],glsl:`
	return _st + _c0.xy * amount;
`,description:"Modulate coordinates with another source"},{name:"modulateScale",type:"combineCoord",inputs:[{name:"multiple",type:"float",default:1},{name:"offset",type:"float",default:1}],glsl:`
	vec2 xy = _st - vec2(0.5);
	xy *= (1.0 / vec2(offset + multiple * _c0.r, offset + multiple * _c0.g));
	xy += vec2(0.5);
	return xy;
`,description:"Modulate scale with another source"},{name:"modulateRotate",type:"combineCoord",inputs:[{name:"multiple",type:"float",default:1},{name:"offset",type:"float",default:0}],glsl:`
	vec2 xy = _st - vec2(0.5);
	float angle = offset + _c0.x * multiple;
	xy = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * xy;
	xy += 0.5;
	return xy;
`,description:"Modulate rotation with another source"},{name:"modulatePixelate",type:"combineCoord",inputs:[{name:"multiple",type:"float",default:10},{name:"offset",type:"float",default:3}],glsl:`
	vec2 xy = vec2(offset + _c0.x * multiple, offset + _c0.y * multiple);
	return (floor(_st * xy) + 0.5) / xy;
`,description:"Modulate pixelation with another source"},{name:"modulateKaleid",type:"combineCoord",inputs:[{name:"nSides",type:"float",default:4}],glsl:`
	vec2 st = _st - 0.5;
	float r = length(st);
	float a = atan(st.y, st.x);
	float pi = 2.0 * 3.1416;
	a = mod(a, pi / nSides);
	a = abs(a - pi / nSides / 2.0);
	return (_c0.r + r) * vec2(cos(a), sin(a));
`,description:"Modulate kaleidoscope with another source"},{name:"modulateScrollX",type:"combineCoord",inputs:[{name:"scrollX",type:"float",default:.5},{name:"speed",type:"float",default:0}],glsl:`
	vec2 st = _st;
	st.x += _c0.r * scrollX + time * speed;
	return fract(st);
`,description:"Modulate X scroll with another source"},{name:"modulateScrollY",type:"combineCoord",inputs:[{name:"scrollY",type:"float",default:.5},{name:"speed",type:"float",default:0}],glsl:`
	vec2 st = _st;
	st.y += _c0.r * scrollY + time * speed;
	return fract(st);
`,description:"Modulate Y scroll with another source"},{name:"modulateRepeat",type:"combineCoord",inputs:[{name:"repeatX",type:"float",default:3},{name:"repeatY",type:"float",default:3},{name:"offsetX",type:"float",default:.5},{name:"offsetY",type:"float",default:.5}],glsl:`
	vec2 st = _st * vec2(repeatX, repeatY);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offsetX;
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.g * offsetY;
	return fract(st);
`,description:"Modulate repeat pattern with another source"},{name:"modulateRepeatX",type:"combineCoord",inputs:[{name:"reps",type:"float",default:3},{name:"offset",type:"float",default:.5}],glsl:`
	vec2 st = _st * vec2(reps, 1.0);
	st.y += step(1.0, mod(st.x, 2.0)) + _c0.r * offset;
	return fract(st);
`,description:"Modulate X repeat with another source"},{name:"modulateRepeatY",type:"combineCoord",inputs:[{name:"reps",type:"float",default:3},{name:"offset",type:"float",default:.5}],glsl:`
	vec2 st = _st * vec2(1.0, reps);
	st.x += step(1.0, mod(st.y, 2.0)) + _c0.r * offset;
	return fract(st);
`,description:"Modulate Y repeat with another source"},{name:"modulateHue",type:"combineCoord",inputs:[{name:"amount",type:"float",default:1}],glsl:`
	return _st + (vec2(_c0.g - _c0.r, _c0.b - _c0.g) * amount * 1.0 / resolution);
`,description:"Modulate coordinates based on hue differences"},{name:"charNoise",type:"char",inputs:[{name:"scale",type:"float",default:10},{name:"offset",type:"float",default:.5},{name:"charCount",type:"float",default:256}],glsl:`
	float n = _noise(vec3(_st * scale, offset * time));
	n = n * 0.5 + 0.5;
	int charIndex = int(n * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,description:"Generate characters from noise"},{name:"charOsc",type:"char",inputs:[{name:"frequency",type:"float",default:8},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0},{name:"charCount",type:"float",default:256}],glsl:`
	float wave = sin((_st.x - offset/frequency + time * sync) * frequency) * 0.5 + 0.5;
	int charIndex = int(wave * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,description:"Generate characters from oscillator"},{name:"charGradient",type:"char",inputs:[{name:"speed",type:"float",default:0},{name:"charCount",type:"float",default:256}],glsl:`
	float t = _st.x + sin(time * speed);
	int charIndex = int(fract(t) * charCount);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,description:"Generate characters from gradient"},{name:"charVoronoi",type:"char",inputs:[{name:"scale",type:"float",default:5},{name:"speed",type:"float",default:.3},{name:"charCount",type:"float",default:256}],glsl:`
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
`,description:"Generate characters from voronoi"},{name:"charShape",type:"char",inputs:[{name:"sides",type:"float",default:4},{name:"innerChar",type:"float",default:64},{name:"outerChar",type:"float",default:32},{name:"radius",type:"float",default:.3}],glsl:`
	vec2 st = _st * 2.0 - 1.0;
	float a = atan(st.x, st.y) + 3.1416;
	float r = (2.0 * 3.1416) / sides;
	float d = cos(floor(0.5 + a/r) * r - a) * length(st);
	int charIndex = d < radius ? int(innerChar) : int(outerChar);
	return vec4(float(charIndex % 256) / 255.0, float(charIndex / 256) / 255.0, 0.0, 0.0);
`,description:"Generate characters from shape"},{name:"charSolid",type:"char",inputs:[{name:"charIndex",type:"float",default:64}],glsl:`
	int idx = int(charIndex);
	return vec4(float(idx % 256) / 255.0, float(idx / 256) / 255.0, 0.0, 0.0);
`,description:"Set a solid character"},{name:"charFlipX",type:"charModify",inputs:[{name:"toggle",type:"float",default:1}],glsl:`
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 2;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`,description:"Flip characters horizontally"},{name:"charFlipY",type:"charModify",inputs:[{name:"toggle",type:"float",default:1}],glsl:`
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 4;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`,description:"Flip characters vertically"},{name:"charInvert",type:"charModify",inputs:[{name:"toggle",type:"float",default:1}],glsl:`
	int flags = int(_char.b * 255.0 + 0.5);
	if (toggle > 0.5) {
		flags = flags | 1;
	}
	return vec4(_char.rg, float(flags) / 255.0, _char.a);
`,description:"Invert character colors"},{name:"charRotate",type:"charModify",inputs:[{name:"angle",type:"float",default:.25},{name:"speed",type:"float",default:0}],glsl:`
	float rotation = fract(angle + time * speed);
	return vec4(_char.rgb, rotation);
`,description:"Rotate characters"}];class M{_transforms;constructor(t){this._transforms=t}static empty(){return new M([])}static from(t){return new M([...t])}get transforms(){return this._transforms}push(t){this._transforms.push(t)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(t){return new M([...this._transforms,t])}get(t){return this._transforms[t]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class E{id;_layer;isSelf;constructor(t,r=!1){this.id=t,this.isSelf=r}setLayer(t){this._layer=t}getLayer(){return this._layer}hasLayer(){return this._layer!==void 0}}const N=new E("__self__",!0);let q=0;function X(e){return e instanceof E}class R{_chain;_charMapping;_nestedSources;_colorSource;_cellColorSource;_externalOutputs;constructor(t){this._chain=t?.chain??M.empty(),this._charMapping=t?.charMapping,this._colorSource=t?.colorSource,this._cellColorSource=t?.cellColorSource,this._nestedSources=t?.nestedSources??new Map,this._externalOutputs=t?.externalOutputs??[]}addTransform(t,r){const o={name:t,userArgs:r},n=this._chain.length;for(const s of r)if(X(s)&&!s.isSelf){let c="color";t==="charSrc"?c="char":t==="cellColorSrc"&&(c="cellColor"),this._externalOutputs.push({output:s,textureType:c,transformName:t,transformIndex:n})}return this._chain.push(o),this}addCombineTransform(t,r,o){const n=this._chain.length;return this._nestedSources.set(n,r),this.addTransform(t,o)}charMap(t){return this._charMapping=(function(r){const o=Array.from(r),n=[];for(const s of o)n.push(s.codePointAt(0)??32);return{chars:r,indices:n}})(t),this}charColor(t){return this._colorSource=t,this}cellColor(t){return this._cellColorSource=t,this}paint(t){return this._colorSource=t,this._cellColorSource=t,this}clone(){const t=new Map;for(const[o,n]of this._nestedSources)t.set(o,n.clone());const r=[...this._externalOutputs];return new R({chain:M.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),nestedSources:t,externalOutputs:r})}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get nestedSources(){return this._nestedSources}get externalOutputs(){return this._externalOutputs}collectAllExternalOutputs(){const t=[...this._externalOutputs];for(const[,r]of this._nestedSources)t.push(...r.collectAllExternalOutputs());return this._colorSource&&t.push(...this._colorSource.collectAllExternalOutputs()),this._cellColorSource&&t.push(...this._cellColorSource.collectAllExternalOutputs()),t}}const L={linear:e=>e,easeInQuad:e=>e*e,easeOutQuad:e=>e*(2-e),easeInOutQuad:e=>e<.5?2*e*e:(4-2*e)*e-1,easeInCubic:e=>e*e*e,easeOutCubic:e=>--e*e*e+1,easeInOutCubic:e=>e<.5?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1,easeInQuart:e=>e*e*e*e,easeOutQuart:e=>1- --e*e*e*e,easeInOutQuart:e=>e<.5?8*e*e*e*e:1-8*--e*e*e*e,easeInQuint:e=>e*e*e*e*e,easeOutQuint:e=>1+--e*e*e*e*e,easeInOutQuint:e=>e<.5?16*e*e*e*e*e:1+16*--e*e*e*e*e,sin:e=>(1+Math.sin(Math.PI*e-Math.PI/2))/2};function U(e,t){return(e%t+t)%t}class G{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(t,r,o){if((function(n){return Array.isArray(n)&&n.length>0&&typeof n[0]=="number"})(t)){const n=`${o}_${r.name}`,s={name:n,type:r.type,value:r.default??0,isDynamic:!0},c=f=>(function(a,p){const m=a._speed??1,d=a._smooth??0;let u=p.time*m*1+(a._offset??0);if(d!==0){const h=a._ease??L.linear,l=u-d/2,i=a[Math.floor(U(l,a.length))],_=a[Math.floor(U(l+1,a.length))];return h(Math.min(U(l,1)/d,1))*(_-i)+i}return a[Math.floor(U(u,a.length))]})(t,f);return this._uniforms.set(n,s),this._dynamicUpdaters.set(n,c),{glslValue:n,uniform:s,updater:c}}if(typeof t=="function"){const n=`${o}_${r.name}`,s={name:n,type:r.type,value:r.default??0,isDynamic:!0};return this._uniforms.set(n,s),this._dynamicUpdaters.set(n,t),{glslValue:n,uniform:s,updater:t}}if(typeof t=="number")return{glslValue:v(t)};if(Array.isArray(t)&&typeof t[0]=="number"){const n=t;if(n.length===2)return{glslValue:`vec2(${v(n[0])}, ${v(n[1])})`};if(n.length===3)return{glslValue:`vec3(${v(n[0])}, ${v(n[1])}, ${v(n[2])})`};if(n.length===4)return{glslValue:`vec4(${v(n[0])}, ${v(n[1])}, ${v(n[2])}, ${v(n[3])})`}}return this.processDefault(r)}processDefault(t){const r=t.default;return typeof r=="number"?{glslValue:v(r)}:Array.isArray(r)?{glslValue:`vec${r.length}(${r.map(v).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function v(e){const t=e.toString();return t.includes(".")?t:t+".0"}function P(e){return new K().compile(e)}class K{_varCounter=0;_uniformManager=new G;_glslFunctions=new Set;_mainCode=[];_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;_externalTextures=new Map;_getExternalKey(t,r){return`${t}_${r}`}_registerExternalOutput(t){const r=this._getExternalKey(t.output.id,t.textureType);if(!this._externalTextures.has(r)){const o=`u_ext_${t.output.id}_${t.textureType}`;this._externalTextures.set(r,{samplerName:o,outputRef:t})}return this._externalTextures.get(r).samplerName}compile(t){this._varCounter=0,this._uniformManager.clear(),this._glslFunctions.clear(),this._mainCode.length=0,this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1,this._externalTextures.clear();const r=this._compileChain(t,"main","vec4(1.0, 1.0, 1.0, 1.0)");let o=r.colorVar;t.colorSource&&(o=this._compileChain(t.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)").colorVar);let n="vec4(0.0, 0.0, 0.0, 0.0)";t.cellColorSource&&(n=this._compileChain(t.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)").colorVar);const s=(c=!!r.charVar,f=r.charVar??"vec4(0.0)",a=r.colorVar,c?`
	// Character output from generator
	vec4 charOutput = ${f};`:`
	// Derive character from color luminance
	float lum = _luminance(${a}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`);var c,f,a;return{fragmentSource:(function(m){const{uniforms:d,glslFunctions:u,mainCode:h,charOutputCode:l,primaryColorVar:i,cellColorVar:_,charMapping:x,usesFeedback:C,usesCharFeedback:w,usesCellColorFeedback:S,externalTextures:T}=m,B=Array.from(d.values()).map(V=>`uniform ${V.type} ${V.name};`).join(`
`);let O="",b="";x&&(O=`uniform int u_charMap[${x.indices.length}];
uniform int u_charMapSize;`,b=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const $=[];C&&$.push("uniform sampler2D prevBuffer;"),w&&$.push("uniform sampler2D prevCharBuffer;"),S&&$.push("uniform sampler2D prevCellColorBuffer;");const D=$.join(`
`),A=[];if(T&&T.length>0)for(const V of T)A.push(`uniform sampler2D ${V.samplerName};`);return`#version 300 es
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
${D}
${A.length>0?`// External layer textures
${A.join(`
`)}`:""}
${O}

// Dynamic uniforms
${B}


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


// Transform functions
${Array.from(u).join(`
`)}

void main() {
	// Transform chain
${h.join(`
`)}

${l}
${b}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${i};
	o_secondaryColor = ${_};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:s,primaryColorVar:o,cellColorVar:n,charMapping:t.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback,externalTextures:Array.from(this._externalTextures.values())}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:t.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback,externalTextures:Array.from(this._externalTextures.values())}}_compileChain(t,r,o,n="v_uv"){const s=`${r}_st`;let c,f,a,p=`${r}_c`;this._mainCode.push(`	vec2 ${s} = ${n};`),this._mainCode.push(`	vec4 ${p} = ${o};`);const m=t.transforms,d=m.map(l=>this._getProcessedTransform(l.name)),u=[];for(let l=0;l<d.length;l++){const i=d[l];i&&(i.type!=="coord"&&i.type!=="combineCoord"||u.push(l))}const h=l=>{const i=m[l],_=d[l];if(!_)return void console.warn(`[SynthCompiler] Unknown transform: ${i.name}`);const x=i.name==="prev"||i.name==="src"||i.name==="charSrc"||i.name==="cellColorSrc",C=i.userArgs[0],w=X(C)&&!C.isSelf;if(x&&!w&&(i.name==="prev"||i.name==="src"?this._usesFeedback=!0:i.name==="charSrc"?this._usesCharFeedback=!0:i.name==="cellColorSrc"&&(this._usesCellColorFeedback=!0)),x&&w){let $="color";i.name==="charSrc"?$="char":i.name==="cellColorSrc"&&($="cellColor");const D=this._registerExternalOutput({output:C,textureType:$,transformName:i.name,transformIndex:l}),A=`c${this._varCounter++}`;return this._mainCode.push(`	vec4 ${A} = texture(${D}, fract(${s}));`),void(p=A)}this._glslFunctions.add(_.glslFunction);const S=this._processArguments(i.userArgs,_.inputs,`${r}_${l}_${i.name}`),T=t.nestedSources.get(l);let B;T&&(_.type==="combine"||_.type==="combineCoord")&&(B=this._compileChain(T,`${r}_nested_${l}`,o,s).colorVar);const O=this._varCounter++,b=this._generateTransformCode(_,O,s,p,c,f,a,S,B);p=b.colorVar,b.charVar&&(c=b.charVar),b.flagsVar&&(f=b.flagsVar),b.rotationVar&&(a=b.rotationVar)};for(let l=u.length-1;l>=0;l--)h(u[l]);for(let l=0;l<m.length;l++){const i=d[l];(!i||i.type!=="coord"&&i.type!=="combineCoord")&&h(l)}return{coordVar:s,colorVar:p,charVar:c,flagsVar:f,rotationVar:a}}_getProcessedTransform(t){return k.getProcessed(t)}_processArguments(t,r,o){const n=[];for(let s=0;s<r.length;s++){const c=r[s],f=t[s]??c.default,a=this._uniformManager.processArgument(f,c,o);n.push(a.glslValue)}return n}_generateTransformCode(t,r,o,n,s,c,f,a,p){const m=(...i)=>[...i,...a].join(", ");let d=n,u=s,h=c,l=f;switch(t.type){case"src":{const i=`c${r}`;this._mainCode.push(`	vec4 ${i} = ${t.name}(${m(o)});`),d=i;break}case"coord":{const i=`st${r}`;this._mainCode.push(`	vec2 ${i} = ${t.name}(${m(o)});`),this._mainCode.push(`	${o} = ${i};`);break}case"color":{const i=`c${r}`;this._mainCode.push(`	vec4 ${i} = ${t.name}(${m(n)});`),d=i;break}case"combine":{const i=`c${r}`;this._mainCode.push(`	vec4 ${i} = ${t.name}(${m(n,p??"vec4(0.0)")});`),d=i;break}case"combineCoord":{const i=`st${r}`;this._mainCode.push(`	vec2 ${i} = ${t.name}(${m(o,p??"vec4(0.0)")});`),this._mainCode.push(`	${o} = ${i};`);break}case"char":u||(u=`char${r}`,h=`flags${r}`,l=`rot${r}`,this._mainCode.push(`	vec4 ${u} = vec4(0.0);`),this._mainCode.push(`	float ${h} = 0.0;`),this._mainCode.push(`	float ${l} = 0.0;`)),this._mainCode.push(`	${u} = ${t.name}(${m(o)});`);break;case"charModify":u||(u=`char${r}`,h=`flags${r}`,l=`rot${r}`,this._mainCode.push(`	vec4 ${u} = vec4(0.0);`),this._mainCode.push(`	float ${h} = 0.0;`),this._mainCode.push(`	float ${l} = 0.0;`)),this._mainCode.push(`	${u} = ${t.name}(${m(u)});`);break;case"charColor":{const i=`c${r}`;this._mainCode.push(`	vec4 ${i} = ${t.name}(${m(o,u??"vec4(0.0)")});`),d=i;break}case"cellColor":{const i=`c${r}`;this._mainCode.push(`	vec4 ${i} = ${t.name}(${m(o,u??"vec4(0.0)",n)});`),d=i;break}}return{colorVar:d,charVar:u,flagsVar:h,rotationVar:l}}}class Q{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(t,r){const o=r.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===o&&this._lastChars===t)return this._resolvedIndices;const n=Array.from(t),s=new Int32Array(n.length),c=r.characterMap,f=r.characters;for(let a=0;a<n.length;a++){const p=n[a],m=c.get(p);if(m!==void 0)s[a]=f.indexOf(m);else{const d=c.get(" ");s[a]=d!==void 0?f.indexOf(d):0,console.warn(`[CharacterResolver] Character '${p}' not found in font, using fallback`)}}return this._resolvedIndices=s,this._lastFontCharacterCount=o,this._lastChars=t,s}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}class H{_textmodifier;_gl;_characterResolver;_shader;_compiled;_uniformLocations=new Map;_vao;_positionBuffer;constructor(t,r){this._textmodifier=t,this._gl=r.context,this._characterResolver=new Q,this._initGeometry()}_initGeometry(){const t=this._gl;this._vao=t.createVertexArray(),t.bindVertexArray(this._vao),this._positionBuffer=t.createBuffer(),t.bindBuffer(t.ARRAY_BUFFER,this._positionBuffer),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),t.STATIC_DRAW),t.bindVertexArray(null)}async setShader(t){this._compiled=t,this._characterResolver.invalidate(),console.log(`[SynthRenderer] Generated fragment shader:
`,t.fragmentSource),this._shader=await this._textmodifier.createShader(`#version 300 es
precision highp float;

// Use explicit layout location for cross-platform compatibility
layout(location = 0) in vec2 a_position;

out vec2 v_uv;

void main() {
	vec2 uv = a_position * 0.5 + 0.5;
	v_uv = vec2(uv.x, 1.0 - uv.y);
	gl_Position = vec4(a_position, 0.0, 1.0);
}
`,t.fragmentSource),this._uniformLocations.clear(),this._cacheUniformLocation("time"),this._cacheUniformLocation("resolution");for(const[r]of t.uniforms)this._cacheUniformLocation(r);if(t.charMapping&&(this._cacheUniformLocation("u_charMap"),this._cacheUniformLocation("u_charMapSize")),t.usesFeedback&&this._cacheUniformLocation("prevBuffer"),t.usesCharFeedback&&this._cacheUniformLocation("prevCharBuffer"),t.usesCellColorFeedback&&this._cacheUniformLocation("prevCellColorBuffer"),t.externalTextures&&t.externalTextures.length>0)for(const r of t.externalTextures)this._cacheUniformLocation(r.samplerName)}_cacheUniformLocation(t){if(!this._shader)return;console.log(this._shader),console.log(this._shader.glProgram);const r=this._gl.getUniformLocation(this._shader.glProgram,t);r&&this._uniformLocations.set(t,r)}render(t,r,o,n,s,c,f){if(!this._shader||!this._compiled||!this._vao)return void console.warn("[SynthRenderer] Cannot render: missing shader, compiled data, or VAO");const a=this._gl;t.begin(),a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT|a.DEPTH_BUFFER_BIT),a.useProgram(this._shader.glProgram),this._setUniform("time",n.time),this._setUniform("resolution",[r,o]);for(const[u,h]of this._compiled.dynamicUpdaters){const l=h(n);this._setUniform(u,l)}for(const[u,h]of this._compiled.uniforms)h.isDynamic||typeof h.value=="function"||this._setUniform(u,h.value);if(this._compiled.charMapping){const u=this._uniformLocations.get("u_charMap"),h=this._uniformLocations.get("u_charMapSize");if(u&&h){const l=this._characterResolver.resolve(this._compiled.charMapping.chars,s);a.uniform1iv(u,l),a.uniform1i(h,l.length)}}let p=0;if(this._compiled.usesFeedback&&c?.prevBuffer){const u=this._uniformLocations.get("prevBuffer");u&&(a.activeTexture(a.TEXTURE0+p),a.bindTexture(a.TEXTURE_2D,c.prevBuffer),a.uniform1i(u,p),p++)}if(this._compiled.usesCharFeedback&&c?.prevCharBuffer){const u=this._uniformLocations.get("prevCharBuffer");u&&(a.activeTexture(a.TEXTURE0+p),a.bindTexture(a.TEXTURE_2D,c.prevCharBuffer),a.uniform1i(u,p),p++)}if(this._compiled.usesCellColorFeedback&&c?.prevCellColorBuffer){const u=this._uniformLocations.get("prevCellColorBuffer");u&&(a.activeTexture(a.TEXTURE0+p),a.bindTexture(a.TEXTURE_2D,c.prevCellColorBuffer),a.uniform1i(u,p),p++)}if(this._compiled.externalTextures&&f)for(const u of this._compiled.externalTextures){const h=f.get(u.samplerName);if(h){const l=this._uniformLocations.get(u.samplerName);l&&(a.activeTexture(a.TEXTURE0+p),a.bindTexture(a.TEXTURE_2D,h),a.uniform1i(l,p),p++)}}a.bindVertexArray(this._vao),a.bindBuffer(a.ARRAY_BUFFER,this._positionBuffer),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.drawArrays(a.TRIANGLE_STRIP,0,4);const m=a.getError();m!==a.NO_ERROR&&console.error("[SynthRenderer] GL error after draw:",m),a.disableVertexAttribArray(0);let d=0;if(this._compiled.usesFeedback&&c?.prevBuffer&&(a.activeTexture(a.TEXTURE0+d),a.bindTexture(a.TEXTURE_2D,null),d++),this._compiled.usesCharFeedback&&c?.prevCharBuffer&&(a.activeTexture(a.TEXTURE0+d),a.bindTexture(a.TEXTURE_2D,null),d++),this._compiled.usesCellColorFeedback&&c?.prevCellColorBuffer&&(a.activeTexture(a.TEXTURE0+d),a.bindTexture(a.TEXTURE_2D,null),d++),this._compiled.externalTextures&&f)for(const u of this._compiled.externalTextures)f.has(u.samplerName)&&(a.activeTexture(a.TEXTURE0+d),a.bindTexture(a.TEXTURE_2D,null),d++);a.bindVertexArray(null),t.end()}_setUniform(t,r){const o=this._uniformLocations.get(t);if(!o)return;const n=this._gl;if(typeof r=="number")n.uniform1f(o,r);else if(Array.isArray(r))switch(r.length){case 2:n.uniform2fv(o,r);break;case 3:n.uniform3fv(o,r);break;case 4:n.uniform4fv(o,r)}}dispose(){const t=this._gl;this._vao&&(t.deleteVertexArray(this._vao),this._vao=void 0),this._positionBuffer&&(t.deleteBuffer(this._positionBuffer),this._positionBuffer=void 0),this._uniformLocations.clear(),this._shader=void 0,this._compiled=void 0}}const F="textmode.synth.js",W={name:F,version:"1.0.0",install(e,t){const r=t.renderer;t.extendLayer("synth",function(o){const n=performance.now()/1e3,s=this.grid!==void 0&&this.drawFramebuffer!==void 0;let c=this.getPluginState(F);c?(c.source=o,c.startTime=n,c.shaderNeedsUpdate=!0,s&&c.renderer?(c.compiled=P(o),c.shaderNeedsUpdate=!0):(c.needsInitialization=!0,c.compiled=void 0)):c={source:o,compiled:s?P(o):void 0,renderer:void 0,startTime:n,shaderNeedsUpdate:!0,needsInitialization:!s,pingPongBuffers:void 0,pingPongIndex:0},this.setPluginState(F,c)}),t.registerLayerPreRenderHook(async o=>{const n=o.getPluginState(F);if(!n)return;const s=o.grid,c=o.drawFramebuffer;if(!s||!c)return;!n.needsInitialization&&n.compiled||(n.compiled=P(n.source),n.needsInitialization=!1,n.shaderNeedsUpdate=!0),n.renderer||(n.renderer=new H(e,r),n.shaderNeedsUpdate=!0),n.shaderNeedsUpdate&&n.compiled&&(await n.renderer.setShader(n.compiled),n.shaderNeedsUpdate=!1);const f=n.compiled?.usesFeedback??!1,a=n.compiled?.usesCharFeedback??!1,p=n.compiled?.usesCellColorFeedback??!1,m=f||a||p;if(m&&!n.pingPongBuffers){const l=e;l.createFramebuffer&&(n.pingPongBuffers=[l.createFramebuffer({width:s.cols,height:s.rows,attachments:3}),l.createFramebuffer({width:s.cols,height:s.rows,attachments:3})],n.pingPongIndex=0)}const d=e.mouse,u={time:e.millis()/1e3,frameCount:e.frameCount,width:s.width,height:s.height,cols:s.cols,rows:s.rows,mouseX:d?.x??0,mouseY:d?.y??0},h=(function(l){const i=new Map;if(!l||l.length===0)return i;for(const _ of l){const x=_.outputRef.output,C=x.getLayer();if(!C){console.warn(`[SynthPlugin] External output '${x.id}' has no layer assigned`);continue}const w=C.drawFramebuffer;if(!w?.textures){console.warn(`[SynthPlugin] Layer for output '${x.id}' has no drawFramebuffer textures`);continue}let S;switch(_.outputRef.textureType){case"char":S=0;break;case"color":default:S=1;break;case"cellColor":S=2}const T=w.textures[S]??null;i.set(_.samplerName,T)}return i})(n.compiled?.externalTextures??[]);if(m&&n.pingPongBuffers){const l=n.pingPongIndex,i=1-n.pingPongIndex,_=n.pingPongBuffers[l],x=n.pingPongBuffers[i],C={prevBuffer:f?_?.textures?.[1]??null:null,prevCharBuffer:a?_?.textures?.[0]??null:null,prevCellColorBuffer:p?_?.textures?.[2]??null:null};n.renderer.render(x,s.cols,s.rows,u,o.font,C,h),n.renderer.render(c,s.cols,s.rows,u,o.font,C,h),n.pingPongIndex=i}else n.renderer.render(c,s.cols,s.rows,u,o.font,void 0,h.size>0?h:void 0)}),t.registerLayerDisposedHook(o=>{const n=o.getPluginState(F);n?.renderer&&n.renderer.dispose()})},uninstall(e,t){const r=[t.layerManager.base,...t.layerManager.all];for(const o of r){const n=o.getPluginState(F);n?.renderer&&n.renderer.dispose()}t.removeLayerExtension("synth"),t.removeLayerExtension("clearSynth"),t.removeLayerExtension("hasSynth")}};"fast"in Array.prototype||(Array.prototype.fast=function(e=1){return this._speed=e,this},Array.prototype.smooth=function(e=1){return this._smooth=e,this},Array.prototype.ease=function(e="linear"){return typeof e=="function"?(this._smooth=1,this._ease=e):L[e]&&(this._smooth=1,this._ease=L[e]),this},Array.prototype.offset=function(e=.5){return this._offset=e%1,this},Array.prototype.fit=function(e=0,t=1){const r=Math.min(...this),o=Math.max(...this),n=this.map(s=>(function(c,f,a,p,m){return(c-f)*(m-p)/(a-f)+p})(s,r,o,e,t));return n._speed=this._speed,n._smooth=this._smooth,n._ease=this._ease,n._offset=this._offset,n}),k.registerMany(j),z.setSynthSourceClass(R),z.injectMethods(R.prototype);const g=z.generateStandaloneFunctions(),J=g.osc,Z=g.noise,tt=g.voronoi,et=g.gradient,nt=g.shape,rt=g.solid,at=g.src,ot=g.prev,st=g.charSrc,ct=g.cellColorSrc,it=g.charNoise,lt=g.charOsc,ut=g.charGradient,ft=g.charVoronoi,pt=g.charShape,dt=g.charSolid;y.SELF_OUTPUT=N,y.SynthOutput=E,y.SynthPlugin=W,y.SynthSource=R,y.cellColorSrc=ct,y.charGradient=ut,y.charNoise=it,y.charOsc=lt,y.charShape=pt,y.charSolid=dt,y.charSrc=st,y.charVoronoi=ft,y.createOutput=function(e){const t=new E("output_"+q++);return t.setLayer(e),t},y.gradient=et,y.isSynthOutput=X,y.noise=Z,y.osc=J,y.prev=ot,y.shape=nt,y.solid=rt,y.src=at,y.voronoi=tt,Object.defineProperty(y,Symbol.toStringTag,{value:"Module"})});

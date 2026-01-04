(function(_,I){typeof exports=="object"&&typeof module<"u"?I(exports):typeof define=="function"&&define.amd?define(["exports"],I):I((_=typeof globalThis<"u"?globalThis:_||self).TextmodeSynth={})})(this,function(_){"use strict";const I={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]},charModify:{returnType:"vec4",args:[{type:"vec4",name:"_char"}]}},k=new class{_transforms=new Map;_processedCache=new Map;register(n){this._transforms.has(n.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${n.name}`),this._transforms.set(n.name,n),this._processedCache.delete(n.name)}registerMany(n){for(const e of n)this.register(e)}get(n){return this._transforms.get(n)}getProcessed(n){let e=this._processedCache.get(n);if(!e){const t=this._transforms.get(n);t&&(e=(function(a){const r=I[a.type],o=[...r.args,...a.inputs.map(u=>({type:u.type,name:u.name}))].map(u=>`${u.type} ${u.name}`).join(", "),s=`
${r.returnType} ${a.name}(${o}) {
${a.glsl}
}`;return{...a,glslFunction:s}})(t),this._processedCache.set(n,e))}return e}has(n){return this._transforms.has(n)}getByType(n){return Array.from(this._transforms.values()).filter(e=>e.type===n)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src")}remove(n){return this._processedCache.delete(n),this._transforms.delete(n)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},j=new Set(["src"]),X=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(n){this._synthSourceClass=n}injectMethods(n){const e=k.getAll();for(const t of e)this._injectMethod(n,t)}_injectMethod(n,e){const{name:t,inputs:a,type:r}=e;n[t]=r==="combine"||r==="combineCoord"?function(o,...s){const u=a.map((c,f)=>s[f]??c.default);return this.addCombineTransform(t,o,u)}:function(...o){const s=a.map((u,c)=>o[c]??u.default);return this.addTransform(t,s)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const n={},e=k.getAll(),t=this._synthSourceClass;for(const a of e)if(j.has(a.type)){const{name:r,inputs:o}=a;n[r]=(...s)=>{const u=new t,c=o.map((f,h)=>s[h]??f.default);return u.addTransform(r,c)}}return this._generatedFunctions=n,n}getGeneratedFunctions(){return this._generatedFunctions}addTransform(n,e){if(k.register(n),e&&this._injectMethod(e,n),j.has(n.type)&&this._synthSourceClass){const t=this._synthSourceClass,{name:a,inputs:r}=n;this._generatedFunctions[a]=(...o)=>{const s=new t,u=r.map((c,f)=>o[f]??c.default);return s.addTransform(a,u)}}}},E=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
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
`,description:"Generate solid color"},{name:"src",type:"src",inputs:[],glsl:`
	return texture(prevBuffer, fract(_st));
`,description:"Sample the previous frame for feedback effects. Context-aware: automatically samples the appropriate texture based on where it is used (char, charColor, or cellColor context)."},{name:"rotate",type:"coord",inputs:[{name:"angle",type:"float",default:10},{name:"speed",type:"float",default:0}],glsl:`
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
`,description:"Adjust input/output levels and gamma"},{name:"clamp",type:"color",inputs:[{name:"min",type:"float",default:0},{name:"max",type:"float",default:1}],glsl:`
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
`,description:"Modulate coordinates based on hue differences"},{name:"charFlipX",type:"charModify",inputs:[{name:"toggle",type:"float",default:1}],glsl:`
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
`,description:"Rotate characters"}];class w{_transforms;constructor(e){this._transforms=e}static empty(){return new w([])}static from(e){return new w([...e])}get transforms(){return this._transforms}push(e){this._transforms.push(e)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(e){return new w([...this._transforms,e])}get(e){return this._transforms[e]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class C{_chain;_charMapping;_nestedSources;_externalLayerRefs;_colorSource;_cellColorSource;_charSource;_charCount;constructor(e){this._chain=e?.chain??w.empty(),this._charMapping=e?.charMapping,this._colorSource=e?.colorSource,this._cellColorSource=e?.cellColorSource,this._charSource=e?.charSource,this._charCount=e?.charCount,this._nestedSources=e?.nestedSources??new Map,this._externalLayerRefs=e?.externalLayerRefs??new Map}addTransform(e,t){const a={name:e,userArgs:t};return this._chain.push(a),this}addCombineTransform(e,t,a){const r=this._chain.length;return this._nestedSources.set(r,t),this.addTransform(e,a)}addExternalLayerRef(e){const t=this._chain.length;return this._externalLayerRefs.set(t,e),this.addTransform("src",[])}charMap(e){const t=Array.from(e),a=[];for(const r of t)a.push(r.codePointAt(0)??32);return this._charMapping={chars:e,indices:a},this}charColor(e){return this._colorSource=e,this}char(e,t){return this._charSource=e,this._charCount=t,this}cellColor(e){return this._cellColorSource=e,this}paint(e){return this._colorSource=e,this._cellColorSource=e,this}clone(){const e=new Map;for(const[a,r]of this._nestedSources)e.set(a,r.clone());const t=new Map;for(const[a,r]of this._externalLayerRefs)t.set(a,{...r});return new C({chain:w.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),charSource:this._charSource?.clone(),charCount:this._charCount,nestedSources:e,externalLayerRefs:t})}osc(e,t,a){return this.addTransform("osc",[e??60,t??.1,a??0])}noise(e,t){return this.addTransform("noise",[e??10,t??.1])}voronoi(e,t,a){return this.addTransform("voronoi",[e??5,t??.3,a??.3])}gradient(e){return this.addTransform("gradient",[e??0])}shape(e,t,a){return this.addTransform("shape",[e??3,t??.3,a??.01])}solid(e,t,a,r){return this.addTransform("solid",[e??0,t??0,a??0,r??1])}src(e){return this.addTransform("src",[])}rotate(e,t){return this.addTransform("rotate",[e??10,t??0])}scale(e,t,a,r,o){return this.addTransform("scale",[e??1.5,t??1,a??1,r??.5,o??.5])}scroll(e,t,a,r){return this.addTransform("scroll",[e??.5,t??.5,a??0,r??0])}scrollX(e,t){return this.addTransform("scrollX",[e??.5,t??0])}scrollY(e,t){return this.addTransform("scrollY",[e??.5,t??0])}pixelate(e,t){return this.addTransform("pixelate",[e??20,t??20])}repeat(e,t,a,r){return this.addTransform("repeat",[e??3,t??3,a??0,r??0])}repeatX(e,t){return this.addTransform("repeatX",[e??3,t??0])}repeatY(e,t){return this.addTransform("repeatY",[e??3,t??0])}kaleid(e){return this.addTransform("kaleid",[e??4])}brightness(e){return this.addTransform("brightness",[e??.4])}contrast(e){return this.addTransform("contrast",[e??1.6])}invert(e){return this.addTransform("invert",[e??1])}saturate(e){return this.addTransform("saturate",[e??2])}hue(e){return this.addTransform("hue",[e??.4])}colorama(e){return this.addTransform("colorama",[e??.005])}posterize(e,t){return this.addTransform("posterize",[e??3,t??.6])}luma(e,t){return this.addTransform("luma",[e??.5,t??.1])}thresh(e,t){return this.addTransform("thresh",[e??.5,t??.04])}color(e,t,a,r){return this.addTransform("color",[e??1,t??1,a??1,r??1])}r(e,t){return this.addTransform("r",[e??1,t??0])}g(e,t){return this.addTransform("g",[e??1,t??0])}b(e,t){return this.addTransform("b",[e??1,t??0])}shift(e,t,a,r){return this.addTransform("shift",[e??.5,t??0,a??0,r??0])}gamma(e){return this.addTransform("gamma",[e??1])}levels(e,t,a,r,o){return this.addTransform("levels",[e??0,t??1,a??0,r??1,o??1])}clamp(e,t){return this.addTransform("clamp",[e??0,t??1])}add(e,t){return this.addCombineTransform("add",e,[t??.5])}sub(e,t){return this.addCombineTransform("sub",e,[t??.5])}mult(e,t){return this.addCombineTransform("mult",e,[t??.5])}blend(e,t){return this.addCombineTransform("blend",e,[t??.5])}diff(e){return this.addCombineTransform("diff",e,[])}layer(e){return this.addCombineTransform("layer",e,[])}mask(e){return this.addCombineTransform("mask",e,[])}modulate(e,t){return this.addCombineTransform("modulate",e,[t??.1])}modulateScale(e,t,a){return this.addCombineTransform("modulateScale",e,[t??1,a??1])}modulateRotate(e,t,a){return this.addCombineTransform("modulateRotate",e,[t??1,a??0])}modulatePixelate(e,t,a){return this.addCombineTransform("modulatePixelate",e,[t??10,a??3])}modulateKaleid(e,t){return this.addCombineTransform("modulateKaleid",e,[t??4])}modulateScrollX(e,t,a){return this.addCombineTransform("modulateScrollX",e,[t??.5,a??0])}modulateScrollY(e,t,a){return this.addCombineTransform("modulateScrollY",e,[t??.5,a??0])}charFlipX(e){return this.addTransform("charFlipX",[e??1])}charFlipY(e){return this.addTransform("charFlipY",[e??1])}charInvert(e){return this.addTransform("charInvert",[e??1])}charRotate(e,t){return this.addTransform("charRotate",[e??0,t??0])}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get charSource(){return this._charSource}get charCount(){return this._charCount}get nestedSources(){return this._nestedSources}get externalLayerRefs(){return this._externalLayerRefs}}const Y={linear:n=>n,easeInQuad:n=>n*n,easeOutQuad:n=>n*(2-n),easeInOutQuad:n=>n<.5?2*n*n:(4-2*n)*n-1,easeInCubic:n=>n*n*n,easeOutCubic:n=>--n*n*n+1,easeInOutCubic:n=>n<.5?4*n*n*n:(n-1)*(2*n-2)*(2*n-2)+1,easeInQuart:n=>n*n*n*n,easeOutQuart:n=>1- --n*n*n*n,easeInOutQuart:n=>n<.5?8*n*n*n*n:1-8*--n*n*n*n,easeInQuint:n=>n*n*n*n*n,easeOutQuint:n=>1+--n*n*n*n*n,easeInOutQuint:n=>n<.5?16*n*n*n*n*n:1+16*--n*n*n*n*n,sin:n=>(1+Math.sin(Math.PI*n-Math.PI/2))/2};function V(n,e){return(n%e+e)%e}const b="textmode.synth.js";let O=60;function q(n){n.bpm=function(e){return(function(t){O=t})(e),e}}class K{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(e,t,a){if((function(r){return Array.isArray(r)&&r.length>0&&typeof r[0]=="number"})(e)){const r=`${a}_${t.name}`,o={name:r,type:t.type,value:t.default??0,isDynamic:!0},s=u=>(function(c,f){const h=c._speed??1,p=c._smooth??0;let m=f.time*h*(f.bpm/60)+(c._offset??0);if(p!==0){const g=c._ease??Y.linear,d=m-p/2,y=c[Math.floor(V(d,c.length))],i=c[Math.floor(V(d+1,c.length))];return g(Math.min(V(d,1)/p,1))*(i-y)+y}return c[Math.floor(V(m,c.length))]})(e,u);return this._uniforms.set(r,o),this._dynamicUpdaters.set(r,s),{glslValue:r,uniform:o,updater:s}}if(typeof e=="function"){const r=`${a}_${t.name}`,o={name:r,type:t.type,value:t.default??0,isDynamic:!0};return this._uniforms.set(r,o),this._dynamicUpdaters.set(r,e),{glslValue:r,uniform:o,updater:e}}if(typeof e=="number")return{glslValue:x(e)};if(Array.isArray(e)&&typeof e[0]=="number"){const r=e;if(r.length===2)return{glslValue:`vec2(${x(r[0])}, ${x(r[1])})`};if(r.length===3)return{glslValue:`vec3(${x(r[0])}, ${x(r[1])}, ${x(r[2])})`};if(r.length===4)return{glslValue:`vec4(${x(r[0])}, ${x(r[1])}, ${x(r[2])}, ${x(r[3])})`}}return this.processDefault(t)}processDefault(e){const t=e.default;return typeof t=="number"?{glslValue:x(t)}:Array.isArray(t)?{glslValue:`vec${t.length}(${t.map(x).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function x(n){const e=n.toString();return e.includes(".")?e:e+".0"}function B(n){return new G().compile(n)}class G{_varCounter=0;_uniformManager=new K;_glslFunctions=new Set;_mainCode=[];_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;_currentTarget="main";_externalLayers=new Map;_externalLayerCounter=0;_layerIdToPrefix=new Map;compile(e){this._varCounter=0,this._uniformManager.clear(),this._glslFunctions.clear(),this._mainCode.length=0,this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1,this._externalLayers.clear(),this._externalLayerCounter=0,this._layerIdToPrefix.clear();const t=this._compileChain(e,"main","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","main");let a,r=t.charVar;if(e.charSource){const f=this._compileChain(e.charSource,"charSrc","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","char");r="charFromSource_"+this._varCounter++,a=e.charCount??256,this._mainCode.push("	// Convert charSource color to character index"),this._mainCode.push(`	float charLum_${r} = _luminance(${f.colorVar}.rgb);`),this._mainCode.push(`	int charIdx_${r} = int(charLum_${r} * ${a.toFixed(1)});`),this._mainCode.push(`	vec4 ${r} = vec4(float(charIdx_${r} % 256) / 255.0, float(charIdx_${r} / 256) / 255.0, 0.0, 0.0);`)}let o=t.colorVar;e.colorSource&&(o=this._compileChain(e.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","charColor").colorVar);let s="vec4(0.0, 0.0, 0.0, 0.0)";e.cellColorSource&&(s=this._compileChain(e.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)","v_uv","cellColor").colorVar);const u=(function(f,h,p){return f?`
	// Character output from generator
	vec4 charOutput = ${h};`:`
	// Derive character from color luminance
	float lum = _luminance(${p}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`})(!!r,r??"vec4(0.0)",t.colorVar);return{fragmentSource:(function(f){const{uniforms:h,glslFunctions:p,mainCode:m,charOutputCode:g,primaryColorVar:d,cellColorVar:y,charMapping:i,usesFeedback:l,usesCharFeedback:v,usesCellColorFeedback:P,externalLayers:R}=f,U=Array.from(h.values()).map($=>`uniform ${$.type} ${$.name};`).join(`
`);let L="",z="";i&&(L=`uniform int u_charMap[${i.indices.length}];
uniform int u_charMapSize;`,z=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const F=[];l&&F.push("uniform sampler2D prevBuffer;"),v&&F.push("uniform sampler2D prevCharBuffer;"),P&&F.push("uniform sampler2D prevCellColorBuffer;");const S=F.join(`
`),A=[];if(R)for(const[,$]of R)$.usesChar&&A.push(`uniform sampler2D ${$.uniformPrefix}_char;`),$.usesPrimary&&A.push(`uniform sampler2D ${$.uniformPrefix}_primary;`),$.usesCellColor&&A.push(`uniform sampler2D ${$.uniformPrefix}_cell;`);return`#version 300 es
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
${S}
${A.length>0?`// External layer samplers
${A.join(`
`)}`:""}
${L}

// Dynamic uniforms
${U}


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
${Array.from(p).join(`
`)}

void main() {
	// Transform chain
${m.join(`
`)}

${g}
${z}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${d};
	o_secondaryColor = ${y};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:u,primaryColorVar:o,cellColorVar:s,charMapping:e.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback,externalLayers:this._externalLayers}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:e.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback,externalLayers:new Map(this._externalLayers)}}_compileChain(e,t,a,r="v_uv",o="main"){const s=this._currentTarget;this._currentTarget=o;const u=`${t}_st`;let c,f,h,p=`${t}_c`;this._mainCode.push(`	vec2 ${u} = ${r};`),this._mainCode.push(`	vec4 ${p} = ${a};`);const m=e.transforms,g=m.map(i=>this._getProcessedTransform(i.name)),d=[];for(let i=0;i<g.length;i++){const l=g[i];l&&(l.type!=="coord"&&l.type!=="combineCoord"||d.push(i))}const y=i=>{const l=m[i],v=g[i];if(!v)return void console.warn(`[SynthCompiler] Unknown transform: ${l.name}`);const P=e.externalLayerRefs.get(i);if(l.name==="src")if(P)this._trackExternalLayerUsage(P,this._currentTarget);else switch(this._currentTarget){case"char":this._usesCharFeedback=!0;break;case"cellColor":this._usesCellColorFeedback=!0;break;default:this._usesFeedback=!0}const R=this._getContextAwareGlslFunction(v,l.name,P);this._glslFunctions.add(R);const U=this._processArguments(l.userArgs,v.inputs,`${t}_${i}_${l.name}`),L=e.nestedSources.get(i);let z;L&&(v.type==="combine"||v.type==="combineCoord")&&(z=this._compileChain(L,`${t}_nested_${i}`,a,u,o).colorVar);const F=this._varCounter++,S=this._generateTransformCode(v,F,u,p,c,f,h,U,z,P);p=S.colorVar,S.charVar&&(c=S.charVar),S.flagsVar&&(f=S.flagsVar),S.rotationVar&&(h=S.rotationVar)};for(let i=d.length-1;i>=0;i--)y(d[i]);for(let i=0;i<m.length;i++){const l=g[i];(!l||l.type!=="coord"&&l.type!=="combineCoord")&&y(i)}return this._currentTarget=s,{coordVar:u,colorVar:p,charVar:c,flagsVar:f,rotationVar:h}}_getProcessedTransform(e){return k.getProcessed(e)}_getContextAwareGlslFunction(e,t,a){if(t!=="src")return e.glslFunction;if(a){const o=this._getExternalLayerPrefix(a.layerId),s={char:`${o}_char`,charColor:`${o}_primary`,cellColor:`${o}_cell`,main:`${o}_primary`}[this._currentTarget];return`
vec4 ${`src_ext_${o}_${this._currentTarget}`}(vec2 _st) {
	return texture(${s}, fract(_st));
}
`}const r={char:"prevCharBuffer",charColor:"prevBuffer",cellColor:"prevCellColorBuffer",main:"prevBuffer"}[this._currentTarget];return`
vec4 ${`src_${this._currentTarget}`}(vec2 _st) {
	return texture(${r}, fract(_st));
}
`}_getExternalLayerPrefix(e){let t=this._layerIdToPrefix.get(e);return t||(t="extLayer"+this._externalLayerCounter++,this._layerIdToPrefix.set(e,t)),t}_trackExternalLayerUsage(e,t){const a=this._getExternalLayerPrefix(e.layerId);let r=this._externalLayers.get(e.layerId);switch(r||(r={layerId:e.layerId,uniformPrefix:a,usesChar:!1,usesPrimary:!1,usesCellColor:!1},this._externalLayers.set(e.layerId,r)),t){case"char":r.usesChar=!0;break;case"cellColor":r.usesCellColor=!0;break;default:r.usesPrimary=!0}}_processArguments(e,t,a){const r=[];for(let o=0;o<t.length;o++){const s=t[o],u=e[o]??s.default,c=this._uniformManager.processArgument(u,s,a);r.push(c.glslValue)}return r}_generateTransformCode(e,t,a,r,o,s,u,c,f,h){const p=(...l)=>[...l,...c].join(", ");let m=e.name;e.name==="src"&&(h?m=`src_ext_${this._getExternalLayerPrefix(h.layerId)}_${this._currentTarget}`:m=`src_${this._currentTarget}`);let g=r,d=o,y=s,i=u;switch(e.type){case"src":{const l=`c${t}`;this._mainCode.push(`	vec4 ${l} = ${m}(${p(a)});`),g=l;break}case"coord":{const l=`st${t}`;this._mainCode.push(`	vec2 ${l} = ${m}(${p(a)});`),this._mainCode.push(`	${a} = ${l};`);break}case"color":{const l=`c${t}`;this._mainCode.push(`	vec4 ${l} = ${m}(${p(r)});`),g=l;break}case"combine":{const l=`c${t}`;this._mainCode.push(`	vec4 ${l} = ${m}(${p(r,f??"vec4(0.0)")});`),g=l;break}case"combineCoord":{const l=`st${t}`;this._mainCode.push(`	vec2 ${l} = ${m}(${p(a,f??"vec4(0.0)")});`),this._mainCode.push(`	${a} = ${l};`);break}case"charModify":d||(d=`char${t}`,y=`flags${t}`,i=`rot${t}`,this._mainCode.push(`	vec4 ${d} = vec4(0.0);`),this._mainCode.push(`	float ${y} = 0.0;`),this._mainCode.push(`	float ${i} = 0.0;`)),this._mainCode.push(`	${d} = ${m}(${p(d)});`)}return{colorVar:g,charVar:d,flagsVar:y,rotationVar:i}}}class D{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(e,t){const a=t.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===a&&this._lastChars===e)return this._resolvedIndices;const r=Array.from(e),o=new Int32Array(r.length),s=t.characterMap,u=t.characters;for(let c=0;c<r.length;c++){const f=r[c],h=s.get(f);if(h!==void 0)o[c]=u.indexOf(h);else{const p=s.get(" ");o[c]=p!==void 0?u.indexOf(p):0}}return this._resolvedIndices=o,this._lastFontCharacterCount=a,this._lastChars=e,o}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}function M(n){const e=new Map;for(const[,t]of n.externalLayerRefs)e.set(t.layerId,t.layer);for(const[,t]of n.nestedSources){const a=M(t);for(const[r,o]of a)e.set(r,o)}if(n.charSource){const t=M(n.charSource);for(const[a,r]of t)e.set(a,r)}if(n.colorSource){const t=M(n.colorSource);for(const[a,r]of t)e.set(a,r)}if(n.cellColorSource){const t=M(n.cellColorSource);for(const[a,r]of t)e.set(a,r)}return e}async function Q(n,e){const t=n.getPluginState(b);if(!t)return;const a=n.grid,r=n.drawFramebuffer;if(!a||!r||(t.compiled||(t.compiled=B(t.source),t.externalLayerMap=M(t.source),t.needsCompile=!0),t.needsCompile&&t.compiled&&(t.shader?.dispose&&t.shader.dispose(),t.externalLayerMap=M(t.source),t.shader=await e.createFilterShader(t.compiled.fragmentSource),t.needsCompile=!1),!t.shader||!t.compiled))return;const o=t.compiled.usesFeedback,s=t.compiled.usesCharFeedback,u=t.compiled.usesCellColorFeedback,c=o||s||u;c&&!t.pingPongBuffers&&(t.pingPongBuffers=[e.createFramebuffer({width:a.cols,height:a.rows,attachments:3}),e.createFramebuffer({width:a.cols,height:a.rows,attachments:3})],t.pingPongIndex=0);const f=t.bpm??O,h={time:e.secs,frameCount:e.frameCount,width:a.width,height:a.height,cols:a.cols,rows:a.rows,bpm:f},p=m=>{e.setUniform("time",h.time),e.setUniform("resolution",[h.cols,h.rows]);for(const[d,y]of t.compiled.dynamicUpdaters)e.setUniform(d,y(h));for(const[d,y]of t.compiled.uniforms)y.isDynamic||typeof y.value=="function"||e.setUniform(d,y.value);if(t.compiled.charMapping){const d=t.characterResolver.resolve(t.compiled.charMapping.chars,n.font);e.setUniform("u_charMap",d),e.setUniform("u_charMapSize",d.length)}m&&(o&&e.setUniform("prevBuffer",m.textures[1]),s&&e.setUniform("prevCharBuffer",m.textures[0]),u&&e.setUniform("prevCellColorBuffer",m.textures[2]));const g=t.compiled.externalLayers;if(g&&g.size>0&&t.externalLayerMap)for(const[d,y]of g){const i=t.externalLayerMap.get(d);if(!i){console.warn(`[SynthPlugin] External layer not found: ${d}`);continue}const l=i.getPluginState(b);let v;l?.pingPongBuffers?v=l.pingPongBuffers[l.pingPongIndex].textures:i.drawFramebuffer&&(v=i.drawFramebuffer.textures),v&&(y.usesChar&&e.setUniform(`${y.uniformPrefix}_char`,v[0]),y.usesPrimary&&e.setUniform(`${y.uniformPrefix}_primary`,v[1]),y.usesCellColor&&e.setUniform(`${y.uniformPrefix}_cell`,v[2]))}};if(c&&t.pingPongBuffers){const m=t.pingPongBuffers[t.pingPongIndex],g=t.pingPongBuffers[1-t.pingPongIndex];g.begin(),e.clear(),e.shader(t.shader),p(m),e.rect(a.cols,a.rows),g.end(),r.begin(),e.clear(),e.shader(t.shader),p(m),e.rect(a.cols,a.rows),r.end(),t.pingPongIndex=1-t.pingPongIndex}else r.begin(),e.clear(),e.shader(t.shader),p(null),e.rect(a.cols,a.rows),r.end()}function H(n){const e=n.getPluginState(b);e&&(e.shader?.dispose&&e.shader.dispose(),e.pingPongBuffers&&(e.pingPongBuffers[0].dispose?.(),e.pingPongBuffers[1].dispose?.()))}const N={name:b,version:"1.0.0",install(n,e){q(n),(function(t){t.extendLayer("synth",function(a){const r=performance.now()/1e3,o=this.grid!==void 0&&this.drawFramebuffer!==void 0;let s=this.getPluginState(b);s?(s.source=a,s.startTime=r,s.needsCompile=!0,s.characterResolver.invalidate(),o&&(s.compiled=B(a))):s={source:a,compiled:o?B(a):void 0,shader:void 0,characterResolver:new D,startTime:r,needsCompile:!0,pingPongBuffers:void 0,pingPongIndex:0},this.setPluginState(b,s)})})(e),(function(t){t.extendLayer("bpm",function(a){let r=this.getPluginState(b);if(r)r.bpm=a;else{const o=performance.now()/1e3;r={source:new C,compiled:void 0,shader:void 0,characterResolver:new D,startTime:o,needsCompile:!1,pingPongBuffers:void 0,pingPongIndex:0,bpm:a}}this.setPluginState(b,r)})})(e),(function(t){t.extendLayer("clearSynth",function(){const a=this.getPluginState(b);a&&(a.shader?.dispose&&a.shader.dispose(),a.pingPongBuffers&&(a.pingPongBuffers[0].dispose?.(),a.pingPongBuffers[1].dispose?.()),this.setPluginState(b,void 0))})})(e),e.registerLayerPreRenderHook(t=>Q(t,n)),e.registerLayerDisposedHook(H)},uninstall(n,e){const t=[e.layerManager.base,...e.layerManager.all];for(const a of t){const r=a.getPluginState(b);r&&(r.shader?.dispose&&r.shader.dispose(),r.pingPongBuffers&&(r.pingPongBuffers[0].dispose?.(),r.pingPongBuffers[1].dispose?.()))}delete n.bpm,e.removeLayerExtension("synth"),e.removeLayerExtension("bpm"),e.removeLayerExtension("clearSynth")}};"fast"in Array.prototype||(Array.prototype.fast=function(n=1){return this._speed=n,this},Array.prototype.smooth=function(n=1){return this._smooth=n,this},Array.prototype.ease=function(n="linear"){return typeof n=="function"?(this._smooth=1,this._ease=n):Y[n]&&(this._smooth=1,this._ease=Y[n]),this},Array.prototype.offset=function(n=.5){return this._offset=n%1,this},Array.prototype.fit=function(n=0,e=1){const t=Math.min(...this),a=Math.max(...this),r=this.map(o=>(function(s,u,c,f,h){return(s-u)*(h-f)/(c-u)+f})(o,t,a,n,e));return r._speed=this._speed,r._smooth=this._smooth,r._ease=this._ease,r._offset=this._offset,r}),k.registerMany(E),X.setSynthSourceClass(C),X.injectMethods(C.prototype);const T=X.generateStandaloneFunctions(),W=(n,e=256)=>{const t=new C;return t._charSource=n,t._charCount=e,t},J=T.osc,Z=T.noise,ee=T.voronoi,te=T.gradient,ne=T.shape,re=T.solid,ae=(function(){const n=T.src;return e=>{if(!e)return n();const t=new C,a=e.id??`layer_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;return t.addExternalLayerRef({layerId:a,layer:e}),t}})();_.SynthPlugin=N,_.SynthSource=C,_.cellColor=n=>{const e=new C;return e._cellColorSource=n,e},_.char=W,_.charColor=n=>{const e=new C;return e._colorSource=n,e},_.gradient=te,_.noise=Z,_.osc=J,_.paint=n=>{const e=new C;return e._colorSource=n,e._cellColorSource=n,e},_.shape=ne,_.solid=re,_.src=ae,_.voronoi=ee,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"})});

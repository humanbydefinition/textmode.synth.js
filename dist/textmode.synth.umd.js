(function(y,M){typeof exports=="object"&&typeof module<"u"?M(exports):typeof define=="function"&&define.amd?define(["exports"],M):M((y=typeof globalThis<"u"?globalThis:y||self).TextmodeSynth={})})(this,function(y){"use strict";const M={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]},charModify:{returnType:"vec4",args:[{type:"vec4",name:"_char"}]}},w=new class{_transforms=new Map;_processedCache=new Map;register(t){this._transforms.has(t.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${t.name}`),this._transforms.set(t.name,t),this._processedCache.delete(t.name)}registerMany(t){for(const e of t)this.register(e)}get(t){return this._transforms.get(t)}getProcessed(t){let e=this._processedCache.get(t);if(!e){const a=this._transforms.get(t);a&&(e=(function(r){const n=M[r.type],o=[...n.args,...r.inputs.map(i=>({type:i.type,name:i.name}))].map(i=>`${i.type} ${i.name}`).join(", "),u=`
${n.returnType} ${r.name}(${o}) {
${r.glsl}
}`;return{...r,glslFunction:u}})(a),this._processedCache.set(t,e))}return e}has(t){return this._transforms.has(t)}getByType(t){return Array.from(this._transforms.values()).filter(e=>e.type===t)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src")}remove(t){return this._processedCache.delete(t),this._transforms.delete(t)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},X=new Set(["src"]),T=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(t){this._synthSourceClass=t}injectMethods(t){const e=w.getAll();for(const a of e)this._injectMethod(t,a)}_injectMethod(t,e){const{name:a,inputs:r,type:n}=e;t[a]=n==="combine"||n==="combineCoord"?function(o,...u){const i=r.map((s,p)=>u[p]??s.default);return this.addCombineTransform(a,o,i)}:function(...o){const u=r.map((i,s)=>o[s]??i.default);return this.addTransform(a,u)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const t={},e=w.getAll(),a=this._synthSourceClass;for(const r of e)if(X.has(r.type)){const{name:n,inputs:o}=r;t[n]=(...u)=>{const i=new a,s=o.map((p,f)=>u[f]??p.default);return i.addTransform(n,s)}}return this._generatedFunctions=t,t}getGeneratedFunctions(){return this._generatedFunctions}addTransform(t,e){if(w.register(t),e&&this._injectMethod(e,t),X.has(t.type)&&this._synthSourceClass){const a=this._synthSourceClass,{name:r,inputs:n}=t;this._generatedFunctions[r]=(...o)=>{const u=new a,i=n.map((s,p)=>o[p]??s.default);return u.addTransform(r,i)}}}},B=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
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
`,description:"Sample the previous frame primary color for feedback effects"},{name:"charSrc",type:"src",inputs:[],glsl:`
	return texture(prevCharBuffer, fract(_st));
`,description:"Sample the previous frame character data for feedback effects"},{name:"cellColorSrc",type:"src",inputs:[],glsl:`
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
`,description:"Rotate characters"}];class b{_transforms;constructor(e){this._transforms=e}static empty(){return new b([])}static from(e){return new b([...e])}get transforms(){return this._transforms}push(e){this._transforms.push(e)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(e){return new b([...this._transforms,e])}get(e){return this._transforms[e]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class x{_chain;_charMapping;_nestedSources;_colorSource;_cellColorSource;_charSource;_charCount;constructor(e){this._chain=e?.chain??b.empty(),this._charMapping=e?.charMapping,this._colorSource=e?.colorSource,this._cellColorSource=e?.cellColorSource,this._charSource=e?.charSource,this._charCount=e?.charCount,this._nestedSources=e?.nestedSources??new Map}addTransform(e,a){const r={name:e,userArgs:a};return this._chain.push(r),this}addCombineTransform(e,a,r){const n=this._chain.length;return this._nestedSources.set(n,a),this.addTransform(e,r)}charMap(e){const a=Array.from(e),r=[];for(const n of a)r.push(n.codePointAt(0)??32);return this._charMapping={chars:e,indices:r},this}charColor(e){return this._colorSource=e,this}char(e,a){return this._charSource=e,this._charCount=a,this}cellColor(e){return this._cellColorSource=e,this}paint(e){return this._colorSource=e,this._cellColorSource=e,this}clone(){const e=new Map;for(const[a,r]of this._nestedSources)e.set(a,r.clone());return new x({chain:b.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),charSource:this._charSource?.clone(),charCount:this._charCount,nestedSources:e})}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get charSource(){return this._charSource}get charCount(){return this._charCount}get nestedSources(){return this._nestedSources}}const A={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>t*(2-t),easeInOutQuad:t=>t<.5?2*t*t:(4-2*t)*t-1,easeInCubic:t=>t*t*t,easeOutCubic:t=>--t*t*t+1,easeInOutCubic:t=>t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1,easeInQuart:t=>t*t*t*t,easeOutQuart:t=>1- --t*t*t*t,easeInOutQuart:t=>t<.5?8*t*t*t*t:1-8*--t*t*t*t,easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>1+--t*t*t*t*t,easeInOutQuint:t=>t<.5?16*t*t*t*t*t:1+16*--t*t*t*t*t,sin:t=>(1+Math.sin(Math.PI*t-Math.PI/2))/2};function $(t,e){return(t%e+e)%e}class O{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(e,a,r){if((function(n){return Array.isArray(n)&&n.length>0&&typeof n[0]=="number"})(e)){const n=`${r}_${a.name}`,o={name:n,type:a.type,value:a.default??0,isDynamic:!0},u=i=>(function(s,p){const f=s._speed??1,m=s._smooth??0;let d=p.time*f*1+(s._offset??0);if(m!==0){const h=s._ease??A.linear,c=d-m/2,l=s[Math.floor($(c,s.length))],_=s[Math.floor($(c+1,s.length))];return h(Math.min($(c,1)/m,1))*(_-l)+l}return s[Math.floor($(d,s.length))]})(e,i);return this._uniforms.set(n,o),this._dynamicUpdaters.set(n,u),{glslValue:n,uniform:o,updater:u}}if(typeof e=="function"){const n=`${r}_${a.name}`,o={name:n,type:a.type,value:a.default??0,isDynamic:!0};return this._uniforms.set(n,o),this._dynamicUpdaters.set(n,e),{glslValue:n,uniform:o,updater:e}}if(typeof e=="number")return{glslValue:g(e)};if(Array.isArray(e)&&typeof e[0]=="number"){const n=e;if(n.length===2)return{glslValue:`vec2(${g(n[0])}, ${g(n[1])})`};if(n.length===3)return{glslValue:`vec3(${g(n[0])}, ${g(n[1])}, ${g(n[2])})`};if(n.length===4)return{glslValue:`vec4(${g(n[0])}, ${g(n[1])}, ${g(n[2])}, ${g(n[3])})`}}return this.processDefault(a)}processDefault(e){const a=e.default;return typeof a=="number"?{glslValue:g(a)}:Array.isArray(a)?{glslValue:`vec${a.length}(${a.map(g).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function g(t){const e=t.toString();return e.includes(".")?e:e+".0"}function I(t){return new U().compile(t)}class U{_varCounter=0;_uniformManager=new O;_glslFunctions=new Set;_mainCode=[];_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;compile(e){this._varCounter=0,this._uniformManager.clear(),this._glslFunctions.clear(),this._mainCode.length=0,this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1;const a=this._compileChain(e,"main","vec4(1.0, 1.0, 1.0, 1.0)");let r,n=a.charVar;if(e.charSource){const p=this._compileChain(e.charSource,"charSrc","vec4(1.0, 1.0, 1.0, 1.0)");n="charFromSource_"+this._varCounter++,r=e.charCount??256,this._mainCode.push("	// Convert charSource color to character index"),this._mainCode.push(`	float charLum_${n} = _luminance(${p.colorVar}.rgb);`),this._mainCode.push(`	int charIdx_${n} = int(charLum_${n} * ${r.toFixed(1)});`),this._mainCode.push(`	vec4 ${n} = vec4(float(charIdx_${n} % 256) / 255.0, float(charIdx_${n} / 256) / 255.0, 0.0, 0.0);`)}let o=a.colorVar;e.colorSource&&(o=this._compileChain(e.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)").colorVar);let u="vec4(0.0, 0.0, 0.0, 0.0)";e.cellColorSource&&(u=this._compileChain(e.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)").colorVar);const i=(function(p,f,m){return p?`
	// Character output from generator
	vec4 charOutput = ${f};`:`
	// Derive character from color luminance
	float lum = _luminance(${m}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`})(!!n,n??"vec4(0.0)",a.colorVar);return{fragmentSource:(function(p){const{uniforms:f,glslFunctions:m,mainCode:d,charOutputCode:h,primaryColorVar:c,cellColorVar:l,charMapping:_,usesFeedback:V,usesCharFeedback:F,usesCellColorFeedback:k}=p,P=Array.from(f.values()).map(j=>`uniform ${j.type} ${j.name};`).join(`
`);let v="",Y="";_&&(v=`uniform int u_charMap[${_.indices.length}];
uniform int u_charMapSize;`,Y=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const z=[];return V&&z.push("uniform sampler2D prevBuffer;"),F&&z.push("uniform sampler2D prevCharBuffer;"),k&&z.push("uniform sampler2D prevCellColorBuffer;"),`#version 300 es
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
${z.join(`
`)}
${v}

// Dynamic uniforms
${P}


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
${Array.from(m).join(`
`)}

void main() {
	// Transform chain
${d.join(`
`)}

${h}
${Y}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${c};
	o_secondaryColor = ${l};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:i,primaryColorVar:o,cellColorVar:u,charMapping:e.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:e.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback}}_compileChain(e,a,r,n="v_uv"){const o=`${a}_st`;let u,i,s,p=`${a}_c`;this._mainCode.push(`	vec2 ${o} = ${n};`),this._mainCode.push(`	vec4 ${p} = ${r};`);const f=e.transforms,m=f.map(c=>this._getProcessedTransform(c.name)),d=[];for(let c=0;c<m.length;c++){const l=m[c];l&&(l.type!=="coord"&&l.type!=="combineCoord"||d.push(c))}const h=c=>{const l=f[c],_=m[c];if(!_)return void console.warn(`[SynthCompiler] Unknown transform: ${l.name}`);l.name==="src"&&(this._usesFeedback=!0),l.name==="charSrc"&&(this._usesCharFeedback=!0),l.name==="cellColorSrc"&&(this._usesCellColorFeedback=!0),this._glslFunctions.add(_.glslFunction);const V=this._processArguments(l.userArgs,_.inputs,`${a}_${c}_${l.name}`),F=e.nestedSources.get(c);let k;F&&(_.type==="combine"||_.type==="combineCoord")&&(k=this._compileChain(F,`${a}_nested_${c}`,r,o).colorVar);const P=this._varCounter++,v=this._generateTransformCode(_,P,o,p,u,i,s,V,k);p=v.colorVar,v.charVar&&(u=v.charVar),v.flagsVar&&(i=v.flagsVar),v.rotationVar&&(s=v.rotationVar)};for(let c=d.length-1;c>=0;c--)h(d[c]);for(let c=0;c<f.length;c++){const l=m[c];(!l||l.type!=="coord"&&l.type!=="combineCoord")&&h(c)}return{coordVar:o,colorVar:p,charVar:u,flagsVar:i,rotationVar:s}}_getProcessedTransform(e){return w.getProcessed(e)}_processArguments(e,a,r){const n=[];for(let o=0;o<a.length;o++){const u=a[o],i=e[o]??u.default,s=this._uniformManager.processArgument(i,u,r);n.push(s.glslValue)}return n}_generateTransformCode(e,a,r,n,o,u,i,s,p){const f=(...l)=>[...l,...s].join(", ");let m=n,d=o,h=u,c=i;switch(e.type){case"src":{const l=`c${a}`;this._mainCode.push(`	vec4 ${l} = ${e.name}(${f(r)});`),m=l;break}case"coord":{const l=`st${a}`;this._mainCode.push(`	vec2 ${l} = ${e.name}(${f(r)});`),this._mainCode.push(`	${r} = ${l};`);break}case"color":{const l=`c${a}`;this._mainCode.push(`	vec4 ${l} = ${e.name}(${f(n)});`),m=l;break}case"combine":{const l=`c${a}`;this._mainCode.push(`	vec4 ${l} = ${e.name}(${f(n,p??"vec4(0.0)")});`),m=l;break}case"combineCoord":{const l=`st${a}`;this._mainCode.push(`	vec2 ${l} = ${e.name}(${f(r,p??"vec4(0.0)")});`),this._mainCode.push(`	${r} = ${l};`);break}case"charModify":d||(d=`char${a}`,h=`flags${a}`,c=`rot${a}`,this._mainCode.push(`	vec4 ${d} = vec4(0.0);`),this._mainCode.push(`	float ${h} = 0.0;`),this._mainCode.push(`	float ${c} = 0.0;`)),this._mainCode.push(`	${d} = ${e.name}(${f(d)});`)}return{colorVar:m,charVar:d,flagsVar:h,rotationVar:c}}}class R{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(e,a){const r=a.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===r&&this._lastChars===e)return this._resolvedIndices;const n=Array.from(e),o=new Int32Array(n.length),u=a.characterMap,i=a.characters;for(let s=0;s<n.length;s++){const p=n[s],f=u.get(p);if(f!==void 0)o[s]=i.indexOf(f);else{const m=u.get(" ");o[s]=m!==void 0?i.indexOf(m):0}}return this._resolvedIndices=o,this._lastFontCharacterCount=r,this._lastChars=e,o}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}const S="textmode.synth.js",q={name:S,version:"1.0.0",install(t,e){e.extendLayer("synth",function(a){const r=performance.now()/1e3,n=this.grid!==void 0&&this.drawFramebuffer!==void 0;let o=this.getPluginState(S);o?(o.source=a,o.startTime=r,o.needsCompile=!0,o.characterResolver.invalidate(),n&&(o.compiled=I(a))):o={source:a,compiled:n?I(a):void 0,shader:void 0,characterResolver:new R,startTime:r,needsCompile:!0,pingPongBuffers:void 0,pingPongIndex:0},this.setPluginState(S,o)}),e.registerLayerPreRenderHook(async a=>{const r=a.getPluginState(S);if(!r)return;const n=a.grid,o=a.drawFramebuffer;if(!n||!o||(r.compiled||(r.compiled=I(r.source),r.needsCompile=!0),r.needsCompile&&r.compiled&&(r.shader?.dispose&&r.shader.dispose(),r.shader=await t.createFilterShader(r.compiled.fragmentSource),r.needsCompile=!1),!r.shader||!r.compiled))return;const u=r.compiled.usesFeedback,i=r.compiled.usesCharFeedback,s=r.compiled.usesCellColorFeedback,p=u||i||s;p&&!r.pingPongBuffers&&(r.pingPongBuffers=[t.createFramebuffer({width:n.cols,height:n.rows,attachments:3}),t.createFramebuffer({width:n.cols,height:n.rows,attachments:3})],r.pingPongIndex=0);const f={time:t.millis()/1e3,frameCount:t.frameCount,width:n.width,height:n.height,cols:n.cols,rows:n.rows},m=d=>{t.setUniform("time",f.time),t.setUniform("resolution",[f.cols,f.rows]);for(const[h,c]of r.compiled.dynamicUpdaters)t.setUniform(h,c(f));for(const[h,c]of r.compiled.uniforms)c.isDynamic||typeof c.value=="function"||t.setUniform(h,c.value);if(r.compiled.charMapping){const h=r.characterResolver.resolve(r.compiled.charMapping.chars,a.font);t.setUniform("u_charMap",h),t.setUniform("u_charMapSize",h.length)}d&&(u&&t.setUniform("prevBuffer",d.textures[1]),i&&t.setUniform("prevCharBuffer",d.textures[0]),s&&t.setUniform("prevCellColorBuffer",d.textures[2]))};if(p&&r.pingPongBuffers){const d=r.pingPongBuffers[r.pingPongIndex],h=r.pingPongBuffers[1-r.pingPongIndex];h.begin(),t.clear(),t.shader(r.shader),m(d),t.rect(n.cols,n.rows),h.end(),o.begin(),t.clear(),t.shader(r.shader),m(d),t.rect(n.cols,n.rows),o.end(),r.pingPongIndex=1-r.pingPongIndex}else o.begin(),t.clear(),t.shader(r.shader),m(null),t.rect(n.cols,n.rows),o.end()}),e.registerLayerDisposedHook(a=>{const r=a.getPluginState(S);r&&(r.shader?.dispose&&r.shader.dispose(),r.pingPongBuffers&&(r.pingPongBuffers[0].dispose?.(),r.pingPongBuffers[1].dispose?.()))})},uninstall(t,e){const a=[e.layerManager.base,...e.layerManager.all];for(const r of a){const n=r.getPluginState(S);n&&(n.shader?.dispose&&n.shader.dispose(),n.pingPongBuffers&&(n.pingPongBuffers[0].dispose?.(),n.pingPongBuffers[1].dispose?.()))}e.removeLayerExtension("synth")}};"fast"in Array.prototype||(Array.prototype.fast=function(t=1){return this._speed=t,this},Array.prototype.smooth=function(t=1){return this._smooth=t,this},Array.prototype.ease=function(t="linear"){return typeof t=="function"?(this._smooth=1,this._ease=t):A[t]&&(this._smooth=1,this._ease=A[t]),this},Array.prototype.offset=function(t=.5){return this._offset=t%1,this},Array.prototype.fit=function(t=0,e=1){const a=Math.min(...this),r=Math.max(...this),n=this.map(o=>(function(u,i,s,p,f){return(u-i)*(f-p)/(s-i)+p})(o,a,r,t,e));return n._speed=this._speed,n._smooth=this._smooth,n._ease=this._ease,n._offset=this._offset,n}),w.registerMany(B),T.setSynthSourceClass(x),T.injectMethods(x.prototype);const C=T.generateStandaloneFunctions(),D=(t,e=256)=>{const a=new x;return a._charSource=t,a._charCount=e,a},K=C.osc,Q=C.noise,G=C.voronoi,L=C.gradient,E=C.shape,H=C.solid,N=C.src,W=C.charSrc,J=C.cellColorSrc;y.SynthPlugin=q,y.SynthSource=x,y.cellColor=t=>{const e=new x;return e._cellColorSource=t,e},y.cellColorSrc=J,y.char=D,y.charColor=t=>{const e=new x;return e._colorSource=t,e},y.charSrc=W,y.gradient=L,y.noise=Q,y.osc=K,y.paint=t=>{const e=new x;return e._colorSource=t,e._cellColorSource=t,e},y.shape=E,y.solid=H,y.src=N,y.voronoi=G,Object.defineProperty(y,Symbol.toStringTag,{value:"Module"})});

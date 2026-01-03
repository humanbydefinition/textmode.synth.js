(function(_,I){typeof exports=="object"&&typeof module<"u"?I(exports):typeof define=="function"&&define.amd?define(["exports"],I):I((_=typeof globalThis<"u"?globalThis:_||self).TextmodeSynth={})})(this,function(_){"use strict";const I={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]},charModify:{returnType:"vec4",args:[{type:"vec4",name:"_char"}]}},k=new class{_transforms=new Map;_processedCache=new Map;register(r){this._transforms.has(r.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${r.name}`),this._transforms.set(r.name,r),this._processedCache.delete(r.name)}registerMany(r){for(const t of r)this.register(t)}get(r){return this._transforms.get(r)}getProcessed(r){let t=this._processedCache.get(r);if(!t){const e=this._transforms.get(r);e&&(t=(function(n){const a=I[n.type],o=[...a.args,...n.inputs.map(l=>({type:l.type,name:l.name}))].map(l=>`${l.type} ${l.name}`).join(", "),u=`
${a.returnType} ${n.name}(${o}) {
${n.glsl}
}`;return{...n,glslFunction:u}})(e),this._processedCache.set(r,t))}return t}has(r){return this._transforms.has(r)}getByType(r){return Array.from(this._transforms.values()).filter(t=>t.type===r)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src")}remove(r){return this._processedCache.delete(r),this._transforms.delete(r)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},j=new Set(["src"]),X=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(r){this._synthSourceClass=r}injectMethods(r){const t=k.getAll();for(const e of t)this._injectMethod(r,e)}_injectMethod(r,t){const{name:e,inputs:n,type:a}=t;r[e]=a==="combine"||a==="combineCoord"?function(o,...u){const l=n.map((c,f)=>u[f]??c.default);return this.addCombineTransform(e,o,l)}:function(...o){const u=n.map((l,c)=>o[c]??l.default);return this.addTransform(e,u)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const r={},t=k.getAll(),e=this._synthSourceClass;for(const n of t)if(j.has(n.type)){const{name:a,inputs:o}=n;r[a]=(...u)=>{const l=new e,c=o.map((f,m)=>u[m]??f.default);return l.addTransform(a,c)}}return this._generatedFunctions=r,r}getGeneratedFunctions(){return this._generatedFunctions}addTransform(r,t){if(k.register(r),t&&this._injectMethod(t,r),j.has(r.type)&&this._synthSourceClass){const e=this._synthSourceClass,{name:n,inputs:a}=r;this._generatedFunctions[n]=(...o)=>{const u=new e,l=a.map((c,f)=>o[f]??c.default);return u.addTransform(n,l)}}}},E=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
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
`,description:"Rotate characters"}];class M{_transforms;constructor(t){this._transforms=t}static empty(){return new M([])}static from(t){return new M([...t])}get transforms(){return this._transforms}push(t){this._transforms.push(t)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(t){return new M([...this._transforms,t])}get(t){return this._transforms[t]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class b{_chain;_charMapping;_nestedSources;_externalLayerRefs;_colorSource;_cellColorSource;_charSource;_charCount;constructor(t){this._chain=t?.chain??M.empty(),this._charMapping=t?.charMapping,this._colorSource=t?.colorSource,this._cellColorSource=t?.cellColorSource,this._charSource=t?.charSource,this._charCount=t?.charCount,this._nestedSources=t?.nestedSources??new Map,this._externalLayerRefs=t?.externalLayerRefs??new Map}addTransform(t,e){const n={name:t,userArgs:e};return this._chain.push(n),this}addCombineTransform(t,e,n){const a=this._chain.length;return this._nestedSources.set(a,e),this.addTransform(t,n)}addExternalLayerRef(t){const e=this._chain.length;return this._externalLayerRefs.set(e,t),this.addTransform("src",[])}charMap(t){const e=Array.from(t),n=[];for(const a of e)n.push(a.codePointAt(0)??32);return this._charMapping={chars:t,indices:n},this}charColor(t){return this._colorSource=t,this}char(t,e){return this._charSource=t,this._charCount=e,this}cellColor(t){return this._cellColorSource=t,this}paint(t){return this._colorSource=t,this._cellColorSource=t,this}clone(){const t=new Map;for(const[n,a]of this._nestedSources)t.set(n,a.clone());const e=new Map;for(const[n,a]of this._externalLayerRefs)e.set(n,{...a});return new b({chain:M.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),charSource:this._charSource?.clone(),charCount:this._charCount,nestedSources:t,externalLayerRefs:e})}osc(t,e,n){return this.addTransform("osc",[t??60,e??.1,n??0])}noise(t,e){return this.addTransform("noise",[t??10,e??.1])}voronoi(t,e,n){return this.addTransform("voronoi",[t??5,e??.3,n??.3])}gradient(t){return this.addTransform("gradient",[t??0])}shape(t,e,n){return this.addTransform("shape",[t??3,e??.3,n??.01])}solid(t,e,n,a){return this.addTransform("solid",[t??0,e??0,n??0,a??1])}src(t){return this.addTransform("src",[])}rotate(t,e){return this.addTransform("rotate",[t??10,e??0])}scale(t,e,n,a,o){return this.addTransform("scale",[t??1.5,e??1,n??1,a??.5,o??.5])}scroll(t,e,n,a){return this.addTransform("scroll",[t??.5,e??.5,n??0,a??0])}scrollX(t,e){return this.addTransform("scrollX",[t??.5,e??0])}scrollY(t,e){return this.addTransform("scrollY",[t??.5,e??0])}pixelate(t,e){return this.addTransform("pixelate",[t??20,e??20])}repeat(t,e,n,a){return this.addTransform("repeat",[t??3,e??3,n??0,a??0])}repeatX(t,e){return this.addTransform("repeatX",[t??3,e??0])}repeatY(t,e){return this.addTransform("repeatY",[t??3,e??0])}kaleid(t){return this.addTransform("kaleid",[t??4])}brightness(t){return this.addTransform("brightness",[t??.4])}contrast(t){return this.addTransform("contrast",[t??1.6])}invert(t){return this.addTransform("invert",[t??1])}saturate(t){return this.addTransform("saturate",[t??2])}hue(t){return this.addTransform("hue",[t??.4])}colorama(t){return this.addTransform("colorama",[t??.005])}posterize(t,e){return this.addTransform("posterize",[t??3,e??.6])}luma(t,e){return this.addTransform("luma",[t??.5,e??.1])}thresh(t,e){return this.addTransform("thresh",[t??.5,e??.04])}color(t,e,n,a){return this.addTransform("color",[t??1,e??1,n??1,a??1])}r(t,e){return this.addTransform("r",[t??1,e??0])}g(t,e){return this.addTransform("g",[t??1,e??0])}b(t,e){return this.addTransform("b",[t??1,e??0])}shift(t,e,n,a){return this.addTransform("shift",[t??.5,e??0,n??0,a??0])}gamma(t){return this.addTransform("gamma",[t??1])}levels(t,e,n,a,o){return this.addTransform("levels",[t??0,e??1,n??0,a??1,o??1])}clampColor(t,e){return this.addTransform("clampColor",[t??0,e??1])}add(t,e){return this.addCombineTransform("add",t,[e??.5])}sub(t,e){return this.addCombineTransform("sub",t,[e??.5])}mult(t,e){return this.addCombineTransform("mult",t,[e??.5])}blend(t,e){return this.addCombineTransform("blend",t,[e??.5])}diff(t){return this.addCombineTransform("diff",t,[])}layer(t){return this.addCombineTransform("layer",t,[])}mask(t){return this.addCombineTransform("mask",t,[])}modulate(t,e){return this.addCombineTransform("modulate",t,[e??.1])}modulateScale(t,e,n){return this.addCombineTransform("modulateScale",t,[e??1,n??1])}modulateRotate(t,e,n){return this.addCombineTransform("modulateRotate",t,[e??1,n??0])}modulatePixelate(t,e,n){return this.addCombineTransform("modulatePixelate",t,[e??10,n??3])}modulateKaleid(t,e){return this.addCombineTransform("modulateKaleid",t,[e??4])}modulateScrollX(t,e,n){return this.addCombineTransform("modulateScrollX",t,[e??.5,n??0])}modulateScrollY(t,e,n){return this.addCombineTransform("modulateScrollY",t,[e??.5,n??0])}charNoise(t,e,n){return this.addTransform("charNoise",[t??10,e??.1,n??256])}charOsc(t,e,n){return this.addTransform("charOsc",[t??60,e??.1,n??256])}charGradient(t,e){return this.addTransform("charGradient",[t??256,e??0])}charVoronoi(t,e,n){return this.addTransform("charVoronoi",[t??5,e??.3,n??256])}charShape(t,e,n,a){return this.addTransform("charShape",[t??3,e??0,n??1,a??.3])}charSolid(t){return this.addTransform("charSolid",[t??0])}charFlipX(t){return this.addTransform("charFlipX",[t??1])}charFlipY(t){return this.addTransform("charFlipY",[t??1])}charInvert(t){return this.addTransform("charInvert",[t??1])}charRotate(t,e){return this.addTransform("charRotate",[t??0,e??0])}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get charSource(){return this._charSource}get charCount(){return this._charCount}get nestedSources(){return this._nestedSources}get externalLayerRefs(){return this._externalLayerRefs}}const Y={linear:r=>r,easeInQuad:r=>r*r,easeOutQuad:r=>r*(2-r),easeInOutQuad:r=>r<.5?2*r*r:(4-2*r)*r-1,easeInCubic:r=>r*r*r,easeOutCubic:r=>--r*r*r+1,easeInOutCubic:r=>r<.5?4*r*r*r:(r-1)*(2*r-2)*(2*r-2)+1,easeInQuart:r=>r*r*r*r,easeOutQuart:r=>1- --r*r*r*r,easeInOutQuart:r=>r<.5?8*r*r*r*r:1-8*--r*r*r*r,easeInQuint:r=>r*r*r*r*r,easeOutQuint:r=>1+--r*r*r*r*r,easeInOutQuint:r=>r<.5?16*r*r*r*r*r:1+16*--r*r*r*r*r,sin:r=>(1+Math.sin(Math.PI*r-Math.PI/2))/2};function V(r,t){return(r%t+t)%t}class q{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(t,e,n){if((function(a){return Array.isArray(a)&&a.length>0&&typeof a[0]=="number"})(t)){const a=`${n}_${e.name}`,o={name:a,type:e.type,value:e.default??0,isDynamic:!0},u=l=>(function(c,f){const m=c._speed??1,d=c._smooth??0;let h=f.time*m*(f.bpm/60)+(c._offset??0);if(d!==0){const y=c._ease??Y.linear,p=h-d/2,g=c[Math.floor(V(p,c.length))],s=c[Math.floor(V(p+1,c.length))];return y(Math.min(V(p,1)/d,1))*(s-g)+g}return c[Math.floor(V(h,c.length))]})(t,l);return this._uniforms.set(a,o),this._dynamicUpdaters.set(a,u),{glslValue:a,uniform:o,updater:u}}if(typeof t=="function"){const a=`${n}_${e.name}`,o={name:a,type:e.type,value:e.default??0,isDynamic:!0};return this._uniforms.set(a,o),this._dynamicUpdaters.set(a,t),{glslValue:a,uniform:o,updater:t}}if(typeof t=="number")return{glslValue:x(t)};if(Array.isArray(t)&&typeof t[0]=="number"){const a=t;if(a.length===2)return{glslValue:`vec2(${x(a[0])}, ${x(a[1])})`};if(a.length===3)return{glslValue:`vec3(${x(a[0])}, ${x(a[1])}, ${x(a[2])})`};if(a.length===4)return{glslValue:`vec4(${x(a[0])}, ${x(a[1])}, ${x(a[2])}, ${x(a[3])})`}}return this.processDefault(e)}processDefault(t){const e=t.default;return typeof e=="number"?{glslValue:x(e)}:Array.isArray(e)?{glslValue:`vec${e.length}(${e.map(x).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function x(r){const t=r.toString();return t.includes(".")?t:t+".0"}function B(r){return new G().compile(r)}class G{_varCounter=0;_uniformManager=new q;_glslFunctions=new Set;_mainCode=[];_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;_currentTarget="main";_externalLayers=new Map;_externalLayerCounter=0;_layerIdToPrefix=new Map;compile(t){this._varCounter=0,this._uniformManager.clear(),this._glslFunctions.clear(),this._mainCode.length=0,this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1,this._externalLayers.clear(),this._externalLayerCounter=0,this._layerIdToPrefix.clear();const e=this._compileChain(t,"main","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","main");let n,a=e.charVar;if(t.charSource){const f=this._compileChain(t.charSource,"charSrc","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","char");a="charFromSource_"+this._varCounter++,n=t.charCount??256,this._mainCode.push("	// Convert charSource color to character index"),this._mainCode.push(`	float charLum_${a} = _luminance(${f.colorVar}.rgb);`),this._mainCode.push(`	int charIdx_${a} = int(charLum_${a} * ${n.toFixed(1)});`),this._mainCode.push(`	vec4 ${a} = vec4(float(charIdx_${a} % 256) / 255.0, float(charIdx_${a} / 256) / 255.0, 0.0, 0.0);`)}let o=e.colorVar;t.colorSource&&(o=this._compileChain(t.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","charColor").colorVar);let u="vec4(0.0, 0.0, 0.0, 0.0)";t.cellColorSource&&(u=this._compileChain(t.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)","v_uv","cellColor").colorVar);const l=(function(f,m,d){return f?`
	// Character output from generator
	vec4 charOutput = ${m};`:`
	// Derive character from color luminance
	float lum = _luminance(${d}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`})(!!a,a??"vec4(0.0)",e.colorVar);return{fragmentSource:(function(f){const{uniforms:m,glslFunctions:d,mainCode:h,charOutputCode:y,primaryColorVar:p,cellColorVar:g,charMapping:s,usesFeedback:i,usesCharFeedback:C,usesCellColorFeedback:v,externalLayers:R}=f,U=Array.from(m.values()).map($=>`uniform ${$.type} ${$.name};`).join(`
`);let L="",z="";s&&(L=`uniform int u_charMap[${s.indices.length}];
uniform int u_charMapSize;`,z=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const F=[];i&&F.push("uniform sampler2D prevBuffer;"),C&&F.push("uniform sampler2D prevCharBuffer;"),v&&F.push("uniform sampler2D prevCellColorBuffer;");const T=F.join(`
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
${T}
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
${Array.from(d).join(`
`)}

void main() {
	// Transform chain
${h.join(`
`)}

${y}
${z}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${p};
	o_secondaryColor = ${g};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:l,primaryColorVar:o,cellColorVar:u,charMapping:t.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback,externalLayers:this._externalLayers}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:t.charMapping,usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback,externalLayers:new Map(this._externalLayers)}}_compileChain(t,e,n,a="v_uv",o="main"){const u=this._currentTarget;this._currentTarget=o;const l=`${e}_st`;let c,f,m,d=`${e}_c`;this._mainCode.push(`	vec2 ${l} = ${a};`),this._mainCode.push(`	vec4 ${d} = ${n};`);const h=t.transforms,y=h.map(s=>this._getProcessedTransform(s.name)),p=[];for(let s=0;s<y.length;s++){const i=y[s];i&&(i.type!=="coord"&&i.type!=="combineCoord"||p.push(s))}const g=s=>{const i=h[s],C=y[s];if(!C)return void console.warn(`[SynthCompiler] Unknown transform: ${i.name}`);const v=t.externalLayerRefs.get(s);if(i.name==="src")if(v)this._trackExternalLayerUsage(v,this._currentTarget);else switch(this._currentTarget){case"char":this._usesCharFeedback=!0;break;case"cellColor":this._usesCellColorFeedback=!0;break;default:this._usesFeedback=!0}const R=this._getContextAwareGlslFunction(C,i.name,v);this._glslFunctions.add(R);const U=this._processArguments(i.userArgs,C.inputs,`${e}_${s}_${i.name}`),L=t.nestedSources.get(s);let z;L&&(C.type==="combine"||C.type==="combineCoord")&&(z=this._compileChain(L,`${e}_nested_${s}`,n,l,o).colorVar);const F=this._varCounter++,T=this._generateTransformCode(C,F,l,d,c,f,m,U,z,v);d=T.colorVar,T.charVar&&(c=T.charVar),T.flagsVar&&(f=T.flagsVar),T.rotationVar&&(m=T.rotationVar)};for(let s=p.length-1;s>=0;s--)g(p[s]);for(let s=0;s<h.length;s++){const i=y[s];(!i||i.type!=="coord"&&i.type!=="combineCoord")&&g(s)}return this._currentTarget=u,{coordVar:l,colorVar:d,charVar:c,flagsVar:f,rotationVar:m}}_getProcessedTransform(t){return k.getProcessed(t)}_getContextAwareGlslFunction(t,e,n){if(e!=="src")return t.glslFunction;if(n){const o=this._getExternalLayerPrefix(n.layerId),u={char:`${o}_char`,charColor:`${o}_primary`,cellColor:`${o}_cell`,main:`${o}_primary`}[this._currentTarget];return`
vec4 ${`src_ext_${o}_${this._currentTarget}`}(vec2 _st) {
	return texture(${u}, fract(_st));
}
`}const a={char:"prevCharBuffer",charColor:"prevBuffer",cellColor:"prevCellColorBuffer",main:"prevBuffer"}[this._currentTarget];return`
vec4 ${`src_${this._currentTarget}`}(vec2 _st) {
	return texture(${a}, fract(_st));
}
`}_getExternalLayerPrefix(t){let e=this._layerIdToPrefix.get(t);return e||(e="extLayer"+this._externalLayerCounter++,this._layerIdToPrefix.set(t,e)),e}_trackExternalLayerUsage(t,e){const n=this._getExternalLayerPrefix(t.layerId);let a=this._externalLayers.get(t.layerId);switch(a||(a={layerId:t.layerId,uniformPrefix:n,usesChar:!1,usesPrimary:!1,usesCellColor:!1},this._externalLayers.set(t.layerId,a)),e){case"char":a.usesChar=!0;break;case"cellColor":a.usesCellColor=!0;break;default:a.usesPrimary=!0}}_processArguments(t,e,n){const a=[];for(let o=0;o<e.length;o++){const u=e[o],l=t[o]??u.default,c=this._uniformManager.processArgument(l,u,n);a.push(c.glslValue)}return a}_generateTransformCode(t,e,n,a,o,u,l,c,f,m){const d=(...i)=>[...i,...c].join(", ");let h=t.name;t.name==="src"&&(m?h=`src_ext_${this._getExternalLayerPrefix(m.layerId)}_${this._currentTarget}`:h=`src_${this._currentTarget}`);let y=a,p=o,g=u,s=l;switch(t.type){case"src":{const i=`c${e}`;this._mainCode.push(`	vec4 ${i} = ${h}(${d(n)});`),y=i;break}case"coord":{const i=`st${e}`;this._mainCode.push(`	vec2 ${i} = ${h}(${d(n)});`),this._mainCode.push(`	${n} = ${i};`);break}case"color":{const i=`c${e}`;this._mainCode.push(`	vec4 ${i} = ${h}(${d(a)});`),y=i;break}case"combine":{const i=`c${e}`;this._mainCode.push(`	vec4 ${i} = ${h}(${d(a,f??"vec4(0.0)")});`),y=i;break}case"combineCoord":{const i=`st${e}`;this._mainCode.push(`	vec2 ${i} = ${h}(${d(n,f??"vec4(0.0)")});`),this._mainCode.push(`	${n} = ${i};`);break}case"charModify":p||(p=`char${e}`,g=`flags${e}`,s=`rot${e}`,this._mainCode.push(`	vec4 ${p} = vec4(0.0);`),this._mainCode.push(`	float ${g} = 0.0;`),this._mainCode.push(`	float ${s} = 0.0;`)),this._mainCode.push(`	${p} = ${h}(${d(p)});`)}return{colorVar:y,charVar:p,flagsVar:g,rotationVar:s}}}class O{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(t,e){const n=e.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===n&&this._lastChars===t)return this._resolvedIndices;const a=Array.from(t),o=new Int32Array(a.length),u=e.characterMap,l=e.characters;for(let c=0;c<a.length;c++){const f=a[c],m=u.get(f);if(m!==void 0)o[c]=l.indexOf(m);else{const d=u.get(" ");o[c]=d!==void 0?l.indexOf(d):0}}return this._resolvedIndices=o,this._lastFontCharacterCount=n,this._lastChars=t,o}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}let D=60;const S="textmode.synth.js";function P(r){const t=new Map;for(const[,e]of r.externalLayerRefs)t.set(e.layerId,e.layer);for(const[,e]of r.nestedSources){const n=P(e);for(const[a,o]of n)t.set(a,o)}if(r.charSource){const e=P(r.charSource);for(const[n,a]of e)t.set(n,a)}if(r.colorSource){const e=P(r.colorSource);for(const[n,a]of e)t.set(n,a)}if(r.cellColorSource){const e=P(r.cellColorSource);for(const[n,a]of e)t.set(n,a)}return t}const K={name:S,version:"1.0.0",install(r,t){r.bpm=function(e){return(function(n){D=n})(e),e},t.extendLayer("synth",function(e){const n=performance.now()/1e3,a=this.grid!==void 0&&this.drawFramebuffer!==void 0;let o=this.getPluginState(S);o?(o.source=e,o.startTime=n,o.needsCompile=!0,o.characterResolver.invalidate(),a&&(o.compiled=B(e))):o={source:e,compiled:a?B(e):void 0,shader:void 0,characterResolver:new O,startTime:n,needsCompile:!0,pingPongBuffers:void 0,pingPongIndex:0},this.setPluginState(S,o)}),t.extendLayer("bpm",function(e){let n=this.getPluginState(S);if(n)n.bpm=e;else{const a=performance.now()/1e3;n={source:new b,compiled:void 0,shader:void 0,characterResolver:new O,startTime:a,needsCompile:!1,pingPongBuffers:void 0,pingPongIndex:0,bpm:e}}this.setPluginState(S,n)}),t.extendLayer("clearSynth",function(){const e=this.getPluginState(S);e&&(e.shader?.dispose&&e.shader.dispose(),e.pingPongBuffers&&(e.pingPongBuffers[0].dispose?.(),e.pingPongBuffers[1].dispose?.()),this.setPluginState(S,void 0))}),t.registerLayerPreRenderHook(async e=>{const n=e.getPluginState(S);if(!n)return;const a=e.grid,o=e.drawFramebuffer;if(!a||!o||(n.compiled||(n.compiled=B(n.source),n.externalLayerMap=P(n.source),n.needsCompile=!0),n.needsCompile&&n.compiled&&(n.shader?.dispose&&n.shader.dispose(),n.externalLayerMap=P(n.source),n.shader=await r.createFilterShader(n.compiled.fragmentSource),n.needsCompile=!1),!n.shader||!n.compiled))return;const u=n.compiled.usesFeedback,l=n.compiled.usesCharFeedback,c=n.compiled.usesCellColorFeedback,f=u||l||c;f&&!n.pingPongBuffers&&(n.pingPongBuffers=[r.createFramebuffer({width:a.cols,height:a.rows,attachments:3}),r.createFramebuffer({width:a.cols,height:a.rows,attachments:3})],n.pingPongIndex=0);const m=n.bpm??D,d={time:r.millis()/1e3,frameCount:r.frameCount,width:a.width,height:a.height,cols:a.cols,rows:a.rows,bpm:m},h=y=>{r.setUniform("time",d.time),r.setUniform("resolution",[d.cols,d.rows]);for(const[g,s]of n.compiled.dynamicUpdaters)r.setUniform(g,s(d));for(const[g,s]of n.compiled.uniforms)s.isDynamic||typeof s.value=="function"||r.setUniform(g,s.value);if(n.compiled.charMapping){const g=n.characterResolver.resolve(n.compiled.charMapping.chars,e.font);r.setUniform("u_charMap",g),r.setUniform("u_charMapSize",g.length)}y&&(u&&r.setUniform("prevBuffer",y.textures[1]),l&&r.setUniform("prevCharBuffer",y.textures[0]),c&&r.setUniform("prevCellColorBuffer",y.textures[2]));const p=n.compiled.externalLayers;if(p&&p.size>0&&n.externalLayerMap)for(const[g,s]of p){const i=n.externalLayerMap.get(g);if(!i){console.warn(`[SynthPlugin] External layer not found: ${g}`);continue}const C=i.getPluginState(S);let v;C?.pingPongBuffers?v=C.pingPongBuffers[C.pingPongIndex].textures:i.drawFramebuffer&&(v=i.drawFramebuffer.textures),v&&(s.usesChar&&r.setUniform(`${s.uniformPrefix}_char`,v[0]),s.usesPrimary&&r.setUniform(`${s.uniformPrefix}_primary`,v[1]),s.usesCellColor&&r.setUniform(`${s.uniformPrefix}_cell`,v[2]))}};if(f&&n.pingPongBuffers){const y=n.pingPongBuffers[n.pingPongIndex],p=n.pingPongBuffers[1-n.pingPongIndex];p.begin(),r.clear(),r.shader(n.shader),h(y),r.rect(a.cols,a.rows),p.end(),o.begin(),r.clear(),r.shader(n.shader),h(y),r.rect(a.cols,a.rows),o.end(),n.pingPongIndex=1-n.pingPongIndex}else o.begin(),r.clear(),r.shader(n.shader),h(null),r.rect(a.cols,a.rows),o.end()}),t.registerLayerDisposedHook(e=>{const n=e.getPluginState(S);n&&(n.shader?.dispose&&n.shader.dispose(),n.pingPongBuffers&&(n.pingPongBuffers[0].dispose?.(),n.pingPongBuffers[1].dispose?.()))})},uninstall(r,t){const e=[t.layerManager.base,...t.layerManager.all];for(const n of e){const a=n.getPluginState(S);a&&(a.shader?.dispose&&a.shader.dispose(),a.pingPongBuffers&&(a.pingPongBuffers[0].dispose?.(),a.pingPongBuffers[1].dispose?.()))}delete r.bpm,t.removeLayerExtension("synth"),t.removeLayerExtension("bpm"),t.removeLayerExtension("clearSynth")}};"fast"in Array.prototype||(Array.prototype.fast=function(r=1){return this._speed=r,this},Array.prototype.smooth=function(r=1){return this._smooth=r,this},Array.prototype.ease=function(r="linear"){return typeof r=="function"?(this._smooth=1,this._ease=r):Y[r]&&(this._smooth=1,this._ease=Y[r]),this},Array.prototype.offset=function(r=.5){return this._offset=r%1,this},Array.prototype.fit=function(r=0,t=1){const e=Math.min(...this),n=Math.max(...this),a=this.map(o=>(function(u,l,c,f,m){return(u-l)*(m-f)/(c-l)+f})(o,e,n,r,t));return a._speed=this._speed,a._smooth=this._smooth,a._ease=this._ease,a._offset=this._offset,a}),k.registerMany(E),X.setSynthSourceClass(b),X.injectMethods(b.prototype);const w=X.generateStandaloneFunctions(),Q=(r,t=256)=>{const e=new b;return e._charSource=r,e._charCount=t,e},N=w.osc,H=w.noise,W=w.voronoi,J=w.gradient,Z=w.shape,tt=w.solid,et=(function(){const r=w.src;return t=>{if(!t)return r();const e=new b,n=t.id??`layer_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;return e.addExternalLayerRef({layerId:n,layer:t}),e}})();_.SynthPlugin=K,_.SynthSource=b,_.cellColor=r=>{const t=new b;return t._cellColorSource=r,t},_.char=Q,_.charColor=r=>{const t=new b;return t._colorSource=r,t},_.gradient=J,_.noise=H,_.osc=N,_.paint=r=>{const t=new b;return t._colorSource=r,t._cellColorSource=r,t},_.shape=Z,_.solid=tt,_.src=et,_.voronoi=W,Object.defineProperty(_,Symbol.toStringTag,{value:"Module"})});

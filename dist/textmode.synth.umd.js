(function(g,P){typeof exports=="object"&&typeof module<"u"?P(exports):typeof define=="function"&&define.amd?define(["exports"],P):P((g=typeof globalThis<"u"?globalThis:g||self).TextmodeSynth={})})(this,function(g){"use strict";const P={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]},charModify:{returnType:"vec4",args:[{type:"vec4",name:"_char"}]}},L=new class{_transforms=new Map;_processedCache=new Map;register(r){this._transforms.has(r.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${r.name}`),this._transforms.set(r.name,r),this._processedCache.delete(r.name)}registerMany(r){for(const e of r)this.register(e)}get(r){return this._transforms.get(r)}getProcessed(r){let e=this._processedCache.get(r);if(!e){const t=this._transforms.get(r);t&&(e=(function(a){const n=P[a.type],s=[...n.args,...a.inputs.map(c=>({type:c.type,name:c.name}))].map(c=>`${c.type} ${c.name}`).join(", "),o=`
${n.returnType} ${a.name}(${s}) {
${a.glsl}
}`;return{...a,glslFunction:o}})(t),this._processedCache.set(r,e))}return e}has(r){return this._transforms.has(r)}getByType(r){return Array.from(this._transforms.values()).filter(e=>e.type===r)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src")}remove(r){return this._processedCache.delete(r),this._transforms.delete(r)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},j=new Set(["src"]),X=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(r){this._synthSourceClass=r}injectMethods(r){const e=L.getAll();for(const t of e)this._injectMethod(r,t)}_injectMethod(r,e){const{name:t,inputs:a,type:n}=e;r[t]=n==="combine"||n==="combineCoord"?function(s,...o){const c=a.map((l,d)=>o[d]??l.default);return this.addCombineTransform(t,s,c)}:function(...s){const o=a.map((c,l)=>s[l]??c.default);return this.addTransform(t,o)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const r={},e=L.getAll(),t=this._synthSourceClass;for(const a of e)if(j.has(a.type)){const{name:n,inputs:s}=a;r[n]=(...o)=>{const c=new t,l=s.map((d,m)=>o[m]??d.default);return c.addTransform(n,l)}}return this._generatedFunctions=r,r}getGeneratedFunctions(){return this._generatedFunctions}addTransform(r,e){if(L.register(r),e&&this._injectMethod(e,r),j.has(r.type)&&this._synthSourceClass){const t=this._synthSourceClass,{name:a,inputs:n}=r;this._generatedFunctions[a]=(...s)=>{const o=new t,c=n.map((l,d)=>s[d]??l.default);return o.addTransform(a,c)}}}},E=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
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
	return texture(prevCharColorBuffer, fract(_st));
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
`,description:"Modulate coordinates based on hue differences"}];class F{_transforms;constructor(e){this._transforms=e}static empty(){return new F([])}static from(e){return new F([...e])}get transforms(){return this._transforms}push(e){this._transforms.push(e)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(e){return new F([...this._transforms,e])}get(e){return this._transforms[e]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class ${_chain;_charMapping;_nestedSources;_externalLayerRefs;_colorSource;_cellColorSource;_charSource;_charCount;constructor(e){this._chain=e?.chain??F.empty(),this._charMapping=e?.charMapping,this._colorSource=e?.colorSource,this._cellColorSource=e?.cellColorSource,this._charSource=e?.charSource,this._charCount=e?.charCount,this._nestedSources=e?.nestedSources??new Map,this._externalLayerRefs=e?.externalLayerRefs??new Map}addTransform(e,t){const a={name:e,userArgs:t};return this._chain.push(a),this}addCombineTransform(e,t,a){const n=this._chain.length;return this._nestedSources.set(n,t),this.addTransform(e,a)}addExternalLayerRef(e){const t=this._chain.length;return this._externalLayerRefs.set(t,e),this.addTransform("src",[])}charMap(e){const t=Array.from(e),a=[];for(const n of t)a.push(n.codePointAt(0)??32);return this._charMapping={chars:e,indices:a},this}charColor(e){return this._colorSource=e,this}char(e,t){return this._charSource=e,this._charCount=t,this}cellColor(e){return this._cellColorSource=e,this}paint(e){return this._colorSource=e,this._cellColorSource=e,this}clone(){const e=new Map;for(const[a,n]of this._nestedSources)e.set(a,n.clone());const t=new Map;for(const[a,n]of this._externalLayerRefs)t.set(a,{...n});return new $({chain:F.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),charSource:this._charSource?.clone(),charCount:this._charCount,nestedSources:e,externalLayerRefs:t})}osc(e,t,a){return this.addTransform("osc",[e??60,t??.1,a??0])}noise(e,t){return this.addTransform("noise",[e??10,t??.1])}voronoi(e,t,a){return this.addTransform("voronoi",[e??5,t??.3,a??.3])}gradient(e){return this.addTransform("gradient",[e??0])}shape(e,t,a){return this.addTransform("shape",[e??3,t??.3,a??.01])}solid(e,t,a,n){return this.addTransform("solid",[e??0,t??0,a??0,n??1])}src(e){return this.addTransform("src",[])}rotate(e,t){return this.addTransform("rotate",[e??10,t??0])}scale(e,t,a,n,s){return this.addTransform("scale",[e??1.5,t??1,a??1,n??.5,s??.5])}scroll(e,t,a,n){return this.addTransform("scroll",[e??.5,t??.5,a??0,n??0])}scrollX(e,t){return this.addTransform("scrollX",[e??.5,t??0])}scrollY(e,t){return this.addTransform("scrollY",[e??.5,t??0])}pixelate(e,t){return this.addTransform("pixelate",[e??20,t??20])}repeat(e,t,a,n){return this.addTransform("repeat",[e??3,t??3,a??0,n??0])}repeatX(e,t){return this.addTransform("repeatX",[e??3,t??0])}repeatY(e,t){return this.addTransform("repeatY",[e??3,t??0])}kaleid(e){return this.addTransform("kaleid",[e??4])}brightness(e){return this.addTransform("brightness",[e??.4])}contrast(e){return this.addTransform("contrast",[e??1.6])}invert(e){return this.addTransform("invert",[e??1])}saturate(e){return this.addTransform("saturate",[e??2])}hue(e){return this.addTransform("hue",[e??.4])}colorama(e){return this.addTransform("colorama",[e??.005])}posterize(e,t){return this.addTransform("posterize",[e??3,t??.6])}luma(e,t){return this.addTransform("luma",[e??.5,t??.1])}thresh(e,t){return this.addTransform("thresh",[e??.5,t??.04])}color(e,t,a,n){return this.addTransform("color",[e??1,t??1,a??1,n??1])}r(e,t){return this.addTransform("r",[e??1,t??0])}g(e,t){return this.addTransform("g",[e??1,t??0])}b(e,t){return this.addTransform("b",[e??1,t??0])}shift(e,t,a,n){return this.addTransform("shift",[e??.5,t??0,a??0,n??0])}gamma(e){return this.addTransform("gamma",[e??1])}levels(e,t,a,n,s){return this.addTransform("levels",[e??0,t??1,a??0,n??1,s??1])}clamp(e,t){return this.addTransform("clamp",[e??0,t??1])}add(e,t){return this.addCombineTransform("add",e,[t??.5])}sub(e,t){return this.addCombineTransform("sub",e,[t??.5])}mult(e,t){return this.addCombineTransform("mult",e,[t??.5])}blend(e,t){return this.addCombineTransform("blend",e,[t??.5])}diff(e){return this.addCombineTransform("diff",e,[])}layer(e){return this.addCombineTransform("layer",e,[])}mask(e){return this.addCombineTransform("mask",e,[])}modulate(e,t){return this.addCombineTransform("modulate",e,[t??.1])}modulateScale(e,t,a){return this.addCombineTransform("modulateScale",e,[t??1,a??1])}modulateRotate(e,t,a){return this.addCombineTransform("modulateRotate",e,[t??1,a??0])}modulatePixelate(e,t,a){return this.addCombineTransform("modulatePixelate",e,[t??10,a??3])}modulateKaleid(e,t){return this.addCombineTransform("modulateKaleid",e,[t??4])}modulateScrollX(e,t,a){return this.addCombineTransform("modulateScrollX",e,[t??.5,a??0])}modulateScrollY(e,t,a){return this.addCombineTransform("modulateScrollY",e,[t??.5,a??0])}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get charSource(){return this._charSource}get charCount(){return this._charCount}get nestedSources(){return this._nestedSources}get externalLayerRefs(){return this._externalLayerRefs}}const Y={linear:r=>r,easeInQuad:r=>r*r,easeOutQuad:r=>r*(2-r),easeInOutQuad:r=>r<.5?2*r*r:(4-2*r)*r-1,easeInCubic:r=>r*r*r,easeOutCubic:r=>--r*r*r+1,easeInOutCubic:r=>r<.5?4*r*r*r:(r-1)*(2*r-2)*(2*r-2)+1,easeInQuart:r=>r*r*r*r,easeOutQuart:r=>1- --r*r*r*r,easeInOutQuart:r=>r<.5?8*r*r*r*r:1-8*--r*r*r*r,easeInQuint:r=>r*r*r*r*r,easeOutQuint:r=>1+--r*r*r*r*r,easeInOutQuint:r=>r<.5?16*r*r*r*r*r:1+16*--r*r*r*r*r,sin:r=>(1+Math.sin(Math.PI*r-Math.PI/2))/2};function U(r,e){return(r%e+e)%e}"fast"in Array.prototype||(Array.prototype.fast=function(r=1){return this._speed=r,this},Array.prototype.smooth=function(r=1){return this._smooth=r,this},Array.prototype.ease=function(r="linear"){return typeof r=="function"?(this._smooth=1,this._ease=r):Y[r]&&(this._smooth=1,this._ease=Y[r]),this},Array.prototype.offset=function(r=.5){return this._offset=r%1,this},Array.prototype.fit=function(r=0,e=1){const t=Math.min(...this),a=Math.max(...this),n=this.map(s=>(function(o,c,l,d,m){return(o-c)*(m-d)/(l-c)+d})(s,t,a,r,e));return n._speed=this._speed,n._smooth=this._smooth,n._ease=this._ease,n._offset=this._offset,n}),L.registerMany(E),X.setSynthSourceClass($),X.injectMethods($.prototype);const M=X.generateStandaloneFunctions(),w="textmode.synth.js";class q{_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;trackUsage(e){switch(e){case"char":this._usesCharFeedback=!0;break;case"cellColor":this._usesCellColorFeedback=!0;break;default:this._usesFeedback=!0}}reset(){this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1}getUsage(){return{usesFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback}}get usesAnyFeedback(){return this._usesFeedback||this._usesCharFeedback||this._usesCellColorFeedback}get usesFeedback(){return this._usesFeedback}get usesCharFeedback(){return this._usesCharFeedback}get usesCellColorFeedback(){return this._usesCellColorFeedback}}class G{_externalLayers=new Map;_counter=0;_layerIdToPrefix=new Map;getPrefix(e){let t=this._layerIdToPrefix.get(e);return t||(t="extLayer"+this._counter++,this._layerIdToPrefix.set(e,t)),t}trackUsage(e,t){const a=this.getPrefix(e.layerId);let n=this._externalLayers.get(e.layerId);switch(n||(n={layerId:e.layerId,uniformPrefix:a,usesChar:!1,usesPrimary:!1,usesCellColor:!1},this._externalLayers.set(e.layerId,n)),t){case"char":n.usesChar=!0;break;case"cellColor":n.usesCellColor=!0;break;default:n.usesPrimary=!0}}hasLayer(e){return this._externalLayers.has(e)}getLayerInfo(e){return this._externalLayers.get(e)}getExternalLayers(){return new Map(this._externalLayers)}get hasExternalLayers(){return this._externalLayers.size>0}get count(){return this._externalLayers.size}reset(){this._externalLayers.clear(),this._counter=0,this._layerIdToPrefix.clear()}}const K={char:"prevCharBuffer",charColor:"prevCharColorBuffer",cellColor:"prevCellColorBuffer",main:"prevCharColorBuffer"};class Q{getContextAwareGlslFunction(e,t,a,n,s){return t!=="src"?e.glslFunction:n&&s?this._generateExternalSrcFunction(n,a,s):this._generateSelfFeedbackSrcFunction(a)}getFunctionName(e,t,a,n){return e.name!=="src"?e.name:a&&n?`src_ext_${n(a.layerId)}_${t}`:`src_${t}`}generateTransformCode(e,t,a,n,s,o,c,l,d,m,h,v,x){const p=this.getFunctionName(t,m,v,x),y=(...f)=>[...f,...d].join(", ");let i=s,u=o,_=c,C=l;switch(t.type){case"src":{const f=`c${a}`;e.push(`	vec4 ${f} = ${p}(${y(n)});`),i=f;break}case"coord":{const f=`st${a}`;e.push(`	vec2 ${f} = ${p}(${y(n)});`),e.push(`	${n} = ${f};`);break}case"color":{const f=`c${a}`;e.push(`	vec4 ${f} = ${p}(${y(s)});`),i=f;break}case"combine":{const f=`c${a}`;e.push(`	vec4 ${f} = ${p}(${y(s,h??"vec4(0.0)")});`),i=f;break}case"combineCoord":{const f=`st${a}`;e.push(`	vec2 ${f} = ${p}(${y(n,h??"vec4(0.0)")});`),e.push(`	${n} = ${f};`);break}case"charModify":u||(u=`char${a}`,_=`flags${a}`,C=`rot${a}`,e.push(`	vec4 ${u} = vec4(0.0);`),e.push(`	float ${_} = 0.0;`),e.push(`	float ${C} = 0.0;`)),e.push(`	${u} = ${p}(${y(u)});`)}return{colorVar:i,charVar:u,flagsVar:_,rotationVar:C}}_generateExternalSrcFunction(e,t,a){const n=a(e.layerId);return`
vec4 ${`src_ext_${n}_${t}`}(vec2 _st) {
	return texture(${{char:`${n}_char`,charColor:`${n}_primary`,cellColor:`${n}_cell`,main:`${n}_primary`}[t]}, fract(_st));
}
`}_generateSelfFeedbackSrcFunction(e){return`
vec4 ${`src_${e}`}(vec2 _st) {
	return texture(${K[e]}, fract(_st));
}
`}}class N{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(e,t,a){if((function(n){return Array.isArray(n)&&n.length>0&&typeof n[0]=="number"})(e)){const n=`${a}_${t.name}`,s={name:n,type:t.type,value:t.default??0,isDynamic:!0},o=c=>(function(l,d){const m=l._speed??1,h=l._smooth??0;let v=d.time*m*(d.bpm/60)+(l._offset??0);if(h!==0){const x=l._ease??Y.linear,p=v-h/2,y=l[Math.floor(U(p,l.length))],i=l[Math.floor(U(p+1,l.length))];return x(Math.min(U(p,1)/h,1))*(i-y)+y}return l[Math.floor(U(v,l.length))]})(e,c);return this._uniforms.set(n,s),this._dynamicUpdaters.set(n,o),{glslValue:n,uniform:s,updater:o}}if(typeof e=="function"){const n=`${a}_${t.name}`,s={name:n,type:t.type,value:t.default??0,isDynamic:!0};return this._uniforms.set(n,s),this._dynamicUpdaters.set(n,e),{glslValue:n,uniform:s,updater:e}}if(typeof e=="number")return{glslValue:b(e)};if(Array.isArray(e)&&typeof e[0]=="number"){const n=e;if(n.length===2)return{glslValue:`vec2(${b(n[0])}, ${b(n[1])})`};if(n.length===3)return{glslValue:`vec3(${b(n[0])}, ${b(n[1])}, ${b(n[2])})`};if(n.length===4)return{glslValue:`vec4(${b(n[0])}, ${b(n[1])}, ${b(n[2])}, ${b(n[3])})`}}return this.processDefault(t)}processDefault(e){const t=e.default;return typeof t=="number"?{glslValue:b(t)}:Array.isArray(t)?{glslValue:`vec${t.length}(${t.map(b).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function b(r){const e=r.toString();return e.includes(".")?e:e+".0"}function R(r){return new H().compile(r)}class H{_uniformManager=new N;_feedbackTracker=new q;_externalLayerManager=new G;_codeGenerator=new Q;_glslFunctions=new Set;_mainCode=[];_varCounter=0;_currentTarget="main";compile(e){this._reset();const t=this._compileChain(e,"main","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","main");let a=t.charVar;e.charSource&&(a=this._compileCharSource(e));let n=t.colorVar;e.colorSource&&(n=this._compileChain(e.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","charColor").colorVar);let s="vec4(0.0, 0.0, 0.0, 0.0)";e.cellColorSource&&(s=this._compileChain(e.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)","v_uv","cellColor").colorVar);const o=(function(d,m,h){return d?`
	// Character output from generator
	vec4 charOutput = ${m};`:`
	// Derive character from color luminance
	float lum = _luminance(${h}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`})(!!a,a??"vec4(0.0)",t.colorVar),c=this._feedbackTracker.getUsage();return{fragmentSource:(function(d){const{uniforms:m,glslFunctions:h,mainCode:v,charOutputCode:x,primaryColorVar:p,cellColorVar:y,charMapping:i,usesFeedback:u,usesCharFeedback:_,usesCellColorFeedback:C,externalLayers:f}=d,B=Array.from(m.values()).map(T=>`uniform ${T.type} ${T.name};`).join(`
`);let I="",z="";i&&(I=`uniform int u_charMap[${i.indices.length}];
uniform int u_charMapSize;`,z=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const S=[];u&&S.push("uniform sampler2D prevCharColorBuffer;"),_&&S.push("uniform sampler2D prevCharBuffer;"),C&&S.push("uniform sampler2D prevCellColorBuffer;");const A=S.join(`
`),V=[];if(f)for(const[,T]of f)T.usesChar&&V.push(`uniform sampler2D ${T.uniformPrefix}_char;`),T.usesPrimary&&V.push(`uniform sampler2D ${T.uniformPrefix}_primary;`),T.usesCellColor&&V.push(`uniform sampler2D ${T.uniformPrefix}_cell;`);return`#version 300 es
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
${A}
${V.length>0?`// External layer samplers
${V.join(`
`)}`:""}
${I}

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
${Array.from(h).join(`
`)}

void main() {
	// Transform chain
${v.join(`
`)}

${x}
${z}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${p};
	o_secondaryColor = ${y};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:o,primaryColorVar:n,cellColorVar:s,charMapping:e.charMapping,usesFeedback:c.usesFeedback,usesCharFeedback:c.usesCharFeedback,usesCellColorFeedback:c.usesCellColorFeedback,externalLayers:this._externalLayerManager.getExternalLayers()}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:e.charMapping,usesFeedback:c.usesFeedback,usesCharFeedback:c.usesCharFeedback,usesCellColorFeedback:c.usesCellColorFeedback,externalLayers:this._externalLayerManager.getExternalLayers()}}_reset(){this._varCounter=0,this._uniformManager.clear(),this._feedbackTracker.reset(),this._externalLayerManager.reset(),this._glslFunctions.clear(),this._mainCode.length=0,this._currentTarget="main"}_compileCharSource(e){const t=this._compileChain(e.charSource,"charSrc","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","char"),a="charFromSource_"+this._varCounter++,n=e.charCount??256;return this._mainCode.push("	// Convert charSource color to character index"),this._mainCode.push(`	float charLum_${a} = _luminance(${t.colorVar}.rgb);`),this._mainCode.push(`	int charIdx_${a} = int(charLum_${a} * ${n.toFixed(1)});`),this._mainCode.push(`	vec4 ${a} = vec4(float(charIdx_${a} % 256) / 255.0, float(charIdx_${a} / 256) / 255.0, 0.0, 0.0);`),a}_compileChain(e,t,a,n="v_uv",s="main"){const o=this._currentTarget;this._currentTarget=s;const c=`${t}_st`;let l,d,m,h=`${t}_c`;this._mainCode.push(`	vec2 ${c} = ${n};`),this._mainCode.push(`	vec4 ${h} = ${a};`);const v=e.transforms,x=v.map(i=>this._getProcessedTransform(i.name)),p=this._identifyCoordTransforms(x),y=i=>{const u=v[i],_=x[i];if(!_)return void console.warn(`[SynthCompiler] Unknown transform: ${u.name}`);const C=e.externalLayerRefs.get(i);u.name==="src"&&this._trackSrcUsage(C);const f=this._codeGenerator.getContextAwareGlslFunction(_,u.name,this._currentTarget,C,A=>this._externalLayerManager.getPrefix(A));this._glslFunctions.add(f);const B=this._processArguments(u.userArgs,_.inputs,`${t}_${i}_${u.name}`),I=e.nestedSources.get(i);let z;I&&(_.type==="combine"||_.type==="combineCoord")&&(z=this._compileChain(I,`${t}_nested_${i}`,a,c,s).colorVar);const S=this._codeGenerator.generateTransformCode(this._mainCode,_,this._varCounter++,c,h,l,d,m,B,this._currentTarget,z,C,A=>this._externalLayerManager.getPrefix(A));h=S.colorVar,S.charVar&&(l=S.charVar),S.flagsVar&&(d=S.flagsVar),S.rotationVar&&(m=S.rotationVar)};for(let i=p.length-1;i>=0;i--)y(p[i]);for(let i=0;i<v.length;i++){const u=x[i];(!u||u.type!=="coord"&&u.type!=="combineCoord")&&y(i)}return this._currentTarget=o,{coordVar:c,colorVar:h,charVar:l,flagsVar:d,rotationVar:m}}_identifyCoordTransforms(e){const t=[];for(let a=0;a<e.length;a++){const n=e[a];n&&(n.type!=="coord"&&n.type!=="combineCoord"||t.push(a))}return t}_trackSrcUsage(e){e?this._externalLayerManager.trackUsage(e,this._currentTarget):this._feedbackTracker.trackUsage(this._currentTarget)}_getProcessedTransform(e){return L.getProcessed(e)}_processArguments(e,t,a){const n=[];for(let s=0;s<t.length;s++){const o=t[s],c=e[s]??o.default,l=this._uniformManager.processArgument(c,o,a);n.push(l.glslValue)}return n}}class W{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(e,t){const a=t.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===a&&this._lastChars===e)return this._resolvedIndices;const n=Array.from(e),s=new Int32Array(n.length),o=t.characterMap,c=t.characters;for(let l=0;l<n.length;l++){const d=n[l],m=o.get(d);if(m!==void 0)s[l]=c.indexOf(m);else{const h=o.get(" ");s[l]=h!==void 0?c.indexOf(h):0}}return this._resolvedIndices=s,this._lastFontCharacterCount=a,this._lastChars=e,s}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}function O(r={}){return{source:r.source??new $,compiled:r.compiled,shader:r.shader,characterResolver:r.characterResolver??new W,startTime:r.startTime??performance.now()/1e3,needsCompile:r.needsCompile??!1,pingPongBuffers:r.pingPongBuffers,pingPongIndex:r.pingPongIndex??0,externalLayerMap:r.externalLayerMap,bpm:r.bpm}}let D=60;function J(r){r.bpm=function(e){return(function(t){D=t})(e),e}}function k(r){const e=new Map;for(const[,t]of r.externalLayerRefs)e.set(t.layerId,t.layer);for(const[,t]of r.nestedSources){const a=k(t);for(const[n,s]of a)e.set(n,s)}if(r.charSource){const t=k(r.charSource);for(const[a,n]of t)e.set(a,n)}if(r.colorSource){const t=k(r.colorSource);for(const[a,n]of t)e.set(a,n)}if(r.cellColorSource){const t=k(r.cellColorSource);for(const[a,n]of t)e.set(a,n)}return e}function Z(r){const e=r.getPluginState(w);e&&(e.shader?.dispose&&e.shader.dispose(),e.pingPongBuffers&&(e.pingPongBuffers[0].dispose?.(),e.pingPongBuffers[1].dispose?.()))}const ee={name:w,version:"1.0.0",install(r,e){J(r),(function(t){t.extendLayer("synth",function(a){const n=performance.now()/1e3,s=this.grid!==void 0&&this.drawFramebuffer!==void 0;let o=this.getPluginState(w);o?(o.source=a,o.startTime=n,o.needsCompile=!0,o.characterResolver.invalidate(),s&&(o.compiled=R(a))):o=O({source:a,compiled:s?R(a):void 0,startTime:n,needsCompile:!0}),this.setPluginState(w,o)})})(e),(function(t){t.extendLayer("bpm",function(a){let n=this.getPluginState(w);n?n.bpm=a:n=O({bpm:a}),this.setPluginState(w,n)})})(e),(function(t){t.extendLayer("clearSynth",function(){const a=this.getPluginState(w);a&&(a.shader?.dispose&&a.shader.dispose(),a.pingPongBuffers&&(a.pingPongBuffers[0].dispose?.(),a.pingPongBuffers[1].dispose?.()),this.setPluginState(w,void 0))})})(e),e.registerLayerPreRenderHook(t=>(async function(a,n){const s=a.getPluginState(w);if(!s)return;const o=a.grid,c=a.drawFramebuffer;if(!o||!c||(s.compiled||(s.compiled=R(s.source),s.externalLayerMap=k(s.source),s.needsCompile=!0),s.needsCompile&&s.compiled&&(s.shader?.dispose&&s.shader.dispose(),s.externalLayerMap=k(s.source),s.shader=await n.createFilterShader(s.compiled.fragmentSource),s.needsCompile=!1),!s.shader||!s.compiled))return;const l=s.compiled.usesFeedback,d=s.compiled.usesCharFeedback,m=s.compiled.usesCellColorFeedback,h=l||d||m;h&&!s.pingPongBuffers&&(s.pingPongBuffers=[n.createFramebuffer({width:o.cols,height:o.rows,attachments:3}),n.createFramebuffer({width:o.cols,height:o.rows,attachments:3})],s.pingPongIndex=0);const v={time:n.secs,frameCount:n.frameCount,width:o.width,height:o.height,cols:o.cols,rows:o.rows,bpm:s.bpm??D},x=p=>{n.setUniform("time",n.secs),n.setUniform("resolution",[v.cols,v.rows]);for(const[i,u]of s.compiled.dynamicUpdaters)n.setUniform(i,u(v));for(const[i,u]of s.compiled.uniforms)u.isDynamic||typeof u.value=="function"||n.setUniform(i,u.value);if(s.compiled.charMapping){const i=s.characterResolver.resolve(s.compiled.charMapping.chars,a.font);n.setUniform("u_charMap",i),n.setUniform("u_charMapSize",i.length)}p&&(l&&n.setUniform("prevCharColorBuffer",p.textures[1]),d&&n.setUniform("prevCharBuffer",p.textures[0]),m&&n.setUniform("prevCellColorBuffer",p.textures[2]));const y=s.compiled.externalLayers;if(y&&y.size>0&&s.externalLayerMap)for(const[i,u]of y){const _=s.externalLayerMap.get(i);if(!_){console.warn(`[textmode.synth.js] External layer not found: ${i}`);continue}const C=_.getPluginState(w);let f;C?.pingPongBuffers?f=C.pingPongBuffers[C.pingPongIndex].textures:_.drawFramebuffer&&(f=_.drawFramebuffer.textures),f&&(u.usesChar&&n.setUniform(`${u.uniformPrefix}_char`,f[0]),u.usesPrimary&&n.setUniform(`${u.uniformPrefix}_primary`,f[1]),u.usesCellColor&&n.setUniform(`${u.uniformPrefix}_cell`,f[2]))}};if(h&&s.pingPongBuffers){const p=s.pingPongBuffers[s.pingPongIndex],y=s.pingPongBuffers[1-s.pingPongIndex];y.begin(),n.clear(),n.shader(s.shader),x(p),n.rect(o.cols,o.rows),y.end(),c.begin(),n.clear(),n.shader(s.shader),x(p),n.rect(o.cols,o.rows),c.end(),s.pingPongIndex=1-s.pingPongIndex}else c.begin(),n.clear(),n.shader(s.shader),x(null),n.rect(o.cols,o.rows),c.end()})(t,r)),e.registerLayerDisposedHook(Z)},uninstall(r,e){const t=[e.layerManager.base,...e.layerManager.all];for(const a of t){const n=a.getPluginState(w);n&&(n.shader?.dispose&&n.shader.dispose(),n.pingPongBuffers&&(n.pingPongBuffers[0].dispose?.(),n.pingPongBuffers[1].dispose?.()))}delete r.bpm,e.removeLayerExtension("synth"),e.removeLayerExtension("bpm"),e.removeLayerExtension("clearSynth")}},te=M.gradient,re=M.noise,ne=M.osc,ae=M.shape,se=M.solid,oe=M.voronoi;g.SynthPlugin=ee,g.SynthSource=$,g.cellColor=r=>{const e=new $;return e._colorSource=r,e},g.char=(r,e)=>{const t=new $;return t._charSource=r,t._charCount=e,t},g.charColor=r=>{const e=new $;return e._colorSource=r,e},g.gradient=te,g.noise=re,g.osc=ne,g.paint=r=>{const e=new $;return e._colorSource=r,e._cellColorSource=r,e},g.shape=ae,g.solid=se,g.src=r=>{const e=M.src;if(!r)return e();const t=new $,a=r.id??`layer_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;return t.addExternalLayerRef({layerId:a,layer:r}),t},g.voronoi=oe,Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})});

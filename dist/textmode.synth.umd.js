(function(g,I){typeof exports=="object"&&typeof module<"u"?I(exports):typeof define=="function"&&define.amd?define(["exports"],I):I((g=typeof globalThis<"u"?globalThis:g||self).TextmodeSynth={})})(this,function(g){"use strict";const I={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]}},L=new class{_transforms=new Map;_processedCache=new Map;register(e){this._transforms.has(e.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${e.name}`),this._transforms.set(e.name,e),this._processedCache.delete(e.name)}registerMany(e){for(const t of e)this.register(t)}get(e){return this._transforms.get(e)}getProcessed(e){let t=this._processedCache.get(e);if(!t){const r=this._transforms.get(e);r&&(t=(function(a){const n=I[a.type],o=[...n.args,...a.inputs.map(s=>({type:s.type,name:s.name}))].map(s=>`${s.type} ${s.name}`).join(", "),c=`
${n.returnType} ${a.name}(${o}) {
${a.glsl}
}`;return{...a,glslFunction:c}})(r),this._processedCache.set(e,t))}return t}has(e){return this._transforms.has(e)}getByType(e){return Array.from(this._transforms.values()).filter(t=>t.type===e)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src")}remove(e){return this._processedCache.delete(e),this._transforms.delete(e)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},Y=new Set(["src"]),R=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(e){this._synthSourceClass=e}injectMethods(e){const t=L.getAll();for(const r of t)this._injectMethod(e,r)}_injectMethod(e,t){const{name:r,inputs:a,type:n}=t;e[r]=n==="combine"||n==="combineCoord"?function(o,...c){const s=a.map((l,u)=>c[u]??l.default);return this.addCombineTransform(r,o,s)}:function(...o){const c=a.map((s,l)=>o[l]??s.default);return this.addTransform(r,c)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const e={},t=L.getAll(),r=this._synthSourceClass;for(const a of t)if(Y.has(a.type)){const{name:n,inputs:o}=a;e[n]=(...c)=>{const s=new r,l=o.map((u,h)=>c[h]??u.default);return s.addTransform(n,l)}}return this._generatedFunctions=e,e}getGeneratedFunctions(){return this._generatedFunctions}addTransform(e,t){if(L.register(e),t&&this._injectMethod(t,e),Y.has(e.type)&&this._synthSourceClass){const r=this._synthSourceClass,{name:a,inputs:n}=e;this._generatedFunctions[a]=(...o)=>{const c=new r,s=n.map((l,u)=>o[u]??l.default);return c.addTransform(a,s)}}}},G=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
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
`,description:"Modulate coordinates based on hue differences"}];class P{_transforms;constructor(t){this._transforms=t}static empty(){return new P([])}static from(t){return new P([...t])}get transforms(){return this._transforms}push(t){this._transforms.push(t)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(t){return new P([...this._transforms,t])}get(t){return this._transforms[t]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class w{_chain;_charMapping;_nestedSources;_externalLayerRefs;_colorSource;_cellColorSource;_charSource;_charCount;constructor(t){this._chain=t?.chain??P.empty(),this._charMapping=t?.charMapping,this._colorSource=t?.colorSource,this._cellColorSource=t?.cellColorSource,this._charSource=t?.charSource,this._charCount=t?.charCount,this._nestedSources=t?.nestedSources??new Map,this._externalLayerRefs=t?.externalLayerRefs??new Map}addTransform(t,r){const a={name:t,userArgs:r};return this._chain.push(a),this}addCombineTransform(t,r,a){const n=this._chain.length;return this._nestedSources.set(n,r),this.addTransform(t,a)}addExternalLayerRef(t){const r=this._chain.length;return this._externalLayerRefs.set(r,t),this.addTransform("src",[])}charMap(t){const r=Array.from(t),a=[];for(const n of r)a.push(n.codePointAt(0)??32);return this._charMapping={chars:t,indices:a},this}charColor(t){return this._colorSource=t,this}char(t,r){return this._charSource=t,this._charCount=r,this}cellColor(t){return this._cellColorSource=t,this}paint(t){return this._colorSource=t,this._cellColorSource=t,this}clone(){const t=new Map;for(const[a,n]of this._nestedSources)t.set(a,n.clone());const r=new Map;for(const[a,n]of this._externalLayerRefs)r.set(a,{...n});return new w({chain:P.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),charSource:this._charSource?.clone(),charCount:this._charCount,nestedSources:t,externalLayerRefs:r})}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get charSource(){return this._charSource}get charCount(){return this._charCount}get nestedSources(){return this._nestedSources}get externalLayerRefs(){return this._externalLayerRefs}}const j={linear:e=>e,easeInQuad:e=>e*e,easeOutQuad:e=>e*(2-e),easeInOutQuad:e=>e<.5?2*e*e:(4-2*e)*e-1,easeInCubic:e=>e*e*e,easeOutCubic:e=>--e*e*e+1,easeInOutCubic:e=>e<.5?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1,easeInQuart:e=>e*e*e*e,easeOutQuart:e=>1- --e*e*e*e,easeInOutQuart:e=>e<.5?8*e*e*e*e:1-8*--e*e*e*e,easeInQuint:e=>e*e*e*e*e,easeOutQuint:e=>1+--e*e*e*e*e,easeInOutQuint:e=>e<.5?16*e*e*e*e*e:1+16*--e*e*e*e*e,sin:e=>(1+Math.sin(Math.PI*e-Math.PI/2))/2};function B(e,t){return(e%t+t)%t}"fast"in Array.prototype||(Array.prototype.fast=function(e=1){return this._speed=e,this},Array.prototype.smooth=function(e=1){return this._smooth=e,this},Array.prototype.ease=function(e="linear"){return typeof e=="function"?(this._smooth=1,this._ease=e):j[e]&&(this._smooth=1,this._ease=j[e]),this},Array.prototype.offset=function(e=.5){return this._offset=e%1,this},Array.prototype.fit=function(e=0,t=1){const r=Math.min(...this),a=Math.max(...this),n=this.map(o=>(function(c,s,l,u,h){return(c-s)*(h-u)/(l-s)+u})(o,r,a,e,t));return n._speed=this._speed,n._smooth=this._smooth,n._ease=this._ease,n._offset=this._offset,n}),L.registerMany(G),R.setSynthSourceClass(w),R.injectMethods(w.prototype);const k=R.generateStandaloneFunctions(),$="textmode.synth.js";class K{_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;trackUsage(t){switch(t){case"char":this._usesCharFeedback=!0;break;case"cellColor":this._usesCellColorFeedback=!0;break;default:this._usesFeedback=!0}}reset(){this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1}getUsage(){return{usesCharColorFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback}}get usesAnyFeedback(){return this._usesFeedback||this._usesCharFeedback||this._usesCellColorFeedback}get usesCharColorFeedback(){return this._usesFeedback}get usesCharFeedback(){return this._usesCharFeedback}get usesCellColorFeedback(){return this._usesCellColorFeedback}}class Q{_externalLayers=new Map;_counter=0;_layerIdToPrefix=new Map;getPrefix(t){let r=this._layerIdToPrefix.get(t);return r||(r="extLayer"+this._counter++,this._layerIdToPrefix.set(t,r)),r}trackUsage(t,r){const a=this.getPrefix(t.layerId);let n=this._externalLayers.get(t.layerId);switch(n||(n={layerId:t.layerId,uniformPrefix:a,usesChar:!1,usesCharColor:!1,usesCellColor:!1},this._externalLayers.set(t.layerId,n)),r){case"char":n.usesChar=!0;break;case"cellColor":n.usesCellColor=!0;break;default:n.usesCharColor=!0}}hasLayer(t){return this._externalLayers.has(t)}getLayerInfo(t){return this._externalLayers.get(t)}getExternalLayers(){return new Map(this._externalLayers)}get hasExternalLayers(){return this._externalLayers.size>0}get count(){return this._externalLayers.size}reset(){this._externalLayers.clear(),this._counter=0,this._layerIdToPrefix.clear()}}const H={char:"prevCharBuffer",charColor:"prevCharColorBuffer",cellColor:"prevCellColorBuffer",main:"prevCharColorBuffer"};class W{getContextAwareGlslFunction(t,r,a,n,o){return r!=="src"?t.glslFunction:n&&o?this._generateExternalSrcFunction(n,a,o):this._generateSelfFeedbackSrcFunction(a)}getFunctionName(t,r,a,n){return t.name!=="src"?t.name:a&&n?`src_ext_${n(a.layerId)}_${r}`:`src_${r}`}generateTransformCode(t,r,a,n,o,c,s,l,u,h,y,v,C){const _=this.getFunctionName(r,h,v,C),d=(...p)=>[...p,...u].join(", ");let i=o,f=c,m=s,b=l;switch(r.type){case"src":{const p=`c${a}`;t.push(`	vec4 ${p} = ${_}(${d(n)});`),i=p;break}case"coord":{const p=`st${a}`;t.push(`	vec2 ${p} = ${_}(${d(n)});`),t.push(`	${n} = ${p};`);break}case"color":{const p=`c${a}`;t.push(`	vec4 ${p} = ${_}(${d(o)});`),i=p;break}case"combine":{const p=`c${a}`;t.push(`	vec4 ${p} = ${_}(${d(o,y??"vec4(0.0)")});`),i=p;break}case"combineCoord":{const p=`st${a}`;t.push(`	vec2 ${p} = ${_}(${d(n,y??"vec4(0.0)")});`),t.push(`	${n} = ${p};`);break}}return{colorVar:i,charVar:f,flagsVar:m,rotationVar:b}}_generateExternalSrcFunction(t,r,a){const n=a(t.layerId);return`
vec4 ${`src_ext_${n}_${r}`}(vec2 _st) {
	return texture(${{char:`${n}_char`,charColor:`${n}_primary`,cellColor:`${n}_cell`,main:`${n}_primary`}[r]}, fract(_st));
}
`}_generateSelfFeedbackSrcFunction(t){return`
vec4 ${`src_${t}`}(vec2 _st) {
	return texture(${H[t]}, fract(_st));
}
`}}class J{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(t,r,a){if((function(n){return Array.isArray(n)&&n.length>0&&typeof n[0]=="number"})(t)){const n=`${a}_${r.name}`,o={name:n,type:r.type,value:r.default??0,isDynamic:!0},c=s=>(function(l,u){const h=l._speed??1,y=l._smooth??0;let v=u.time*h*(u.bpm/60)+(l._offset??0);if(y!==0){const C=l._ease??j.linear,_=v-y/2,d=l[Math.floor(B(_,l.length))],i=l[Math.floor(B(_+1,l.length))];return C(Math.min(B(_,1)/y,1))*(i-d)+d}return l[Math.floor(B(v,l.length))]})(t,s);return this._uniforms.set(n,o),this._dynamicUpdaters.set(n,c),{glslValue:n,uniform:o,updater:c}}if(typeof t=="function"){const n=`${a}_${r.name}`,o={name:n,type:r.type,value:r.default??0,isDynamic:!0};return this._uniforms.set(n,o),this._dynamicUpdaters.set(n,t),{glslValue:n,uniform:o,updater:t}}if(typeof t=="number")return{glslValue:x(t)};if(Array.isArray(t)&&typeof t[0]=="number"){const n=t;if(n.length===2)return{glslValue:`vec2(${x(n[0])}, ${x(n[1])})`};if(n.length===3)return{glslValue:`vec3(${x(n[0])}, ${x(n[1])}, ${x(n[2])})`};if(n.length===4)return{glslValue:`vec4(${x(n[0])}, ${x(n[1])}, ${x(n[2])}, ${x(n[3])})`}}return this.processDefault(r)}processDefault(t){const r=t.default;return typeof r=="number"?{glslValue:x(r)}:Array.isArray(r)?{glslValue:`vec${r.length}(${r.map(x).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function x(e){const t=e.toString();return t.includes(".")?t:t+".0"}function X(e){return new Z().compile(e)}class Z{_uniformManager=new J;_feedbackTracker=new K;_externalLayerManager=new Q;_codeGenerator=new W;_glslFunctions=new Set;_mainCode=[];_varCounter=0;_currentTarget="main";compile(t){this._reset();const r=this._compileChain(t,"main","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","main");let a=r.charVar;t.charSource&&(a=this._compileCharSource(t));let n=r.colorVar;t.colorSource&&(n=this._compileChain(t.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","charColor").colorVar);let o="vec4(0.0, 0.0, 0.0, 0.0)";t.cellColorSource&&(o=this._compileChain(t.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)","v_uv","cellColor").colorVar);const c=(function(u,h,y){return u?`
	// Character output from generator
	vec4 charOutput = ${h};`:`
	// Derive character from color luminance
	float lum = _luminance(${y}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`})(!!a,a??"vec4(0.0)",r.colorVar),s=this._feedbackTracker.getUsage();return{fragmentSource:(function(u){const{uniforms:h,glslFunctions:y,mainCode:v,charOutputCode:C,primaryColorVar:_,cellColorVar:d,charMapping:i,usesFeedback:f,usesCharFeedback:m,usesCellColorFeedback:b,externalLayers:p}=u,M=Array.from(h.values()).map(F=>`uniform ${F.type} ${F.name};`).join(`
`);let A="",z="";i&&(A=`uniform int u_charMap[${i.indices.length}];
uniform int u_charMapSize;`,z=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const S=[];f&&S.push("uniform sampler2D prevCharColorBuffer;"),m&&S.push("uniform sampler2D prevCharBuffer;"),b&&S.push("uniform sampler2D prevCellColorBuffer;");const V=S.join(`
`),U=[];if(p)for(const[,F]of p)F.usesChar&&U.push(`uniform sampler2D ${F.uniformPrefix}_char;`),F.usesCharColor&&U.push(`uniform sampler2D ${F.uniformPrefix}_primary;`),F.usesCellColor&&U.push(`uniform sampler2D ${F.uniformPrefix}_cell;`);return`#version 300 es
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
${V}
${U.length>0?`// External layer samplers
${U.join(`
`)}`:""}
${A}

// Dynamic uniforms
${M}


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
${Array.from(y).join(`
`)}

void main() {
	// Transform chain
${v.join(`
`)}

${C}
${z}

	// Output to MRT
	o_character = charOutput;
	o_primaryColor = ${_};
	o_secondaryColor = ${d};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:c,primaryColorVar:n,cellColorVar:o,charMapping:t.charMapping,usesFeedback:s.usesCharColorFeedback,usesCharFeedback:s.usesCharFeedback,usesCellColorFeedback:s.usesCellColorFeedback,externalLayers:this._externalLayerManager.getExternalLayers()}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:t.charMapping,usesCharColorFeedback:s.usesCharColorFeedback,usesCharFeedback:s.usesCharFeedback,usesCellColorFeedback:s.usesCellColorFeedback,externalLayers:this._externalLayerManager.getExternalLayers()}}_reset(){this._varCounter=0,this._uniformManager.clear(),this._feedbackTracker.reset(),this._externalLayerManager.reset(),this._glslFunctions.clear(),this._mainCode.length=0,this._currentTarget="main"}_compileCharSource(t){const r=this._compileChain(t.charSource,"charSrc","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","char"),a="charFromSource_"+this._varCounter++,n=t.charCount??256;return this._mainCode.push("	// Convert charSource color to character index"),this._mainCode.push(`	float charLum_${a} = _luminance(${r.colorVar}.rgb);`),this._mainCode.push(`	int charIdx_${a} = int(charLum_${a} * ${n.toFixed(1)});`),this._mainCode.push(`	vec4 ${a} = vec4(float(charIdx_${a} % 256) / 255.0, float(charIdx_${a} / 256) / 255.0, 0.0, 0.0);`),a}_compileChain(t,r,a,n="v_uv",o="main"){const c=this._currentTarget;this._currentTarget=o;const s=`${r}_st`;let l,u,h,y=`${r}_c`;this._mainCode.push(`	vec2 ${s} = ${n};`),this._mainCode.push(`	vec4 ${y} = ${a};`);const v=t.transforms,C=v.map(i=>this._getProcessedTransform(i.name)),_=this._identifyCoordTransforms(C),d=i=>{const f=v[i],m=C[i];if(!m)return void console.warn(`[SynthCompiler] Unknown transform: ${f.name}`);const b=t.externalLayerRefs.get(i);f.name==="src"&&this._trackSrcUsage(b);const p=this._codeGenerator.getContextAwareGlslFunction(m,f.name,this._currentTarget,b,V=>this._externalLayerManager.getPrefix(V));this._glslFunctions.add(p);const M=this._processArguments(f.userArgs,m.inputs,`${r}_${i}_${f.name}`),A=t.nestedSources.get(i);let z;A&&(m.type==="combine"||m.type==="combineCoord")&&(z=this._compileChain(A,`${r}_nested_${i}`,a,s,o).colorVar);const S=this._codeGenerator.generateTransformCode(this._mainCode,m,this._varCounter++,s,y,l,u,h,M,this._currentTarget,z,b,V=>this._externalLayerManager.getPrefix(V));y=S.colorVar,S.charVar&&(l=S.charVar),S.flagsVar&&(u=S.flagsVar),S.rotationVar&&(h=S.rotationVar)};for(let i=_.length-1;i>=0;i--)d(_[i]);for(let i=0;i<v.length;i++){const f=C[i];(!f||f.type!=="coord"&&f.type!=="combineCoord")&&d(i)}return this._currentTarget=c,{coordVar:s,colorVar:y,charVar:l,flagsVar:u,rotationVar:h}}_identifyCoordTransforms(t){const r=[];for(let a=0;a<t.length;a++){const n=t[a];n&&(n.type!=="coord"&&n.type!=="combineCoord"||r.push(a))}return r}_trackSrcUsage(t){t?this._externalLayerManager.trackUsage(t,this._currentTarget):this._feedbackTracker.trackUsage(this._currentTarget)}_getProcessedTransform(t){return L.getProcessed(t)}_processArguments(t,r,a){const n=[];for(let o=0;o<r.length;o++){const c=r[o],s=t[o]??c.default,l=this._uniformManager.processArgument(s,c,a);n.push(l.glslValue)}return n}}class ee{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(t,r){const a=r.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===a&&this._lastChars===t)return this._resolvedIndices;const n=Array.from(t),o=new Int32Array(n.length),c=r.characterMap,s=r.characters;for(let l=0;l<n.length;l++){const u=n[l],h=c.get(u);if(h!==void 0)o[l]=s.indexOf(h);else{const y=c.get(" ");o[l]=y!==void 0?s.indexOf(y):0}}return this._resolvedIndices=o,this._lastFontCharacterCount=a,this._lastChars=t,o}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}function E(e={}){return{source:e.source??new w,compiled:e.compiled,shader:e.shader,characterResolver:e.characterResolver??new ee,needsCompile:e.needsCompile??!1,pingPongBuffers:e.pingPongBuffers,pingPongIndex:e.pingPongIndex??0,externalLayerMap:e.externalLayerMap,bpm:e.bpm}}let D=60;function te(e){e.bpm=function(t){return(function(r){D=r})(t),t}}function T(e){const t=new Map;for(const[,r]of e.externalLayerRefs)t.set(r.layerId,r.layer);for(const[,r]of e.nestedSources){const a=T(r);for(const[n,o]of a)t.set(n,o)}if(e.charSource){const r=T(e.charSource);for(const[a,n]of r)t.set(a,n)}if(e.colorSource){const r=T(e.colorSource);for(const[a,n]of r)t.set(a,n)}if(e.cellColorSource){const r=T(e.cellColorSource);for(const[a,n]of r)t.set(a,n)}return t}let O=null;function q(e,t,r){const a=r??O;if(a)try{a(e,t)}catch{}}function ne(e,t,r={}){let a;try{a=e()}catch(n){throw q(n,t,r.onError),n}if(!(function(n){return n==null?!1:typeof n=="number"?Number.isFinite(n):Array.isArray(n)?n.length>0&&n.every(o=>typeof o=="number"&&Number.isFinite(o)):!1})(a)){const n=new Error(`[textmode.synth.js] Invalid dynamic parameter value for "${t}": ${N(a)}`);throw q(n,t,r.onError),n}return a}function N(e){if(e===void 0)return"undefined";if(e===null)return"null";if(typeof e=="number"){if(Number.isNaN(e))return"NaN";if(!Number.isFinite(e))return e>0?"Infinity":"-Infinity"}if(Array.isArray(e)){const t=e.findIndex(r=>typeof r!="number"||!Number.isFinite(r));if(t>=0)return`array with invalid element at index ${t}: ${N(e[t])}`}return String(e)}function re(e){const t=e.getPluginState($);t&&(t.shader?.dispose&&t.shader.dispose(),t.pingPongBuffers&&(t.pingPongBuffers[0].dispose?.(),t.pingPongBuffers[1].dispose?.()))}const ae={name:$,version:"1.0.0",install(e,t){te(e),(function(r){r.extendLayer("synth",function(a){const n=this.grid!==void 0&&this.drawFramebuffer!==void 0;let o=this.getPluginState($);o?(o.source=a,o.needsCompile=!0,o.characterResolver.invalidate(),n&&(o.compiled=X(a))):o=E({source:a,compiled:n?X(a):void 0,needsCompile:!0}),this.setPluginState($,o)})})(t),(function(r){r.extendLayer("bpm",function(a){let n=this.getPluginState($);n?n.bpm=a:n=E({bpm:a}),this.setPluginState($,n)})})(t),(function(r){r.extendLayer("clearSynth",function(){const a=this.getPluginState($);a&&(a.shader?.dispose&&a.shader.dispose(),a.pingPongBuffers&&(a.pingPongBuffers[0].dispose?.(),a.pingPongBuffers[1].dispose?.()),this.setPluginState($,void 0))})})(t),t.registerLayerPreRenderHook(r=>(async function(a,n){const o=a.getPluginState($);if(!o)return;const c=a.grid,s=a.drawFramebuffer;if(!c||!s||(o.compiled||(o.compiled=X(o.source),o.externalLayerMap=T(o.source),o.needsCompile=!0),o.needsCompile&&o.compiled&&(o.shader?.dispose&&o.shader.dispose(),o.externalLayerMap=T(o.source),o.shader=await n.createFilterShader(o.compiled.fragmentSource),o.needsCompile=!1),!o.shader||!o.compiled))return;const l=o.compiled.usesCharColorFeedback,u=o.compiled.usesCharFeedback,h=o.compiled.usesCellColorFeedback,y=l||u||h;y&&!o.pingPongBuffers&&(o.pingPongBuffers=[n.createFramebuffer({width:c.cols,height:c.rows,attachments:3}),n.createFramebuffer({width:c.cols,height:c.rows,attachments:3})],o.pingPongIndex=0);const v={time:n.secs,frameCount:n.frameCount,width:c.width,height:c.height,cols:c.cols,rows:c.rows,bpm:o.bpm??D},C=new Map;for(const[d,i]of o.compiled.dynamicUpdaters){const f=ne(()=>i(v),d,{onError:o.onDynamicError});C.set(d,f)}const _=d=>{n.setUniform("time",n.secs),n.setUniform("resolution",[v.cols,v.rows]);for(const[f,m]of C)n.setUniform(f,m);for(const[f,m]of o.compiled.uniforms)m.isDynamic||typeof m.value=="function"||n.setUniform(f,m.value);if(o.compiled.charMapping){const f=o.characterResolver.resolve(o.compiled.charMapping.chars,a.font);n.setUniform("u_charMap",f),n.setUniform("u_charMapSize",f.length)}d&&(l&&n.setUniform("prevCharColorBuffer",d.textures[1]),u&&n.setUniform("prevCharBuffer",d.textures[0]),h&&n.setUniform("prevCellColorBuffer",d.textures[2]));const i=o.compiled.externalLayers;if(i&&i.size>0&&o.externalLayerMap)for(const[f,m]of i){const b=o.externalLayerMap.get(f);if(!b){console.warn(`[textmode.synth.js] External layer not found: ${f}`);continue}const p=b.getPluginState($);let M;p?.pingPongBuffers?M=p.pingPongBuffers[p.pingPongIndex].textures:b.drawFramebuffer&&(M=b.drawFramebuffer.textures),M&&(m.usesChar&&n.setUniform(`${m.uniformPrefix}_char`,M[0]),m.usesCharColor&&n.setUniform(`${m.uniformPrefix}_primary`,M[1]),m.usesCellColor&&n.setUniform(`${m.uniformPrefix}_cell`,M[2]))}};if(y&&o.pingPongBuffers){const d=o.pingPongBuffers[o.pingPongIndex],i=o.pingPongBuffers[1-o.pingPongIndex];i.begin(),n.clear(),n.shader(o.shader),_(d),n.rect(c.cols,c.rows),i.end(),s.begin(),n.clear(),n.shader(o.shader),_(d),n.rect(c.cols,c.rows),s.end(),o.pingPongIndex=1-o.pingPongIndex}else s.begin(),n.clear(),n.shader(o.shader),_(null),n.rect(c.cols,c.rows),s.end()})(r,e)),t.registerLayerDisposedHook(re)},uninstall(e,t){const r=[t.layerManager.base,...t.layerManager.all];for(const a of r){const n=a.getPluginState($);n&&(n.shader?.dispose&&n.shader.dispose(),n.pingPongBuffers&&(n.pingPongBuffers[0].dispose?.(),n.pingPongBuffers[1].dispose?.()))}delete e.bpm,t.removeLayerExtension("synth"),t.removeLayerExtension("bpm"),t.removeLayerExtension("clearSynth")}};g.SynthPlugin=ae,g.SynthSource=w,g.cellColor=e=>{const t=new w;return t._colorSource=e,t},g.char=(e,t)=>{const r=new w;return r._charSource=e,r._charCount=t,r},g.charColor=e=>{const t=new w;return t._colorSource=e,t},g.gradient=function(e){return k.gradient(e)},g.noise=function(e,t){return k.noise(e,t)},g.osc=function(e,t,r){return k.osc(e,t,r)},g.paint=e=>{const t=new w;return t._colorSource=e,t._cellColorSource=e,t},g.setGlobalErrorCallback=function(e){O=e},g.shape=function(e,t,r){return k.shape(e,t,r)},g.solid=function(e,t,r,a){return k.solid(e,t,r,a)},g.src=e=>{const t=k.src;if(!e)return t();const r=new w,a=e.id??`layer_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;return r.addExternalLayerRef({layerId:a,layer:e}),r},g.voronoi=function(e,t,r){return k.voronoi(e,t,r)},Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})});

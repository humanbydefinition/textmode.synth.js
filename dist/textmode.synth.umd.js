(function(g,T){typeof exports=="object"&&typeof module<"u"?T(exports):typeof define=="function"&&define.amd?define(["exports"],T):T((g=typeof globalThis<"u"?globalThis:g||self).TextmodeSynth={})})(this,function(g){"use strict";const T={src:{returnType:"vec4",args:[{type:"vec2",name:"_st"}]},coord:{returnType:"vec2",args:[{type:"vec2",name:"_st"}]},color:{returnType:"vec4",args:[{type:"vec4",name:"_c0"}]},combine:{returnType:"vec4",args:[{type:"vec4",name:"_c0"},{type:"vec4",name:"_c1"}]},combineCoord:{returnType:"vec2",args:[{type:"vec2",name:"_st"},{type:"vec4",name:"_c0"}]}},I=new class{_transforms=new Map;_processedCache=new Map;register(t){this._transforms.has(t.name)&&console.warn(`[TransformRegistry] Overwriting existing transform: ${t.name}`),this._transforms.set(t.name,t),this._processedCache.delete(t.name)}registerMany(t){for(const e of t)this.register(e)}get(t){return this._transforms.get(t)}getProcessed(t){let e=this._processedCache.get(t);if(!e){const r=this._transforms.get(t);r&&(e=(function(a){const n=T[a.type],o=[...n.args,...a.inputs.map(s=>({type:s.type,name:s.name}))].map(s=>`${s.type} ${s.name}`).join(", "),c=`
${n.returnType} ${a.name}(${o}) {
${a.glsl}
}`;return{...a,glslFunction:c}})(r),this._processedCache.set(t,e))}return e}has(t){return this._transforms.has(t)}getByType(t){return Array.from(this._transforms.values()).filter(e=>e.type===t)}getNames(){return Array.from(this._transforms.keys())}getAll(){return Array.from(this._transforms.values())}getSourceTransforms(){return this.getByType("src")}remove(t){return this._processedCache.delete(t),this._transforms.delete(t)}clear(){this._transforms.clear(),this._processedCache.clear()}get size(){return this._transforms.size}},E=new Set(["src"]),R=new class{_generatedFunctions={};_synthSourceClass=null;setSynthSourceClass(t){this._synthSourceClass=t}injectMethods(t){const e=I.getAll();for(const r of e)this._injectMethod(t,r)}_injectMethod(t,e){const{name:r,inputs:a,type:n}=e;t[r]=n==="combine"||n==="combineCoord"?function(o,...c){const s=a.map((i,f)=>c[f]??i.default);return this.addCombineTransform(r,o,s)}:function(...o){const c=a.map((s,i)=>o[i]??s.default);return this.addTransform(r,c)}}generateStandaloneFunctions(){if(!this._synthSourceClass)throw new Error("[TransformFactory] SynthSource class not set. Call setSynthSourceClass first.");const t={},e=I.getAll(),r=this._synthSourceClass;for(const a of e)if(E.has(a.type)){const{name:n,inputs:o}=a;t[n]=(...c)=>{const s=new r,i=o.map((f,d)=>c[d]??f.default);return s.addTransform(n,i)}}return this._generatedFunctions=t,t}getGeneratedFunctions(){return this._generatedFunctions}addTransform(t,e){if(I.register(t),e&&this._injectMethod(e,t),E.has(t.type)&&this._synthSourceClass){const r=this._synthSourceClass,{name:a,inputs:n}=t;this._generatedFunctions[a]=(...o)=>{const c=new r,s=n.map((i,f)=>o[f]??i.default);return c.addTransform(a,s)}}}},Q=[{name:"osc",type:"src",inputs:[{name:"frequency",type:"float",default:60},{name:"sync",type:"float",default:.1},{name:"offset",type:"float",default:0}],glsl:`
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
`,description:"Modulate coordinates based on hue differences"}];class k{_transforms;constructor(e){this._transforms=e}static empty(){return new k([])}static from(e){return new k([...e])}get transforms(){return this._transforms}push(e){this._transforms.push(e)}get length(){return this._transforms.length}get isEmpty(){return this._transforms.length===0}append(e){return new k([...this._transforms,e])}get(e){return this._transforms[e]}[Symbol.iterator](){return this._transforms[Symbol.iterator]()}}class w{_chain;_charMapping;_nestedSources;_externalLayerRefs;_colorSource;_cellColorSource;_charSource;_charCount;constructor(e){this._chain=e?.chain??k.empty(),this._charMapping=e?.charMapping,this._colorSource=e?.colorSource,this._cellColorSource=e?.cellColorSource,this._charSource=e?.charSource,this._charCount=e?.charCount,this._nestedSources=e?.nestedSources??new Map,this._externalLayerRefs=e?.externalLayerRefs??new Map}addTransform(e,r){const a={name:e,userArgs:r};return this._chain.push(a),this}addCombineTransform(e,r,a){const n=this._chain.length;return this._nestedSources.set(n,r),this.addTransform(e,a)}addExternalLayerRef(e){const r=this._chain.length;return this._externalLayerRefs.set(r,e),this.addTransform("src",[])}charMap(e){const r=Array.from(e),a=[];for(const n of r)a.push(n.codePointAt(0)??32);return this._charMapping={chars:e,indices:a},this}charColor(e){return this._colorSource=e,this}char(e,r){return this._charSource=e,this._charCount=r,this}cellColor(e){return this._cellColorSource=e,this}paint(e){return this._colorSource=e,this._cellColorSource=e,this}clone(){const e=new Map;for(const[a,n]of this._nestedSources)e.set(a,n.clone());const r=new Map;for(const[a,n]of this._externalLayerRefs)r.set(a,{...n});return new w({chain:k.from(this._chain.transforms),charMapping:this._charMapping,colorSource:this._colorSource?.clone(),cellColorSource:this._cellColorSource?.clone(),charSource:this._charSource?.clone(),charCount:this._charCount,nestedSources:e,externalLayerRefs:r})}get transforms(){return this._chain.transforms}get charMapping(){return this._charMapping}get colorSource(){return this._colorSource}get cellColorSource(){return this._cellColorSource}get charSource(){return this._charSource}get charCount(){return this._charCount}get nestedSources(){return this._nestedSources}get externalLayerRefs(){return this._externalLayerRefs}}const j={linear:t=>t,easeInQuad:t=>t*t,easeOutQuad:t=>t*(2-t),easeInOutQuad:t=>t<.5?2*t*t:(4-2*t)*t-1,easeInCubic:t=>t*t*t,easeOutCubic:t=>--t*t*t+1,easeInOutCubic:t=>t<.5?4*t*t*t:(t-1)*(2*t-2)*(2*t-2)+1,easeInQuart:t=>t*t*t*t,easeOutQuart:t=>1- --t*t*t*t,easeInOutQuart:t=>t<.5?8*t*t*t*t:1-8*--t*t*t*t,easeInQuint:t=>t*t*t*t*t,easeOutQuint:t=>1+--t*t*t*t*t,easeInOutQuint:t=>t<.5?16*t*t*t*t*t:1+16*--t*t*t*t*t,sin:t=>(1+Math.sin(Math.PI*t-Math.PI/2))/2};function B(t,e){return(t%e+e)%e}"fast"in Array.prototype||(Array.prototype.fast=function(t=1){return this._speed=t,this},Array.prototype.smooth=function(t=1){return this._smooth=t,this},Array.prototype.ease=function(t="linear"){return typeof t=="function"?(this._smooth=1,this._ease=t):j[t]&&(this._smooth=1,this._ease=j[t]),this},Array.prototype.offset=function(t=.5){return this._offset=t%1,this},Array.prototype.fit=function(t=0,e=1){const r=Math.min(...this),a=Math.max(...this),n=this.map(o=>(function(c,s,i,f,d){return(c-s)*(d-f)/(i-s)+f})(o,r,a,t,e));return n._speed=this._speed,n._smooth=this._smooth,n._ease=this._ease,n._offset=this._offset,n}),I.registerMany(Q),R.setSynthSourceClass(w),R.injectMethods(w.prototype);const F=R.generateStandaloneFunctions(),$="textmode.synth.js";class H{_usesFeedback=!1;_usesCharFeedback=!1;_usesCellColorFeedback=!1;trackUsage(e){switch(e){case"char":this._usesCharFeedback=!0;break;case"cellColor":this._usesCellColorFeedback=!0;break;default:this._usesFeedback=!0}}reset(){this._usesFeedback=!1,this._usesCharFeedback=!1,this._usesCellColorFeedback=!1}getUsage(){return{usesCharColorFeedback:this._usesFeedback,usesCharFeedback:this._usesCharFeedback,usesCellColorFeedback:this._usesCellColorFeedback}}get usesAnyFeedback(){return this._usesFeedback||this._usesCharFeedback||this._usesCellColorFeedback}get usesCharColorFeedback(){return this._usesFeedback}get usesCharFeedback(){return this._usesCharFeedback}get usesCellColorFeedback(){return this._usesCellColorFeedback}}class W{_externalLayers=new Map;_counter=0;_layerIdToPrefix=new Map;getPrefix(e){let r=this._layerIdToPrefix.get(e);return r||(r="extLayer"+this._counter++,this._layerIdToPrefix.set(e,r)),r}trackUsage(e,r){const a=this.getPrefix(e.layerId);let n=this._externalLayers.get(e.layerId);switch(n||(n={layerId:e.layerId,uniformPrefix:a,usesChar:!1,usesCharColor:!1,usesCellColor:!1},this._externalLayers.set(e.layerId,n)),r){case"char":n.usesChar=!0;break;case"cellColor":n.usesCellColor=!0;break;default:n.usesCharColor=!0}}hasLayer(e){return this._externalLayers.has(e)}getLayerInfo(e){return this._externalLayers.get(e)}getExternalLayers(){return new Map(this._externalLayers)}get hasExternalLayers(){return this._externalLayers.size>0}get count(){return this._externalLayers.size}reset(){this._externalLayers.clear(),this._counter=0,this._layerIdToPrefix.clear()}}const J={char:"prevCharBuffer",charColor:"prevCharColorBuffer",cellColor:"prevCellColorBuffer",main:"prevCharColorBuffer"};class Z{getContextAwareGlslFunction(e,r,a,n,o){return r!=="src"?e.glslFunction:n&&o?this._generateExternalSrcFunction(n,a,o):this._generateSelfFeedbackSrcFunction(a)}getFunctionName(e,r,a,n){return e.name!=="src"?e.name:a&&n?`src_ext_${n(a.layerId)}_${r}`:`src_${r}`}generateTransformCode(e,r,a,n,o,c,s,i,f,d,h,v,x){const m=this.getFunctionName(r,d,v,x),y=(...u)=>[...u,...f].join(", ");let l=o,p=c,_=s,C=i;switch(r.type){case"src":{const u=`c${a}`;e.push(`	vec4 ${u} = ${m}(${y(n)});`),l=u;break}case"coord":{const u=`st${a}`;e.push(`	vec2 ${u} = ${m}(${y(n)});`),e.push(`	${n} = ${u};`);break}case"color":{const u=`c${a}`;e.push(`	vec4 ${u} = ${m}(${y(o)});`),l=u;break}case"combine":{const u=`c${a}`;e.push(`	vec4 ${u} = ${m}(${y(o,h??"vec4(0.0)")});`),l=u;break}case"combineCoord":{const u=`st${a}`;e.push(`	vec2 ${u} = ${m}(${y(n,h??"vec4(0.0)")});`),e.push(`	${n} = ${u};`);break}}return{colorVar:l,charVar:p,flagsVar:_,rotationVar:C}}_generateExternalSrcFunction(e,r,a){const n=a(e.layerId);return`
vec4 ${`src_ext_${n}_${r}`}(vec2 _st) {
	return texture(${{char:`${n}_char`,charColor:`${n}_primary`,cellColor:`${n}_cell`,main:`${n}_primary`}[r]}, fract(_st));
}
`}_generateSelfFeedbackSrcFunction(e){return`
vec4 ${`src_${e}`}(vec2 _st) {
	return texture(${J[e]}, fract(_st));
}
`}}class ee{_uniforms=new Map;_dynamicUpdaters=new Map;processArgument(e,r,a){if((function(n){return Array.isArray(n)&&n.length>0&&typeof n[0]=="number"})(e)){const n=`${a}_${r.name}`,o={name:n,type:r.type,value:r.default??0,isDynamic:!0},c=s=>(function(i,f){const d=i._speed??1,h=i._smooth??0;let v=f.time*d*(f.bpm/60)+(i._offset??0);if(h!==0){const x=i._ease??j.linear,m=v-h/2,y=i[Math.floor(B(m,i.length))],l=i[Math.floor(B(m+1,i.length))];return x(Math.min(B(m,1)/h,1))*(l-y)+y}return i[Math.floor(B(v,i.length))]})(e,s);return this._uniforms.set(n,o),this._dynamicUpdaters.set(n,c),{glslValue:n,uniform:o,updater:c}}if(typeof e=="function"){const n=`${a}_${r.name}`,o={name:n,type:r.type,value:r.default??0,isDynamic:!0};return this._uniforms.set(n,o),this._dynamicUpdaters.set(n,e),{glslValue:n,uniform:o,updater:e}}if(typeof e=="number")return{glslValue:b(e)};if(Array.isArray(e)&&typeof e[0]=="number"){const n=e;if(n.length===2)return{glslValue:`vec2(${b(n[0])}, ${b(n[1])})`};if(n.length===3)return{glslValue:`vec3(${b(n[0])}, ${b(n[1])}, ${b(n[2])})`};if(n.length===4)return{glslValue:`vec4(${b(n[0])}, ${b(n[1])}, ${b(n[2])}, ${b(n[3])})`}}return this.processDefault(r)}processDefault(e){const r=e.default;return typeof r=="number"?{glslValue:b(r)}:Array.isArray(r)?{glslValue:`vec${r.length}(${r.map(b).join(", ")})`}:{glslValue:"0.0"}}getUniforms(){return new Map(this._uniforms)}getDynamicUpdaters(){return new Map(this._dynamicUpdaters)}clear(){this._uniforms.clear(),this._dynamicUpdaters.clear()}}function b(t){const e=t.toString();return e.includes(".")?e:e+".0"}function X(t){return new te().compile(t)}class te{_uniformManager=new ee;_feedbackTracker=new H;_externalLayerManager=new W;_codeGenerator=new Z;_glslFunctions=new Set;_mainCode=[];_varCounter=0;_currentTarget="main";compile(e){this._reset();const r=this._compileChain(e,"main","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","main");let a=r.charVar;e.charSource&&(a=this._compileCharSource(e));let n=r.colorVar;e.colorSource&&(n=this._compileChain(e.colorSource,"charColor","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","charColor").colorVar);let o="vec4(0.0, 0.0, 0.0, 0.0)";e.cellColorSource&&(o=this._compileChain(e.cellColorSource,"cellColor","vec4(0.0, 0.0, 0.0, 0.0)","v_uv","cellColor").colorVar);const c=(function(f,d,h){return f?`
	// Character output from generator
	vec4 charOutput = ${d};`:`
	// Derive character from color luminance
	float lum = _luminance(${h}.rgb);
	int charIdx = int(lum * 255.0);
	vec4 charOutput = vec4(float(charIdx % 256) / 255.0, float(charIdx / 256) / 255.0, 0.0, 0.0);`})(!!a,a??"vec4(0.0)",r.colorVar),s=this._feedbackTracker.getUsage();return{fragmentSource:(function(f){const{uniforms:d,glslFunctions:h,mainCode:v,charOutputCode:x,primaryColorVar:m,cellColorVar:y,charMapping:l,usesFeedback:p,usesCharFeedback:_,usesCellColorFeedback:C,externalLayers:u}=f,Y=Array.from(d.values()).map(M=>`uniform ${M.type} ${M.name};`).join(`
`);let A="",z="";l&&(A=`uniform int u_charMap[${l.indices.length}];
uniform int u_charMapSize;`,z=`
	// Apply character mapping
	int rawCharIdx = int(charOutput.r * 255.0 + charOutput.g * 255.0 * 256.0);
	int mappedCharIdx = u_charMap[int(mod(float(rawCharIdx), float(u_charMapSize)))];
	charOutput.r = float(mappedCharIdx % 256) / 255.0;
	charOutput.g = float(mappedCharIdx / 256) / 255.0;`);const S=[];p&&S.push("uniform sampler2D prevCharColorBuffer;"),_&&S.push("uniform sampler2D prevCharBuffer;"),C&&S.push("uniform sampler2D prevCellColorBuffer;");const V=S.join(`
`),U=[];if(u)for(const[,M]of u)M.usesChar&&U.push(`uniform sampler2D ${M.uniformPrefix}_char;`),M.usesCharColor&&U.push(`uniform sampler2D ${M.uniformPrefix}_primary;`),M.usesCellColor&&U.push(`uniform sampler2D ${M.uniformPrefix}_cell;`);return`#version 300 es
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
${Y}


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
	o_primaryColor = ${m};
	o_secondaryColor = ${y};
}
`})({uniforms:this._uniformManager.getUniforms(),glslFunctions:this._glslFunctions,mainCode:this._mainCode,charOutputCode:c,primaryColorVar:n,cellColorVar:o,charMapping:e.charMapping,usesFeedback:s.usesCharColorFeedback,usesCharFeedback:s.usesCharFeedback,usesCellColorFeedback:s.usesCellColorFeedback,externalLayers:this._externalLayerManager.getExternalLayers()}),uniforms:this._uniformManager.getUniforms(),dynamicUpdaters:this._uniformManager.getDynamicUpdaters(),charMapping:e.charMapping,usesCharColorFeedback:s.usesCharColorFeedback,usesCharFeedback:s.usesCharFeedback,usesCellColorFeedback:s.usesCellColorFeedback,externalLayers:this._externalLayerManager.getExternalLayers()}}_reset(){this._varCounter=0,this._uniformManager.clear(),this._feedbackTracker.reset(),this._externalLayerManager.reset(),this._glslFunctions.clear(),this._mainCode.length=0,this._currentTarget="main"}_compileCharSource(e){const r=this._compileChain(e.charSource,"charSrc","vec4(1.0, 1.0, 1.0, 1.0)","v_uv","char"),a="charFromSource_"+this._varCounter++,n=e.charCount??256;return this._mainCode.push("	// Convert charSource color to character index"),this._mainCode.push(`	float charLum_${a} = _luminance(${r.colorVar}.rgb);`),this._mainCode.push(`	int charIdx_${a} = int(charLum_${a} * ${n.toFixed(1)});`),this._mainCode.push(`	vec4 ${a} = vec4(float(charIdx_${a} % 256) / 255.0, float(charIdx_${a} / 256) / 255.0, 0.0, 0.0);`),a}_compileChain(e,r,a,n="v_uv",o="main"){const c=this._currentTarget;this._currentTarget=o;const s=`${r}_st`;let i,f,d,h=`${r}_c`;this._mainCode.push(`	vec2 ${s} = ${n};`),this._mainCode.push(`	vec4 ${h} = ${a};`);const v=e.transforms,x=v.map(l=>this._getProcessedTransform(l.name)),m=this._identifyCoordTransforms(x),y=l=>{const p=v[l],_=x[l];if(!_)return void console.warn(`[SynthCompiler] Unknown transform: ${p.name}`);const C=e.externalLayerRefs.get(l);p.name==="src"&&this._trackSrcUsage(C);const u=this._codeGenerator.getContextAwareGlslFunction(_,p.name,this._currentTarget,C,V=>this._externalLayerManager.getPrefix(V));this._glslFunctions.add(u);const Y=this._processArguments(p.userArgs,_.inputs,`${r}_${l}_${p.name}`),A=e.nestedSources.get(l);let z;A&&(_.type==="combine"||_.type==="combineCoord")&&(z=this._compileChain(A,`${r}_nested_${l}`,a,s,o).colorVar);const S=this._codeGenerator.generateTransformCode(this._mainCode,_,this._varCounter++,s,h,i,f,d,Y,this._currentTarget,z,C,V=>this._externalLayerManager.getPrefix(V));h=S.colorVar,S.charVar&&(i=S.charVar),S.flagsVar&&(f=S.flagsVar),S.rotationVar&&(d=S.rotationVar)};for(let l=m.length-1;l>=0;l--)y(m[l]);for(let l=0;l<v.length;l++){const p=x[l];(!p||p.type!=="coord"&&p.type!=="combineCoord")&&y(l)}return this._currentTarget=c,{coordVar:s,colorVar:h,charVar:i,flagsVar:f,rotationVar:d}}_identifyCoordTransforms(e){const r=[];for(let a=0;a<e.length;a++){const n=e[a];n&&(n.type!=="coord"&&n.type!=="combineCoord"||r.push(a))}return r}_trackSrcUsage(e){e?this._externalLayerManager.trackUsage(e,this._currentTarget):this._feedbackTracker.trackUsage(this._currentTarget)}_getProcessedTransform(e){return I.getProcessed(e)}_processArguments(e,r,a){const n=[];for(let o=0;o<r.length;o++){const c=r[o],s=e[o]??c.default,i=this._uniformManager.processArgument(s,c,a);n.push(i.glslValue)}return n}}class ne{_resolvedIndices;_lastFontCharacterCount=0;_lastChars="";resolve(e,r){const a=r.characters.length;if(this._resolvedIndices&&this._lastFontCharacterCount===a&&this._lastChars===e)return this._resolvedIndices;const n=Array.from(e),o=new Int32Array(n.length),c=r.characterMap,s=r.characters;for(let i=0;i<n.length;i++){const f=n[i],d=c.get(f);if(d!==void 0)o[i]=s.indexOf(d);else{const h=c.get(" ");o[i]=h!==void 0?s.indexOf(h):0}}return this._resolvedIndices=o,this._lastFontCharacterCount=a,this._lastChars=e,o}invalidate(){this._resolvedIndices=void 0,this._lastFontCharacterCount=0,this._lastChars=""}}function D(t={}){return{source:t.source??new w,compiled:t.compiled,shader:t.shader,characterResolver:t.characterResolver??new ne,needsCompile:t.needsCompile??!1,pingPongBuffers:t.pingPongBuffers,pingPongIndex:t.pingPongIndex??0,externalLayerMap:t.externalLayerMap,bpm:t.bpm}}let O=60;function re(t){t.bpm=function(e){return(function(r){O=r})(e),e}}function P(t){const e=new Map;for(const[,r]of t.externalLayerRefs)e.set(r.layerId,r.layer);for(const[,r]of t.nestedSources){const a=P(r);for(const[n,o]of a)e.set(n,o)}if(t.charSource){const r=P(t.charSource);for(const[a,n]of r)e.set(a,n)}if(t.colorSource){const r=P(t.colorSource);for(const[a,n]of r)e.set(a,n)}if(t.cellColorSource){const r=P(t.cellColorSource);for(const[a,n]of r)e.set(a,n)}return e}let q=null;const L=new Map,N=new Map;function G(t,e,r){const a=r??q;if(a)try{a(t,e)}catch{}else{const n=Date.now();if(n-(N.get(e)??0)>=1e3){N.set(e,n);const o=t instanceof Error?t.message:String(t);console.warn(`[textmode.synth.js] Dynamic parameter error in "${e}": ${o}`)}}}function ae(t,e,r){L.has(e)||L.set(e,r.fallback);try{const a=t();return(function(n){return n==null?!1:typeof n=="number"?Number.isFinite(n):Array.isArray(n)?n.length>0&&n.every(o=>typeof o=="number"&&Number.isFinite(o)):!1})(a)?(L.set(e,a),a):(G(new Error(`Invalid dynamic parameter value: ${K(a)}`),e,r.onError),L.get(e))}catch(a){return G(a,e,r.onError),L.get(e)}}function K(t){if(t===void 0)return"undefined";if(t===null)return"null";if(typeof t=="number"){if(Number.isNaN(t))return"NaN";if(!Number.isFinite(t))return t>0?"Infinity":"-Infinity"}if(Array.isArray(t)){const e=t.findIndex(r=>typeof r!="number"||!Number.isFinite(r));if(e>=0)return`array with invalid element at index ${e}: ${K(t[e])}`}return String(t)}function oe(t){const e=t.getPluginState($);e&&(e.shader?.dispose&&e.shader.dispose(),e.pingPongBuffers&&(e.pingPongBuffers[0].dispose?.(),e.pingPongBuffers[1].dispose?.()))}const se={name:$,version:"1.0.0",install(t,e){re(t),(function(r){r.extendLayer("synth",function(a){const n=this.grid!==void 0&&this.drawFramebuffer!==void 0;let o=this.getPluginState($);o?(o.source=a,o.needsCompile=!0,o.characterResolver.invalidate(),n&&(o.compiled=X(a))):o=D({source:a,compiled:n?X(a):void 0,needsCompile:!0}),this.setPluginState($,o)})})(e),(function(r){r.extendLayer("bpm",function(a){let n=this.getPluginState($);n?n.bpm=a:n=D({bpm:a}),this.setPluginState($,n)})})(e),(function(r){r.extendLayer("clearSynth",function(){const a=this.getPluginState($);a&&(a.shader?.dispose&&a.shader.dispose(),a.pingPongBuffers&&(a.pingPongBuffers[0].dispose?.(),a.pingPongBuffers[1].dispose?.()),this.setPluginState($,void 0))})})(e),e.registerLayerPreRenderHook(r=>(async function(a,n){const o=a.getPluginState($);if(!o)return;const c=a.grid,s=a.drawFramebuffer;if(!c||!s||(o.compiled||(o.compiled=X(o.source),o.externalLayerMap=P(o.source),o.needsCompile=!0),o.needsCompile&&o.compiled&&(o.shader?.dispose&&o.shader.dispose(),o.externalLayerMap=P(o.source),o.shader=await n.createFilterShader(o.compiled.fragmentSource),o.needsCompile=!1),!o.shader||!o.compiled))return;const i=o.compiled.usesCharColorFeedback,f=o.compiled.usesCharFeedback,d=o.compiled.usesCellColorFeedback,h=i||f||d;h&&!o.pingPongBuffers&&(o.pingPongBuffers=[n.createFramebuffer({width:c.cols,height:c.rows,attachments:3}),n.createFramebuffer({width:c.cols,height:c.rows,attachments:3})],o.pingPongIndex=0);const v={time:n.secs,frameCount:n.frameCount,width:c.width,height:c.height,cols:c.cols,rows:c.rows,bpm:o.bpm??O},x=m=>{n.setUniform("time",n.secs),n.setUniform("resolution",[v.cols,v.rows]);for(const[l,p]of o.compiled.dynamicUpdaters){const _=o.compiled.uniforms.get(l),C=ae(()=>p(v),l,{fallback:_?.value??0,onError:o.onDynamicError});n.setUniform(l,C)}for(const[l,p]of o.compiled.uniforms)p.isDynamic||typeof p.value=="function"||n.setUniform(l,p.value);if(o.compiled.charMapping){const l=o.characterResolver.resolve(o.compiled.charMapping.chars,a.font);n.setUniform("u_charMap",l),n.setUniform("u_charMapSize",l.length)}m&&(i&&n.setUniform("prevCharColorBuffer",m.textures[1]),f&&n.setUniform("prevCharBuffer",m.textures[0]),d&&n.setUniform("prevCellColorBuffer",m.textures[2]));const y=o.compiled.externalLayers;if(y&&y.size>0&&o.externalLayerMap)for(const[l,p]of y){const _=o.externalLayerMap.get(l);if(!_){console.warn(`[textmode.synth.js] External layer not found: ${l}`);continue}const C=_.getPluginState($);let u;C?.pingPongBuffers?u=C.pingPongBuffers[C.pingPongIndex].textures:_.drawFramebuffer&&(u=_.drawFramebuffer.textures),u&&(p.usesChar&&n.setUniform(`${p.uniformPrefix}_char`,u[0]),p.usesCharColor&&n.setUniform(`${p.uniformPrefix}_primary`,u[1]),p.usesCellColor&&n.setUniform(`${p.uniformPrefix}_cell`,u[2]))}};if(h&&o.pingPongBuffers){const m=o.pingPongBuffers[o.pingPongIndex],y=o.pingPongBuffers[1-o.pingPongIndex];y.begin(),n.clear(),n.shader(o.shader),x(m),n.rect(c.cols,c.rows),y.end(),s.begin(),n.clear(),n.shader(o.shader),x(m),n.rect(c.cols,c.rows),s.end(),o.pingPongIndex=1-o.pingPongIndex}else s.begin(),n.clear(),n.shader(o.shader),x(null),n.rect(c.cols,c.rows),s.end()})(r,t)),e.registerLayerDisposedHook(oe)},uninstall(t,e){const r=[e.layerManager.base,...e.layerManager.all];for(const a of r){const n=a.getPluginState($);n&&(n.shader?.dispose&&n.shader.dispose(),n.pingPongBuffers&&(n.pingPongBuffers[0].dispose?.(),n.pingPongBuffers[1].dispose?.()))}delete t.bpm,e.removeLayerExtension("synth"),e.removeLayerExtension("bpm"),e.removeLayerExtension("clearSynth")}};g.SynthPlugin=se,g.SynthSource=w,g.cellColor=t=>{const e=new w;return e._colorSource=t,e},g.char=(t,e)=>{const r=new w;return r._charSource=t,r._charCount=e,r},g.charColor=t=>{const e=new w;return e._colorSource=t,e},g.gradient=function(t){return F.gradient(t)},g.noise=function(t,e){return F.noise(t,e)},g.osc=function(t,e,r){return F.osc(t,e,r)},g.paint=t=>{const e=new w;return e._colorSource=t,e._cellColorSource=t,e},g.setGlobalErrorCallback=function(t){q=t},g.shape=function(t,e,r){return F.shape(t,e,r)},g.solid=function(t,e,r,a){return F.solid(t,e,r,a)},g.src=t=>{const e=F.src;if(!t)return e();const r=new w,a=t.id??`layer_${Date.now()}_${Math.random().toString(36).slice(2,9)}`;return r.addExternalLayerRef({layerId:a,layer:t}),r},g.voronoi=function(t,e,r){return F.voronoi(t,e,r)},Object.defineProperty(g,Symbol.toStringTag,{value:"Module"})});

class At {
  $extractFramebufferData(t) {
    return { characterPixels: t.readPixels(0), primaryColorPixels: t.readPixels(1), secondaryColorPixels: t.readPixels(2) };
  }
  $getCharacterIndex(t, e) {
    return t[e] + (t[e + 1] << 8);
  }
}
class Q {
  $downloadFile(t, e) {
    try {
      const r = this._sanitizeFilename(e), a = URL.createObjectURL(t), i = document.createElement("a");
      i.href = a, i.download = r, i.style.display = "none", i.rel = "noopener", document.body.appendChild(i), i.click(), document.body.removeChild(i), URL.revokeObjectURL(a);
    } catch (r) {
      console.error("[textmode-export] Failed to download file:", r);
    }
  }
  _sanitizeFilename(t) {
    if (!t) return this._generateDefaultFilename();
    const e = t.trim();
    return e ? e.replace(/[<>:"/\\|?*]/g, "_").replace(/\s+/g, "_").replace(/_{2,}/g, "_").replace(/^_+|_+$/g, "").substring(0, 255) || this._generateDefaultFilename() : this._generateDefaultFilename();
  }
  _generateDefaultFilename() {
    return `textmode-export-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19).replace(/:/g, "-")}`;
  }
}
function ft(s, t) {
  return { r: s[t], g: s[t + 1], b: s[t + 2], a: s[t + 3] };
}
class Wt extends At {
  _extractTransformData(t, e) {
    const r = t[e + 2], a = !!(1 & r), i = !!(2 & r), n = !!(4 & r), c = t[e + 3] / 255;
    return { isInverted: a, flipHorizontal: i, flipVertical: n, rotation: Math.round(360 * c * 100) / 100 };
  }
  _calculateCellPosition(t, e, r) {
    return { x: t, y: e, cellX: t * r.cellWidth, cellY: e * r.cellHeight };
  }
  $extractSVGCellData(t, e) {
    const r = [];
    let a = 0;
    for (let i = 0; i < e.rows; i++) for (let n = 0; n < e.cols; n++) {
      const c = 4 * a, l = this.$getCharacterIndex(t.characterPixels, c);
      let p = ft(t.primaryColorPixels, c), o = ft(t.secondaryColorPixels, c);
      const d = this._extractTransformData(t.characterPixels, c);
      if (d.isInverted) {
        const m = p;
        p = o, o = m;
      }
      const u = this._calculateCellPosition(n, i, e);
      r.push({ charIndex: l, primaryColor: p, secondaryColor: o, transform: d, position: u }), a++;
    }
    return r;
  }
}
class qt {
  _createGlyphPath(t, e, r, a, i) {
    const n = i / t.head.unitsPerEm;
    return { getBoundingBox: () => ({ x1: r + e.xMin * n, y1: a + -e.yMax * n, x2: r + e.xMax * n, y2: a + -e.yMin * n }), toSVG: () => this._glyphToSVGPath(e, r, a, n) };
  }
  _glyphToSVGPath(t, e, r, a) {
    if (!t || !t.xs) return "";
    const { xs: i, ys: n, endPts: c, flags: l } = t;
    if (!(i && n && c && l)) return "";
    let p = "", o = 0;
    for (let d = 0; d < c.length; d++) {
      const u = c[d];
      if (!(u < o)) {
        if (u >= o) {
          const m = e + i[o] * a, x = r - n[o] * a;
          p += `M${m.toFixed(2)},${x.toFixed(2)}`;
          let h = o + 1;
          for (; h <= u; )
            if (1 & l[h]) {
              const f = e + i[h] * a, _ = r - n[h] * a;
              p += `L${f.toFixed(2)},${_.toFixed(2)}`, h++;
            } else {
              const f = e + i[h] * a, _ = r - n[h] * a;
              let v = h + 1 > u ? o : h + 1;
              if (1 & l[v]) {
                const g = e + i[v] * a, C = r - n[v] * a;
                p += `Q${f.toFixed(2)},${_.toFixed(2)} ${g.toFixed(2)},${C.toFixed(2)}`, h = v + 1;
              } else {
                const g = (f + (e + i[v] * a)) / 2, C = (_ + (r - n[v] * a)) / 2;
                p += `Q${f.toFixed(2)},${_.toFixed(2)} ${g.toFixed(2)},${C.toFixed(2)}`, h = v;
              }
            }
          p += "Z";
        }
        o = u + 1;
      }
    }
    return p;
  }
  _generateCharacterPath(t, e, r, a, i) {
    const n = e.characterMap.get(t).glyphData;
    return n ? this._createGlyphPath(e.font, n, r, a, i) : null;
  }
  $generatePositionedCharacterPath(t, e, r, a, i, n, c, l) {
    if (!l) return null;
    const p = c / e.font.head.unitsPerEm, o = r + (i - l.advanceWidth * p) / 2, d = a + (n + 0.7 * c) / 2, u = this._generateCharacterPath(t, e, o, d, c);
    return u && u.toSVG() || null;
  }
}
class Ht {
  _pathGenerator;
  constructor() {
    this._pathGenerator = new qt();
  }
  $generateSVGHeader(t) {
    const { width: e, height: r } = t;
    return `<?xml version="1.0" encoding="UTF-8"?><svg width="${e}" height="${r}" viewBox="0 0 ${e} ${r}" xmlns="http://www.w3.org/2000/svg"><title>textmode.js sketch</title>`;
  }
  $generateSVGFooter() {
    return "</g></svg>";
  }
  _generateTransformAttribute(t, e) {
    const { transform: r, position: a } = t;
    if (!r.flipHorizontal && !r.flipVertical && !r.rotation) return "";
    const i = a.cellX + e.cellWidth / 2, n = a.cellY + e.cellHeight / 2, c = [];
    if (r.flipHorizontal || r.flipVertical) {
      const l = r.flipHorizontal ? -1 : 1, p = r.flipVertical ? -1 : 1;
      c.push(`translate(${i} ${n})scale(${l} ${p})translate(${-i} ${-n})`);
    }
    return r.rotation && c.push(`rotate(${r.rotation} ${i} ${n})`), ` transform="${c.join(" ")}"`;
  }
  _generateCellBackground(t, e, r) {
    if (!r.includeBackgroundRectangles || t.secondaryColor.a === 0) return "";
    const { position: a } = t, { r: i, g: n, b: c, a: l } = t.secondaryColor, p = `rgba(${i},${n},${c},${l / 255})`;
    return r.drawMode === "stroke" ? `<rect x="${a.cellX}" y="${a.cellY}" width="${e.cellWidth}" height="${e.cellHeight}" stroke="${p}" fill="none" stroke-width="${r.strokeWidth}"/>` : `<rect x="${a.cellX}" y="${a.cellY}" width="${e.cellWidth}" height="${e.cellHeight}" fill="${p}"/>`;
  }
  _generateCharacterPath(t, e, r, a) {
    const i = r.characters[t.charIndex];
    if (!i) return "";
    const n = this._pathGenerator.$generatePositionedCharacterPath(i.character, r, t.position.cellX, t.position.cellY, e.cellWidth, e.cellHeight, r.fontSize, i.glyphData);
    if (!n) return "";
    const { r: c, g: l, b: p, a: o } = t.primaryColor, d = `rgba(${c},${l},${p},${o / 255})`;
    return a.drawMode === "stroke" ? `<path d="${n}" stroke="${d}" stroke-width="${a.strokeWidth}" fill="none"/>` : `<path d="${n}" fill="${d}"/>`;
  }
  $generateCellContent(t, e, r, a) {
    const i = [], n = this._generateCellBackground(t, e, a);
    n && i.push(n);
    const c = this._generateCharacterPath(t, e, r, a);
    if (c) {
      const l = this._generateTransformAttribute(t, e);
      i.push(l ? `<g${l}>${c}</g>` : c);
    }
    return i.join("");
  }
  $generateSVGContent(t, e, r, a) {
    const i = [this.$generateSVGHeader(e), '<g id="ascii-cells">'];
    for (const n of t) i.push(this.$generateCellContent(n, e, r, a));
    return i.push(this.$generateSVGFooter()), i.join("");
  }
  $optimizeSVGContent(t) {
    return t.replace(/<path[^>]*d=""[^>]*\/>/g, "").replace(/\s+/g, " ").replace(/> </g, "><");
  }
}
class gt {
  _applyDefaultOptions(t) {
    return { includeBackgroundRectangles: t.includeBackgroundRectangles ?? !0, drawMode: t.drawMode ?? "fill", strokeWidth: t.strokeWidth ?? 1, filename: t.filename };
  }
  $generateSVG(t, e = {}) {
    const r = new Wt(), a = new Ht(), i = r.$extractSVGCellData(r.$extractFramebufferData(t.layers.base.drawFramebuffer), t.grid), n = a.$generateSVGContent(i, t.grid, t.font, this._applyDefaultOptions(e));
    return a.$optimizeSVGContent(n);
  }
  $saveSVG(t, e = {}) {
    new Q().$downloadFile(new Blob([this.$generateSVG(t, e)], { type: "image/svg+xml;charset=utf-8" }), e.filename);
  }
}
const st = { png: "image/png", jpg: "image/jpeg", webp: "image/webp" }, lt = { png: ".png", jpg: ".jpg", webp: ".webp" };
class bt {
  _applyDefaultOptions(t) {
    return { format: t.format ?? "png", scale: Math.abs(t.scale ?? 1), filename: t.filename };
  }
  _validateOptions(t) {
    if (!(t.format in st)) throw new Error(`Saving '${t.format}' files is not supported`);
  }
  async $generateImageBlob(t, e) {
    const r = t, a = document.createElement("canvas"), i = a.getContext("2d"), n = Math.round(r.width * e.scale), c = Math.round(r.height * e.scale);
    return a.width = n, a.height = c, i.imageSmoothingEnabled = !1, i.clearRect(0, 0, n, c), i.drawImage(r, 0, 0, r.width, r.height, 0, 0, n, c), await new Promise((l, p) => {
      a.toBlob((o) => {
        o ? l(o) : p(new Error(`Failed to generate ${e.format.toUpperCase()} blob`));
      }, st[e.format]);
    });
  }
  async $saveImage(t, e = {}) {
    const r = this._applyDefaultOptions(e);
    this._validateOptions(r);
    const a = await this.$generateImageBlob(t, r);
    new Q().$downloadFile(a, r.filename);
  }
  async $copyImageToClipboard(t, e = {}) {
    if (typeof navigator > "u" || !navigator.clipboard || typeof navigator.clipboard.write != "function") throw new Error("Clipboard API is not available in this environment");
    const r = this._applyDefaultOptions(e);
    this._validateOptions(r);
    const a = await this.$generateImageBlob(t, r), i = new ClipboardItem({ [st[r.format]]: a });
    await navigator.clipboard.write([i]);
  }
}
class vt {
  _applyDefaultOptions(t) {
    return { preserveTrailingSpaces: t.preserveTrailingSpaces ?? !1, emptyCharacter: t.emptyCharacter ?? " ", filename: t.filename };
  }
  _createTXTContent(t, e) {
    const r = new At();
    console.log(t);
    let a = r.$extractFramebufferData(t.layers.base.drawFramebuffer);
    const i = [];
    let n = 0;
    for (let l = 0; l < t.grid.rows; l++) {
      const p = [];
      for (let o = 0; o < t.grid.cols; o++) {
        const d = 4 * n, u = r.$getCharacterIndex(a.characterPixels, d), m = t.font.characters[u]?.character || e.emptyCharacter;
        p.push(m), n++;
      }
      i.push(p);
    }
    const c = [];
    for (const l of i) {
      let p = l.join("");
      e.preserveTrailingSpaces || (p = p.replace(/\s+$/, "")), c.push(p);
    }
    return c.join(`
`);
  }
  $generateTXT(t, e = {}) {
    return this._createTXTContent(t, this._applyDefaultOptions(e));
  }
  $saveTXT(t, e = {}) {
    const r = this._applyDefaultOptions(e), a = this._createTXTContent(t, r), i = new Blob([a], { type: "text/plain;charset=utf-8" });
    new Q().$downloadFile(i, r.filename);
  }
}
class jt {
  _canvas;
  _ctx;
  async $record(t, e, r, a) {
    const i = Math.max(1, Math.round(e.frameRate)), n = Math.round(1e3 / i), c = Math.max(1, Math.round(e.frameCount));
    return await new Promise((l, p) => {
      const o = [];
      let d, u = 0, m = !1;
      const x = () => {
        d && (d(), d = void 0);
      }, h = (_) => {
        m || (m = !0, x(), l(_));
      }, f = () => {
        if (u >= c) h(o);
        else try {
          const _ = e.scale, v = Math.max(1, Math.round(t.width * _)), g = Math.max(1, Math.round(t.height * _));
          this._canvas || (this._canvas = document.createElement("canvas")), this._canvas.width === v && this._canvas.height === g || (this._canvas.width = v, this._canvas.height = g), this._ctx || (this._ctx = this._canvas.getContext("2d"));
          const C = this._ctx;
          C.imageSmoothingEnabled = !1, C.clearRect(0, 0, v, g), C.drawImage(t, 0, 0, t.width, t.height, 0, 0, v, g);
          const S = { imageData: C.getImageData(0, 0, v, g), width: v, height: g, delayMs: n };
          o.push(S), u += 1, a?.({ state: "recording", frameIndex: u, totalFrames: c }), u >= c && h(o);
        } catch (_) {
          ((v) => {
            if (m) return;
            m = !0, x();
            const g = v instanceof Error ? v.message : "GIF recording failed";
            a?.({ state: "error", message: g }), p(v instanceof Error ? v : new Error(String(v)));
          })(_);
        }
      };
      d = r(() => {
        f();
      }), a?.({ state: "recording", frameIndex: 0, totalFrames: c });
    });
  }
}
var Pt = Object.defineProperty, Qt = (s) => Pt(s, "__esModule", { value: !0 }), Xt = (s, t) => () => (t || s((t = { exports: {} }).exports, t), t.exports), Yt = (s, t) => {
  for (var e in t) Pt(s, e, { get: t[e], enumerable: !0 });
}, Jt = Xt((s) => {
  function t(d, u, m) {
    return 0.29889531 * d + 0.58662247 * u + 0.11448223 * m;
  }
  function e(d, u, m) {
    return 0.59597799 * d - 0.2741761 * u - 0.32180189 * m;
  }
  function r(d, u, m) {
    return 0.21147017 * d - 0.52261711 * u + 0.31114694 * m;
  }
  function a(d, u) {
    let m = d[0] - u[0], x = d[1] - u[1], h = d[2] - u[2], f = i(d) - i(u);
    return m * m * 0.5053 + x * x * 0.299 + h * h * 0.1957 + f * f;
  }
  function i(d) {
    return d[3] != null ? d[3] : 255;
  }
  function n(d, u) {
    return Math.sqrt(a(d, u));
  }
  function c(d, u) {
    let [m, x, h] = d, [f, _, v] = u, g = t(m, x, h) - t(f, _, v), C = e(m, x, h) - e(f, _, v), S = r(m, x, h) - r(f, _, v), E = i(d) - i(u);
    return g * g * 0.5053 + C * C * 0.299 + S * S * 0.1957 + E * E;
  }
  function l(d, u) {
    return Math.sqrt(c(d, u));
  }
  function p(d, u) {
    var m, x = 0;
    for (m = 0; m < d.length; m++) {
      let h = d[m] - u[m];
      x += h * h;
    }
    return x;
  }
  function o(d, u) {
    return Math.sqrt(p(d, u));
  }
  Qt(s), Yt(s, { colorDifferenceRGBToYIQ: () => l, colorDifferenceRGBToYIQSquared: () => c, colorDifferenceYIQ: () => n, colorDifferenceYIQSquared: () => a, euclideanDistance: () => o, euclideanDistanceSquared: () => p });
}), Kt = { trailer: 59 };
function Dt(s = 256) {
  let t = 0, e = new Uint8Array(s);
  return { get buffer() {
    return e.buffer;
  }, reset() {
    t = 0;
  }, bytesView: () => e.subarray(0, t), bytes: () => e.slice(0, t), writeByte(a) {
    r(t + 1), e[t] = a, t++;
  }, writeBytes(a, i = 0, n = a.length) {
    r(t + n);
    for (let c = 0; c < n; c++) e[t++] = a[c + i];
  }, writeBytesView(a, i = 0, n = a.byteLength) {
    r(t + n), e.set(a.subarray(i, i + n), t), t += n;
  } };
  function r(a) {
    var i = e.length;
    if (i >= a) return;
    a = Math.max(a, i * (i < 1048576 ? 2 : 1.125) >>> 0), i != 0 && (a = Math.max(a, 256));
    let n = e;
    e = new Uint8Array(a), t > 0 && e.set(n.subarray(0, t), 0);
  }
}
var Z = 12, xt = 5003, Zt = [0, 1, 3, 7, 15, 31, 63, 127, 255, 511, 1023, 2047, 4095, 8191, 16383, 32767, 65535];
function te(s, t, e, r, a, i, n, c) {
  a = a || Dt(512), i = i || new Uint8Array(256), n = n || new Int32Array(xt), c = c || new Int32Array(xt);
  let l = n.length, p = Math.max(2, r);
  i.fill(0), c.fill(0), L();
  let o = 0, d = 0, u = p + 1, m = u, x = !1, h = m, f = D(h), _ = 1 << u - 1, v = _ + 1, g = _ + 2, C = 0, S = e[0], E = 0;
  for (let k = l; k < 65536; k *= 2) ++E;
  E = 8 - E, a.writeByte(p), O(_);
  for (let k = 1; k < e.length; k++) V(e[k]);
  return O(S), O(v), a.writeByte(0), a.bytesView();
  function A(k) {
    i[C++] = k, C >= 254 && B();
  }
  function L() {
    n.fill(-1);
  }
  function V(k) {
    let R = (k << Z) + S, y = k << E ^ S;
    if (n[y] === R) S = c[y];
    else {
      if (n[y] >= 0) {
        let w = y === 0 ? 1 : l - y;
        do
          if (y -= w, y < 0 && (y += l), n[y] === R) return void (S = c[y]);
        while (n[y] >= 0);
      }
      O(S), S = k, g < 1 << Z ? (c[y] = g++, n[y] = R) : (L(), g = _ + 2, x = !0, O(_));
    }
  }
  function B() {
    C > 0 && (a.writeByte(C), a.writeBytesView(i, 0, C), C = 0);
  }
  function D(k) {
    return (1 << k) - 1;
  }
  function O(k) {
    for (o &= Zt[d], d > 0 ? o |= k << d : o = k, d += h; d >= 8; ) A(255 & o), o >>= 8, d -= 8;
    if ((g > f || x) && (x ? (h = m, f = D(h), x = !1) : (++h, f = h == Z ? 1 << Z : D(h))), k == v) {
      for (; d > 0; ) A(255 & o), o >>= 8, d -= 8;
      B();
    }
  }
}
var ee = te;
function Vt(s, t, e) {
  return s << 8 & 63488 | t << 2 & 992 | e >> 3 & 31;
}
function Tt(s, t, e, r) {
  return s >> 4 | 240 & t | (240 & e) << 4 | (240 & r) << 8;
}
function Ot(s, t, e) {
  return s >> 4 << 8 | t >> 4 << 4 | e >> 4;
}
function tt(s, t, e) {
  return s < t ? t : s > e ? e : s;
}
function at(s) {
  return s * s;
}
function yt(s, t, e) {
  for (var r = 0, a = 1e100, i = s[t], n = i.cnt, c = (i.ac, i.rc), l = i.gc, p = i.bc, o = i.fw; o != 0; o = s[o].fw) {
    var d = s[o].cnt, u = n * d / (n + d);
    if (!(u >= a)) {
      var m = 0;
      !((m += u * at(s[o].rc - c)) >= a) && !((m += u * at(s[o].gc - l)) >= a) && !((m += u * at(s[o].bc - p)) >= a) && (a = m, r = o);
    }
  }
  i.err = a, i.nn = r;
}
function dt() {
  return { ac: 0, rc: 0, gc: 0, bc: 0, cnt: 0, nn: 0, fw: 0, bk: 0, tm: 0, mtm: 0, err: 0 };
}
function re(s, t) {
  let e = new Array(t === "rgb444" ? 4096 : 65536), r = s.length;
  if (t === "rgba4444") for (let a = 0; a < r; ++a) {
    let i = s[a], n = i >> 24 & 255, c = i >> 16 & 255, l = i >> 8 & 255, p = 255 & i, o = Tt(p, l, c, n), d = o in e ? e[o] : e[o] = dt();
    d.rc += p, d.gc += l, d.bc += c, d.ac += n, d.cnt++;
  }
  else if (t === "rgb444") for (let a = 0; a < r; ++a) {
    let i = s[a], n = i >> 16 & 255, c = i >> 8 & 255, l = 255 & i, p = Ot(l, c, n), o = p in e ? e[p] : e[p] = dt();
    o.rc += l, o.gc += c, o.bc += n, o.cnt++;
  }
  else for (let a = 0; a < r; ++a) {
    let i = s[a], n = i >> 16 & 255, c = i >> 8 & 255, l = 255 & i, p = Vt(l, c, n), o = p in e ? e[p] : e[p] = dt();
    o.rc += l, o.gc += c, o.bc += n, o.cnt++;
  }
  return e;
}
function ae(s, t, e) {
  let { format: r = "rgb565", clearAlpha: a = !0, clearAlphaColor: i = 0, clearAlphaThreshold: n = 0, oneBitAlpha: c = !1 } = e || {}, l = e.useSqrt !== !1, p = r === "rgba4444", o = re(s, r), d = o.length, u = d - 1, m = new Uint32Array(d + 1);
  for (var x = 0, h = 0; h < o.length; ++h) {
    let k = o[h];
    if (k != null) {
      var f = 1 / k.cnt;
      p && (k.ac *= f), k.rc *= f, k.gc *= f, k.bc *= f, o[x++] = k;
    }
  }
  for (at(t) / x < 0.022 && (l = !1), h = 0; h < x - 1; ++h) o[h].fw = h + 1, o[h + 1].bk = h, l && (o[h].cnt = Math.sqrt(o[h].cnt));
  var _, v, g;
  for (l && (o[h].cnt = Math.sqrt(o[h].cnt)), h = 0; h < x; ++h) {
    yt(o, h);
    var C = o[h].err;
    for (v = ++m[0]; v > 1 && !(o[_ = m[g = v >> 1]].err <= C); v = g) m[v] = _;
    m[v] = h;
  }
  var S = x - t;
  for (h = 0; h < S; ) {
    for (var E; ; ) {
      var A = m[1];
      if ((E = o[A]).tm >= E.mtm && o[E.nn].mtm <= E.tm) break;
      for (E.mtm == u ? A = m[1] = m[m[0]--] : (yt(o, A), E.tm = h), C = o[A].err, v = 1; (g = v + v) <= m[0] && (g < m[0] && o[m[g]].err > o[m[g + 1]].err && g++, !(C <= o[_ = m[g]].err)); v = g) m[v] = _;
      m[v] = A;
    }
    var L = o[E.nn], V = E.cnt, B = L.cnt;
    f = 1 / (V + B), p && (E.ac = f * (V * E.ac + B * L.ac)), E.rc = f * (V * E.rc + B * L.rc), E.gc = f * (V * E.gc + B * L.gc), E.bc = f * (V * E.bc + B * L.bc), E.cnt += L.cnt, E.mtm = ++h, o[L.bk].fw = L.fw, o[L.fw].bk = L.bk, L.mtm = u;
  }
  let D = [];
  var O = 0;
  for (h = 0; ; ++O) {
    let k = tt(Math.round(o[h].rc), 0, 255), R = tt(Math.round(o[h].gc), 0, 255), y = tt(Math.round(o[h].bc), 0, 255), w = 255;
    p && (w = tt(Math.round(o[h].ac), 0, 255), c && (w = w <= (typeof c == "number" ? c : 127) ? 0 : 255), a && w <= n && (k = R = y = i, w = 0));
    let F = p ? [k, R, y, w] : [k, R, y];
    if (ie(D, F) || D.push(F), (h = o[h].fw) == 0) break;
  }
  return D;
}
function ie(s, t) {
  for (let e = 0; e < s.length; e++) {
    let r = s[e], a = r[0] === t[0] && r[1] === t[1] && r[2] === t[2], i = !(r.length >= 4 && t.length >= 4) || r[3] === t[3];
    if (a && i) return !0;
  }
  return !1;
}
function oe(s, t, e) {
  let r = (e = e || "rgb565") === "rgb444" ? 4096 : 65536, a = new Uint8Array(s.length), i = new Array(r);
  if (e === "rgba4444") for (let n = 0; n < s.length; n++) {
    let c, l = s[n], p = l >> 24 & 255, o = l >> 16 & 255, d = l >> 8 & 255, u = 255 & l, m = Tt(u, d, o, p);
    i[m] != null ? c = i[m] : (c = ne(u, d, o, p, t), i[m] = c), a[n] = c;
  }
  else for (let n = 0; n < s.length; n++) {
    let c, l = s[n], p = l >> 16 & 255, o = l >> 8 & 255, d = 255 & l, u = e === "rgb444" ? Ot(d, o, p) : Vt(d, o, p);
    i[u] != null ? c = i[u] : (c = se(d, o, p, t), i[u] = c), a[n] = c;
  }
  return a;
}
function ne(s, t, e, r, a) {
  let i = 0, n = 1e100;
  for (let c = 0; c < a.length; c++) {
    let l = a[c], p = l[0], o = l[1], d = l[2], u = W(l[3] - r);
    u > n || (u += W(p - s), !(u > n) && (u += W(o - t), !(u > n) && (u += W(d - e), !(u > n) && (n = u, i = c))));
  }
  return i;
}
function se(s, t, e, r) {
  let a = 0, i = 1e100;
  for (let n = 0; n < r.length; n++) {
    let c = r[n], l = c[0], p = c[1], o = c[2], d = W(l - s);
    d > i || (d += W(p - t), !(d > i) && (d += W(o - e), !(d > i) && (i = d, a = n)));
  }
  return a;
}
function W(s) {
  return s * s;
}
function le(s = {}) {
  let { initialCapacity: t = 4096, auto: e = !0 } = s, r = Dt(t), a = new Uint8Array(256), i = new Int32Array(5003), n = new Int32Array(5003), c = !1;
  return { reset() {
    r.reset(), c = !1;
  }, finish() {
    r.writeByte(Kt.trailer);
  }, bytes: () => r.bytes(), bytesView: () => r.bytesView(), get buffer() {
    return r.buffer;
  }, get stream() {
    return r;
  }, writeHeader: l, writeFrame(p, o, d, u = {}) {
    let { transparent: m = !1, transparentIndex: x = 0, delay: h = 0, palette: f = null, repeat: _ = 0, colorDepth: v = 8, dispose: g = -1 } = u, C = !1;
    if (e ? c || (C = !0, l(), c = !0) : C = !!u.first, o = Math.max(0, Math.floor(o)), d = Math.max(0, Math.floor(d)), C) {
      if (!f) throw new Error("First frame must include a { palette } option");
      ce(r, o, d, f, v), _t(r, f), _ >= 0 && ue(r, _);
    }
    let S = Math.round(h / 10);
    de(r, g, S, m, x);
    let E = !!f && !C;
    pe(r, o, d, E ? f : null), E && _t(r, f), he(r, p, o, d, v, a, i, n);
  } };
  function l() {
    Rt(r, "GIF89a");
  }
}
function de(s, t, e, r, a) {
  var i, n;
  s.writeByte(33), s.writeByte(249), s.writeByte(4), a < 0 && (a = 0, r = !1), r ? (i = 1, n = 2) : (i = 0, n = 0), t >= 0 && (n = 7 & t), n <<= 2, s.writeByte(0 | n | i), N(s, e), s.writeByte(a || 0), s.writeByte(0);
}
function ce(s, t, e, r, a = 8) {
  let i = 128 | a - 1 << 4 | ht(r.length) - 1;
  N(s, t), N(s, e), s.writeBytes([i, 0, 0]);
}
function ue(s, t) {
  s.writeByte(33), s.writeByte(255), s.writeByte(11), Rt(s, "NETSCAPE2.0"), s.writeByte(3), s.writeByte(1), N(s, t), s.writeByte(0);
}
function _t(s, t) {
  let e = 1 << ht(t.length);
  for (let r = 0; r < e; r++) {
    let a = [0, 0, 0];
    r < t.length && (a = t[r]), s.writeByte(a[0]), s.writeByte(a[1]), s.writeByte(a[2]);
  }
}
function pe(s, t, e, r) {
  if (s.writeByte(44), N(s, 0), N(s, 0), N(s, t), N(s, e), r) {
    let a = 0, i = 0, n = ht(r.length) - 1;
    s.writeByte(128 | a | i | n);
  } else s.writeByte(0);
}
function he(s, t, e, r, a = 8, i, n, c) {
  ee(e, r, t, a, s, i, n, c);
}
function N(s, t) {
  s.writeByte(255 & t), s.writeByte(t >> 8 & 255);
}
function Rt(s, t) {
  for (var e = 0; e < t.length; e++) s.writeByte(t.charCodeAt(e));
}
function ht(s) {
  return Math.max(Math.ceil(Math.log2(s)), 1);
}
Jt();
class me {
  _recorder;
  _textmodifier;
  _registerPostDrawHook;
  constructor(t, e) {
    this._recorder = new jt(), this._textmodifier = t, this._registerPostDrawHook = e;
  }
  async $saveGIF(t = {}) {
    const e = this._textmodifier.canvas, r = this._applyDefaultOptions(t), a = t.onProgress;
    try {
      const i = await this._recorder.$record(e, r, this._registerPostDrawHook, a), n = le(), { repeat: c } = t;
      i.forEach((o, d) => {
        const { width: u, height: m, imageData: x, delayMs: h } = o, f = new Uint32Array(x.data.buffer.slice(0)), _ = ae(f, 256, {}), v = oe(f, _);
        n.writeFrame(v, u, m, { palette: _, delay: h, repeat: d === 0 ? c : -1 });
      }), n.finish();
      const l = n.bytes(), p = l.buffer.slice(l.byteOffset, l.byteOffset + l.byteLength);
      new Q().$downloadFile(new Blob([p], { type: "image/gif" }), r.filename), a?.({ state: "completed", totalFrames: r.frameCount });
    } catch (i) {
      throw a?.({ state: "error", message: i instanceof Error ? i.message : "GIF export failed" }), i;
    }
  }
  _applyDefaultOptions(t) {
    const e = Math.abs(Math.round(t.frameCount ?? 300)), r = Math.abs(t.frameRate ?? 60), a = Math.abs(t.scale ?? 1), i = Math.max(-1, Math.round(t.repeat ?? 0));
    return { filename: t.filename, frameCount: e, frameRate: r, scale: a, repeat: i };
  }
}
function fe(s) {
  return s && s.__esModule && Object.prototype.hasOwnProperty.call(s, "default") ? s.default : s;
}
var wt, Ct = { exports: {} };
function ge() {
  return wt || (wt = 1, s = Ct, (function() {
    function t(l, p) {
      return (function(o) {
        if (typeof o != "string" || !o.match(/^data:image\/webp;base64,/i)) throw new Error("Failed to decode WebP Base64 URL");
        return window.atob(o.substring(23));
      })(typeof l == "string" && /^data:image\/webp/.test(l) ? l : l.toDataURL("image/webp", p));
    }
    function e(l) {
      return (l.charCodeAt(0) | l.charCodeAt(1) << 8 | l.charCodeAt(2) << 16 | l.charCodeAt(3) << 24) >>> 0;
    }
    function r(l) {
      let p = l.indexOf("VP8", 12);
      if (p === -1) throw new Error("Bad image format, does this browser support WebP?");
      let o = !1;
      for (; p < l.length - 8; ) {
        let d, u;
        switch (u = l.substring(p, p + 4), p += 4, d = e(l.substring(p, p + 4)), p += 4, u) {
          case "VP8 ":
            return { frame: l.substring(p, p + d), hasAlpha: o };
          case "ALPH":
            o = !0;
        }
        p += d, 1 & d && p++;
      }
      throw new Error("Failed to find VP8 keyframe in WebP image, is this image mistakenly encoded in the Lossless WebP format?");
    }
    function a(l) {
      this.value = l;
    }
    function i(l) {
      this.value = l;
    }
    function n(l, p, o) {
      if (Array.isArray(o)) for (let d = 0; d < o.length; d++) n(l, p, o[d]);
      else if (typeof o == "string") l.writeString(o);
      else if (o instanceof Uint8Array) l.writeBytes(o);
      else {
        if (!o.id) throw new Error("Bad EBML datatype " + typeof o.data);
        if (o.offset = l.pos + p, l.writeUnsignedIntBE(o.id), Array.isArray(o.data)) {
          let d, u, m;
          o.size === -1 ? l.writeByte(255) : o.size === -2 ? (d = l.pos, l.writeBytes([15, 255, 255, 255, 255])) : (d = l.pos, l.writeBytes([0, 0, 0, 0])), u = l.pos, o.dataOffset = u + p, n(l, p, o.data), o.size !== -1 && o.size !== -2 && (m = l.pos, o.size = m - u, l.seek(d), l.writeEBMLVarIntWidth(o.size, 4), l.seek(m));
        } else if (typeof o.data == "string") l.writeEBMLVarInt(o.data.length), o.dataOffset = l.pos + p, l.writeString(o.data);
        else if (typeof o.data == "number") o.size || (o.size = l.measureUnsignedInt(o.data)), l.writeEBMLVarInt(o.size), o.dataOffset = l.pos + p, l.writeUnsignedIntBE(o.data, o.size);
        else if (o.data instanceof i) l.writeEBMLVarInt(8), o.dataOffset = l.pos + p, l.writeDoubleBE(o.data.value);
        else if (o.data instanceof a) l.writeEBMLVarInt(4), o.dataOffset = l.pos + p, l.writeFloatBE(o.data.value);
        else {
          if (!(o.data instanceof Uint8Array)) throw new Error("Bad EBML datatype " + typeof o.data);
          l.writeEBMLVarInt(o.data.byteLength), o.dataOffset = l.pos + p, l.writeBytes(o.data);
        }
      }
    }
    let c = function(l, p) {
      return function(o) {
        let d, u, m = !1, x = 0, h = 0, f = null, _ = null, v = null, g = [], C = 0, S = 0, E = { quality: 0.95, transparent: !1, alphaQuality: void 0, fileWriter: null, fd: null, frameDuration: null, frameRate: null }, A = { Cues: { id: new Uint8Array([28, 83, 187, 107]), positionEBML: null }, SegmentInfo: { id: new Uint8Array([21, 73, 169, 102]), positionEBML: null }, Tracks: { id: new Uint8Array([22, 84, 174, 107]), positionEBML: null } }, L = { id: 17545, data: new i(0) }, V = [], B = new p(o.fileWriter || o.fd);
        function D(y) {
          return y - d.dataOffset;
        }
        function O() {
          u = (function() {
            let M = { id: 21420, size: 5, data: 0 }, U = { id: 290298740, data: [] };
            for (let I in A) {
              let q = A[I];
              q.positionEBML = Object.create(M), U.data.push({ id: 19899, data: [{ id: 21419, data: q.id }, q.positionEBML] });
            }
            return U;
          })();
          let y = { id: 357149030, data: [{ id: 2807729, data: 1e6 }, { id: 19840, data: "webm-writer-js" }, { id: 22337, data: "webm-writer-js" }, L] }, w = [{ id: 176, data: x }, { id: 186, data: h }];
          o.transparent && w.push({ id: 21440, data: 1 });
          let F = { id: 374648427, data: [{ id: 174, data: [{ id: 215, data: 1 }, { id: 29637, data: 1 }, { id: 156, data: 0 }, { id: 2274716, data: "und" }, { id: 134, data: "V_VP8" }, { id: 2459272, data: "VP8" }, { id: 131, data: 1 }, { id: 224, data: w }] }] };
          d = { id: 408125543, size: -2, data: [u, y, F] };
          let $ = new l(256);
          n($, B.pos, [{ id: 440786851, data: [{ id: 17030, data: 1 }, { id: 17143, data: 1 }, { id: 17138, data: 4 }, { id: 17139, data: 8 }, { id: 17026, data: "webm" }, { id: 17031, data: 2 }, { id: 17029, data: 2 }] }, d]), B.write($.getAsDataArray()), A.SegmentInfo.positionEBML.data = D(y.offset), A.Tracks.positionEBML.data = D(F.offset), m = !0;
        }
        function k(y) {
          return y.alpha ? (function(w) {
            let F, $, M = new l(4);
            if (!(w.trackNumber > 0 && w.trackNumber < 127)) throw new Error("TrackNumber must be > 0 and < 127");
            return M.writeEBMLVarInt(w.trackNumber), M.writeU16BE(w.timecode), M.writeByte(0), F = { id: 161, data: [M.getAsDataArray(), w.frame] }, $ = { id: 30113, data: [{ id: 166, data: [{ id: 238, data: 1 }, { id: 165, data: w.alpha }] }] }, { id: 160, data: [F, $] };
          })(y) : (function(w) {
            let F = new l(4);
            if (!(w.trackNumber > 0 && w.trackNumber < 127)) throw new Error("TrackNumber must be > 0 and < 127");
            return F.writeEBMLVarInt(w.trackNumber), F.writeU16BE(w.timecode), F.writeByte(128), { id: 163, data: [F.getAsDataArray(), w.frame] };
          })(y);
        }
        function R() {
          if (g.length === 0) return;
          let y = 0;
          for (let I = 0; I < g.length; I++) y += g[I].frame.length + (g[I].alpha ? g[I].alpha.length : 0);
          let w = new l(y + 64 * g.length), F = (function(I) {
            return { id: 524531317, data: [{ id: 231, data: Math.round(I.timecode) }] };
          })({ timecode: Math.round(C) });
          for (let I = 0; I < g.length; I++) F.data.push(k(g[I]));
          var $, M, U;
          n(w, B.pos, F), B.write(w.getAsDataArray()), $ = 1, M = Math.round(C), U = F.offset, V.push({ id: 187, data: [{ id: 179, data: M }, { id: 183, data: [{ id: 247, data: $ }, { id: 241, data: D(U) }] }] }), g = [], C += S, S = 0;
        }
        this.addFrame = function(y, w, F) {
          m || (x = y.width || 0, h = y.height || 0, O());
          let $, M = r(t(y, o.quality)), U = null;
          $ = F || (typeof w == "number" ? w : o.frameDuration), o.transparent && (w instanceof HTMLCanvasElement || typeof w == "string" ? U = w : M.hasAlpha && (U = (function(I) {
            f !== null && f.width === I.width && f.height === I.height || (f = document.createElement("canvas"), f.width = I.width, f.height = I.height, _ = f.getContext("2d"), v = _.createImageData(f.width, f.height));
            let q = I.getContext("2d").getImageData(0, 0, I.width, I.height).data, J = v.data, K = 0, zt = I.width * I.height * 4;
            for (let ot = 3; ot < zt; ot += 4) {
              let nt = q[ot];
              J[K++] = nt, J[K++] = nt, J[K++] = nt, J[K++] = 255;
            }
            return _.putImageData(v, 0, 0), f;
          })(y))), (function(I) {
            I.trackNumber = 1, I.timecode = Math.round(S), g.push(I), S += I.duration, S >= 5e3 && R();
          })({ frame: M.frame, duration: $, alpha: U ? r(t(U, o.alphaQuality)).frame : null });
        }, this.complete = function() {
          return m || O(), R(), (function() {
            let y = { id: 475249515, data: V }, w = new l(16 + 32 * V.length);
            n(w, B.pos, y), B.write(w.getAsDataArray()), A.Cues.positionEBML.data = D(y.offset);
          })(), (function() {
            let y = new l(u.size), w = B.pos;
            n(y, u.dataOffset, u.data), B.seek(u.dataOffset), B.write(y.getAsDataArray()), B.seek(w);
          })(), (function() {
            let y = new l(8), w = B.pos;
            y.writeDoubleBE(C), B.seek(L.dataOffset), B.write(y.getAsDataArray()), B.seek(w);
          })(), (function() {
            let y = new l(10), w = B.pos;
            y.writeUnsignedIntBE(d.id), y.writeEBMLVarIntWidth(B.pos - d.dataOffset, 5), B.seek(d.offset), B.write(y.getAsDataArray()), B.seek(w);
          })(), B.complete("video/webm");
        }, this.getWrittenSize = function() {
          return B.length;
        }, o = (function(y, w) {
          let F = {};
          return [y, w].forEach(function($) {
            for (let M in $) Object.prototype.hasOwnProperty.call($, M) && (F[M] = $[M]);
          }), F;
        })(E, o || {}), (function() {
          if (!o.frameDuration) {
            if (!o.frameRate) throw new Error("Missing required frameDuration or frameRate setting");
            o.frameDuration = 1e3 / o.frameRate;
          }
          o.quality = Math.max(Math.min(o.quality, 0.99999), 0), o.alphaQuality === void 0 ? o.alphaQuality = o.quality : o.alphaQuality = Math.max(Math.min(o.alphaQuality, 0.99999), 0);
        })();
      };
    };
    s.exports = c;
  })()), Ct.exports;
  var s;
}
var Et, kt = { exports: {} };
function be() {
  return Et || (Et = 1, s = kt, (function() {
    let t = function(e) {
      this.data = new Uint8Array(e), this.pos = 0;
    };
    t.prototype.seek = function(e) {
      this.pos = e;
    }, t.prototype.writeBytes = function(e) {
      for (let r = 0; r < e.length; r++) this.data[this.pos++] = e[r];
    }, t.prototype.writeByte = function(e) {
      this.data[this.pos++] = e;
    }, t.prototype.writeU8 = t.prototype.writeByte, t.prototype.writeU16BE = function(e) {
      this.data[this.pos++] = e >> 8, this.data[this.pos++] = e;
    }, t.prototype.writeDoubleBE = function(e) {
      let r = new Uint8Array(new Float64Array([e]).buffer);
      for (let a = r.length - 1; a >= 0; a--) this.writeByte(r[a]);
    }, t.prototype.writeFloatBE = function(e) {
      let r = new Uint8Array(new Float32Array([e]).buffer);
      for (let a = r.length - 1; a >= 0; a--) this.writeByte(r[a]);
    }, t.prototype.writeString = function(e) {
      for (let r = 0; r < e.length; r++) this.data[this.pos++] = e.charCodeAt(r);
    }, t.prototype.writeEBMLVarIntWidth = function(e, r) {
      switch (r) {
        case 1:
          this.writeU8(128 | e);
          break;
        case 2:
          this.writeU8(64 | e >> 8), this.writeU8(e);
          break;
        case 3:
          this.writeU8(32 | e >> 16), this.writeU8(e >> 8), this.writeU8(e);
          break;
        case 4:
          this.writeU8(16 | e >> 24), this.writeU8(e >> 16), this.writeU8(e >> 8), this.writeU8(e);
          break;
        case 5:
          this.writeU8(8 | e / 4294967296 & 7), this.writeU8(e >> 24), this.writeU8(e >> 16), this.writeU8(e >> 8), this.writeU8(e);
          break;
        default:
          throw new Error("Bad EBML VINT size " + r);
      }
    }, t.prototype.measureEBMLVarInt = function(e) {
      if (e < 127) return 1;
      if (e < 16383) return 2;
      if (e < 2097151) return 3;
      if (e < 268435455) return 4;
      if (e < 34359738367) return 5;
      throw new Error("EBML VINT size not supported " + e);
    }, t.prototype.writeEBMLVarInt = function(e) {
      this.writeEBMLVarIntWidth(e, this.measureEBMLVarInt(e));
    }, t.prototype.writeUnsignedIntBE = function(e, r) {
      switch (r === void 0 && (r = this.measureUnsignedInt(e)), r) {
        case 5:
          this.writeU8(Math.floor(e / 4294967296));
        case 4:
          this.writeU8(e >> 24);
        case 3:
          this.writeU8(e >> 16);
        case 2:
          this.writeU8(e >> 8);
        case 1:
          this.writeU8(e);
          break;
        default:
          throw new Error("Bad UINT size " + r);
      }
    }, t.prototype.measureUnsignedInt = function(e) {
      return e < 256 ? 1 : e < 65536 ? 2 : e < 1 << 24 ? 3 : e < 4294967296 ? 4 : 5;
    }, t.prototype.getAsDataArray = function() {
      if (this.pos < this.data.byteLength) return this.data.subarray(0, this.pos);
      if (this.pos == this.data.byteLength) return this.data;
      throw new Error("ArrayBufferDataStream's pos lies beyond end of buffer");
    }, s.exports = t;
  })()), kt.exports;
  var s;
}
var Bt, It, St, Ft = { exports: {} };
function ve() {
  return Bt || (Bt = 1, s = Ft, (function() {
    let t = function(e) {
      return function(r) {
        let a = [], i = Promise.resolve(), n = null, c = null;
        function l(d) {
          return new Promise(function(u, m) {
            let x = new FileReader();
            x.addEventListener("loadend", function() {
              u(x.result);
            }), x.readAsArrayBuffer(d);
          });
        }
        function p(d) {
          return new Promise(function(u, m) {
            d instanceof Uint8Array ? u(d) : d instanceof ArrayBuffer || ArrayBuffer.isView(d) ? u(new Uint8Array(d)) : d instanceof Blob ? u(l(d).then(function(x) {
              return new Uint8Array(x);
            })) : u(l(new Blob([d])).then(function(x) {
              return new Uint8Array(x);
            }));
          });
        }
        function o(d) {
          let u = d.byteLength || d.length || d.size;
          if (!Number.isInteger(u)) throw new Error("Failed to determine size of element");
          return u;
        }
        r && r.constructor.name === "FileWriter" ? n = r : e && r && (c = r), this.pos = 0, this.length = 0, this.seek = function(d) {
          if (d < 0) throw new Error("Offset may not be negative");
          if (isNaN(d)) throw new Error("Offset may not be NaN");
          if (d > this.length) throw new Error("Seeking beyond the end of file is not allowed");
          this.pos = d;
        }, this.write = function(d) {
          let u = { offset: this.pos, data: d, length: o(d) }, m = u.offset >= this.length;
          this.pos += u.length, this.length = Math.max(this.length, this.pos), i = i.then(function() {
            if (c) return new Promise(function(x, h) {
              p(u.data).then(function(f) {
                let _ = 0, v = Buffer.from(f.buffer), g = function(C, S, E) {
                  _ += S, _ >= E.length ? x() : e.write(c, E, _, E.length - _, u.offset + _, g);
                };
                e.write(c, v, 0, v.length, u.offset, g);
              });
            });
            if (n) return new Promise(function(x, h) {
              n.onwriteend = x, n.seek(u.offset), n.write(new Blob([u.data]));
            });
            if (!m) for (let x = 0; x < a.length; x++) {
              let h = a[x];
              if (!(u.offset + u.length <= h.offset || u.offset >= h.offset + h.length)) {
                if (u.offset < h.offset || u.offset + u.length > h.offset + h.length) throw new Error("Overwrite crosses blob boundaries");
                return u.offset == h.offset && u.length == h.length ? void (h.data = u.data) : p(h.data).then(function(f) {
                  return h.data = f, p(u.data);
                }).then(function(f) {
                  u.data = f, h.data.set(u.data, u.offset - h.offset);
                });
              }
            }
            a.push(u);
          });
        }, this.complete = function(d) {
          return i = c || n ? i.then(function() {
            return null;
          }) : i.then(function() {
            let u = [];
            for (let m = 0; m < a.length; m++) u.push(a[m].data);
            return new Blob(u, { type: d });
          }), i;
        };
      };
    };
    s.exports = t;
  })()), Ft.exports;
  var s;
}
function xe() {
  return St ? It : (St = 1, It = ge()(be(), ve()(null)));
}
var ye = xe();
const _e = fe(ye);
class we {
  async $record(t, e, r, a) {
    const i = Math.max(1, Math.round(e.frameRate)), n = Math.max(1, Math.round(e.frameCount)), c = new _e({ quality: e.quality, alphaQuality: e.transparent ? e.quality : void 0, transparent: e.transparent, frameRate: i }), l = this._createSnapshotSurface();
    return await new Promise((p, o) => {
      let d, u = "capturing", m = !1, x = 0;
      const h = () => {
        d && (d(), d = void 0);
      }, f = () => {
        a?.({ state: "recording", frameIndex: x, totalFrames: n });
      }, _ = (g) => {
        if (m) return;
        m = !0, h();
        const C = g instanceof Error ? g.message : "WEBM export failed";
        a?.({ state: "error", message: C }), o(g instanceof Error ? g : new Error(String(g)));
      }, v = () => {
        u !== "capturing" || m || (u = "encoding", h(), c.complete().then((g) => {
          ((C) => {
            m || (m = !0, a?.({ state: "completed", frameIndex: Math.min(n, x), totalFrames: n }), p(C));
          })(g);
        }).catch(_));
      };
      d = r(() => {
        (() => {
          if (u === "capturing") if (x >= n) v();
          else try {
            const g = l(t);
            c.addFrame(g), x += 1, f(), x >= n && v();
          } catch (g) {
            _(g);
          }
        })();
      }), f();
    });
  }
  _createSnapshotSurface() {
    let t = null, e = null;
    return (r) => {
      const a = Math.max(1, r.width), i = Math.max(1, r.height), n = ((c, l) => (t || (t = document.createElement("canvas")), t.width !== c || t.height !== l ? (t.width = c, t.height = l, e = t.getContext("2d"), e && (e.imageSmoothingEnabled = !1)) : e || (e = t.getContext("2d"), e && (e.imageSmoothingEnabled = !1)), e ? t : null))(a, i);
      return n && e ? (e.clearRect(0, 0, a, i), e.drawImage(r, 0, 0, a, i), n) : r;
    };
  }
}
class Ce {
  _recorder;
  _textmodifier;
  _registerPostDrawHook;
  constructor(t, e) {
    this._recorder = new we(), this._textmodifier = t, this._registerPostDrawHook = e;
  }
  async $saveWEBM(t = {}) {
    const e = this._textmodifier.canvas, r = this._applyDefaultOptions(t);
    try {
      const a = await this._recorder.$record(e, r, this._registerPostDrawHook, t.onProgress);
      new Q().$downloadFile(a, r.filename);
    } catch (a) {
      throw t.onProgress?.({ state: "error", message: a instanceof Error ? a.message : "WEBM export failed" }), a;
    }
  }
  _applyDefaultOptions(t) {
    return { filename: t.filename, frameRate: Math.abs(Math.round(t.frameRate ?? 60)), frameCount: Math.abs(Math.round(t.frameCount ?? 300)), quality: Math.abs(Math.min(Math.max(t.quality ?? 1, 0), 1)), transparent: !!t.transparent, debugLogging: !!t.debugLogging };
  }
}
const b = { root: "textmode-export-overlay", stack: "textmode-export-overlay__stack", stackDense: "textmode-export-overlay__stack--dense", stackCompact: "textmode-export-overlay__stack--compact", section: "textmode-export-overlay__section", header: "textmode-export-overlay__header", headerTitleRow: "textmode-export-overlay__header-title-row", headerLinks: "textmode-export-overlay__header-links", row: "textmode-export-overlay__row", label: "textmode-export-overlay__label", field: "textmode-export-overlay__field", fieldCompact: "textmode-export-overlay__field--compact", fieldDense: "textmode-export-overlay__field--dense", fieldFull: "textmode-export-overlay__field--full", fieldChannel: "textmode-export-overlay__field--channel", input: "textmode-export-overlay__input", checkbox: "textmode-export-overlay__checkbox", muted: "textmode-export-overlay__muted", status: "textmode-export-overlay__status", statusGif: "textmode-export-overlay__status--gif", statusVideo: "textmode-export-overlay__status--video", statusTitle: "textmode-export-overlay__status-title", statusValue: "textmode-export-overlay__status-value", divider: "textmode-export-overlay__divider", title: "textmode-export-overlay__title", button: "textmode-export-overlay__button", buttonPrimary: "textmode-export-overlay__button--primary", buttonSecondary: "textmode-export-overlay__button--secondary", buttonFull: "textmode-export-overlay__button--full", supportLink: "textmode-export-overlay__support-link", supportIcon: "textmode-export-overlay__support-icon", linkIcon: "textmode-export-overlay__link-icon" };
class T {
  element;
  mounted = !1;
  destroyed = !1;
  mount(t) {
    if (this.destroyed) throw new Error("Cannot mount a destroyed component");
    if (this.mounted) return;
    const e = this.render();
    t.appendChild(e), this.element = e, this.onMount(), this.mounted = !0;
  }
  unmount() {
    this.mounted && this.element && (this._onUnmount(), this.element.remove(), this.element = void 0, this.mounted = !1);
  }
  destroy() {
    this.destroyed || (this.unmount(), this._onDestroy(), this.destroyed = !0);
  }
  update(t) {
    this.mounted && this.onUpdate(t);
  }
  onMount() {
  }
  _onUnmount() {
  }
  _onDestroy() {
  }
  onUpdate(t) {
  }
  get root() {
    if (!this.element) throw new Error("Component is not mounted yet");
    return this.element;
  }
  isMounted() {
    return this.mounted;
  }
}
class H extends T {
  static _iconNamespace = "http://www.w3.org/2000/svg";
  render() {
    const t = document.createElement("div");
    t.classList.add(b.stack, b.stackDense, b.header);
    const e = document.createElement("div");
    e.classList.add(b.headerTitleRow);
    const r = document.createElement("strong");
    r.textContent = "textmode.export.js", r.classList.add(b.title);
    const a = document.createElement("div");
    a.classList.add(b.headerLinks);
    const i = this._createLink("https://github.com/humanbydefinition/textmode.export.js", "View repository on GitHub", b.linkIcon, [{ d: "M0 0h24v24H0z", fill: "none", stroke: "none" }, { d: "M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" }]), n = this._createLink("https://code.textmode.art/support.html", "Support textmode.export.js", b.supportIcon, [{ d: "M0 0h24v24H0z", fill: "none", stroke: "none" }, { d: "M3 14c.83 .642 2.077 1.017 3.5 1c1.423 .017 2.67 -.358 3.5 -1c.83 -.642 2.077 -1.017 3.5 -1c1.423 -.017 2.67 .358 3.5 1" }, { d: "M8 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" }, { d: "M12 3a2.4 2.4 0 0 0 -1 2a2.4 2.4 0 0 0 1 2" }, { d: "M3 10h14v5a6 6 0 0 1 -6 6h-2a6 6 0 0 1 -6 -6v-5z" }, { d: "M16.746 16.726a3 3 0 1 0 .252 -5.555" }]);
    a.appendChild(i), a.appendChild(n), e.appendChild(r), e.appendChild(a);
    const c = document.createElement("div");
    return c.classList.add(b.divider), t.appendChild(e), t.appendChild(c), t;
  }
  _createLink(t, e, r, a) {
    const i = document.createElement("a");
    return i.href = t, i.target = "_blank", i.rel = "noopener noreferrer", i.classList.add(b.supportLink), i.setAttribute("aria-label", e), i.appendChild(this._createIcon(r, a)), i;
  }
  _createIcon(t, e) {
    const r = document.createElementNS(H._iconNamespace, "svg");
    r.setAttribute("xmlns", H._iconNamespace), r.setAttribute("width", "18"), r.setAttribute("height", "18"), r.setAttribute("viewBox", "0 0 24 24"), r.setAttribute("fill", "none"), r.setAttribute("stroke", "currentColor"), r.setAttribute("stroke-width", "2"), r.setAttribute("stroke-linecap", "round"), r.setAttribute("stroke-linejoin", "round"), r.classList.add(t);
    for (const a of e) {
      const i = document.createElementNS(H._iconNamespace, "path");
      for (const [n, c] of Object.entries(a)) i.setAttribute(n, c);
      r.appendChild(i);
    }
    return r;
  }
}
class P extends T {
  props;
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    const t = document.createElement("div");
    t.classList.add(b.field), this.applyVariant(t, this.props.variant);
    const e = document.createElement("label");
    if (e.classList.add(b.label), e.textContent = this.props.label, this.props.labelFor && (e.htmlFor = this.props.labelFor), t.appendChild(e), this.props.description) {
      const r = document.createElement("span");
      r.classList.add(b.muted), r.textContent = this.props.description, t.appendChild(r);
    }
    return t;
  }
  attachControl(t) {
    this.root.appendChild(t);
  }
  update(t) {
    this.props = t, super.update(t);
  }
  onUpdate(t) {
    const e = this.root;
    for (; e.firstChild; ) e.removeChild(e.firstChild);
    this.props = t, e.classList.add(b.field), this.applyVariant(e, t.variant);
    const r = document.createElement("label");
    if (r.classList.add(b.label), r.textContent = t.label, t.labelFor && (r.htmlFor = t.labelFor), e.appendChild(r), t.description) {
      const a = document.createElement("span");
      a.classList.add(b.muted), a.textContent = t.description, e.appendChild(a);
    }
  }
  applyVariant(t, e) {
    switch (t.classList.remove(b.fieldCompact, b.fieldDense, b.fieldFull, b.fieldChannel), e) {
      case "compact":
        t.classList.add(b.fieldCompact);
        break;
      case "dense":
        t.classList.add(b.fieldDense);
        break;
      case "full":
        t.classList.add(b.fieldFull);
        break;
      case "channel":
        t.classList.add(b.fieldChannel);
    }
  }
}
class mt extends T {
  props;
  select;
  handleChange = () => {
    this.props.defaultValue = this.select.value;
  };
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    return this.select = document.createElement("select"), this.select.classList.add(b.input), this.props.id && (this.select.id = this.props.id), this.populateOptions(), this.select.addEventListener("change", this.handleChange), this.select;
  }
  get selectElement() {
    return this.select;
  }
  get value() {
    return this.select.value;
  }
  set value(t) {
    this.select && (this.select.value = t), this.props.defaultValue = t;
  }
  _onUnmount() {
    this.select.removeEventListener("change", this.handleChange);
  }
  onUpdate(t) {
    this.props = t, this.populateOptions(), t.defaultValue && (this.select.value = t.defaultValue);
  }
  update(t) {
    this.props = { ...this.props, ...t }, this.select && (t.id && (this.select.id = t.id), t.options && this.populateOptions(), t.defaultValue !== void 0 && (this.select.value = t.defaultValue));
  }
  populateOptions() {
    if (this.select) {
      this.select.innerHTML = "";
      for (const t of this.props.options) {
        const e = document.createElement("option");
        e.value = t.value, e.textContent = t.label, this.select.appendChild(e);
      }
      this.props.defaultValue && (this.select.value = this.props.defaultValue);
    }
  }
}
class Lt extends T {
  props;
  button;
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    return this.button = document.createElement("button"), this.button.type = "button", this.button.textContent = this.props.label, this.button.classList.add(b.button), this.props.variant === "secondary" ? this.button.classList.add(b.buttonSecondary) : this.button.classList.add(b.buttonPrimary), this.props.fullWidth && this.button.classList.add(b.buttonFull), this.button.disabled = !!this.props.disabled, this.button;
  }
  get buttonElement() {
    return this.button;
  }
  setLabel(t) {
    this.props.label = t, this.button.textContent = t;
  }
  setDisabled(t) {
    this.props.disabled = t, this.button.disabled = t;
  }
  onUpdate(t) {
    this.props = t, this.button.textContent = t.label, this.button.disabled = !!t.disabled, t.variant === "secondary" ? (this.button.classList.add(b.buttonSecondary), this.button.classList.remove(b.buttonPrimary)) : (this.button.classList.add(b.buttonPrimary), this.button.classList.remove(b.buttonSecondary)), this.button.classList.toggle(b.buttonFull, !!t.fullWidth);
  }
}
class Ee {
  api;
  constructor(t) {
    this.api = t;
  }
  async $copy(t, e) {
    switch (t) {
      case "txt": {
        const r = this.api.toString(e);
        await navigator.clipboard.writeText(r);
        break;
      }
      case "svg": {
        const r = this.api.toSVG(e);
        await navigator.clipboard.writeText(r);
        break;
      }
      case "image":
        await this.api.copyCanvas(e);
        break;
      default:
        throw new Error(`Clipboard not supported for ${t}`);
    }
  }
}
class ke {
  api;
  events;
  constructor(t, e) {
    this.api = t, this.events = e;
  }
  async $requestExport(t, e, r = {}) {
    this.events.$emit("export:request", { format: t });
    try {
      const a = { onGIFProgress: r.onGIFProgress ? (i) => {
        r.onGIFProgress?.(i), this.events.$emit("export:progress", { format: t, progress: i });
      } : t === "gif" ? (i) => this.events.$emit("export:progress", { format: t, progress: i }) : void 0, onVideoProgress: r.onVideoProgress ? (i) => {
        r.onVideoProgress?.(i), this.events.$emit("export:progress", { format: t, progress: i });
      } : t === "video" ? (i) => this.events.$emit("export:progress", { format: t, progress: i }) : void 0 };
      await this._execute(t, e, a), this.events.$emit("export:success", { format: t });
    } catch (a) {
      throw this.events.$emit("export:error", { format: t, error: a }), a;
    }
  }
  _execute(t, e, r) {
    switch (t) {
      case "txt":
        return Promise.resolve(this.api.saveStrings(e));
      case "image":
        return this.api.saveCanvas(e);
      case "svg":
        return Promise.resolve(this.api.saveSVG(e));
      case "gif": {
        const a = { ...e, onProgress: r.onGIFProgress };
        return this.api.saveGIF(a);
      }
      case "video": {
        const a = { ...e, onProgress: r.onVideoProgress };
        return this.api.saveWEBM(a);
      }
    }
  }
}
class Be {
  modifier;
  overlay;
  animationFrameId = null;
  handleUpdate;
  bound = !1;
  constructor(t, e) {
    this.modifier = t, this.overlay = e, this.handleUpdate = () => this.scheduleUpdate();
  }
  scheduleUpdate() {
    this.animationFrameId !== null && cancelAnimationFrame(this.animationFrameId), this.animationFrameId = requestAnimationFrame(() => this.update());
  }
  bind() {
    this.bound || (window.addEventListener("resize", this.handleUpdate), window.addEventListener("scroll", this.handleUpdate, !0), this.bound = !0, this.handleUpdate());
  }
  update() {
    this.animationFrameId = null;
    const t = this.modifier.canvas.getBoundingClientRect();
    this.overlay.style.top = `${t.top + window.scrollY + 8}px`, this.overlay.style.left = `${t.left + window.scrollX + 8}px`;
  }
  dispose() {
    this.animationFrameId !== null && (cancelAnimationFrame(this.animationFrameId), this.animationFrameId = null), this.bound && (window.removeEventListener("resize", this.handleUpdate), window.removeEventListener("scroll", this.handleUpdate, !0), this.bound = !1);
  }
}
const X = "textmode-export-number-input", Ie = `${X}__field`, Se = `${X}__controls`, Fe = `${X}__control`, Ut = `${X}__display`, et = `${Ut}--visible`, Le = (s) => {
  s.dispatchEvent(new Event("input", { bubbles: !0 })), s.dispatchEvent(new Event("change", { bubbles: !0 }));
}, Mt = (s) => {
  const t = document.createElement("button");
  return t.type = "button", t.className = Fe, t.textContent = s > 0 ? "▲" : "▼", t;
};
class G extends T {
  props;
  input;
  display;
  incrementButton;
  decrementButton;
  suppressClickAfterPointer = /* @__PURE__ */ new WeakMap();
  holdTimeoutId;
  holdIntervalId;
  activePointerId;
  disabledObserver;
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    const t = document.createElement("div");
    t.className = X, this.input = document.createElement("input"), this.input.type = "number", this.input.value = this.props.defaultValue, Object.assign(this.input, this.props.attributes), this.input.className = Ie, this.display = document.createElement("div"), this.display.className = Ut;
    const e = document.createElement("div");
    return e.className = Se, this.incrementButton = Mt(1), this.decrementButton = Mt(-1), e.appendChild(this.incrementButton), e.appendChild(this.decrementButton), t.appendChild(this.input), t.appendChild(this.display), t.appendChild(e), this.bindStepControls(), this.bindHoldBehavior(), this.bindInputListeners(), this.observeDisabledState(t), this.updateDisplay(), t;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(t) {
    this.input.value = t, this.updateDisplay();
  }
  refresh() {
    this.updateDisplay();
  }
  _onDestroy() {
    this.clearHoldTimers(), this.disabledObserver?.disconnect();
  }
  bindStepControls() {
    const t = (i) => () => {
      if (this.input.disabled) return;
      const n = this.input.value, c = this.input.getAttribute("step");
      if (c && c !== "any") i > 0 ? this.input.stepUp() : this.input.stepDown();
      else {
        const l = i > 0 ? 1 : -1, p = Number.parseFloat(this.input.value || "0"), o = Number.isFinite(p) ? p + l : l;
        this.input.value = String(o);
      }
      this.input.value !== n && Le(this.input), this.updateDisplay(), this.input.focus({ preventScroll: !0 });
    }, e = t(1), r = t(-1), a = (i, n) => (c) => {
      if (this.suppressClickAfterPointer.get(i)) return this.suppressClickAfterPointer.set(i, !1), void c.preventDefault();
      n();
    };
    this.incrementButton.addEventListener("click", a(this.incrementButton, e)), this.decrementButton.addEventListener("click", a(this.decrementButton, r));
  }
  bindHoldBehavior() {
    const t = (e, r) => {
      const a = r > 0 ? () => this.incrementButton.click() : () => this.decrementButton.click();
      e.addEventListener("pointerdown", (c) => {
        if (c.button === 0) {
          c.preventDefault(), this.suppressClickAfterPointer.set(e, !0), this.activePointerId = c.pointerId;
          try {
            e.setPointerCapture(c.pointerId);
          } catch {
          }
          a(), this.holdTimeoutId = window.setTimeout(() => {
            this.holdIntervalId = window.setInterval(a, 80);
          }, 380);
        }
      });
      const i = () => {
        if (this.activePointerId !== void 0) {
          try {
            e.releasePointerCapture(this.activePointerId);
          } catch {
          }
          this.activePointerId = void 0;
        }
      }, n = () => {
        this.clearHoldTimers(), i();
      };
      e.addEventListener("pointerup", n), e.addEventListener("pointerleave", n), e.addEventListener("pointercancel", n);
    };
    t(this.incrementButton, 1), t(this.decrementButton, -1);
  }
  bindInputListeners() {
    const t = () => {
      this.props.defaultValue = this.input.value, this.updateDisplay();
    };
    this.input.addEventListener("input", t), this.input.addEventListener("change", t);
  }
  observeDisabledState(t) {
    const e = () => {
      const r = this.input.disabled;
      this.incrementButton.disabled = r, this.decrementButton.disabled = r, t.classList.toggle("is-disabled", r), r ? (this.display.classList.remove(et), this.input.style.removeProperty("color"), this.input.style.removeProperty("caretColor")) : this.updateDisplay();
    };
    typeof MutationObserver < "u" && (this.disabledObserver = new MutationObserver(e), this.disabledObserver.observe(this.input, { attributes: !0, attributeFilter: ["disabled"] })), e();
  }
  updateDisplay() {
    const t = this.props.formatDisplay;
    if (!t) return this.display.textContent = "", this.display.classList.remove(et), this.input.style.removeProperty("color"), void this.input.style.removeProperty("caretColor");
    const e = this.input.value, r = Number.parseFloat(e), a = t(Number.isFinite(r) ? r : Number.NaN, e, this.input);
    a ? (this.display.textContent = a, this.display.classList.add(et), this.input.style.color = "transparent", this.input.style.caretColor = "#f8fafc") : (this.display.textContent = "", this.display.classList.remove(et), this.input.style.removeProperty("color"), this.input.style.removeProperty("caretColor"));
  }
  clearHoldTimers() {
    this.holdTimeoutId !== void 0 && (window.clearTimeout(this.holdTimeoutId), this.holdTimeoutId = void 0), this.holdIntervalId !== void 0 && (window.clearInterval(this.holdIntervalId), this.holdIntervalId = void 0);
  }
}
class j extends T {
  variant;
  additionalClasses;
  constructor(t = "stack", e = []) {
    super(), this.variant = t, this.additionalClasses = e;
  }
  render() {
    const t = document.createElement("div"), e = [this.variant === "stack" ? b.stack : void 0, this.variant === "stackDense" ? b.stackDense : void 0, this.variant === "stackCompact" ? b.stackCompact : void 0, this.variant === "row" ? b.row : void 0, this.variant === "section" ? b.section : void 0, ...this.additionalClasses].filter(Boolean);
    return t.classList.add(...e), t;
  }
}
const $t = { neutral: "textmode-export-overlay__status-value--neutral", active: "textmode-export-overlay__status-value--active", alert: "textmode-export-overlay__status-value--alert" };
class Nt extends T {
  props;
  container;
  messageElement;
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    this.container = document.createElement("div"), this.container.classList.add(b.status), this.props.context === "gif" ? this.container.classList.add(b.statusGif) : this.props.context === "video" && this.container.classList.add(b.statusVideo);
    const t = document.createElement("span");
    return t.classList.add(b.statusTitle), t.textContent = this.props.title, this.messageElement = document.createElement("span"), this.messageElement.classList.add(b.statusValue), this.messageElement.textContent = this.props.message, this.applyVariant(this.props.variant ?? "neutral"), this.container.appendChild(t), this.container.appendChild(this.messageElement), this.container;
  }
  setMessage(t, e = "neutral") {
    this.messageElement.textContent = t, this.applyVariant(e);
  }
  onUpdate(t) {
    this.props = t, this.setMessage(t.message, t.variant ?? "neutral");
  }
  applyVariant(t) {
    this.messageElement.classList.remove(...Object.values($t)), this.messageElement.classList.add($t[t]);
  }
}
class Y extends T {
  _config;
  _managedComponents = /* @__PURE__ */ new Set();
  constructor(t) {
    super(), this._config = t;
  }
  _manageComponent(t) {
    return this._managedComponents.add(t), t;
  }
  _onUnmount() {
    for (const t of this._managedComponents) t.unmount();
  }
  _onDestroy() {
    for (const t of this._managedComponents) t.destroy();
    this._managedComponents.clear();
  }
}
const z = { frameCount: 300, frameRate: 60, scale: 1, repeat: 0 };
class ut extends Y {
  frameCountInput = this._manageComponent(new G({ defaultValue: String(z.frameCount), attributes: { min: "1", max: "600", step: "1" } }));
  frameRateInput = this._manageComponent(new G({ defaultValue: String(z.frameRate), attributes: { min: "1", max: "60", step: "1" } }));
  scaleInput = this._manageComponent(new G({ defaultValue: String(z.scale), attributes: { min: "0.1", max: "8", step: "0.1" } }));
  repeatInput = this._manageComponent(new G({ defaultValue: "0", attributes: { min: "0", max: "50", step: "1" }, formatDisplay: (t, e) => Number.isFinite(t) ? t === 0 ? "∞" : null : e.trim() === "" ? null : e }));
  status = this._manageComponent(new Nt({ title: "status", message: "ready to record", variant: "neutral", context: "gif" }));
  recordingState = "idle";
  constructor(t) {
    super(t);
  }
  render() {
    const t = document.createElement("div");
    t.classList.add(b.stack);
    const e = new j("row");
    e.mount(t);
    const r = new P({ label: "number of frames", labelFor: "textmode-export-gif-frame-count", variant: "dense" });
    r.mount(e.root), this.frameCountInput.mount(r.root), this.frameCountInput.inputElement.id = "textmode-export-gif-frame-count";
    const a = new P({ label: "frame rate (fps)", labelFor: "textmode-export-gif-frame-rate", variant: "dense" });
    a.mount(e.root), this.frameRateInput.mount(a.root), this.frameRateInput.inputElement.id = "textmode-export-gif-frame-rate";
    const i = new j("row");
    i.mount(t);
    const n = new P({ label: "scale", labelFor: "textmode-export-gif-scale", variant: "dense" });
    n.mount(i.root), this.scaleInput.mount(n.root), this.scaleInput.inputElement.id = "textmode-export-gif-scale";
    const c = new P({ label: "loop count", labelFor: "textmode-export-gif-repeat", variant: "dense" });
    return c.mount(i.root), this.repeatInput.mount(c.root), this.repeatInput.inputElement.id = "textmode-export-gif-repeat", this.status.mount(t), t;
  }
  getOptions() {
    const t = this._config.defaultOptions ?? {};
    return { frameCount: this.safeParseInt(this.frameCountInput.value, t.frameCount ?? 300), frameRate: this.safeParseInt(this.frameRateInput.value, t.frameRate ?? 60), scale: this.safeParseFloat(this.scaleInput.value, t.scale ?? 1), repeat: this.safeParseInt(this.repeatInput.value, t.repeat ?? 0) };
  }
  reset() {
    this.recordingState = "idle", this.applyDefaults(), this.setRecordingState("idle");
  }
  validate() {
    const t = Number.parseInt(this.frameCountInput.value, 10), e = Number.parseInt(this.frameRateInput.value, 10), r = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(t) && t > 0 && Number.isFinite(e) && e > 0 && Number.isFinite(r) && r > 0;
  }
  isRecording() {
    return this.recordingState === "recording";
  }
  setRecordingState(t, e) {
    this.recordingState = t;
    const r = t === "recording";
    switch (this.frameCountInput.inputElement.disabled = r, this.frameRateInput.inputElement.disabled = r, this.scaleInput.inputElement.disabled = r, this.repeatInput.inputElement.disabled = r, t) {
      case "recording":
        if (e?.totalFrames) {
          const a = e.frameIndex ?? 0;
          this.status.setMessage(`recording ${a}/${e.totalFrames}`, "active");
        } else this.status.setMessage("recording…", "active");
        break;
      case "completed":
        this.status.setMessage("GIF saved successfully", "active");
        break;
      case "error":
        this.status.setMessage(e?.message ?? "failed to export GIF", "alert");
        break;
      default:
        this.status.setMessage("ready to record", "neutral");
    }
  }
  handleProgress(t) {
    t.state === "recording" && t.totalFrames ? this.status.setMessage(`recording ${t.frameIndex ?? 0}/${t.totalFrames}`, "active") : t.state === "completed" ? this.status.setMessage("GIF saved successfully", "active") : t.state === "error" && this.status.setMessage(t.message ?? "failed to export GIF", "alert");
  }
  applyDefaults() {
    const t = this._config.defaultOptions ?? {}, e = t.frameCount ?? z.frameCount, r = t.frameRate ?? z.frameRate, a = t.scale ?? z.scale, i = t.repeat ?? z.repeat;
    this.frameCountInput.value = String(e), this.frameRateInput.value = String(r), this.scaleInput.value = String(a), this.repeatInput.value = String(i), this.frameCountInput.refresh(), this.frameRateInput.refresh(), this.scaleInput.refresh(), this.repeatInput.refresh();
  }
  safeParseInt(t, e) {
    const r = Number.parseInt(t, 10);
    return Number.isFinite(r) ? r : e;
  }
  safeParseFloat(t, e) {
    const r = Number.parseFloat(t);
    return Number.isFinite(r) ? r : e;
  }
}
const it = "textmode-export-range-input", Me = `${it}__field`, $e = `${it}__tooltip`, ct = `${it}__tooltip--visible`, rt = (s, t) => {
  if (typeof s != "string" || s.length === 0) return t;
  const e = Number.parseFloat(s);
  return Number.isFinite(e) ? e : t;
}, Ae = (s, t, e) => Math.min(e, Math.max(t, s));
class Pe extends T {
  props;
  input;
  tooltip;
  hoverActive = !1;
  focusActive = !1;
  pointerActive = !1;
  suppressFocusFromPointer = !1;
  activePointerId;
  disabledObserver;
  resizeObserver;
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    const t = document.createElement("div");
    return t.className = it, this.input = document.createElement("input"), this.input.type = "range", this.input.value = this.props.defaultValue, Object.assign(this.input, this.props.attributes), this.input.className = Me, this.tooltip = document.createElement("div"), this.tooltip.className = $e, t.appendChild(this.input), t.appendChild(this.tooltip), this.bindEvents(t), this.updateTooltip(), this.syncDisabledState(t), t;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(t) {
    this.input.value = t, this.updateTooltip();
  }
  _onDestroy() {
    this.disabledObserver?.disconnect(), this.resizeObserver?.disconnect();
  }
  bindEvents(t) {
    this.input.addEventListener("pointerenter", () => {
      this.hoverActive = !0, this.refreshTooltipVisibility();
    }), this.input.addEventListener("pointerleave", () => {
      this.hoverActive = !1, this.refreshTooltipVisibility();
    }), this.input.addEventListener("focus", () => {
      let r = !1;
      try {
        r = this.input.matches(":focus-visible");
      } catch {
        r = !this.suppressFocusFromPointer;
      }
      this.suppressFocusFromPointer || !r || this.input.disabled ? this.focusActive = !1 : this.focusActive = !0, this.suppressFocusFromPointer = !1, this.refreshTooltipVisibility();
    }), this.input.addEventListener("blur", () => {
      this.focusActive = !1, this.refreshTooltipVisibility();
    }), this.input.addEventListener("pointerdown", (r) => {
      this.pointerActive = !0, this.suppressFocusFromPointer = !0, this.hoverActive = !0, this.refreshTooltipVisibility();
      try {
        this.input.setPointerCapture(r.pointerId), this.activePointerId = r.pointerId;
      } catch {
        this.activePointerId = void 0;
      }
    });
    const e = () => {
      this.pointerActive = !1, this.suppressFocusFromPointer = !1, this.hoverActive = this.input.matches(":hover"), this.releasePointerCapture(), this.refreshTooltipVisibility();
    };
    this.input.addEventListener("pointerup", e), this.input.addEventListener("pointercancel", e), this.input.addEventListener("lostpointercapture", e), this.input.addEventListener("input", () => {
      (this.hoverActive || this.focusActive || this.pointerActive) && this.updateTooltip(), this.props.defaultValue = this.input.value;
    }), this.input.addEventListener("change", () => {
      this.pointerActive || this.updateTooltip(), this.props.defaultValue = this.input.value;
    }), typeof ResizeObserver < "u" && (this.resizeObserver = new ResizeObserver(() => {
      this.tooltip.classList.contains(ct) && this.updateTooltipPosition();
    }), this.resizeObserver.observe(t));
  }
  refreshTooltipVisibility() {
    const t = (this.hoverActive || this.focusActive || this.pointerActive) && !this.input.disabled;
    t && this.updateTooltip(), this.tooltip.classList.toggle(ct, t);
  }
  syncDisabledState(t) {
    const e = () => {
      const r = this.input.disabled;
      t.classList.toggle("is-disabled", r), r && (this.hoverActive = !1, this.focusActive = !1, this.pointerActive = !1, this.suppressFocusFromPointer = !1, this.releasePointerCapture(), this.tooltip.classList.remove(ct));
    };
    typeof MutationObserver < "u" && (this.disabledObserver = new MutationObserver(e), this.disabledObserver.observe(this.input, { attributes: !0, attributeFilter: ["disabled"] })), e();
  }
  releasePointerCapture() {
    if (this.activePointerId !== void 0) {
      try {
        this.input.releasePointerCapture(this.activePointerId);
      } catch {
      }
      this.activePointerId = void 0;
    }
  }
  updateTooltip() {
    this.updateTooltipContent(), this.updateTooltipPosition();
  }
  updateTooltipContent() {
    const t = this.props.formatValue ?? ((r) => `${r}`), e = this.getCurrentValue();
    this.tooltip.textContent = t(e, this.input);
  }
  updateTooltipPosition() {
    const t = this.getMin(), e = this.getMax(), r = Ae(this.getCurrentValue(), t, e), a = e - t, i = a === 0 ? 0 : (r - t) / a;
    this.tooltip.style.left = 100 * i + "%";
  }
  getMin() {
    return rt(this.input.min, 0);
  }
  getMax() {
    return rt(this.input.max, 100);
  }
  getCurrentValue() {
    return rt(this.input.value, rt(this.props.defaultValue, 0));
  }
}
function De(s) {
  if (!Number.isFinite(s)) return "default quality";
  const t = Math.max(0, Math.min(1, s));
  return t >= 0.995 ? "near-lossless" : t >= 0.98 ? "maximum detail" : t >= 0.88 ? "ultra quality" : t >= 0.7 ? "high quality" : t >= 0.5 ? "balanced" : t >= 0.25 ? "compact" : t >= 0.1 ? "lightweight" : "draft";
}
function Ve(s) {
  return `${De(s)} (quality ≈ ${s.toFixed(3)})`;
}
class pt extends Y {
  frameRateInput = this._manageComponent(new G({ defaultValue: String(60), attributes: { min: String(1), max: String(60), step: "1" }, formatDisplay: (t) => Number.isFinite(t) ? `${t} fps` : null }));
  frameCountInput = this._manageComponent(new G({ defaultValue: String(480), attributes: { min: String(1), max: String(3600), step: "1" } }));
  qualityInput = this._manageComponent(new Pe({ defaultValue: String(0.7), attributes: { min: String(0), max: String(1), step: "0.001" }, formatValue: (t) => Ve(t) }));
  status = this._manageComponent(new Nt({ title: "status", message: "ready to record", variant: "neutral", context: "video" }));
  recordingState = "idle";
  constructor(t) {
    super(t);
  }
  render() {
    const t = document.createElement("div");
    t.classList.add(b.stack);
    const e = new j("row");
    e.mount(t);
    const r = new P({ label: "number of frames", labelFor: "textmode-export-video-frame-count", variant: "compact" });
    r.mount(e.root), this.frameCountInput.mount(r.root), this.frameCountInput.inputElement.id = "textmode-export-video-frame-count";
    const a = new P({ label: "frame rate (fps)", labelFor: "textmode-export-video-frame-rate", variant: "compact" });
    a.mount(e.root), this.frameRateInput.mount(a.root), this.frameRateInput.inputElement.id = "textmode-export-video-frame-rate";
    const i = new P({ label: "quality", labelFor: "textmode-export-video-quality", variant: "full" });
    return i.mount(t), this.qualityInput.mount(i.root), this.qualityInput.inputElement.id = "textmode-export-video-quality", this.status.mount(t), t;
  }
  getOptions() {
    const t = this._config.defaultOptions ?? {}, e = Number.parseInt(this.frameCountInput.value, 10), r = Number.parseFloat(this.frameRateInput.value), a = Number.parseFloat(this.qualityInput.value);
    return { frameCount: Number.isFinite(e) ? e : t.frameCount ?? 480, frameRate: Number.isFinite(r) ? r : t.frameRate ?? 60, quality: Number.isFinite(a) ? a : t.quality ?? 0.7 };
  }
  reset() {
    this.recordingState = "idle", this.applyDefaults(), this.status.setMessage("ready to record", "neutral");
  }
  validate() {
    const t = Number.parseInt(this.frameCountInput.value, 10), e = Number.parseFloat(this.frameRateInput.value);
    return Number.isFinite(t) && t >= 1 && Number.isFinite(e) && e >= 1;
  }
  isRecording() {
    return this.recordingState === "recording";
  }
  setRecordingState(t, e) {
    this.recordingState = t;
    const r = t === "recording";
    this.frameCountInput.inputElement.disabled = r, this.frameRateInput.inputElement.disabled = r, this.qualityInput.inputElement.disabled = r, this.syncStatus(t, e);
  }
  handleProgress(t) {
    this.syncStatus(t.state, t);
  }
  syncStatus(t, e) {
    switch (t) {
      case "recording": {
        const r = e?.frameIndex ?? 0, a = e?.totalFrames ?? this.resolvePlannedFrameCount();
        if (a) {
          const i = Math.min(Math.max(0, Math.round(r)), a);
          this.status.setMessage(`recording ${i}/${a} frames`, "active");
        } else this.status.setMessage(`recording ${Math.max(0, Math.round(r))} frames`, "active");
        break;
      }
      case "completed":
        this.status.setMessage("saved to disk", "active");
        break;
      case "error":
        this.status.setMessage(e?.message ? `error: ${e.message}` : "recording failed", "alert");
        break;
      default:
        this.status.setMessage("ready to record", "neutral");
    }
  }
  resolvePlannedFrameCount() {
    const t = Number.parseInt(this.frameCountInput.value, 10);
    return Number.isFinite(t) && t > 0 ? Math.round(t) : void 0;
  }
  applyDefaults() {
    const t = this._config.defaultOptions ?? {}, e = t.frameCount ?? 480, r = t.frameRate ?? 60, a = t.quality ?? 0.7;
    this.frameCountInput.value = String(e), this.frameRateInput.value = String(r), this.qualityInput.value = String(a), this.frameCountInput.refresh(), this.frameRateInput.refresh();
  }
}
const Te = `@layer textmode-export-overlay{.textmode-export-overlay{--overlay-bg: rgba(20, 20, 20, .8);--overlay-surface: rgba(40, 40, 40, .9);--overlay-border: rgba(255, 255, 255, .14);--overlay-border-strong: rgba(255, 255, 255, .2);--overlay-border-focus: rgba(160, 160, 160, .6);--overlay-focus-shadow: 0 0 0 1px rgba(140, 140, 140, .28);--overlay-text: #ffffff;--overlay-muted: rgba(200, 200, 200, .74);--overlay-radius: .75rem;--overlay-stack-gap: .55rem;position:absolute;top:0;left:0;display:flex;flex-direction:column;gap:var(--overlay-stack-gap);min-width:236px;max-width:236px;padding:.65rem .8rem;background:var(--overlay-bg);color:var(--overlay-text);border-radius:var(--overlay-radius);border:1px solid var(--overlay-border);box-shadow:0 12px 28px #0000004d;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;font-size:.82rem;line-height:1.35;pointer-events:auto;z-index:2147483647}.textmode-export-overlay *{box-sizing:border-box}.textmode-export-overlay__header{display:flex;flex-direction:column;gap:.4rem}.textmode-export-overlay__header-title-row{display:flex;align-items:center;justify-content:space-between;gap:.4rem}.textmode-export-overlay__header-links{display:inline-flex;align-items:center;gap:.3rem}.textmode-export-overlay__support-link{display:inline-flex;align-items:center;justify-content:center;padding:.2rem;border-radius:.45rem;border:1px solid transparent;color:#d7d7d7d1;background:transparent;text-decoration:none;line-height:0;transition:background .18s ease,color .18s ease,transform .18s ease,border-color .18s ease}.textmode-export-overlay__support-link:hover{color:#fff;background:#5a5a5a4d;border-color:#c8c8c824}.textmode-export-overlay__support-link:focus-visible{outline:none;border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow)}.textmode-export-overlay__support-icon,.textmode-export-overlay__link-icon{display:block;width:1rem;height:1rem}.textmode-export-overlay__stack{display:flex;flex-direction:column;gap:var(--overlay-stack-gap)}.textmode-export-overlay__stack--dense{gap:.3rem}.textmode-export-overlay__stack--compact{gap:.45rem}.textmode-export-overlay__section{display:flex;flex-direction:column;gap:.4rem}.textmode-export-overlay__title{font-size:.92rem;font-weight:600}.textmode-export-overlay__divider{width:100%;height:1px;background:#ffffff29;margin-top:.25rem}.textmode-export-overlay__label{font-weight:500;opacity:.9}.textmode-export-overlay__checkbox{display:flex;align-items:center;gap:.5rem}.textmode-export-overlay__checkbox input[type=checkbox]{width:1rem;height:1rem;accent-color:rgba(100,100,100,.9)}.textmode-export-overlay__row{display:flex;gap:.6rem;flex-wrap:wrap;align-items:flex-start;width:100%}.textmode-export-overlay__field{display:flex;flex-direction:column;gap:.3rem;flex:1 1 120px;min-width:120px}.textmode-export-overlay__field--compact{flex:1 1 100px;min-width:100px}.textmode-export-overlay__field--dense{flex:1 1 90px;min-width:90px}.textmode-export-overlay__field--channel{flex:1 1 0;min-width:0}.textmode-export-overlay__field--full{width:100%;flex:1 1 100%}.textmode-export-overlay__input,.textmode-export-overlay select.textmode-export-overlay__input,.textmode-export-overlay input.textmode-export-overlay__input{width:100%;padding:.35rem .5rem;border-radius:.4rem;border:1px solid var(--overlay-border-strong);background:var(--overlay-surface);color:var(--overlay-text);font:inherit;line-height:1.35;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease}.textmode-export-overlay select.textmode-export-overlay__input{-webkit-appearance:none;-moz-appearance:none;appearance:none;background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(200, 200, 200, 0.74)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");background-repeat:no-repeat;background-position:right .5rem center;background-size:1rem;padding-right:2rem}.textmode-export-overlay__input:focus{outline:none;border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow);background:#2d2f42eb}.textmode-export-overlay__input::placeholder{color:var(--overlay-muted);opacity:.7}.textmode-export-overlay__muted{font-size:.75rem;opacity:.7;display:block}.textmode-export-overlay__button{display:inline-flex;align-items:center;justify-content:center;gap:.35rem;border-radius:.45rem;border:none;font-weight:600;padding:.45rem .7rem;cursor:pointer;transition:background .2s ease,transform .2s ease,box-shadow .2s ease}.textmode-export-overlay__button--primary{background:#505050;color:#fff}.textmode-export-overlay__button--secondary{background:#606060;color:#fff}.textmode-export-overlay__button--full{width:100%}.textmode-export-overlay__button:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 7px 18px #00000073}.textmode-export-overlay__button--primary:hover:not(:disabled){background:#404040}.textmode-export-overlay__button--secondary:hover:not(:disabled){background:#4a4a4a}.textmode-export-overlay__button:disabled{cursor:default;opacity:.55;transform:none;box-shadow:none}.textmode-export-overlay__status{display:flex;flex-direction:column;gap:.25rem;padding:.45rem .55rem;border-radius:.45rem;border:1px solid rgba(110,110,110,.22);background:#4646462e}.textmode-export-overlay__status--gif{background:#5050501f;border-color:#78787840}.textmode-export-overlay__status--video{background:#4646461f;border-color:#6e6e6e40}.textmode-export-overlay__status-title{font-weight:600;font-size:.75rem;opacity:.85;text-transform:uppercase;letter-spacing:.04em}.textmode-export-overlay__status-value{font-size:.82rem;color:#dedede;transition:color .18s ease}.textmode-export-overlay__status-value--neutral{color:#cfcfcf}.textmode-export-overlay__status-value--active{color:#f5f5f5}.textmode-export-overlay__status-value--alert{color:#b8b8b8}.textmode-export-number-input,.textmode-export-overlay .textmode-export-number-input{display:flex;align-items:stretch;width:100%;background:var(--overlay-surface);border:1px solid var(--overlay-border-strong);border-radius:.4rem;overflow:hidden;transition:border-color .18s ease,box-shadow .18s ease,background .18s ease;position:relative}.textmode-export-number-input:focus-within{border-color:var(--overlay-border-focus);box-shadow:var(--overlay-focus-shadow)}.textmode-export-number-input.is-disabled{opacity:.55}.textmode-export-number-input__field{flex:1 1 auto;min-width:0;border:none;background:transparent;color:var(--overlay-text);font:inherit;padding:.35rem .5rem;appearance:textfield}.textmode-export-number-input__field::-webkit-outer-spin-button,.textmode-export-number-input__field::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.textmode-export-number-input__field:focus{outline:none}.textmode-export-number-input__controls{display:flex;flex-direction:column;border-left:1px solid rgba(255,255,255,.12);min-width:1.6rem}.textmode-export-number-input__control{display:flex;align-items:center;justify-content:center;width:100%;flex:1;border:none;background:#32323299;color:#d0d0d0;font-size:.68rem;line-height:1;cursor:pointer;transition:background .15s ease,color .15s ease;padding:0}.textmode-export-number-input__control:hover:not(:disabled){background:#5a5a5ad9;color:#fff}.textmode-export-number-input__control:disabled{cursor:default;opacity:.4;background:#28282880;color:#c8c8c866}.textmode-export-number-input:focus-within .textmode-export-number-input__control{background:#3c3c3cbf;color:#e8e8e8}.textmode-export-number-input__display{position:absolute;inset:0;display:flex;align-items:center;padding:.4rem .55rem;pointer-events:none;color:#f8fafc;opacity:0;transition:opacity .14s ease}.textmode-export-number-input__display--visible{opacity:1}.textmode-export-range-input{position:relative;width:100%}.textmode-export-range-input.is-disabled{opacity:.55}.textmode-export-range-input__field{width:100%;height:1.4rem;padding:0;margin:0;background:transparent;cursor:pointer;appearance:none;-webkit-appearance:none}.textmode-export-range-input__field::-webkit-slider-thumb{width:12px;height:12px;margin-top:-3.5px;-webkit-appearance:none;border-radius:50%;background:#a0a0a0;border:2px solid #303030;box-shadow:0 0 0 2px #00000059}.textmode-export-range-input__field::-webkit-slider-runnable-track{height:5px;border-radius:999px;background:linear-gradient(90deg,#8c8c8cd9,#646464a6)}.textmode-export-range-input__field::-moz-range-thumb{width:12px;height:12px;border-radius:50%;background:#a0a0a0;border:2px solid #303030;margin-top:-3.5px}.textmode-export-range-input__field::-moz-range-track{height:5px;border-radius:999px;background:linear-gradient(90deg,#8c8c8cd9,#646464a6)}.textmode-export-range-input__tooltip{position:absolute;top:-1.5rem;left:0;transform:translate(-50%);padding:.2rem .35rem;border-radius:.35rem;background:#1e1e1ee0;color:#f8fafc;font-size:.68rem;line-height:1;white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .15s ease}.textmode-export-range-input__tooltip--visible{opacity:1}}`;
class Oe {
  _textmodifier;
  _state;
  _events;
  _exportService;
  _clipboardService;
  _definitions;
  _formats = /* @__PURE__ */ new Map();
  _eventUnsubscribers = [];
  _shadowHost;
  _shadowRoot;
  _overlayElement;
  _optionsContainer;
  _copyButtonContainer;
  _positionService;
  _header = new H();
  _formatField = new P({ label: "export format", labelFor: "textmode-export-format", variant: "full" });
  _formatSelect = new mt({ id: "textmode-export-format", options: [] });
  _exportButton = new Lt({ label: "download file", fullWidth: !0, variant: "primary" });
  _copyButton = new Lt({ label: "copy to clipboard", fullWidth: !0, variant: "primary" });
  _currentFormat;
  _currentBlade;
  _handleFormatSelectChange = () => {
    this._handleFormatChange(this._formatSelect.value);
  };
  _handleExportClickSafe = () => {
    this._handleExportClick().catch((t) => {
      console.error("[textmode-export] Export failed", t);
    });
  };
  _handleCopyClickSafe = () => {
    this._handleCopyClick().catch((t) => {
      console.error("[textmode-export] Copy failed", t);
    });
  };
  constructor(t, e, r, a, i) {
    this._textmodifier = t, this._state = r, this._events = a, this._exportService = new ke(e, a), this._clipboardService = new Ee(e), this._definitions = i, this._currentFormat = r.snapshot.format, this._initializeFormatMap(), this._registerEventHandlers();
  }
  $mount() {
    this._createOverlay(), this._renderStaticContent(), this._positionService = new Be(this._textmodifier, this._shadowHost), this._positionService.bind(), this._switchFormat(this._currentFormat);
  }
  $dispose() {
    this._formatSelect.isMounted() && this._formatSelect.selectElement.removeEventListener("change", this._handleFormatSelectChange), this._exportButton.isMounted() && this._exportButton.buttonElement.removeEventListener("click", this._handleExportClickSafe), this._copyButton.isMounted() && this._copyButton.buttonElement.removeEventListener("click", this._handleCopyClickSafe);
    for (const t of this._eventUnsubscribers) t();
    this._eventUnsubscribers.length = 0, this._events.$clear();
    for (const t of this._formats.values()) t.blade.destroy();
    this._formats.clear(), this._currentBlade = void 0, this._shadowHost?.isConnected && this._shadowHost.remove(), this._positionService?.dispose();
  }
  _initializeFormatMap() {
    for (const t of this._definitions) {
      const e = t.createBlade();
      this._formats.set(t.format, { definition: t, blade: e, initialized: !1 });
    }
  }
  _createOverlay() {
    this._shadowHost = document.createElement("div"), this._shadowHost.dataset.plugin = "textmode-export-overlay-host", this._shadowHost.style.cssText = "position: absolute; top: 0; left: 0; pointer-events: none; z-index: 2147483647;", this._shadowRoot = this._shadowHost.attachShadow({ mode: "open" });
    const t = document.createElement("style");
    t.textContent = Te, this._shadowRoot.appendChild(t), this._overlayElement = document.createElement("div"), this._overlayElement.dataset.plugin = "textmode-export-overlay", this._overlayElement.classList.add(b.root, b.stack), this._shadowRoot.appendChild(this._overlayElement), document.body.appendChild(this._shadowHost);
  }
  _renderStaticContent() {
    this._header.mount(this._overlayElement);
    const t = document.createElement("div");
    t.classList.add(b.section), this._overlayElement.appendChild(t), this._formatField.mount(t), this._prepareFormatOptions(), this._formatSelect.mount(this._formatField.root), this._formatSelect.selectElement.addEventListener("change", this._handleFormatSelectChange), this._optionsContainer = document.createElement("div"), this._optionsContainer.classList.add(b.stack, b.stackCompact), this._overlayElement.appendChild(this._optionsContainer), this._exportButton.mount(this._overlayElement), this._exportButton.buttonElement.addEventListener("click", this._handleExportClickSafe), this._copyButtonContainer = document.createElement("div"), this._copyButtonContainer.classList.add(b.stack, b.stackDense), this._overlayElement.appendChild(this._copyButtonContainer), this._copyButton.mount(this._copyButtonContainer), this._copyButton.buttonElement.dataset.defaultLabel = "copy to clipboard", this._copyButton.buttonElement.addEventListener("click", this._handleCopyClickSafe);
  }
  _prepareFormatOptions() {
    const t = this._definitions.map((e) => ({ value: e.format, label: e.label }));
    this._formatSelect.update({ options: t, defaultValue: this._currentFormat });
  }
  _registerEventHandlers() {
    this._eventUnsubscribers.push(this._events.$on("export:request", ({ format: t }) => {
      t === this._currentFormat && (this._state.$set({ isBusy: !0, error: void 0 }), this._updateExportButton());
    }), this._events.$on("export:success", ({ format: t }) => {
      if (t === this._currentFormat) {
        const e = { isBusy: !1 };
        t === "gif" && (e.gifProgress = void 0), t === "video" && (e.videoProgress = void 0), this._state.$set(e), this._updateExportButton();
      }
    }), this._events.$on("export:error", ({ format: t, error: e }) => {
      t === this._currentFormat && (this._state.$set({ isBusy: !1, error: e }), this._updateExportButton());
    }), this._events.$on("export:progress", ({ format: t, progress: e }) => {
      if (e) {
        if (t === "gif" && this._currentBlade?.blade instanceof ut) {
          const r = e;
          this._state.$set({ gifProgress: r }), this._currentBlade.blade.handleProgress(r);
        } else if (t === "video" && this._currentBlade?.blade instanceof pt) {
          const r = e;
          this._state.$set({ videoProgress: r }), this._currentBlade.blade.handleProgress(r);
        }
        this._updateExportButton();
      }
    }));
  }
  _handleFormatChange(t) {
    this._currentFormat = t, this._state.$set({ format: t }), this._switchFormat(t), this._events.$emit("format:change", { format: t });
  }
  _switchFormat(t) {
    const e = this._formats.get(t);
    if (!e) throw new Error(`Unknown export format: ${t}`);
    this._currentBlade && this._currentBlade.blade.unmount(), this._optionsContainer.innerHTML = "", e.blade.mount(this._optionsContainer), e.initialized || (e.blade.reset(), e.initialized = !0), this._currentBlade = e, this._formatSelect.value = t, this._updateCopyButtonState(), this._updateExportButton(), this._positionService?.scheduleUpdate();
  }
  _updateCopyButtonState() {
    const t = this._currentBlade?.definition.supportsClipboard ?? !1;
    this._copyButtonContainer.style.display = t ? "flex" : "none", this._copyButton.setDisabled(!t);
  }
  async _handleExportClick() {
    if (!this._currentBlade) return;
    const t = this._currentBlade.definition.format, e = this._currentBlade.blade.getOptions();
    if (this._currentBlade.blade.validate()) {
      if (t === "gif") {
        const r = this._currentBlade.blade;
        if (r.isRecording()) return;
        r.setRecordingState("recording");
        try {
          await this._exportService.$requestExport("gif", e, { onGIFProgress: (a) => {
            r.setRecordingState(a.state, a);
          } });
        } catch (a) {
          throw r.setRecordingState("error"), a;
        }
        return void window.setTimeout(() => {
          r.setRecordingState("idle"), this._updateExportButton();
        }, 1600);
      }
      if (t === "video") {
        const r = this._currentBlade.blade;
        if (r.isRecording()) return;
        r.setRecordingState("recording");
        try {
          await this._exportService.$requestExport("video", e, { onVideoProgress: (a) => {
            r.setRecordingState(a.state, a);
          } });
        } catch (a) {
          throw r.setRecordingState("error"), a;
        }
        return void window.setTimeout(() => {
          r.setRecordingState("idle"), this._updateExportButton();
        }, 1600);
      }
      this._exportButton.setDisabled(!0), this._exportButton.setLabel("exporting…");
      try {
        await this._exportService.$requestExport(t, e);
      } finally {
        this._exportButton.setDisabled(!1), this._exportButton.setLabel("download file");
      }
    } else console.warn("[textmode-export] Export options failed validation");
  }
  async _handleCopyClick() {
    if (!this._currentBlade || !this._currentBlade.definition.supportsClipboard) return;
    const t = this._currentBlade.definition.format, e = this._currentBlade.blade.getOptions(), r = this._copyButton.buttonElement.dataset.defaultLabel ?? "copy to clipboard";
    this._copyButton.setDisabled(!0), this._copyButton.setLabel("copying…");
    try {
      await this._clipboardService.$copy(t, e), this._copyButton.setLabel("copied!");
    } catch (a) {
      console.error("[textmode-export] Failed to copy to clipboard", a), this._copyButton.setLabel("copy failed!");
    } finally {
      window.setTimeout(() => {
        this._copyButton.setLabel(r), this._copyButton.setDisabled(!1);
      }, 1200);
    }
  }
  _updateExportButton() {
    if (!this._currentBlade) return;
    const t = this._currentBlade.definition.format;
    if (t === "gif" && this._currentBlade.blade instanceof ut) {
      const r = this._currentBlade.blade, a = this._state.snapshot.gifProgress;
      if (r.isRecording()) if (this._exportButton.setDisabled(!0), a?.totalFrames) {
        const i = a.frameIndex ?? 0;
        this._exportButton.setLabel(`recording ${i}/${a.totalFrames}`);
      } else this._exportButton.setLabel("recording…");
      else this._exportButton.setDisabled(!1), this._exportButton.setLabel("start recording");
      return;
    }
    if (t === "video" && this._currentBlade.blade instanceof pt) {
      const r = this._currentBlade.blade, a = this._state.snapshot.videoProgress;
      if (r.isRecording()) if (this._exportButton.setDisabled(!0), a?.totalFrames) {
        const i = a.frameIndex ?? 0;
        this._exportButton.setLabel(`recording ${i}/${a.totalFrames} frames`);
      } else this._exportButton.setLabel("recording…");
      else this._exportButton.setDisabled(!1), this._exportButton.setLabel("start recording");
      return;
    }
    const e = this._state.snapshot.isBusy;
    this._exportButton.setDisabled(e), this._exportButton.setLabel(e ? "exporting…" : "download file");
  }
}
class Re {
  _listeners = /* @__PURE__ */ new Map();
  $on(t, e) {
    this._listeners.has(t) || this._listeners.set(t, /* @__PURE__ */ new Set());
    const r = this._listeners.get(t);
    return r.add(e), () => {
      r.delete(e), r.size === 0 && this._listeners.delete(t);
    };
  }
  $emit(t, e) {
    const r = this._listeners.get(t);
    if (r) for (const a of [...r]) try {
      a(e);
    } catch (i) {
      console.error("[textmode-export] Event handler failed", i);
    }
  }
  $clear() {
    this._listeners.clear();
  }
}
class Ue {
  _state;
  _listeners = /* @__PURE__ */ new Set();
  constructor(t) {
    this._state = t;
  }
  get snapshot() {
    return Object.freeze({ ...this._state });
  }
  $set(t) {
    this._state = Object.assign({}, this._state, t);
    const e = this.snapshot;
    for (const r of [...this._listeners]) try {
      r(e);
    } catch (a) {
      console.error("[textmode-export] State listener failed", a);
    }
  }
  $subscribe(t) {
    return this._listeners.add(t), t(this.snapshot), () => {
      this._listeners.delete(t);
    };
  }
  $reset(t) {
    this._state = t;
    const e = this.snapshot;
    for (const r of [...this._listeners]) r(e);
  }
}
const Ne = (s) => ({ format: s, isBusy: !1 });
class Gt extends T {
  props;
  checkbox;
  labelElement;
  handleChange = () => {
    this.props.defaultChecked = this.checkbox.checked;
  };
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    this.labelElement = document.createElement("label"), this.labelElement.classList.add(b.checkbox), this.checkbox = document.createElement("input"), this.checkbox.type = "checkbox", this.props.id && (this.checkbox.id = this.props.id), this.checkbox.checked = !!this.props.defaultChecked, this.checkbox.addEventListener("change", this.handleChange);
    const t = document.createElement("span");
    return t.textContent = this.props.label, this.labelElement.htmlFor = this.props.id ?? "", this.labelElement.appendChild(this.checkbox), this.labelElement.appendChild(t), this.labelElement;
  }
  get inputElement() {
    return this.checkbox;
  }
  get checked() {
    return this.checkbox.checked;
  }
  set checked(t) {
    this.checkbox.checked = t;
  }
  _onUnmount() {
    this.checkbox.removeEventListener("change", this.handleChange);
  }
  onUpdate(t) {
    this.props = t, t.id && (this.checkbox.id = t.id, this.labelElement.htmlFor = t.id), this.checkbox.checked = !!t.defaultChecked, this.labelElement.lastElementChild && (this.labelElement.lastElementChild.textContent = t.label);
  }
}
class Ge extends T {
  props;
  input;
  handleInput = () => {
    this.props.defaultValue = this.input.value;
  };
  constructor(t) {
    super(), this.props = t;
  }
  render() {
    return this.input = document.createElement("input"), this.input.type = "text", this.input.classList.add(b.input), this.props.id && (this.input.id = this.props.id), this.props.maxLength !== void 0 && (this.input.maxLength = this.props.maxLength), this.props.defaultValue !== void 0 && (this.input.value = this.props.defaultValue), this.input.addEventListener("input", this.handleInput), this.input;
  }
  get inputElement() {
    return this.input;
  }
  get value() {
    return this.input.value;
  }
  set value(t) {
    this.input.value = t;
  }
  _onUnmount() {
    this.input.removeEventListener("input", this.handleInput);
  }
  onUpdate(t) {
    this.props = t, t.id && (this.input.id = t.id), t.maxLength !== void 0 && (this.input.maxLength = t.maxLength), t.defaultValue !== void 0 && (this.input.value = t.defaultValue);
  }
}
class ze extends Y {
  trailingSpaces = this._manageComponent(new Gt({ label: "preserve trailing spaces", defaultChecked: !1 }));
  emptyCharacter = this._manageComponent(new Ge({ id: "textmode-export-empty-character", defaultValue: " ", maxLength: 1 }));
  constructor(t) {
    super(t);
  }
  render() {
    const t = document.createElement("div");
    t.classList.add(b.stack), this.trailingSpaces.mount(t);
    const e = new P({ label: "empty character", labelFor: "textmode-export-empty-character", variant: "full" });
    return e.mount(t), this.emptyCharacter.mount(e.root), t;
  }
  getOptions() {
    const t = this._config.defaultOptions ?? {}, e = this.emptyCharacter.value || t.emptyCharacter || " ";
    return { preserveTrailingSpaces: this.trailingSpaces.checked, emptyCharacter: e };
  }
  reset() {
    this.applyDefaults();
  }
  validate() {
    return this.emptyCharacter.value.length <= 1;
  }
  applyDefaults() {
    const t = this._config.defaultOptions ?? {};
    this.trailingSpaces.checked = t.preserveTrailingSpaces ?? !1, this.emptyCharacter.value = t.emptyCharacter ?? " ";
  }
}
class We extends Y {
  formatSelect = this._manageComponent(new mt({ id: "textmode-export-image-format", options: [{ value: "png", label: `PNG (${lt.png})` }, { value: "jpg", label: `JPG (${lt.jpg})` }, { value: "webp", label: `WEBP (${lt.webp})` }], defaultValue: "png" }));
  scaleInput = this._manageComponent(new G({ defaultValue: "1", attributes: { min: "0.1", step: "0.1" } }));
  constructor(t) {
    super(t);
  }
  render() {
    const t = document.createElement("div");
    t.classList.add(b.stack);
    const e = new j("row");
    e.mount(t);
    const r = new P({ label: "image format", labelFor: "textmode-export-image-format", variant: "compact" });
    r.mount(e.root), this.formatSelect.mount(r.root);
    const a = new P({ label: "scale", labelFor: "textmode-export-image-scale", variant: "dense" });
    return a.mount(e.root), this.scaleInput.mount(a.root), this.scaleInput.inputElement.id = "textmode-export-image-scale", t;
  }
  getOptions() {
    const t = Number.parseFloat(this.scaleInput.value);
    return { format: this.formatSelect.value, scale: Number.isFinite(t) ? t : this._config.defaultOptions?.scale ?? 1 };
  }
  reset() {
    this.applyDefaults(), this.scaleInput.refresh();
  }
  validate() {
    const t = Number.parseFloat(this.scaleInput.value);
    return Number.isFinite(t) && t > 0;
  }
  applyDefaults() {
    const t = this._config.defaultOptions ?? {};
    this.formatSelect.value = t.format ?? "png";
    const e = t.scale ?? 1;
    this.scaleInput.value = String(e);
  }
}
class qe extends Y {
  includeBackground = this._manageComponent(new Gt({ id: "textmode-export-svg-include-backgrounds", label: "include cell backgrounds", defaultChecked: !0 }));
  drawMode = this._manageComponent(new mt({ id: "textmode-export-svg-draw-mode", options: [{ value: "fill", label: "fill" }, { value: "stroke", label: "stroke" }], defaultValue: "fill" }));
  strokeWidth = this._manageComponent(new G({ defaultValue: "1", attributes: { min: "0", step: "0.1" } }));
  constructor(t) {
    super(t);
  }
  render() {
    const t = document.createElement("div");
    t.classList.add(b.stack), this.includeBackground.mount(t);
    const e = new j("row");
    e.mount(t);
    const r = new P({ label: "draw mode", labelFor: "textmode-export-svg-draw-mode", variant: "compact" });
    r.mount(e.root), this.drawMode.mount(r.root);
    const a = new P({ label: "stroke width", labelFor: "textmode-export-svg-stroke-width", variant: "compact" });
    return a.mount(e.root), this.strokeWidth.mount(a.root), this.strokeWidth.inputElement.id = "textmode-export-svg-stroke-width", this.drawMode.selectElement.addEventListener("change", () => this.updateStrokeControls()), this.updateStrokeControls(), t;
  }
  getOptions() {
    return { includeBackgroundRectangles: this.includeBackground.checked, drawMode: this.drawMode.value, strokeWidth: Number.parseFloat(this.strokeWidth.value) };
  }
  reset() {
    this.applyDefaults(), this.updateStrokeControls();
  }
  validate() {
    const t = Number.parseFloat(this.strokeWidth.value);
    return this.drawMode.value !== "stroke" || Number.isFinite(t) && t >= 0;
  }
  updateStrokeControls() {
    const t = this.drawMode.value === "stroke";
    this.strokeWidth.inputElement.disabled = !t, this.strokeWidth.refresh();
  }
  applyDefaults() {
    const t = this._config.defaultOptions ?? {};
    this.includeBackground.checked = t.includeBackgroundRectangles ?? !0, this.drawMode.value = t.drawMode ?? "fill";
    const e = t.strokeWidth ?? 1;
    this.strokeWidth.value = String(e), this.strokeWidth.refresh();
  }
}
const He = [{ format: "txt", label: "plain text (.txt)", supportsClipboard: !0, createBlade: () => new ze({ format: "txt", label: "plain text (.txt)", supportsClipboard: !0, defaultOptions: { preserveTrailingSpaces: !1, emptyCharacter: " " } }) }, { format: "image", label: "image (.png / .jpg / .webp)", supportsClipboard: !0, createBlade: () => new We({ format: "image", label: "image (.png / .jpg / .webp)", supportsClipboard: !0, defaultOptions: { format: "png", scale: 1 } }) }, { format: "svg", label: "vector (.svg)", supportsClipboard: !0, createBlade: () => new qe({ format: "svg", label: "vector (.svg)", supportsClipboard: !0, defaultOptions: { includeBackgroundRectangles: !0, drawMode: "fill", strokeWidth: 1 } }) }, { format: "gif", label: "animated GIF (.gif)", supportsClipboard: !1, createBlade: () => new ut({ format: "gif", label: "animated GIF (.gif)", supportsClipboard: !1, defaultOptions: { frameCount: 300, frameRate: 60, scale: 1, repeat: 0 } }) }, { format: "video", label: "video (.webm)", supportsClipboard: !1, createBlade: () => new pt({ format: "video", label: "video (.webm)", supportsClipboard: !1, defaultOptions: { frameCount: 480, frameRate: 60, quality: 0.7 } }) }];
function je() {
  return He;
}
function Qe(s, t) {
  const e = je(), r = e[0]?.format, a = new Ue(Ne(r)), i = new Re(), n = new Oe(s, t, a, i, e);
  return n.$mount(), n;
}
const Xe = (s = {}) => {
  const t = s.overlay ?? !0;
  let e;
  return { name: "textmode-export", version: "1.0.0", async install(r, a) {
    const i = { saveCanvas: async (n = {}) => new bt().$saveImage(r.canvas, n), copyCanvas: async (n = {}) => new bt().$copyImageToClipboard(r.canvas, n), saveSVG: (n = {}) => {
      new gt().$saveSVG(r, n);
    }, saveStrings: (n = {}) => {
      new vt().$saveTXT(r, n);
    }, toSVG: (n = {}) => new gt().$generateSVG(r, n), toString: (n = {}) => new vt().$generateTXT(r, n), saveGIF: async (n = {}) => new me(r, a.registerPostDrawHook).$saveGIF(n), saveWEBM: async (n = {}) => new Ce(r, a.registerPostDrawHook).$saveWEBM(n) };
    Object.assign(r, i), t && (e = Qe(r, i));
  }, async uninstall(r) {
    e?.$dispose(), e = void 0;
    const a = ["saveCanvas", "copyCanvas", "saveSVG", "saveStrings", "toSVG", "toString", "saveGIF", "saveWEBM"];
    for (const i of a) delete r[i];
  } };
};
typeof window < "u" && (window.createTextmodeExportPlugin = Xe);
export {
  Xe as createTextmodeExportPlugin
};

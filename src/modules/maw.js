// ===== THE MAW OF MEANING =====
// The crossing into the Archive of the Dead. The old party was eaten in Session 39 by the
// Consumer, whose face was a single maw, ringed and spiralling down into a dark that did not
// end, and which fed on every word and spell. Here the page goes the same way: its words come
// loose and spiral into a ringed throat that opens in the middle of the screen, the throat
// takes the whole screen, and the dark at the bottom of it opens onto the Archive.
// The maw is only the way in. Leaving the Archive, it crumbles to ash instead (ash.js).
//
// Every word on screen is drawn once into a texture in its own font and colour, then moved
// as a sprite on the graphics card; the page's real text is hidden while its sprite stands in.

import { GLSL_HEAD } from './portal.js';

// ---------- the Archive's door: a small maw ----------
// Uneven folds of the throat sink toward a dark middle inside a ring of crooked fangs. Hovered,
// it opens wider and the door's own letters lean in toward it. Drawn as a small SVG; the
// motion is CSS. (Inside the Archive the door is ash instead: see ash.js.)
const ICON_C = 20; // the drawing is 40 units across, centred here
const pt = (r, a) => `${(ICON_C + r * Math.cos(a)).toFixed(2)} ${(ICON_C + r * Math.sin(a)).toFixed(2)}`;

function seeded(seed) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
}

// A closed ring that wobbles like flesh rather than a drawn circle
function foldPath(rand, R) {
  const p1 = rand() * 6.28;
  const p2 = rand() * 6.28;
  const pts = [];
  for (let k = 0; k < 36; k++) {
    const a = (k / 36) * Math.PI * 2;
    pts.push(pt(R * (1 + 0.07 * Math.sin(3 * a + p1) + 0.04 * Math.sin(5 * a + p2)), a));
  }
  return `M${pts.join(' L')} Z`;
}

const MAW_ICON = (() => {
  const rand = seeded(39);
  const folds = Array.from({ length: 4 }, (_, i) => `<path class="maw-fold" style="--i:${i}" d="${foldPath(rand, 15.5)}"/>`).join('');
  // crooked fangs set in the lip, curved sides, each its own length and lean; two are missing
  let teeth = '';
  const n = 19;
  for (let k = 0; k < n; k++) {
    const jitter = rand();
    if (k === 5 || k === 13) continue;
    const a = ((k + (jitter - 0.5) * 0.35) / n) * Math.PI * 2;
    const half = (0.075 + 0.05 * rand());
    const tipR = 7.5 + rand() * 5;
    const lean = (rand() - 0.5) * 0.22;
    const b1 = pt(18.6, a - half);
    const b2 = pt(18.6, a + half);
    const tip = pt(tipR, a + lean);
    const c1 = pt((18.6 + tipR) / 2 + 0.8, a - half * 0.35 + lean * 0.5);
    const c2 = pt((18.6 + tipR) / 2 + 0.8, a + half * 0.35 + lean * 0.5);
    const shade = ['#d9ccb4', '#cbbb9f', '#e4d8c2', '#bba98d'][k % 4];
    teeth += `<path d="M${b1} Q${c1} ${tip} Q${c2} ${b2} Z" fill="${shade}"/>`;
  }
  const open = `<g class="maw-folds slow">${folds}</g><g class="maw-folds quick">${folds}</g>`
    + `<g class="maw-lip"><circle class="maw-gum" cx="20" cy="20" r="18.2"/><g class="maw-fangs">${teeth}</g></g>`;
  return open;
})();

export function mawIconHtml() {
  return `<span class="maw-icon" aria-hidden="true"><span class="maw-throat"></span>`
    + `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" focusable="false">${MAW_ICON}</svg></span>`;
}

const escapeText = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// A title split into letters, each pulled toward the maw by how near it sits to it
export function mawLettersHtml(text) {
  const count = text.replace(/\s/g, '').length || 1;
  let k = 0;
  const words = text.split(' ').map((word) => {
    const letters = [...word].map((ch) => {
      const pull = Math.pow(1 - k / count, 1.6);
      return `<span class="maw-ch" style="--k:${k++};--pull:${pull.toFixed(3)}">${escapeText(ch)}</span>`;
    }).join('');
    return `<span class="maw-word">${letters}</span>`;
  });
  return `<span class="maw-letters">${words.join(' ')}</span>`;
}

const MAX_WORDS = 1400;
const MIDPOINT = 0.70;
const SPIN = 2.4; // how far the words wind round on the way down (radians)

// The clock. The swallowing keeps its pace; past the switch the far side gets more room,
// and the change of pace is eased so nothing lurches at the midpoint.
const RATE_A = 1 / 4400; // progress per ms while the page is swallowed
const RATE_B = 1 / 6600; // ...and on the far side
const EASE_FROM = 2600;
const EASE_TO = 3400;
function progAt(ms) {
  if (ms <= EASE_FROM) return ms * RATE_A;
  const span = EASE_TO - EASE_FROM;
  if (ms <= EASE_TO) {
    const x = ms - EASE_FROM;
    return EASE_FROM * RATE_A + RATE_A * x + (0.5 * (RATE_B - RATE_A) * x * x) / span;
  }
  return EASE_FROM * RATE_A + 0.5 * (RATE_A + RATE_B) * span + RATE_B * (ms - EASE_TO);
}
const TOTAL_MS = EASE_TO + (1 - progAt(EASE_TO)) / RATE_B;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---------- reading the page ----------

function alphaOf(color) {
  const m = /rgba?\(([^)]+)\)/.exec(color || '');
  if (!m) return 1;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  return parts.length > 3 ? parseFloat(parts[3]) : 1;
}

// Titles filled with a gradient (gold) are painted by their background, not their colour,
// so hiding the colour doesn't hide them. Finds the element doing the painting, if any.
function painterFinder() {
  const cache = new Map();
  const find = (el) => {
    if (!el || el === document.body || el === document.documentElement) return null;
    if (cache.has(el)) return cache.get(el);
    const cs = getComputedStyle(el);
    const own = cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text';
    const hit = own ? el : find(el.parentElement);
    cache.set(el, hit);
    return hit;
  };
  return find;
}

function gradientColor(el) {
  const stops = (getComputedStyle(el).backgroundImage || '').match(/rgba?\([^)]+\)/g);
  return stops && stops.length ? stops[Math.floor((stops.length - 1) / 2)] : '#c9a24a';
}

function styleOf(el, clipEl) {
  const cs = getComputedStyle(el);
  let color = cs.webkitTextFillColor || cs.color;
  if (alphaOf(color) < 0.05) color = clipEl ? gradientColor(clipEl) : cs.color;
  if (alphaOf(color) < 0.05) color = '#c9a24a';
  return {
    font: `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`,
    color,
    spacing: cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing,
    transform: cs.textTransform,
  };
}

// Every word visible on screen, with its box, in reading order
export function collectWords(root) {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const shownCache = new Map();
  const shown = (el) => {
    if (!el || el === document.body || el === document.documentElement) return true;
    if (shownCache.has(el)) return shownCache.get(el);
    const cs = getComputedStyle(el);
    const ok = cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05 && shown(el.parentElement);
    shownCache.set(el, ok);
    return ok;
  };
  const clipCache = new Map();
  const clipOf = (el) => {
    if (!el || el === document.body || el === document.documentElement) return { l: 0, t: 0, r: W, b: H };
    if (clipCache.has(el)) return clipCache.get(el);
    const parent = clipOf(el.parentElement);
    const cs = getComputedStyle(el);
    let clip = parent;
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      const r = el.getBoundingClientRect();
      clip = { l: Math.max(parent.l, r.left), t: Math.max(parent.t, r.top), r: Math.min(parent.r, r.right), b: Math.min(parent.b, r.bottom) };
    }
    clipCache.set(el, clip);
    return clip;
  };
  const outside = (r, c) => r.right < c.l || r.left > c.r || r.bottom < c.t || r.top > c.b;
  const clipText = painterFinder();

  const styles = new Map();
  const words = [];
  words.painted = new Set(); // gradient titles, hidden separately while their words are away
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const text = n.nodeValue;
    if (!text || !text.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest('script, style, noscript, textarea, .portal-transition')) continue;
    range.selectNodeContents(n);
    const box = range.getBoundingClientRect();
    if (!box.width || !box.height || box.bottom < 0 || box.top > H || box.right < 0 || box.left > W) continue;
    if (!shown(el)) continue;
    const clip = clipOf(el);
    if (outside(box, clip)) continue;
    let st = styles.get(el);
    if (!st) {
      const painter = clipText(el);
      if (painter) words.painted.add(painter);
      st = styleOf(el, painter);
      styles.set(el, st);
    }
    const re = /\S+/g;
    let m;
    while ((m = re.exec(text))) {
      range.setStart(n, m.index);
      range.setEnd(n, m.index + m[0].length);
      const r = range.getClientRects()[0];
      if (!r || r.width < 0.5 || outside(r, clip) || r.bottom < 0 || r.top > H) continue;
      let word = m[0];
      if (st.transform === 'uppercase') word = word.toUpperCase();
      else if (st.transform === 'lowercase') word = word.toLowerCase();
      words.push({ text: word, x: r.left, y: r.top, w: r.width, h: r.height, st });
      if (words.length >= MAX_WORDS) return words;
    }
  }
  return words;
}

// Each word drawn once into one texture, in its own font and colour
export function buildAtlas(gl, words) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const maxSize = Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE), 4096);
  const PAD = 3;
  const order = words.map((_, i) => i).sort((a, b) => words[b].h - words[a].h);
  let scale = dpr;
  let width = 0;
  let height = 0;
  for (let attempt = 0; attempt < 6; attempt++) {
    width = Math.min(maxSize, 2048);
    let x = 0;
    let y = 0;
    let shelf = 0;
    let fits = true;
    for (const i of order) {
      const wd = words[i];
      const cw = Math.ceil(wd.w * scale) + PAD * 2;
      const ch = Math.ceil(wd.h * scale) + PAD * 2;
      if (x + cw > width) { x = 0; y += shelf; shelf = 0; }
      if (cw > width || y + ch > maxSize) { fits = false; break; }
      wd.cell = [x, y, cw, ch];
      x += cw;
      shelf = Math.max(shelf, ch);
    }
    height = y + shelf;
    if (fits) break;
    scale *= 0.7;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = Math.max(1, height);
  const g = canvas.getContext('2d');
  g.textBaseline = 'alphabetic';
  for (const wd of words) {
    if (!wd.cell) continue;
    const [cx, cy, , ch] = wd.cell;
    g.setTransform(scale, 0, 0, scale, cx + PAD, cy + PAD);
    g.font = wd.st.font;
    if ('letterSpacing' in g) g.letterSpacing = wd.st.spacing;
    g.fillStyle = wd.st.color;
    const mt = g.measureText(wd.text);
    const asc = mt.fontBoundingBoxAscent ?? mt.actualBoundingBoxAscent;
    const desc = mt.fontBoundingBoxDescent ?? mt.actualBoundingBoxDescent;
    const base = (wd.h - (asc + desc)) / 2 + asc;
    g.fillText(wd.text, 0, base);
    void ch;
  }

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  for (const wd of words) {
    if (!wd.cell) continue;
    const [cx, cy, cw, ch] = wd.cell;
    wd.uv = [cx / width, cy / canvas.height, (cx + cw) / width, (cy + ch) / canvas.height];
    wd.pad = PAD / scale;
  }
  return { tex, count: words.length };
}

// Where each word starts, when it lets go, and how fast it goes
export function planWords(words, W, H) {
  const cx = W / 2;
  const cy = H / 2;
  const rMax = Math.hypot(cx, cy);
  let seed = 7;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (const wd of words) {
    const x = wd.x + wd.w / 2 - cx;
    const y = wd.y + wd.h / 2 - cy;
    wd.r0 = Math.hypot(x, y);
    wd.th0 = Math.atan2(y, x);
    wd.spinK = 0.75 + rand() * 0.5;
    const near = wd.r0 / rMax;
    wd.delay = 0.04 + 0.28 * near + rand() * 0.06;
    wd.dur = 0.24 + rand() * 0.06;
  }
}

// Writes the six corners of every word's quad for this moment into `out`
export function wordQuads(words, prog, W, H, out) {
  const cx = W / 2;
  const cy = H / 2;
  let n = 0;
  for (const wd of words) {
    if (!wd.uv) continue;
    const u = clamp01((prog - wd.delay) / wd.dur);
    const e = Math.pow(u, 2.2);
    const r = wd.r0 * (1 - e);
    const th = wd.th0 + SPIN * wd.spinK * e * (1 + 1.4 * e);
    const lift = u < 0.12 ? Math.sin(Math.PI * u / 0.12) * 0.07 : 0;
    const scale = (1 - 0.88 * e) * (1 + lift);
    const rot = SPIN * wd.spinK * e * 1.1;
    const alpha = 1 - smooth(0.78, 1, u);
    const shade = 1 - 0.7 * e;
    if (alpha <= 0.002) continue;
    const px = cx + r * Math.cos(th);
    const py = cy + r * Math.sin(th);
    const hw = (wd.w / 2 + wd.pad) * scale;
    const hh = (wd.h / 2 + wd.pad) * scale;
    const c = Math.cos(rot);
    const s = Math.sin(rot);
    const [u0, v0, u1, v1] = wd.uv;
    const corner = (dx, dy, uu, vv) => {
      const x = px + dx * c - dy * s;
      const y = py + dx * s + dy * c;
      out[n++] = (x / W) * 2 - 1;
      out[n++] = 1 - (y / H) * 2;
      out[n++] = uu;
      out[n++] = vv;
      out[n++] = alpha;
      out[n++] = shade;
    };
    corner(-hw, -hh, u0, v0); corner(hw, -hh, u1, v0); corner(hw, hh, u1, v1);
    corner(-hw, -hh, u0, v0); corner(hw, hh, u1, v1); corner(-hw, hh, u0, v1);
  }
  return n / 6;
}

// ---------- the throat ----------

const VERT_FULL = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Premultiplied output: the canvas is composited as colour + page * (1 - alpha)
const MAW_FRAG = GLSL_HEAD + `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float d = length(p);
  float a = atan(p.y, p.x);

  float open = smoothstep(0.03, 0.46, uProg);
  float take = smoothstep(0.44, 0.68, uProg);
  float R = 0.33 * open + 1.6 * take * take;
  float lift = 0.0;
  if (uMode > 0.5) {
    // (mode 1, no longer used: the way back crumbles to ash, see ash.js)
    float closing = smoothstep(0.71, 0.93, uProg);
    R *= (1.0 - closing) * (1.0 - closing);
    lift = smoothstep(0.76, 1.0, uProg);
  }

  // into the Archive: we keep falling down the throat to its far end, which opens onto the
  // Archive. The fall is measured in the throat's own rings, so walls and opening move as one.
  float fall = 0.0;
  float exitR = 0.0;
  if (uMode < 0.5) {
    fall = 5.3 * smoothstep(0.60, 0.97, uProg);
    exitR = 0.008 * exp(fall);
  }

  vec2 dir = p / max(d, 1e-4);

  // the lip: ragged, and it breathes (noise sampled round a circle so it wraps cleanly)
  float lip = R * (1.0 + (fbm(dir * 1.3 + vec2(t * 0.25, 3.0)) - 0.5) * 0.40 + (fbm(dir * 4.0 + vec2(-t * 0.5, 7.0)) - 0.5) * 0.10);
  float inside = smoothstep(lip + 0.006, lip - 0.006, d) * step(0.0005, R);

  // folds of the throat, ring under ring, spiralling down without end
  float lr = log(max(d, 1e-4) / max(lip, 1e-4));
  float lw = lr - fall; // the walls rush past as we fall
  float wob = (fbm(dir * 1.8 + vec2(lw * 1.4 - t * 0.7, 1.0)) - 0.5) * 1.3;
  float phase = lw * 3.6 - t * 1.3 + a / 6.2831 * 2.0 + wob;
  float wave = sin(phase * 6.2831);
  float slope = cos(phase * 6.2831);
  float fold = pow(0.5 + 0.5 * wave, 1.6);
  float depth = exp(lr * 1.05);
  float grainF = fbm(dir * 6.0 + vec2(lw * 6.0 - t * 1.3, 2.0));
  // lit from above: the face of each fold that turns up catches the light
  float facing = max(0.0, slope * dot(dir, vec2(0.0, 1.0)) * -1.0) + max(0.0, -slope) * 0.25;
  vec3 dark = vec3(0.055, 0.030, 0.032);
  vec3 lit = vec3(0.40, 0.25, 0.23);
  vec3 wall = dark + lit * (fold * 0.45 + facing * 0.9) * (0.7 + 0.6 * grainF);
  wall += vec3(0.60, 0.50, 0.46) * pow(max(0.0, slope * -dir.y), 12.0) * fold * 0.6;   // wet sheen on the lit edges
  // teeth set along the first folds below the lip
  // a ring of narrow fangs round the lip, pointing down the throat
  float k = clamp(-lr / 0.30, 0.0, 1.0);
  float row = a * 46.0 / 6.2831 + t * 0.05;
  float jitter = hash(vec2(floor(row), 3.0));
  float tw = abs(fract(row) - 0.5) * 2.0;
  float fang = step(tw, (1.0 - k) * (0.55 + 0.35 * jitter)) * step(k * (0.7 + 0.5 * jitter), 1.0) * step(0.001, k);
  float fangLit = 0.55 + 0.45 * max(0.0, -dir.y) + 0.25 * (1.0 - tw);
  wall = mix(wall, vec3(0.62, 0.57, 0.49) * fangLit * (0.75 + 0.4 * grainF), fang * 0.92);
  // a dark rim of flesh at the lip itself
  wall *= 0.35 + 0.65 * smoothstep(-0.02, -0.12, lr);
  vec3 throat = wall * depth;
  float inA = 1.0;

  if (uMode < 0.5) {
    float er = exitR * (1.0 + (fbm(dir * 1.5 + vec2(t * 0.2, 9.0)) - 0.5) * 0.22);
    float le = log(max(d, 1e-4) / max(er, 1e-4)); // above 0 on the walls, below 0 in the opening
    // a cold light comes up out of the opening onto the last folds
    float glow = exp(-max(le, 0.0) * 1.7) * smoothstep(0.60, 0.70, uProg);
    throat += vec3(0.24, 0.25, 0.28) * glow * (0.25 + 0.9 * fold) * (0.7 + 0.6 * grainF);
    // the far end: flesh drawn tight round the opening, lit from below...
    float rim = smoothstep(-0.01, 0.05, le) * (1.0 - smoothstep(0.06, 0.30, le));
    vec3 rimCol = mix(vec3(0.17, 0.08, 0.08), vec3(0.40, 0.34, 0.34), glow) * (0.7 + 0.5 * grainF) * (0.6 + 0.4 * fold);
    throat = mix(throat, rimCol, rim * 0.85);
    // ...with narrow teeth set in it, uneven, hanging over the drop
    float kE = (le + 0.10) / 0.30; // 0 at the tips, 1 at the roots
    float rowE = a * 70.0 / 6.2831 - t * 0.04 + 0.5;
    float jE = hash(vec2(floor(rowE), 11.0));
    float jB = hash(vec2(floor(rowE), 23.0));
    float shortBy = jE * 0.55;
    float kk = clamp((kE - shortBy) / (1.0 - shortBy), 0.0, 1.0);
    // tips lean to one side or the other; a few are broken off or missing
    float twE = abs(fract(rowE + (jB - 0.5) * 0.7 * (1.0 - kk)) - 0.5) * 2.0;
    float wTooth = kk * (0.30 + 0.36 * jE) * step(0.14, jB);
    float fangE = (1.0 - smoothstep(wTooth - 0.05, wTooth + 0.05, twE)) * step(0.001, kk) * step(kE, 1.0);
    vec3 tooth = mix(vec3(0.16, 0.10, 0.09), vec3(0.58, 0.55, 0.50), pow(1.0 - kk, 0.8));
    tooth *= (0.55 + 0.55 * glow) * (0.85 + 0.3 * (1.0 - twE)) * (0.85 + 0.3 * grainF);
    throat = mix(throat, tooth, fangE * 0.95);
    // the opening: cold grey mist at first, then the Archive itself as we drop through
    float hole = (1.0 - smoothstep(-0.015, 0.015, le)) * (1.0 - fangE);
    float opened = smoothstep(0.705, 0.76, uProg);
    float clear = smoothstep(0.74, 0.97, uProg);
    float mist = 0.45 + 0.55 * fbm(p * 2.6 + vec2(t * 0.12, -t * 0.08));
    float holeA = mix(1.0, 0.78 * mist * (1.0 - clear), opened);
    vec3 mistCol = vec3(0.30, 0.31, 0.34) * (0.8 + 0.4 * mist);
    throat = mix(throat, mistCol * holeA, hole);
    inA = mix(1.0, holeA, hole);
  }

  // the page darkens round the lip, as if pulled in
  float around = exp(-max(d - lip, 0.0) * 2.4) * open * 0.80 + smoothstep(0.0, 0.35, uProg) * 0.22;
  float outsideA = clamp(around, 0.0, 0.92);
  if (uMode > 0.5) {
    // back among the living, the dark comes off the page in wisps
    float wisp = fbm(p * 2.4 - dir * lift * 0.9 + vec2(t * 0.1, 4.0));
    float lo = -0.30 + 1.25 * lift;
    outsideA *= smoothstep(lo, lo + 0.30, wisp);
  }

  float A = mix(outsideA, inA, inside);
  vec3 P = throat * inside;

  if (uMode < 0.5) {
    float endF = 1.0 - smoothstep(0.955, 1.0, uProg);
    P *= endF;
    A *= endF;
  }

  float grain = (hash(gl_FragCoord.xy + fract(t * 7.0) * 100.0) - 0.5) * 0.025;
  P = max(P + grain * A, 0.0);
  gl_FragColor = vec4(min(P, vec3(A)), A);
}`;

export const VERT_SPRITE = `
attribute vec2 aPos;
attribute vec2 aUv;
attribute vec2 aFx;
varying vec2 vUv;
varying vec2 vFx;
void main() { vUv = aUv; vFx = aFx; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const FRAG_SPRITE = `
precision mediump float;
uniform sampler2D uAtlas;
varying vec2 vUv;
varying vec2 vFx;
void main() {
  vec4 c = texture2D(uAtlas, vUv);
  gl_FragColor = vec4(c.rgb * vFx.y, c.a) * vFx.x;
}`;

export function compileProgram(gl, vs, fs) {
  const make = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, make(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, make(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  return prog;
}

// The whole renderer: the throat plus the words, for one canvas
function makeRenderer(canvas, keep = false) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: true, preserveDrawingBuffer: keep });
  if (!gl) return null;
  const maw = compileProgram(gl, VERT_FULL, MAW_FRAG);
  const spr = compileProgram(gl, VERT_SPRITE, FRAG_SPRITE);
  const full = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, full);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const quads = gl.createBuffer();
  const mu = (n) => gl.getUniformLocation(maw, n);
  const U = { res: mu('uRes'), time: mu('uTime'), prog: mu('uProg'), mode: mu('uMode') };
  const loc = {
    mawPos: gl.getAttribLocation(maw, 'aPos'),
    pos: gl.getAttribLocation(spr, 'aPos'),
    uv: gl.getAttribLocation(spr, 'aUv'),
    fx: gl.getAttribLocation(spr, 'aFx'),
    atlas: gl.getUniformLocation(spr, 'uAtlas'),
  };
  let verts = new Float32Array(6 * 6 * 64);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  return {
    gl,
    draw(prog, time, mode, layers, W, H) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(maw);
      gl.bindBuffer(gl.ARRAY_BUFFER, full);
      gl.enableVertexAttribArray(loc.mawPos);
      gl.vertexAttribPointer(loc.mawPos, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, time);
      gl.uniform1f(U.prog, prog);
      gl.uniform1f(U.mode, mode);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(loc.mawPos);

      gl.useProgram(spr);
      gl.bindBuffer(gl.ARRAY_BUFFER, quads);
      gl.enableVertexAttribArray(loc.pos);
      gl.enableVertexAttribArray(loc.uv);
      gl.enableVertexAttribArray(loc.fx);
      gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 24, 0);
      gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 24, 8);
      gl.vertexAttribPointer(loc.fx, 2, gl.FLOAT, false, 24, 16);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(loc.atlas, 0);
      for (const layer of layers) {
        const need = layer.words.length * 36;
        if (verts.length < need) verts = new Float32Array(need);
        const count = wordQuads(layer.words, prog, W, H, verts);
        if (!count) continue;
        gl.bindTexture(gl.TEXTURE_2D, layer.atlas.tex);
        gl.bufferData(gl.ARRAY_BUFFER, verts.subarray(0, count * 6), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, count);
      }
      gl.disableVertexAttribArray(loc.pos);
      gl.disableVertexAttribArray(loc.uv);
      gl.disableVertexAttribArray(loc.fx);
    },
  };
}

export function pageRoot() {
  return document.querySelector('.app') || document.body;
}

// The first time a device compiles these shaders it can stall the click by a tenth of a second
// or more; compiling them once ahead of time (in a throwaway context) lets the browser reuse them.
let mawWarm = false;
export function warmMaw() {
  if (mawWarm) return;
  mawWarm = true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const r = makeRenderer(canvas);
    if (!r) return;
    r.draw(0.5, 0, 0, [], 4, 4);
    r.gl.finish();
    const lose = r.gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  } catch { /* nothing to warm */ }
}

// mode 0: into the Archive; mode 1: back to the living. Returns false if the device can't.
export function playMaw(mode, onMidpoint) {
  const canvas = document.createElement('canvas');
  let r = null;
  try { r = makeRenderer(canvas); } catch (err) { console.warn('Maw unavailable:', err); }
  if (!r) return false;

  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const root = document.documentElement;

  // While the crossing runs, nothing on the page fades its colours (the site eases colour
  // changes, which made the text blink out and back when the sprites handed over to it)
  root.classList.add('maw-still');

  const eaten = collectWords(pageRoot());
  planWords(eaten, W, H);
  const layers = [{ words: eaten, atlas: buildAtlas(r.gl, eaten) }];

  const overlay = document.createElement('div');
  overlay.className = 'portal-transition portal-gl maw-transition';
  overlay.appendChild(canvas);
  // the words are pinned where they were read, so the page mustn't scroll under them
  const pin = (e) => e.preventDefault();
  overlay.addEventListener('wheel', pin, { passive: false });
  overlay.addEventListener('touchmove', pin, { passive: false });
  document.body.appendChild(overlay);

  const marked = [];
  const hidePainted = (words) => {
    for (const el of words.painted) { el.setAttribute('data-maw-hidden', ''); marked.push(el); }
  };
  let frames = 0;
  let unstillAt = 0;
  const showText = () => {
    root.classList.remove('maw-hide-text');
    for (const el of marked) el.removeAttribute('data-maw-hidden');
    marked.length = 0;
    unstillAt = frames + 3; // let the text come back with transitions still off
  };

  // the sprites take the words' places in the same frame the page's own text goes
  r.draw(0, 0, mode, layers, W, H);
  root.classList.add('maw-hide-text');
  hidePainted(eaten);

  let fired = false;
  let start = null;
  const slow = (import.meta.env && import.meta.env.DEV && window.__mawSlow) || 1;
  if (import.meta.env && import.meta.env.DEV) window.__mawLast = { mode, layers };
  const finish = () => {
    showText();
    root.classList.remove('maw-still');
    overlay.remove();
  };
  const frame = (now) => {
    if (start === null) start = now;
    const elapsed = (now - start) / slow;
    const prog = Math.min(1, progAt(elapsed));

    frames++;
    if (unstillAt && frames >= unstillAt) { root.classList.remove('maw-still'); unstillAt = 0; }
    if (!fired && prog >= MIDPOINT) {
      fired = true;
      try { if (onMidpoint) onMidpoint(); } catch (err) { console.error(err); }
      // the far side is whole under the throat; it shows as the throat opens or draws back
      showText();
    }
    r.draw(prog, elapsed / 1000, mode, layers, W, H);
    if (prog < 1) requestAnimationFrame(frame);
    else finish();
  };
  requestAnimationFrame(frame);
  return true;
}

// Dev only: one frame of the maw over a rough copy of the page (background, pictures, the
// words as sprites), returned as a canvas to judge the look while the window is hidden.
if (import.meta.env && import.meta.env.DEV) {
  let still = null;
  window.__mawStill = (prog, mode = 0) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (!still || still.W !== W || still.H !== H) {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const r = makeRenderer(canvas, true);
      const words = collectWords(pageRoot());
      planWords(words, W, H);
      const atlas = buildAtlas(r.gl, words);
      still = { W, H, canvas, r, words, atlas };
    }
    const { canvas, r, words, atlas } = still;
    const layers = [{ words, atlas }];
    r.draw(prog, prog * TOTAL_MS / 1000, mode, layers, W, H);

    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const g = out.getContext('2d');
    g.fillStyle = getComputedStyle(document.body).backgroundColor || '#0a0a12';
    g.fillRect(0, 0, W, H);
    for (const img of document.querySelectorAll('.app img')) {
      const b = img.getBoundingClientRect();
      if (b.width < 2 || b.bottom < 0 || b.top > H || !img.complete) continue;
      try { g.drawImage(img, b.left, b.top, b.width, b.height); } catch { /* not drawable */ }
    }
    g.drawImage(canvas, 0, 0);
    return out;
  };
}

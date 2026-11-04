// ===== THE ARCHIVE CRUMBLES =====
// Leaving the Archive of the Dead. Ash falls on the Archive page and settles until the page is
// a slab of grey ash with its words pressed into it. Then the slab cracks and crumbles away from
// the left, flake by flake, blowing off on the wind as ash, and the living page is underneath.
// (The maw is only the way in: that is how the old party died. Nobody leaves through it.)
//
// The page's words are drawn once into a texture, in their own fonts and colours, and the
// slab carries them: they grey as the ash covers them and go with the flake they sit on.

import { GLSL_HEAD } from './portal.js';
import { collectWords, buildAtlas, planWords, wordQuads, compileProgram, pageRoot, VERT_SPRITE, FRAG_SPRITE } from './maw.js';

const DURATION = 4400;
const MIDPOINT = 0.44; // the slab is whole here: the page underneath changes
const FALLING = 220; // ash coming down onto the page
const BLOWN = 700; // ash blowing off it

const VERT_FULL = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

// Premultiplied output: the canvas is composited as colour + page * (1 - alpha)
const ASH_FRAG = GLSL_HEAD + `
uniform sampler2D uWords;
const float S = 0.06;    // a flake, roughly, in screen heights
const float LIFE = 0.17; // how long a flake takes to crumble away

// the crust cracks into uneven pieces, like dried ash: each piece grows from a seed
vec2 seedOf(vec2 c) { return (c + 0.12 + 0.76 * vec2(hash(c), hash(c + 17.3))) * S; }
// the piece q is in, and how far q is from that piece's edge (0 on a crack)
vec3 pieceAt(vec2 q) {
  vec2 base = floor(q / S);
  float d1 = 1e9;
  float d2 = 1e9;
  vec2 best = base;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 c = base + vec2(float(x), float(y));
      float d = length(q - seedOf(c));
      if (d < d1) { d2 = d1; d1 = d; best = c; }
      else if (d < d2) { d2 = d; }
    }
  }
  return vec3(best, (d2 - d1) / S);
}
// pieces go from the left (the side the door is on), the top a touch sooner; never before the switch
float releaseAt(vec2 c) {
  vec2 at = seedOf(c);
  return 0.47 + 0.24 * clamp(at.x / (uRes.x / uRes.y), 0.0, 1.0) + hash(c + 5.1) * 0.09 + (1.0 - clamp(at.y, 0.0, 1.0)) * 0.03;
}

void main() {
  vec2 p = gl_FragCoord.xy / uRes.y;

  // ash settling on the page: a dusting that thickens to a crust
  float cov = 1.0;
  if (uProg < 0.42) {
    float settle = smoothstep(0.03, 0.40, uProg);
    float dust = fbm(p * 4.0 + vec2(1.7, 3.1));
    cov = clamp(settle * 1.8 - 0.3 + (dust - 0.5) * 0.9, 0.0, 1.0);
  }

  // the piece of crust here, with ragged edges
  vec2 rough = (vec2(noise(p * 26.0), noise(p * 26.0 + 9.7)) - 0.5) * S * 0.22;
  vec3 pc = pieceAt(p + rough);
  vec2 cell = pc.xy;
  float edge = pc.z;
  float rel = releaseAt(cell);
  float age = max(0.0, (uProg - rel) / LIFE);
  float soon = smoothstep(rel - 0.14, rel, uProg);

  // a loose piece doesn't shrink as one: it falls apart into grains, from its cracks inward
  float grains = noise(p * 95.0) * 0.55 + noise(p * 38.0) * 0.45;
  float hold = edge * 1.5 + grains * 0.95;
  float gone = age * 2.7 - 0.25;
  float flake = age > 0.0 ? smoothstep(gone, gone + 0.10, hold) : 1.0;

  // the ash: dark grey, grained, flecked pale; once cracked each piece shows its own shade, and
  // it pales as it dries out
  float grain = noise(p * 22.0) * 0.6 + noise(p * 55.0) * 0.4;
  vec3 ash = vec3(0.22, 0.212, 0.203) * (0.80 + 0.40 * grain) * mix(1.0, 0.86 + 0.28 * hash(cell + 3.1), soon);
  ash += vec3(0.09) * step(0.92, noise(p * 140.0));
  ash = mix(ash, vec3(0.36, 0.35, 0.34), smoothstep(0.0, 0.6, age) * 0.55);
  float crack = (1.0 - smoothstep(0.0, 0.07, edge)) * soon;
  ash *= 1.0 - 0.7 * crack;

  // the words are in the crust: their own colour until the ash takes them, then pressed grey
  vec4 w = texture2D(uWords, gl_FragCoord.xy / uRes);
  float lum = dot(w.rgb / max(w.a, 0.001), vec3(0.3, 0.59, 0.11));
  vec3 pressed = vec3(0.47, 0.46, 0.44) * (0.65 + 0.45 * lum) * w.a;
  vec3 word = mix(w.rgb, pressed, cov);

  vec3 P = word + ash * cov * (1.0 - w.a);
  float A = w.a + cov * (1.0 - w.a);
  float k = flake * (1.0 - smoothstep(0.97, 1.0, uProg));
  P *= k;
  A *= k;
  gl_FragColor = vec4(min(P, vec3(A)), A);
}`;

const MOTE_VERT = `
attribute vec2 aPos;
attribute vec2 aFx;
varying float vA;
void main() { vA = aFx.y; gl_Position = vec4(aPos, 0.0, 1.0); gl_PointSize = aFx.x; }`;

const MOTE_FRAG = `
precision mediump float;
varying float vA;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.12, 0.5, d)) * vA;
  gl_FragColor = vec4(vec3(0.70, 0.68, 0.64) * a, a);
}`;

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };

// The loose ash: some comes down onto the page, more blows off it as the flakes go
function planMotes(W, H) {
  let seed = 11;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const motes = [];
  for (let i = 0; i < FALLING; i++) {
    motes.push({
      fall: true, x: rand() * W * 1.1 - W * 0.05, y: rand() * H * 0.9 - H * 0.1,
      t0: rand() * 0.30, life: 0.10 + rand() * 0.12, size: 1.1 + rand() * 1.6,
      vx: (0.02 + rand() * 0.05) * W, vy: (0.5 + rand() * 0.9) * H, peak: 0.35 + rand() * 0.45, ph: rand() * 6.28,
    });
  }
  for (let i = 0; i < BLOWN; i++) {
    const x = rand() * W;
    const y = rand() * H;
    motes.push({
      fall: false, x, y,
      t0: 0.47 + 0.24 * (x / W) + rand() * 0.09 + (y / H) * 0.03 + 0.03 + rand() * 0.04,
      life: 0.10 + rand() * 0.14, size: 1.3 + rand() * 2.8,
      vx: (0.9 + rand() * 1.6) * W, vy: (0.2 + rand() * 0.6) * H, peak: 0.45 + rand() * 0.5, ph: rand() * 6.28,
    });
  }
  return motes;
}

function moteVerts(motes, prog, W, H, dpr, out) {
  let n = 0;
  for (const m of motes) {
    const u = (prog - m.t0) / m.life;
    if (u <= 0 || u >= 1) continue;
    const age = prog - m.t0;
    let x;
    let y;
    if (m.fall) {
      x = m.x + m.vx * age + Math.sin(m.ph + age * 40) * 3;
      y = m.y + m.vy * age;
    } else {
      // picked up by the wind: off to the right, a little down, tumbling
      x = m.x + m.vx * age * age * 2.2 + Math.sin(m.ph + age * 55) * 4;
      y = m.y + m.vy * age * age * 1.5 - Math.cos(m.ph + age * 30) * 3;
    }
    const a = smooth(0, 0.15, u) * (1 - smooth(0.45, 1, u)) * m.peak;
    out[n++] = (x / W) * 2 - 1;
    out[n++] = 1 - (y / H) * 2;
    out[n++] = m.size * dpr;
    out[n++] = a;
  }
  return n / 4;
}

function makeAshRenderer(canvas, keep = false) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, preserveDrawingBuffer: keep });
  if (!gl) return null;
  const ash = compileProgram(gl, VERT_FULL, ASH_FRAG);
  const spr = compileProgram(gl, VERT_SPRITE, FRAG_SPRITE);
  const mote = compileProgram(gl, MOTE_VERT, MOTE_FRAG);
  const full = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, full);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const dyn = gl.createBuffer();
  const U = {
    res: gl.getUniformLocation(ash, 'uRes'),
    time: gl.getUniformLocation(ash, 'uTime'),
    prog: gl.getUniformLocation(ash, 'uProg'),
    words: gl.getUniformLocation(ash, 'uWords'),
    atlas: gl.getUniformLocation(spr, 'uAtlas'),
  };
  const L = {
    ashPos: gl.getAttribLocation(ash, 'aPos'),
    sPos: gl.getAttribLocation(spr, 'aPos'),
    sUv: gl.getAttribLocation(spr, 'aUv'),
    sFx: gl.getAttribLocation(spr, 'aFx'),
    mPos: gl.getAttribLocation(mote, 'aPos'),
    mFx: gl.getAttribLocation(mote, 'aFx'),
  };

  // the words, baked once into a screen-sized texture
  const wordsTex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, wordsTex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, wordsTex, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  let verts = new Float32Array(4 * (FALLING + BLOWN));

  return {
    gl,
    bakeWords(words, atlas, W, H) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const quad = new Float32Array(Math.max(36, words.length * 36));
      const count = wordQuads(words, 0, W, H, quad);
      if (count) {
        gl.useProgram(spr);
        gl.bindBuffer(gl.ARRAY_BUFFER, dyn);
        gl.bufferData(gl.ARRAY_BUFFER, quad.subarray(0, count * 6), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(L.sPos);
        gl.enableVertexAttribArray(L.sUv);
        gl.enableVertexAttribArray(L.sFx);
        gl.vertexAttribPointer(L.sPos, 2, gl.FLOAT, false, 24, 0);
        gl.vertexAttribPointer(L.sUv, 2, gl.FLOAT, false, 24, 8);
        gl.vertexAttribPointer(L.sFx, 2, gl.FLOAT, false, 24, 16);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, atlas.tex);
        gl.uniform1i(U.atlas, 0);
        gl.drawArrays(gl.TRIANGLES, 0, count);
        gl.disableVertexAttribArray(L.sPos);
        gl.disableVertexAttribArray(L.sUv);
        gl.disableVertexAttribArray(L.sFx);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    },
    draw(prog, time, motes, W, H, dpr) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(ash);
      gl.bindBuffer(gl.ARRAY_BUFFER, full);
      gl.enableVertexAttribArray(L.ashPos);
      gl.vertexAttribPointer(L.ashPos, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, wordsTex);
      gl.uniform1i(U.words, 0);
      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, time);
      gl.uniform1f(U.prog, prog);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(L.ashPos);

      const count = moteVerts(motes, prog, W, H, dpr, verts);
      if (count) {
        gl.useProgram(mote);
        gl.bindBuffer(gl.ARRAY_BUFFER, dyn);
        gl.bufferData(gl.ARRAY_BUFFER, verts.subarray(0, count * 4), gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(L.mPos);
        gl.enableVertexAttribArray(L.mFx);
        gl.vertexAttribPointer(L.mPos, 2, gl.FLOAT, false, 16, 0);
        gl.vertexAttribPointer(L.mFx, 2, gl.FLOAT, false, 16, 8);
        gl.drawArrays(gl.POINTS, 0, count);
        gl.disableVertexAttribArray(L.mPos);
        gl.disableVertexAttribArray(L.mFx);
      }
    },
  };
}

// ---------- the way back, on the door: a disc of ash coming apart ----------
// A disc of grey ash cracked into uneven pieces; the ones on the right are loose and drift off
// when hovered, and a few motes blow away from it all the time.
const ASH_ICON = (() => {
  let seed = 65;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // the disc, with a ragged rim
  const rim = [];
  for (let k = 0; k < 28; k++) {
    const a = (k / 28) * Math.PI * 2;
    const r = 15.4 + (rand() - 0.5) * 1.6;
    rim.push([20 + r * Math.cos(a), 20 + r * Math.sin(a)]);
  }
  // crack it into uneven pieces: each piece is the part of the disc nearest its own seed
  const seeds = [];
  while (seeds.length < 10) {
    const p = [20 + (rand() - 0.5) * 30, 20 + (rand() - 0.5) * 30];
    if (Math.hypot(p[0] - 20, p[1] - 20) > 14) continue;
    if (seeds.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 5.2)) continue;
    seeds.push(p);
  }
  const clip = (poly, si, sj) => {
    const mx = (si[0] + sj[0]) / 2;
    const my = (si[1] + sj[1]) / 2;
    const nx = sj[0] - si[0];
    const ny = sj[1] - si[1];
    const side = (p) => (p[0] - mx) * nx + (p[1] - my) * ny; // <= 0 is si's side
    const out = [];
    for (let k = 0; k < poly.length; k++) {
      const a = poly[k];
      const b = poly[(k + 1) % poly.length];
      const sa = side(a);
      const sb = side(b);
      if (sa <= 0) out.push(a);
      if ((sa <= 0) !== (sb <= 0)) {
        const t = sa / (sa - sb);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      }
    }
    return out;
  };
  const greys = ['#6f6a63', '#5f5b56', '#7b766f', '#66625c', '#57534e', '#74706a', '#625e58'];
  let out = '';
  seeds.forEach((si, i) => {
    let poly = rim;
    seeds.forEach((sj, j) => { if (j !== i) poly = clip(poly, si, sj); });
    if (poly.length < 3) return;
    const cx = poly.reduce((t, p) => t + p[0], 0) / poly.length;
    const cy = poly.reduce((t, p) => t + p[1], 0) / poly.length;
    // pull each piece in a little so the cracks between them show
    const pts = poly.map(([x, y]) => {
      const dx = cx - x;
      const dy = cy - y;
      const d = Math.hypot(dx, dy) || 1;
      return `${(x + (dx / d) * 0.55).toFixed(2)} ${(y + (dy / d) * 0.55).toFixed(2)}`;
    });
    const facing = (cx - 20) / 15; // the pieces on the right are loose, the wind takes them
    const loose = facing > 0.25;
    out += `<path class="ash-piece${loose ? ' loose' : ''}" style="--d:${facing.toFixed(2)}" fill="${greys[i % greys.length]}" d="M${pts.join(' L')} Z"/>`;
  });
  for (let i = 0; i < 4; i++) {
    out += `<circle class="ash-mote" style="--i:${i}" cx="${(33 + rand() * 3).toFixed(1)}" cy="${(13 + rand() * 14).toFixed(1)}" r="${(0.8 + rand() * 0.6).toFixed(2)}"/>`;
  }
  return out;
})();

export function ashIconHtml() {
  return `<span class="ash-icon" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" focusable="false">${ASH_ICON}</svg></span>`;
}

// The first time a device compiles these shaders it can stall the click by a tenth of a second
// or more; compiling them once ahead of time (in a throwaway context) lets the browser reuse them.
let ashWarm = false;
export function warmAsh() {
  if (ashWarm) return;
  ashWarm = true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 4;
    canvas.height = 4;
    const r = makeAshRenderer(canvas);
    if (!r) return;
    r.draw(0.6, 0, [], 4, 4, 1);
    r.gl.finish();
    const lose = r.gl.getExtension('WEBGL_lose_context');
    if (lose) lose.loseContext();
  } catch { /* nothing to warm */ }
}

// Back to the living from the Archive. Returns false if the device can't.
export function playAsh(onMidpoint) {
  const canvas = document.createElement('canvas');
  let r = null;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  try { r = makeAshRenderer(canvas); } catch (err) { console.warn('Ash unavailable:', err); }
  if (!r) return false;
  const root = document.documentElement;

  // nothing on the page fades its colours while the crossing stands in for its words
  root.classList.add('maw-still');
  const words = collectWords(pageRoot());
  planWords(words, W, H);
  r.bakeWords(words, buildAtlas(r.gl, words), W, H);
  const motes = planMotes(W, H);

  const overlay = document.createElement('div');
  overlay.className = 'portal-transition portal-gl ash-transition';
  overlay.appendChild(canvas);
  const pin = (e) => e.preventDefault();
  overlay.addEventListener('wheel', pin, { passive: false });
  overlay.addEventListener('touchmove', pin, { passive: false });
  document.body.appendChild(overlay);

  const marked = [];
  let frames = 0;
  let unstillAt = 0;
  const showText = () => {
    root.classList.remove('maw-hide-text');
    for (const el of marked) el.removeAttribute('data-maw-hidden');
    marked.length = 0;
    unstillAt = frames + 3;
  };

  // the baked words take the page's place in the same frame its own text goes
  r.draw(0, 0, motes, W, H, dpr);
  root.classList.add('maw-hide-text');
  for (const el of words.painted) { el.setAttribute('data-maw-hidden', ''); marked.push(el); }

  let fired = false;
  let start = null;
  const slow = (import.meta.env && import.meta.env.DEV && window.__mawSlow) || 1;
  const finish = () => {
    showText();
    root.classList.remove('maw-still');
    overlay.remove();
  };
  const frame = (now) => {
    if (start === null) start = now;
    const elapsed = (now - start) / slow;
    const prog = Math.min(1, elapsed / DURATION);
    frames++;
    if (unstillAt && frames >= unstillAt) { root.classList.remove('maw-still'); unstillAt = 0; }
    if (!fired && prog >= MIDPOINT) {
      fired = true;
      try { if (onMidpoint) onMidpoint(); } catch (err) { console.error(err); }
      showText(); // the living page is whole under the slab, and shows as the flakes go
    }
    r.draw(prog, elapsed / 1000, motes, W, H, dpr);
    if (prog < 1) requestAnimationFrame(frame);
    else finish();
  };
  requestAnimationFrame(frame);
  return true;
}

// Dev only: one frame over a rough copy of the page (background, pictures), to judge the look
// while the window is hidden.
if (import.meta.env && import.meta.env.DEV) {
  let still = null;
  window.__ashStill = (prog) => {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (!still || still.W !== W || still.H !== H) {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const r = makeAshRenderer(canvas, true);
      const words = collectWords(pageRoot());
      planWords(words, W, H);
      r.bakeWords(words, buildAtlas(r.gl, words), W, H);
      still = { W, H, canvas, r, motes: planMotes(W, H) };
    }
    const { canvas, r, motes } = still;
    r.draw(prog, (prog * DURATION) / 1000, motes, W, H, 1);
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

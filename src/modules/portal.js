// ===== THE CROSSING INTO BEFORE THE USURPATION =====
// "Through the seam": a line of light draws itself down the middle of the screen, parts into a
// column of soft light shedding motes, and the light floods the page. Only opacity and transform
// are animated, and the motes are drawn on one small canvas, so it stays smooth.

const RING_MOTES = 5;

// The small door-light that replaces the door's icon (sidebar link and welcome gate)
export function portalRingHtml() {
  const motes = Array.from({ length: RING_MOTES }, (_, i) => `<span class="portal-mote" style="--i:${i}"></span>`).join('');
  return `<span class="portal-ring" aria-hidden="true"><span class="portal-ring-core"></span>${motes}</span>`;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Soft golden motes drifting out of the seam
function startMotes(canvas, durationMs) {
  const scale = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  // One pre-drawn glow, stamped for every mote
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const s = sprite.getContext('2d');
  const g = s.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,252,236,1)');
  g.addColorStop(0.25, 'rgba(255,228,150,0.7)');
  g.addColorStop(1, 'rgba(255,200,100,0)');
  s.fillStyle = g;
  s.fillRect(0, 0, 32, 32);

  const cx = w / 2;
  const motes = [];
  const spawn = (t) => {
    const side = Math.random() < 0.5 ? -1 : 1;
    motes.push({
      x: cx + side * Math.random() * 6,
      y: h * (0.15 + Math.random() * 0.7),
      vx: side * (0.02 + Math.random() * 0.09),
      vy: -(0.008 + Math.random() * 0.03),
      size: 4 + Math.random() * 10,
      born: t,
      life: 900 + Math.random() * 900,
    });
  };

  let start = null;
  let raf = 0;
  const frame = (t) => {
    if (start === null) start = t;
    const elapsed = t - start;
    if (elapsed < durationMs - 400) for (let k = 0; k < 3; k++) spawn(t);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (let i = motes.length - 1; i >= 0; i--) {
      const m = motes[i];
      const age = t - m.born;
      if (age > m.life) { motes.splice(i, 1); continue; }
      const p = age / m.life;
      const x = m.x + m.vx * age;
      const y = m.y + m.vy * age;
      ctx.globalAlpha = Math.sin(Math.PI * p) * 0.9;
      const size = m.size * (0.6 + 0.4 * Math.sin(Math.PI * p));
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }
    if (elapsed < durationMs) raf = requestAnimationFrame(frame);
  };
  raf = requestAnimationFrame(frame);
  return () => cancelAnimationFrame(raf);
}

// The plain-light version, for devices without WebGL
function playSeamFallback({ title, sub }, onMidpoint) {
  let fired = false;
  const fire = () => { if (!fired) { fired = true; if (onMidpoint) onMidpoint(); } };

  const app = document.querySelector('.app');
  const overlay = document.createElement('div');
  overlay.className = 'portal-transition';
  overlay.innerHTML = `
    <div class="seam-dim"></div>
    <div class="seam-glow"></div>
    <div class="seam-column"></div>
    <div class="seam-line"></div>
    <canvas class="seam-motes"></canvas>
    <div class="portal-flash"></div>
    <div class="portal-words">
      <div class="portal-title">${title}</div>
      <div class="portal-subtitle">${sub}</div>
    </div>`;
  document.body.appendChild(overlay);

  const q = (sel) => overlay.querySelector(sel);
  const dim = q('.seam-dim');
  const glow = q('.seam-glow');
  const column = q('.seam-column');
  const line = q('.seam-line');
  const canvas = q('.seam-motes');
  const flash = q('.portal-flash');
  const words = q('.portal-words');
  const titleEl = q('.portal-title');
  const subEl = q('.portal-subtitle');
  let stopMotes = () => {};

  const cleanup = () => {
    stopMotes();
    overlay.remove();
    if (app) app.style.willChange = '';
  };

  (async () => {
    const soft = 'cubic-bezier(.45,0,.2,1)';
    if (app) app.style.willChange = 'transform';

    // 1. The room darkens and a line of light draws itself down the middle
    dim.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'ease-out', fill: 'forwards' });
    glow.animate(
      [{ opacity: 0, transform: 'translate(-50%, -50%) scale(.25)' }, { opacity: 0.7, transform: 'translate(-50%, -50%) scale(.55)' }],
      { duration: 900, easing: soft, fill: 'forwards' }
    );
    if (app) app.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.025)' }], { duration: 1500, easing: 'ease-in', fill: 'forwards' });
    await line.animate(
      [{ transform: 'scaleY(0)', opacity: 0.4 }, { transform: 'scaleY(1)', opacity: 1 }],
      { duration: 650, delay: 150, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' }
    ).finished;

    // 2. The seam parts: a column of soft light opens and motes drift out of it
    stopMotes = startMotes(canvas, 1500);
    canvas.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'forwards' });
    glow.animate(
      [{ opacity: 0.7, transform: 'translate(-50%, -50%) scale(.55)' }, { opacity: 1, transform: 'translate(-50%, -50%) scale(1.1)' }],
      { duration: 900, easing: soft, fill: 'forwards' }
    );
    await column.animate(
      [
        { opacity: 0, transform: 'translateX(-50%) scaleX(.02)' },
        { opacity: 1, transform: 'translateX(-50%) scaleX(.35)', offset: 0.45 },
        { opacity: 1, transform: 'translateX(-50%) scaleX(1)' },
      ],
      { duration: 900, easing: soft, fill: 'forwards' }
    ).finished;

    // 3. The light floods everything
    await flash.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'ease-in', fill: 'forwards' }).finished;

    // 4. In the light: change sides while nothing can be seen
    fire();
    stopMotes();
    [dim, glow, column, line, canvas].forEach((el) => { el.style.display = 'none'; });
    if (app) {
      app.getAnimations().forEach((a) => a.cancel());
      app.style.opacity = '0';
    }
    words.style.opacity = '1';
    await Promise.all([
      titleEl.animate(
        [
          { opacity: 0, transform: 'translateY(12px)', letterSpacing: '0.12em' },
          { opacity: 1, transform: 'translateY(0)', letterSpacing: '0.26em' },
        ],
        { duration: 900, easing: 'ease-out', fill: 'forwards' }
      ).finished,
      subEl.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 750, delay: 250, easing: 'ease-out', fill: 'forwards' }
      ).finished,
    ]);
    await wait(700);

    // 5. The light lifts and the far side is there
    if (app) {
      app.style.opacity = '';
      app.animate(
        [{ opacity: 0, transform: 'scale(1.03)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 1100, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
    }
    await Promise.all([
      words.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }).finished,
      flash.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1100, easing: 'ease-out', fill: 'forwards' }).finished,
    ]);
    cleanup();
  })().catch(() => {
    fire();
    if (app) { app.style.opacity = ''; app.getAnimations().forEach((a) => a.cancel()); }
    cleanup();
  });
}

// ===== The tear (WebGL) =====
// A ragged seam tears open in the dark; through it is the world Before the Usurpation,
// sunlit. The tear widens, the view pushes through, and the real page is waiting behind it.
// One full-screen shader on the graphics card does the light, the edge, the embers and the grain.

export const EVE_PORTAL_IMAGE = 'images/S62 Amphiale.webp';
let preloaded = null;

// Start fetching the far side's picture before the click (on hover), so the tear opens at once
export function preloadPortal() {
  if (!preloaded) {
    preloaded = new Image();
    preloaded.decoding = 'async';
    preloaded.src = EVE_PORTAL_IMAGE;
  }
  return preloaded;
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const GLSL_HEAD = `
precision highp float;
uniform vec2 uRes;
uniform vec2 uTexRes;
uniform float uTime;
uniform float uProg;
uniform float uHasTex;
uniform float uMode;
uniform sampler2D uTex;
varying vec2 vUv;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}
// Bright values roll off softly instead of clipping flat
vec3 shoulder(vec3 c) {
  vec3 hi = 1.0 - 0.3 * exp(-(c - 0.7) / 0.3);
  return mix(c, hi, step(0.7, c));
}

`;

const FRAG = GLSL_HEAD + `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;

  float form = smoothstep(0.0, 0.28, uProg);   // the seam draws itself out from a spark
  float open = smoothstep(0.22, 0.80, uProg);  // it parts into an almond of light
  float push = smoothstep(0.72, 1.0, uProg);   // and we go through

  // The opening: pointed at both ends, widest in the middle, with a living ragged edge
  float reach = mix(0.03, 0.43, form) + 0.07 * open + push * push * 1.6;
  float yn = clamp(p.y / reach, -1.0, 1.0);
  float lens = 1.0 - yn * yn;
  float wob = (fbm(vec2(p.y * 3.2, t * 0.30)) - 0.5) * 0.045 + (fbm(vec2(p.y * 19.0 + 4.0, t * 0.9)) - 0.5) * 0.010;
  float x = p.x + wob * (0.35 + open);
  float W = 0.0010 + 0.30 * open * open + push * push * 2.4;
  float halfW = W * pow(lens, 0.8);
  float d = max(abs(x) - halfW, abs(p.y) - reach);
  float aa = 1.5 / uRes.y;
  float inside = smoothstep(aa, -aa, d);

  // The far side, sunlit; first too bright to look at, then the eye adjusts
  vec3 world = vec3(1.0, 0.92, 0.74);
  if (uHasTex > 0.0 && inside > 0.0) {
    vec2 uv = vUv;
    float zoom = 1.0 + 0.06 * open + 0.10 * push;
    uv = (uv - 0.5) / zoom + 0.5;
    float sr = uRes.x / uRes.y;
    float tr = uTexRes.x / uTexRes.y;
    if (sr > tr) { uv.y = (uv.y - 0.5) * tr / sr + 0.5; } else { uv.x = (uv.x - 0.5) * sr / tr + 0.5; }
    uv.y = 1.0 - uv.y;
    // the rush: a brief blur toward the centre while we are pulled through, gone by the end
    float rush = 0.028 * sin(3.14159 * push);
    vec3 tex;
    if (rush > 0.001) {
      float jit = hash(gl_FragCoord.xy);
      tex = vec3(0.0);
      for (int i = 0; i < 8; i++) {
        float k = 1.0 - rush * (float(i) + jit) / 8.0;
        tex += texture2D(uTex, (uv - 0.5) * k + 0.5).rgb;
      }
      tex /= 8.0;
    } else {
      tex = texture2D(uTex, uv).rgb;
    }
    world = mix(world, tex, uHasTex);
  }
  float exposure = mix(4.0, 1.0, smoothstep(0.0, 0.72, open));
  float inner = exp(-max(-d, 0.0) * mix(80.0, 22.0, open)) * (1.0 - push);   // light pouring in at the lip
  world = world * exposure + vec3(1.0, 0.90, 0.68) * inner * 1.1;

  // Light spilling out over the dark page
  float dist = max(d, 0.0);
  float taper = sqrt(max(lens, 0.0));
  float hot = 0.55 + 0.45 * fbm(vec2(p.y * 6.0 - t * 0.9, t * 0.5));               // hot spots crawl along the lip
  float rim = exp(-abs(d) * mix(1100.0, 300.0, open)) * taper * hot * form;
  float glow = exp(-dist * mix(70.0, 16.0, open)) * taper * form;
  float r = length(p * vec2(1.0, 0.75));
  float halo = exp(-r * mix(9.0, 2.6, open)) * form;

  // Soft rays fanning out from the opening, turning slowly
  vec2 dir = normalize(p * vec2(1.0, 0.62) + 1e-5);
  float rayN = fbm(dir * 3.4 + vec2(t * 0.05, -t * 0.04)) * 0.65 + fbm(dir * 9.0 - vec2(t * 0.03)) * 0.35;
  float rays = pow(smoothstep(0.35, 0.80, rayN), 1.6) * exp(-max(r - W * 0.5, 0.0) * 2.4) * (0.15 + 0.85 * open);

  // A hairline crack running on past the tips
  float hair = exp(-abs(x) * 1600.0) * smoothstep(reach + 0.30, reach, abs(p.y)) * 0.35 * form * (1.0 - push);

  // Dust in the light, drifting away from the seam (each side its own pattern)
  float motes = 0.0;
  float side = step(0.0, p.x);
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec2 q = vec2(abs(p.x), p.y) * (18.0 + fi * 11.0) - vec2(t * (0.9 + fi * 0.5), -t * 0.25) + side * vec2(17.3, 5.1) + fi * 3.7;
    vec2 id = floor(q);
    vec2 f = fract(q) - 0.5;
    float h = hash(id + fi * 7.31);
    vec2 off = vec2(h - 0.5, fract(h * 13.7) - 0.5) * 0.55;
    float m = smoothstep(0.10, 0.0, length(f - off)) * step(0.82, h);
    motes += m * (0.55 + 0.45 * sin(t * 3.0 + h * 40.0));
  }
  motes *= (glow * 1.5 + halo + rays * 0.8) * (1.0 - inside) * (1.0 - push);

  vec3 white = vec3(1.0, 0.97, 0.90);
  vec3 gold = vec3(1.0, 0.78, 0.42);
  vec3 amber = vec3(0.95, 0.55, 0.22);
  vec3 light = white * (rim * 2.2 + hair) + mix(gold, white, glow) * glow * 0.95
             + mix(amber, gold, halo) * halo * 0.55 + gold * rays * 0.42 * (1.0 - push) + white * motes * 0.9;

  float dark = 0.88 * smoothstep(0.0, 0.20, uProg) * (1.0 - inside);
  float grain = (hash(gl_FragCoord.xy + fract(t * 7.0) * 100.0) - 0.5) * 0.035;

  vec3 lit = shoulder(light);
  float lum = clamp(max(max(lit.r, lit.g), lit.b), 0.0, 1.0);
  float aOut = clamp(dark + lum, 0.0, 1.0);
  vec3 outside = lit / max(aOut, 0.001);
  vec3 seen = mix(shoulder(world + white * rim * 1.5), world, push * push);
  vec3 col = mix(outside, seen, inside) + grain * (1.0 - inside * push);
  float alpha = mix(aOut, 1.0, inside);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), alpha);
}`;

function makeGl(canvas, keep = false, frag = FRAG) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true, antialias: false, preserveDrawingBuffer: keep });
  if (!gl) return null;
  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const u = (name) => gl.getUniformLocation(prog, name);
  return { gl, u: { res: u('uRes'), texRes: u('uTexRes'), time: u('uTime'), prog: u('uProg'), hasTex: u('uHasTex'), tex: u('uTex'), mode: u('uMode') } };
}


export function playPortal(_originEl, words, onMidpoint) {
  const canvas = document.createElement('canvas');
  let ctx = null;
  try { ctx = makeGl(canvas); } catch (err) { console.warn('Portal shader unavailable:', err); }
  if (!ctx) { playSeamFallback(words, onMidpoint); return; }

  let fired = false;
  const fire = () => { if (!fired) { fired = true; if (onMidpoint) onMidpoint(); } };

  const app = document.querySelector('.app');
  const overlay = document.createElement('div');
  overlay.className = 'portal-transition portal-gl';
  overlay.appendChild(canvas);
  const pin = (e) => e.preventDefault();
  overlay.addEventListener('wheel', pin, { passive: false });
  overlay.addEventListener('touchmove', pin, { passive: false });
  document.body.appendChild(overlay);

  // Drawn at no more than the screen's own pixels, and no wider than the far side's picture
  // (1672px); the light is soft, so it loses nothing
  const scale = Math.min(window.devicePixelRatio || 1, 1) * (window.innerWidth < 700 ? 0.75 : Math.min(1, 1680 / window.innerWidth));
  canvas.width = Math.round(window.innerWidth * scale);
  canvas.height = Math.round(window.innerHeight * scale);
  const { gl, u } = ctx;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(u.res, canvas.width, canvas.height);
  gl.uniform2f(u.texRes, 1, 1);

  const img = preloadPortal();
  let hasTex = false;
  let texAt = 0;
  const bindTexture = () => {
    if (hasTex || !img.complete || !img.naturalWidth) return;
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.uniform1i(u.tex, 0);
    gl.uniform2f(u.texRes, img.naturalWidth, img.naturalHeight);
    hasTex = true;
    texAt = performance.now();
  };

  const DURATION = 2900;
  let start = null;
  let raf = 0;

  if (app) {
    app.style.willChange = 'transform';
    app.animate([{ transform: 'scale(1)' }, { transform: 'scale(.985)' }], { duration: 1600, easing: 'ease-in', fill: 'forwards' });
  }

  // We come out into the picture. It is the eve page's own first picture, so rather than fade
  // off over the page it settles into that picture's frame while the page comes up around it.
  const settle = async () => {
    const hero = document.querySelector('.eve-landing .eve-hero');
    const target = new URL(EVE_PORTAL_IMAGE, window.location.href).href;
    if (!hero || hero.src !== target || !img.naturalWidth) return false;
    const to = hero.getBoundingClientRect();
    if (to.width < 40 || to.bottom < 0 || to.top > window.innerHeight) return false;
    const cs = getComputedStyle(hero);

    const shade = document.createElement('div');
    shade.className = 'portal-settle-shade';
    const bg = getComputedStyle(document.body).backgroundColor;
    shade.style.background = bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent' ? bg : '#0b0a08';
    const frame = document.createElement('div');
    frame.className = 'portal-settle';
    const pic = document.createElement('img');
    pic.alt = '';
    pic.src = img.src;
    frame.appendChild(pic);
    overlay.append(shade, frame);
    try { await pic.decode(); } catch { /* it's the preloaded picture */ }
    // the canvas's last frame is this same picture at the same zoom: swap it out underneath
    canvas.style.opacity = '0';
    cancelAnimationFrame(raf);

    const W = window.innerWidth;
    const H = window.innerHeight;
    const ease = 'cubic-bezier(.6, 0, .2, 1)';
    const time = 1400;
    const moves = [
      frame.animate([
        { left: '0px', top: '0px', width: `${W}px`, height: `${H}px`, borderRadius: '0px', boxShadow: '0 0 0 rgba(0,0,0,0)' },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, borderRadius: cs.borderRadius, boxShadow: cs.boxShadow },
      ], { duration: time, easing: ease, fill: 'forwards' }),
      pic.animate([{ transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: time, easing: ease, fill: 'forwards' }),
      shade.animate([{ opacity: 1 }, { opacity: 1, offset: 0.25 }, { opacity: 0 }], { duration: time, easing: 'ease-in-out', fill: 'forwards' }),
    ];
    await Promise.all(moves.map((m) => m.finished));
    try { await hero.decode(); } catch { /* shown as it is */ }
    return true;
  };

  const finish = async () => {
    if (app) app.getAnimations().forEach((a) => a.cancel());
    fire();
    // land at the top of the page at once, so the picture's frame stays where it is measured
    window.scrollTo({ top: 0, behavior: 'instant' });
    let settled = false;
    try { settled = await settle(); } catch { settled = false; }
    if (!settled) {
      if (app) app.animate([{ transform: 'scale(1.035)' }, { transform: 'scale(1)' }], { duration: 1100, easing: 'cubic-bezier(.2,.7,.2,1)' });
      await canvas.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 1000, easing: 'ease-out', fill: 'forwards' }).finished;
    }
    cancelAnimationFrame(raf);
    overlay.remove();
    if (app) app.style.willChange = '';
  };

  const frame = (now) => {
    if (start === null) start = now;
    const elapsed = now - start;
    const prog = Math.min(1, elapsed / DURATION);
    bindTexture();
    gl.uniform1f(u.time, elapsed / 1000);
    gl.uniform1f(u.prog, prog);
    gl.uniform1f(u.hasTex, hasTex ? Math.min(1, (now - texAt) / 350) : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (prog < 1) raf = requestAnimationFrame(frame);
    else finish().catch(() => { fire(); overlay.remove(); });
  };
  raf = requestAnimationFrame(frame);
}

// ===== Back to the present: the old world burns =====
// The page catches along the seam and burns outward to both sides: it browns, a glowing
// edge eats through it throwing sparks, and it leaves char and drifting ash. In the dark
// the realm changes, then the smoke clears from the top down onto the present.
const BURN_FRAG = GLSL_HEAD + `
void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float aspect = uRes.x / uRes.y;

  float ax = abs(p.x) / (0.5 * aspect);
  float n = fbm(p * 2.4 + vec2(3.1, 7.7)) - 0.5;
  float nf = fbm(p * 11.0 + vec2(t * 0.4, 0.0)) - 0.5;
  float sm = smoothstep(0.0, 0.3, ax);
  float f = ax * 0.9 + n * 0.5 * (0.25 + 0.75 * sm) + nf * 0.07 + abs(p.y) * 0.18;
  float burnP = clamp((uProg - 0.04) / 0.56, 0.0, 1.0);
  float T = -0.15 + 1.6 * pow(burnP, 1.45);
  float e = f - T;

  float burnt = smoothstep(0.004, -0.004, e);
  float scorch = smoothstep(0.17, 0.0, e) * (1.0 - burnt);
  float flick = 0.6 + 0.4 * fbm(p * 16.0 + vec2(0.0, -t * 2.2));
  float core = exp(-abs(e) * 220.0);
  float band = exp(min(e, 0.0) * 32.0) * burnt;
  float spots = smoothstep(0.72, 0.90, fbm(p * 22.0 + vec2(1.7, -t * 0.25)));
  float coals = spots * (exp(min(e, 0.0) * 6.0) * burnt * 0.9 + burnt * 0.12 * (1.0 - smoothstep(0.55, 0.78, uProg)));
  float heat = (core * 1.2 + band * 0.75) * flick + coals;
  float ahead = exp(-max(e, 0.0) * 16.0) * (1.0 - burnt) * smoothstep(0.02, 0.1, uProg);

  float sparks = 0.0;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    vec2 q = p * (22.0 + fi * 14.0) + vec2(fi * 5.3, -t * (2.2 + fi * 1.1));
    vec2 id = floor(q);
    vec2 g = fract(q) - 0.5;
    float h = hash(id + fi * 11.7);
    vec2 off = vec2(h - 0.5, fract(h * 9.1) - 0.5) * 0.5;
    sparks += smoothstep(0.09, 0.0, length(g - off)) * step(0.86, h) * (0.5 + 0.5 * sin(t * 9.0 + h * 50.0));
  }
  sparks *= exp(-abs(e) * 9.0) * (1.0 - smoothstep(0.48, 0.60, uProg));

  vec2 aq = p * 9.0 + vec2(sin(p.y * 3.0 + t * 0.7) * 0.4, -t * 0.55);
  vec2 aid = floor(aq);
  vec2 ag = fract(aq) - 0.5;
  float ah = hash(aid + 3.3);
  vec2 aoff = vec2(ah - 0.5, fract(ah * 7.3) - 0.5) * 0.5;
  float ash = smoothstep(0.075, 0.02, length((ag - aoff) * vec2(1.0, 1.9))) * step(0.80, ah);
  ash *= smoothstep(0.12, 0.40, uProg) * (1.0 - smoothstep(0.86, 1.0, uProg)) * 0.55;

  vec3 scorchCol = mix(vec3(0.42, 0.27, 0.10), vec3(0.09, 0.045, 0.02), scorch);
  vec3 charCol = vec3(0.022, 0.018, 0.016) + (fbm(p * 55.0) - 0.5) * 0.025;
  vec3 base = mix(scorchCol, charCol, burnt);
  float a = max(burnt, scorch * 0.8);
  vec3 light = shoulder(vec3(1.0, 0.24, 0.03) * heat + vec3(1.0, 0.66, 0.26) * heat * heat * 0.9
                        + vec3(1.0, 0.95, 0.80) * heat * heat * heat * 0.7
                        + vec3(1.0, 0.45, 0.10) * ahead * 0.22 + vec3(1.0, 0.62, 0.22) * sparks * 1.4);
  float lum = clamp(max(max(light.r, light.g), light.b), 0.0, 1.0);
  vec3 P = base * a + light;
  float A = clamp(a + lum, 0.0, 1.0);

  float R = smoothstep(0.64, 1.0, uProg);
  float rn = fbm(p * 1.1 + vec2(0.0, -t * 0.15)) * 0.8 + fbm(p * 4.0 - vec2(0.0, t * 0.3)) * 0.2 - p.y * 0.5;
  float th = mix(-0.55, 1.25, R);
  float cover = smoothstep(th - 0.32, th + 0.32, rn);
  P *= cover;
  A *= cover;

  vec3 ashCol = vec3(0.50, 0.47, 0.44) + vec3(1.0, 0.45, 0.1) * exp(-abs(e) * 12.0) * (1.0 - burnt * 0.5);
  P = P * (1.0 - ash) + ashCol * ash;
  A = A + ash * (1.0 - A);

  float grain = (hash(gl_FragCoord.xy + fract(t * 7.0) * 100.0) - 0.5) * 0.03;
  gl_FragColor = vec4(clamp(P / max(A, 0.001) + grain, 0.0, 1.0), A);
}`;

// Runs a crossing that covers the screen, changes the realm in the dark, and uncovers it.
// Returns false when the device can't run the shader, so the caller can use the plain fade.
function playCover({ frag, mode = 0, duration, midpoint, onMidpoint }) {
  const canvas = document.createElement('canvas');
  let ctx = null;
  try { ctx = makeGl(canvas, false, frag); } catch (err) { console.warn('Crossing shader unavailable:', err); }
  if (!ctx) return false;

  let fired = false;
  const fire = () => { if (!fired) { fired = true; if (onMidpoint) onMidpoint(); } };

  const overlay = document.createElement('div');
  overlay.className = 'portal-transition portal-gl';
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);

  const scale = Math.min(window.devicePixelRatio || 1, 1) * (window.innerWidth < 700 ? 0.75 : Math.min(1, 1680 / window.innerWidth));
  canvas.width = Math.round(window.innerWidth * scale);
  canvas.height = Math.round(window.innerHeight * scale);
  const { gl, u } = ctx;
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(u.res, canvas.width, canvas.height);
  gl.uniform1f(u.mode, mode);
  gl.uniform2f(u.texRes, 1, 1);

  let start = null;
  const frame = (now) => {
    if (start === null) start = now;
    const elapsed = now - start;
    const prog = Math.min(1, elapsed / duration);
    gl.uniform1f(u.time, elapsed / 1000);
    gl.uniform1f(u.prog, prog);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    if (prog >= midpoint) fire();
    if (prog < 1) requestAnimationFrame(frame);
    else { fire(); overlay.remove(); }
  };
  requestAnimationFrame(frame);
  return true;
}

export function playBurn(onMidpoint) {
  return playCover({ frag: BURN_FRAG, duration: 3800, midpoint: 0.58, onMidpoint });
}

// Dev only: draw one still of the tear at a given progress, to judge the look frame by frame
if (import.meta.env && import.meta.env.DEV) {
  window.__portalStill = (prog, time = 1.2, w = window.innerWidth, h = window.innerHeight, which = 'tear') => {
    document.querySelectorAll('.portal-still').forEach((n) => n.remove());
    if (prog == null) return null;
    const canvas = document.createElement('canvas');
    const frag = { tear: FRAG, burn: BURN_FRAG }[which] || FRAG;
    const ctx = makeGl(canvas, true, frag);
    const holder = document.createElement('div');
    holder.className = 'portal-transition portal-gl portal-still';
    holder.appendChild(canvas);
    document.body.appendChild(holder);
    canvas.width = w;
    canvas.height = h;
    const { gl, u } = ctx;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.res, canvas.width, canvas.height);
    const img = preloadPortal();
    const draw = () => {
      let has = 0;
      if (img.complete && img.naturalWidth) {
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.uniform2f(u.texRes, img.naturalWidth, img.naturalHeight);
        has = 1;
      }
      gl.uniform1f(u.time, time);
      gl.uniform1f(u.prog, prog);
      gl.uniform1f(u.hasTex, has);
      gl.uniform1f(u.mode, which === 'veil1' ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    if (img.complete) draw(); else img.onload = draw;
    return canvas;
  };
}

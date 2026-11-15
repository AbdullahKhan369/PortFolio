// Real-time prism for the hero: physically based refraction (Snell's law, 16 wavelengths) done in JS,
// drawn by a small WebGL fragment shader. No library. Returns null when WebGL is unavailable so the caller keeps the SVG fallback.
// Mobile first: quality and pixel ratio are chosen by the caller; the layout switches between portrait and landscape.

type V = [number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const dot = (a: V, b: V): number => a[0] * b[0] + a[1] * b[1];
const len = (a: V): number => Math.hypot(a[0], a[1]);
const norm = (a: V): V => {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l];
};

const N = 16;

/** Wavelength (nm) to linear-ish RGB (Bruton approximation), boosted a little so the fan stays vivid on a dark page. */
function wavelengthToRgb(nm: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else { r = 1; }
  const f = nm < 420 ? 0.45 + (0.55 * (nm - 400)) / 20 : nm > 680 ? 0.45 + (0.55 * (700 - nm)) / 20 : 1;
  return [Math.pow(r * f, 0.8), Math.pow(g * f, 0.8), Math.pow(b * f, 0.8)];
}

/** Snell refraction. `n` is the unit normal facing against `d`. Returns null on total internal reflection. */
function refract(d: V, n: V, eta: number): V | null {
  const cosi = -dot(n, d);
  const k = 1 - eta * eta * (1 - cosi * cosi);
  if (k < 0) return null;
  const t = eta * cosi - Math.sqrt(k);
  return [eta * d[0] + t * n[0], eta * d[1] + t * n[1]];
}

interface Hit { t: number; edge: number; p: V }
function rayTriangle(o: V, d: V, v: V[]): Hit[] {
  const hits: Hit[] = [];
  for (let e = 0; e < 3; e++) {
    const a = v[e] as V;
    const b = v[(e + 1) % 3] as V;
    const s = sub(b, a);
    const den = d[0] * s[1] - d[1] * s[0];
    if (Math.abs(den) < 1e-9) continue;
    const ao = sub(a, o);
    const t = (ao[0] * s[1] - ao[1] * s[0]) / den;
    const u = (ao[0] * d[1] - ao[1] * d[0]) / den;
    if (t > 1e-3 && u >= 0 && u <= 1) hits.push({ t, edge: e, p: add(o, mul(d, t)) });
  }
  return hits.sort((x, y) => x.t - y.t);
}

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes; uniform float uPx; uniform float uTime; uniform float uSpread;
uniform vec2 uS; uniform vec2 uE; uniform vec2 uA; uniform vec2 uB; uniform vec2 uC;
uniform vec2 uX[${N}]; uniform vec2 uD[${N}]; uniform vec3 uCol[${N}]; uniform float uOn[${N}];
float sdSeg(vec2 p, vec2 a, vec2 b, out float h){ vec2 pa=p-a, ba=b-a; h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h); }
float sdTri(vec2 p, vec2 p0, vec2 p1, vec2 p2){
  vec2 e0=p1-p0, e1=p2-p1, e2=p0-p2; vec2 v0=p-p0, v1=p-p1, v2=p-p2;
  vec2 pq0=v0-e0*clamp(dot(v0,e0)/dot(e0,e0),0.,1.); vec2 pq1=v1-e1*clamp(dot(v1,e1)/dot(e1,e1),0.,1.); vec2 pq2=v2-e2*clamp(dot(v2,e2)/dot(e2,e2),0.,1.);
  float s=sign(e0.x*e2.y-e0.y*e2.x);
  vec2 d=min(min(vec2(dot(pq0,pq0),s*(v0.x*e0.y-v0.y*e0.x)),vec2(dot(pq1,pq1),s*(v1.x*e1.y-v1.y*e1.x))),vec2(dot(pq2,pq2),s*(v2.x*e2.y-v2.y*e2.x)));
  return -sqrt(d.x)*sign(d.y);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec3 col = vec3(0.0);
  float bw = 1.5 * uPx;
  float h;
  float db = sdSeg(p, uS, uE, h);
  float beam = exp(-db*db/(bw*bw)) * 1.25 + exp(-db*db/(bw*bw*70.0)) * 0.32;
  col += vec3(1.0, 0.98, 0.94) * beam * (0.25 + 0.75*h);
  for (int i = 0; i < ${N}; i++) {
    if (uOn[i] < 0.5) continue;
    float h1; float di = sdSeg(p, uE, uX[i], h1);
    col += uCol[i] * exp(-di*di/(bw*bw*2.2)) * 0.07;
    vec2 d = uD[i]; float t = dot(p - uX[i], d);
    if (t > 0.0) {
      float dd = length(p - uX[i] - d*t);
      float w = bw * (1.0 + t * 0.0017 * uSpread);
      float core = exp(-dd*dd/(w*w));
      float glow = exp(-dd*dd/(w*w*55.0)) * 0.30;
      float fall = exp(-t / (uRes.x * 1.25 + uRes.y * 0.35));
      col += uCol[i] * (core * 0.8 + glow * 1.1) * fall;
    }
  }
  float d = sdTri(p, uA, uB, uC);
  float edge = exp(-abs(d)/(1.3*uPx));
  float edgeGlow = exp(-abs(d)/(16.0*uPx)) * 0.16;
  col += vec3(0.86, 0.9, 1.0) * (edge * 0.8 + edgeGlow);
  if (d < 0.0) col += vec3(0.50, 0.46, 1.0) * 0.07 * (1.0 - clamp(-d/(90.0*uPx), 0.0, 1.0));
  col = 1.0 - exp(-col * 1.35);
  col += (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.012;
  float a = clamp(max(col.r, max(col.g, col.b)), 0.0, 1.0);
  gl_FragColor = vec4(max(col, 0.0), a);
}`;

export interface PrismGL {
  setPointer(x: number, y: number): void;
  setScroll(p: number): void;
  resize(): void;
  start(): void;
  stop(): void;
  destroy(): void;
}

export interface PrismGLOptions {
  /** Render scale on top of the device pixel ratio, for example 0.6 on phones. */
  quality: number;
  maxDpr: number;
  /** When false the scene is drawn once per resize/pointer change instead of animating. */
  animate: boolean;
}

export function createPrismGL(canvas: HTMLCanvasElement, opts: PrismGLOptions): PrismGL | null {
  const gl = (canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: "low-power" }) ||
    canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (!gl) return null;

  const compile = (type: number, src: string): WebGLShader | null => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  const prog = gl.createProgram();
  if (!vs || !fs || !prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const U = (n: string): WebGLUniformLocation | null => gl.getUniformLocation(prog, n);
  const uRes = U("uRes"), uPx = U("uPx"), uTime = U("uTime"), uSpread = U("uSpread");
  const uS = U("uS"), uE = U("uE"), uA = U("uA"), uB = U("uB"), uC = U("uC");
  const uX = U("uX[0]"), uD = U("uD[0]"), uCol = U("uCol[0]"), uOn = U("uOn[0]");

  const lambdas = Array.from({ length: N }, (_, i) => 400 + (300 * i) / (N - 1));
  const cols = new Float32Array(N * 3);
  lambdas.forEach((nm, i) => {
    const [r, g, b] = wavelengthToRgb(nm);
    cols.set([r, g, b], i * 3);
  });

  let W = 1, H = 1, px = 1;
  let pointer: V = [0, 0], pointerS: V = [0, 0];
  let scroll = 0, scrollS = 0;
  let raf = 0, running = false;
  const t0 = performance.now();

  const resize = (): void => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    const dpr = Math.min(window.devicePixelRatio || 1, opts.maxDpr) * opts.quality;
    px = dpr;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    draw(performance.now());
  };

  const draw = (now: number): void => {
    const time = (now - t0) / 1000;
    pointerS = [pointerS[0] + (pointer[0] - pointerS[0]) * 0.08, pointerS[1] + (pointer[1] - pointerS[1]) * 0.08];
    scrollS += (scroll - scrollS) * 0.1;

    // Layout: mobile first (portrait), then landscape.
    // Apex up in both layouts: the beam rises in from the lower left (under the text) and the fan falls to the lower right.
    const portrait = H > W * 1.05;
    const R = portrait ? Math.min(W * 0.3, H * 0.16) : Math.min(W * 0.15, H * 0.28);
    const C: V = portrait ? [W * 0.46, H * 0.8] : [W * 0.7, H * 0.6];
    const breathe = opts.animate ? Math.sin(time * 0.35) : 0;
    const rot = 0.05 * breathe + pointerS[0] * 0.22 + scrollS * 0.35;
    const apex = -Math.PI / 2;
    // The beam runs close to parallel with the prism base (minimum deviation), so light always passes through.
    const tilt = -0.33 + pointerS[1] * 0.1 - scrollS * 0.05;
    const d0 = norm([Math.cos(rot + tilt), Math.sin(rot + tilt)] as V);
    const perp: V = [-d0[1], d0[0]];
    const aimOff = R * (0.1 * Math.sin(time * 0.27 + 1) * (opts.animate ? 1 : 0) + pointerS[1] * 0.3 - 0.32);
    const spread = 1.25 + scrollS * 0.9;
    const verts: V[] = [0, 1, 2].map((k) => {
      const a = rot + apex + (k * 2 * Math.PI) / 3;
      return [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)] as V;
    });
    const aim: V = add(C, mul(perp, aimOff));
    const S: V = sub(aim, mul(d0, Math.hypot(W, H)));
    const entryHits = rayTriangle(S, d0, verts).filter((h) => {
      const a = verts[h.edge] as V, b = verts[(h.edge + 1) % 3] as V;
      const e = sub(b, a);
      let n = norm([e[1], -e[0]] as V);
      if (dot(n, sub(a, C)) < 0) n = mul(n, -1);
      return dot(d0, n) < 0;
    });
    const entry = entryHits[0];
    const on = new Float32Array(N);
    const exits = new Float32Array(N * 2);
    const dirs = new Float32Array(N * 2);
    let E: V = aim;
    if (entry) {
      E = entry.p;
      const a = verts[entry.edge] as V, b = verts[(entry.edge + 1) % 3] as V;
      const ed = sub(b, a);
      let n1 = norm([ed[1], -ed[0]] as V);
      if (dot(n1, sub(a, C)) < 0) n1 = mul(n1, -1);
      for (let i = 0; i < N; i++) {
        const lam = (lambdas[i] as number) / 1000;
        const nIdx = 1.5 + 0.1 * spread * (0.7 - lam) / 0.3;
        const d1 = refract(d0, mul(n1, 1), 1 / nIdx);
        if (!d1) continue;
        const inner = rayTriangle(E, d1, verts).filter((h) => h.edge !== entry.edge)[0];
        if (!inner) continue;
        const ea = verts[inner.edge] as V, eb = verts[(inner.edge + 1) % 3] as V;
        const e2 = sub(eb, ea);
        let n2 = norm([e2[1], -e2[0]] as V);
        if (dot(n2, sub(ea, C)) < 0) n2 = mul(n2, -1);
        const d2 = refract(d1, mul(n2, -1), nIdx);
        if (!d2) continue;
        on[i] = 1;
        exits.set(inner.p, i * 2);
        dirs.set(norm(d2), i * 2);
      }
    }

    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uPx, px);
    gl.uniform1f(uTime, time);
    gl.uniform1f(uSpread, spread);
    const s = px;
    gl.uniform2f(uS, S[0] * s, S[1] * s);
    gl.uniform2f(uE, E[0] * s, E[1] * s);
    gl.uniform2f(uA, (verts[0] as V)[0] * s, (verts[0] as V)[1] * s);
    gl.uniform2f(uB, (verts[1] as V)[0] * s, (verts[1] as V)[1] * s);
    gl.uniform2f(uC, (verts[2] as V)[0] * s, (verts[2] as V)[1] * s);
    gl.uniform2fv(uX, exits.map((v) => v * s));
    gl.uniform2fv(uD, dirs);
    gl.uniform3fv(uCol, cols);
    gl.uniform1fv(uOn, on);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const loop = (now: number): void => {
    if (!running) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  };

  const onLost = (e: Event): void => {
    e.preventDefault();
    stop();
  };
  canvas.addEventListener("webglcontextlost", onLost);

  function start(): void {
    if (running || !opts.animate) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }
  function stop(): void {
    running = false;
    cancelAnimationFrame(raf);
  }

  resize();
  return {
    setPointer(x, y) {
      pointer = [x, y];
      if (!running) draw(performance.now());
    },
    setScroll(p) {
      scroll = p;
      if (!running) draw(performance.now());
    },
    resize,
    start,
    stop,
    destroy() {
      stop();
      canvas.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

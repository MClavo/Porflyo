import { useEffect, useRef } from "react";

/* 
  Wrapper component to render a Shadertoy-like GLSL fragment shader.
  It supports various overlay effects like blur, grain, glassmorphism, and tinting.

  Made with ChatGPT. 
*/


type RGB = [number, number, number];

type Props = {
  shaderSource: string;
  className?: string;
  maxFps?: number;

  // ── Base overlay (existing)
  showOverlay?: boolean;
  overlayBlurPx?: number;
  grainOpacity?: number;
  grainScale?: number;
  grainSpeed?: number;

  // ── Glassmorphism controls
  enableGlass?: boolean;       // enables saturate/brightness/contrast in the backdrop
  glassSaturate?: number;      // 1 = no change; typical 1.2–1.6
  glassBrightness?: number;    // 1 = no change; typical 1.05–1.2
  glassContrast?: number;      // 1 = no change; typical 1.05–1.15

  // ── Optional color tint
  tintEnabled?: boolean;       // true: applies tint; false: no tint
  tintColor?: string;          // any CSS color, e.g., "#66aaff" or "rgba(255,255,255,1)"
  tintOpacity?: number;        // 0–1 (0.0 visually disables it)
  tintBlendMode?:              // how the tint blends over the background
    | "normal"
    | "multiply"     // darkens (does nothing with white; darkens with black)
    | "screen"       // lightens (does nothing with black; lightens with white)
    | "overlay"      // contrast
    | "soft-light"   // soft glass effect
    | "color"        // pushes the tint's hue/saturation
    | "hue"
    | "saturation"
    | "luminosity";
  
  /** Base water color (optional) */
  baseColor?: RGB | string;       // e.g., [0,0.35,0.5] (0..1) or "#0a6fbf"
  /** Highlight / foam color (optional) */
  highlightColor?: RGB | string;  // e.g., [1,1,1] or "#ffffff"
};
export default function ShaderWrapper({
  shaderSource,
  className,
  maxFps = 60,

  showOverlay = true,
  overlayBlurPx = 2,
  grainOpacity = 0.07,
  grainScale = 1.5,
  grainSpeed = 0.7,

  // glass default to soft
  enableGlass = true,
  glassSaturate = 1.35,
  glassBrightness = 1.08,
  glassContrast = 1.06,

  // tint disabled by default
  tintEnabled = false,
  tintColor = "white",
  tintOpacity = 0.08,
  tintBlendMode = "soft-light",
  baseColor = [0.0, 0.35, 0.5],
  highlightColor = [1, 1, 1],
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformLocsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const startRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });


  function toRgb01(c: RGB | string): RGB {
    if (Array.isArray(c)) {
      // accepts [0..1] or [0..255]
      const maxv = c.some(v => v > 1) ? 255 : 1;
      return [c[0] / maxv, c[1] / maxv, c[2] / maxv] as RGB;
    }
    // #rgb, #rrggbb, rgb(r,g,b)
    if (/^#([0-9a-f]{3})$/i.test(c)) {
      const [, h] = c.match(/^#([0-9a-f]{3})$/i)!;
      const r = parseInt(h[0] + h[0], 16);
      const g = parseInt(h[1] + h[1], 16);
      const b = parseInt(h[2] + h[2], 16);
      return [r / 255, g / 255, b / 255];
    }
    if (/^#([0-9a-f]{6})$/i.test(c)) {
      const [, h] = c.match(/^#([0-9a-f]{6})$/i)!;
      const r = parseInt(h.slice(0, 2), 16);
      const g = parseInt(h.slice(2, 4), 16);
      const b = parseInt(h.slice(4, 6), 16);
      return [r / 255, g / 255, b / 255];
    }
    const m = c.match(/^rgb\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)$/i);
    if (m) return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
    // fallback
    return [1, 1, 1];
  }

  // ─────────────── WebGL setup ───────────────
  const VERT_SRC = `#version 300 es
  precision highp float;
  const vec2 verts[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
  void main(){ gl_Position = vec4(verts[gl_VertexID],0.0,1.0); }`;

  const wrapFragment = (userFrag: string) => `#version 300 es
  precision highp float;
  out vec4 outColor;
  uniform vec3  iResolution;
  uniform float iTime;
  uniform int   iFrame;
  uniform vec4  iMouse;
  ${userFrag}
  void main(){
    vec4 fragColor = vec4(0.0);
    vec2 fragCoord = gl_FragCoord.xy;
    mainImage(fragColor, fragCoord);
    outColor = fragColor;
  }`;

  function compile(gl: WebGL2RenderingContext, type: number, src: string) {
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(sh) || "Shader error";
      gl.deleteShader(sh);
      throw new Error(info);
    }
    return sh;
  }
  function link(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader) {
    const p = gl.createProgram()!;
    gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(p) || "Link error";
      gl.deleteProgram(p);
      throw new Error(info);
    }
    return p;
  }
  function resize(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h);
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", { premultipliedAlpha: true, antialias: false });
    if (!gl) { console.error("WebGL2 no disponible"); return; }
    glRef.current = gl;

    let prog: WebGLProgram | null = null;
    try {
      const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
      const fs = compile(gl, gl.FRAGMENT_SHADER, wrapFragment(shaderSource));
      prog = link(gl, vs, fs);
      gl.deleteShader(vs); gl.deleteShader(fs);
    } catch (e) {
      console.error("Error compilando/enlazando shader:", e);
      return;
    }

    programRef.current = prog;
    gl.useProgram(prog);
    uniformLocsRef.current = {
      iResolution: gl.getUniformLocation(prog, "iResolution"),
      iTime: gl.getUniformLocation(prog, "iTime"),
      iFrame: gl.getUniformLocation(prog, "iFrame"),
      iMouse: gl.getUniformLocation(prog, "iMouse"),
      uBaseColor: gl.getUniformLocation(prog, "uBaseColor"),
      uHighlightColor: gl.getUniformLocation(prog, "uHighlightColor"),
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      mouseRef.current.x = (e.clientX - rect.left) * dpr;
      mouseRef.current.y = (rect.height - (e.clientY - rect.top)) * dpr; // origin bottom-left
    };
    const onDown = () => (mouseRef.current.down = true);
    const onUp = () => (mouseRef.current.down = false);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    const onResize = () => resize(gl, canvas);
    window.addEventListener("resize", onResize);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const interval = 1000 / Math.max(1, Math.min(240, maxFps));
    startRef.current = performance.now();
    lastRef.current = 0;
    frameRef.current = 0;

    let visible = true;
    const onVis = () => { visible = document.visibilityState === "visible"; lastRef.current = performance.now(); };
    document.addEventListener("visibilitychange", onVis);

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (!visible) return;
      if (reduceMotion && frameRef.current > 0) return;
      if (now - lastRef.current < interval) return;
      lastRef.current = now;

      resize(gl, canvas);
      gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
      gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);

      const t = (now - startRef.current) / 1000.0;
      gl.uniform3f(uniformLocsRef.current.iResolution, canvas.width, canvas.height, 1.0);
      gl.uniform1f(uniformLocsRef.current.iTime, t);
      gl.uniform1i(uniformLocsRef.current.iFrame, frameRef.current | 0);
      const m = mouseRef.current; const click = m.down ? 1.0 : 0.0;
      gl.uniform4f(uniformLocsRef.current.iMouse, m.x, m.y, click * m.x, click * m.y);

      const base = toRgb01(baseColor);
      const hi = toRgb01(highlightColor);
      gl.uniform3f(uniformLocsRef.current.uBaseColor!, base[0], base[1], base[2]);
      gl.uniform3f(uniformLocsRef.current.uHighlightColor!, hi[0], hi[1], hi[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 3);
      frameRef.current++;
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      if (prog) gl.deleteProgram(prog);
      glRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },  [shaderSource, maxFps, baseColor as unknown, highlightColor as unknown]);

  // ─────────────── Overlay (blur + grain + glass + tint) ───────────────
  const noiseSvg = encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
      <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='1' seed='2'/><feColorMatrix type='saturate' values='0'/></filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`
  );
  const noiseUrl = `url("data:image/svg+xml,${noiseSvg}")`;

  // Combined backdrop-filter (blur + glass)
  const glassFilter =
    `blur(${Math.max(0, overlayBlurPx)}px)` +
    (enableGlass ? ` saturate(${glassSaturate}) brightness(${glassBrightness}) contrast(${glassContrast})` : "");

  return (
    <>
      <canvas
        ref={canvasRef}
        className={className}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", zIndex: -1, display: "block" }}
      />

      {showOverlay && (
        // Base layer: applies backdrop-filter (blur + glass) over the canvas behind
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backdropFilter: glassFilter,
            WebkitBackdropFilter: glassFilter,
            backgroundColor: "rgba(0,0,0,0.001)", // activates the backdrop in Safari/WebKit
          }}
        >
          {/* Grain layer (animated) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: noiseUrl,
              backgroundRepeat: "repeat",
              backgroundSize: `${Math.max(1, grainScale) * 64}px ${Math.max(1, grainScale) * 64}px`,
              opacity: Math.max(0, Math.min(1, grainOpacity)),
              animation: `grainShift ${Math.max(0.01, grainSpeed)}s steps(2,end) infinite`,
              mixBlendMode: "overlay",
            }}
          />
          {/* Tint layer */}
          {tintEnabled && (
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: tintColor,
                opacity: Math.max(0, Math.min(1, tintOpacity)),
                // With "normal" it acts as a veil; "multiply" darkens; "screen" lightens;
                // "soft-light"/"overlay" give a glassy look; "color"/"hue" push the tint's hue.
                mixBlendMode: tintBlendMode,
              }}
            />
          )}
        </div>
      )}

      <style>{`
        @keyframes grainShift { 0% { background-position:0 0; } 100% { background-position:64px 64px; } }
      `}</style>
    </>
  );
}

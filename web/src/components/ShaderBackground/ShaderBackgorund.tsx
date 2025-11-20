import { useTheme } from "../../contexts/theme/useTheme";
import ShaderWrapper from "./ShaderWrapper";

/* 
    Shader modified from https://www.shadertoy.com/view/llcXW7, originally by k-mouse.
    Added parameters for base color and highlight color to allow theme adaptation.
    Also modified some of the calculations.
*/
const waterShader = String.raw`
// Made by k-mouse (2016-11-23)
// Modified from David Hoskins (2013-07-07) and joltz0r (2013-07-04)

#define TAU 6.28318530718
#define TILING_FACTOR 0.65
#define MAX_ITER 6

uniform vec3 uBaseColor;
uniform vec3 uHighlightColor;

float waterHighlight(vec2 p, float time, float foaminess)
{
    vec2 i = vec2(p);
    float c = 0.0;
    float foaminess_factor = mix(1.0, 2.0, foaminess);
    float inten = .005 * foaminess_factor;

    for (int n = 0; n < MAX_ITER; n++) 
    {
        float t = time * (1.0 - (2.5/ float(n+1)));
        i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
        c += 1.0/length(vec2(p.x / (sin(i.x+t)),p.y / (cos(i.y+t))));
    }
    c = 0.2 + c / (inten * float(MAX_ITER));
    c = 1.17 - pow(c, 1.4);
    c = pow(abs(c), 8.0);
    return c / sqrt(foaminess_factor);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) 
{
    float time = iTime * 0.1 + 23.0;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 uv_square = vec2(uv.x * iResolution.x / iResolution.y, uv.y);
    float dist_center = pow(2.0*length(uv - 0.5), 1.0);

    float foaminess = smoothstep(0.4, 1.8, dist_center);
    float clearness = 0.1 + 0.9*smoothstep(0.1, 0.5, dist_center);

    vec2 p = mod(uv_square*TAU*TILING_FACTOR, TAU) - 250.0;
    float c = waterHighlight(p, time, foaminess);

    vec3 boosted = clamp(uBaseColor + c * uHighlightColor, 0.0, 1.0);
    vec3 color = mix(uBaseColor, boosted, clearness);

    fragColor = vec4(color, 1.0);
}
`;

export default function ShaderBackground() {
  const { isDark } = useTheme();


  // Presets de overlay/tint
  const blur = isDark ? 6 : 8;               // desenfoque del agua por detrás
  const sat  = isDark ? 1.05 : 0.90;         // saturación del glass
  const bri  = isDark ? 0.92 : 0.92;         // brillo del glass
  const con  = isDark ? 1.10 : 1.15;         // contraste del glass
  // Velo/tinte: en dark, leve violeta; en light, blanco suave
  const tintColor   = isDark ? "rgba(124,58,237,1)" : "rgba(255,255,255,1)";
  const tintOpacity = isDark ? 0.10 : 0.10;
  const tintMode    = "soft-light" as const; // cohesiona sin lavar el color

  return (
    <ShaderWrapper
      shaderSource={waterShader}
      maxFps={25}

      baseColor={isDark ? "#101010" : [0.00, 0.35, 0.50]}
      highlightColor={isDark ? "#562c76" : [0.85, 0.90, 0.95]}

      showOverlay={true}
      overlayBlurPx={blur}
      grainOpacity={0.1}
      grainScale={1.5}
      grainSpeed={0.7}
      
      enableGlass={true}
      glassSaturate={sat}
      glassBrightness={bri}
      glassContrast={con}

      tintEnabled={true}
      tintColor={tintColor}
      tintOpacity={tintOpacity}
      tintBlendMode={tintMode}
    />
  );
}

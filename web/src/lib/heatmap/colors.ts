/**
 * Convierte un valor de heatmap normalizado (0-1) a un color HSL
 * Rojo (caliente) -> Amarillo -> Verde -> Azul claro -> Azul oscuro (frío)
 */
export function getHeatmapColor(normalizedValue: number, alpha: number = 1): string {
  // Asegurar que el valor esté entre 0 y 1
  const value = Math.max(0, Math.min(1, normalizedValue));
  
  if (value === 0) {
    return `hsla(0, 0%, 0%, 0)`; // Transparente
  }
  
  let hue: number;
  let saturation: number;
  let lightness: number;
  
  if (value <= 0.25) {
    // Azul oscuro a azul claro (240° a 200°)
    hue = 240 - (value / 0.25) * 40;
    saturation = 80 + (value / 0.25) * 20; // 80% a 100%
    lightness = 30 + (value / 0.25) * 20;  // 30% a 50%
  } else if (value <= 0.5) {
    // Azul claro a verde (200° a 120°)
    const localValue = (value - 0.25) / 0.25;
    hue = 200 - localValue * 80;
    saturation = 100;
    lightness = 50 + localValue * 10; // 50% a 60%
  } else if (value <= 0.75) {
    // Verde a amarillo (120° a 60°)
    const localValue = (value - 0.5) / 0.25;
    hue = 120 - localValue * 60;
    saturation = 100;
    lightness = 60 + localValue * 10; // 60% a 70%
  } else {
    // Amarillo a rojo (60° a 0°)
    const localValue = (value - 0.75) / 0.25;
    hue = 60 - localValue * 60;
    saturation = 100;
    lightness = 70 - localValue * 20; // 70% a 50%
  }
  
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
}

/**
 * Genera un gradiente radial para el canvas basado en un valor de intensidad
 */
export function createRadialGradient(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  normalizedValue: number
): CanvasGradient {
  const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
  
  const centerColor = getHeatmapColor(normalizedValue, 0.8);
  const edgeColor = getHeatmapColor(normalizedValue * 0.3, 0.2);
  const outerColor = getHeatmapColor(normalizedValue * 0.1, 0);
  
  gradient.addColorStop(0, centerColor);
  gradient.addColorStop(0.4, edgeColor);
  gradient.addColorStop(1, outerColor);
  
  return gradient;
}

/**
 * Aplica un efecto de blur gaussiano simplificado para suavizar el heatmap
 */
export function applyGaussianBlur(
  imageData: ImageData,
  radius: number
): ImageData {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  
  // Blur horizontal
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const sampleX = Math.max(0, Math.min(width - 1, x + i));
        const sampleIdx = (y * width + sampleX) * 4;
        
        r += data[sampleIdx];
        g += data[sampleIdx + 1];
        b += data[sampleIdx + 2];
        a += data[sampleIdx + 3];
        count++;
      }
      
      output[idx] = r / count;
      output[idx + 1] = g / count;
      output[idx + 2] = b / count;
      output[idx + 3] = a / count;
    }
  }
  
  // Blur vertical
  const finalOutput = new Uint8ClampedArray(output);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const sampleY = Math.max(0, Math.min(height - 1, y + i));
        const sampleIdx = (sampleY * width + x) * 4;
        
        r += output[sampleIdx];
        g += output[sampleIdx + 1];
        b += output[sampleIdx + 2];
        a += output[sampleIdx + 3];
        count++;
      }
      
      finalOutput[idx] = r / count;
      finalOutput[idx + 1] = g / count;
      finalOutput[idx + 2] = b / count;
      finalOutput[idx + 3] = a / count;
    }
  }
  
  return new ImageData(finalOutput, width, height);
}
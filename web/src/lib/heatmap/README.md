# Heatmap System Documentation

## Overview

El sistema de heatmap ha sido completamente rediseñado para proporcionar visualizaciones de mapas de calor más realistas y atractivas. En lugar de simples rectángulos, ahora genera gradientes suaves con colores que van desde azul oscuro (valores bajos) hasta rojo intenso (valores altos).

## Features

### 🎨 **Nuevo Sistema de Colores**
- **Azul oscuro** → **Azul claro** → **Verde** → **Amarillo** → **Rojo**
- Transiciones suaves entre colores
- Gradientes radiales para efectos de "mancha de calor" realistas

### 🔥 **Modos de Renderizado**
- **`gradient`** (por defecto): Heatmap con gradientes suaves y efectos de blur
- **`circle`**: Círculos con colores del nuevo sistema
- **`rect`**: Rectángulos con colores del nuevo sistema

### ⚡ **Performance Optimizations**
- Arquitectura modular separada en componentes específicos
- Renderizado eficiente con canvas temporal para efectos
- Throttling de dibujo configurable

## Architecture

```
src/lib/heatmap/
├── index.ts          # Exportaciones principales
├── types.ts          # Definiciones de tipos TypeScript
├── colors.ts         # Sistema de colores y gradientes
├── renderer.ts       # Lógica de renderizado del canvas
└── grid.ts          # Gestión de datos de la grilla
```

## Usage

### Basic Usage

```tsx
import { useHeatmap } from '../hooks/useHeatmap';

function MyComponent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { getHeatmapData, getTopCells, showTopCellsOnly, reset } = useHeatmap(containerRef, {
    shape: 'gradient',      // Nuevo modo por defecto
    gradientRadius: 30,     // Radio del gradiente en píxeles
    intensity: 1.2,         // Multiplicador de intensidad
    maxCols: 30,
    cellHeight: 50,
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', height: '500px' }}>
      {/* Tu contenido aquí */}
    </div>
  );
}
```

### Advanced Configuration

```tsx
const heatmapOptions = {
  // Grid configuration
  maxCols: 25,              // Número de columnas
  maxRows: 100,             // Máximo número de filas
  cellHeight: 60,           // Altura de cada celda en píxeles
  
  // Visual appearance
  shape: 'gradient',        // 'gradient' | 'circle' | 'rect'
  gradientRadius: 30,       // Radio del gradiente (solo para 'gradient')
  intensity: 1.0,           // Multiplicador de intensidad del color
  radius: 15,               // Radio para círculos (solo para 'circle')
  
  // Performance
  drawIntervalMs: 100,      // Throttling del renderizado
  idleMs: 2000,             // Tiempo de inactividad antes de parar grabación
  
  // Control
  disabled: false,          // Deshabilitar completamente el heatmap
};
```

### API Methods

#### `getHeatmapData(): HeatmapData | null`
Obtiene todos los datos actuales del heatmap:
```tsx
const data = getHeatmapData();
console.log(data?.totalInteractions); // Total de interacciones
console.log(data?.isRecording);       // Si está grabando actualmente
```

#### `getTopCells(topN: number): TopCell[]`
Obtiene las N celdas con mayor actividad:
```tsx
const topCells = getTopCells(10);
topCells.forEach(cell => {
  console.log(`Cell at (${cell.col}, ${cell.row}): ${cell.value} interactions`);
});
```

#### `showTopCellsOnly(topN: number): void`
Muestra solo las top N celdas con mayor actividad:
```tsx
// Mostrar solo las 5 áreas más activas
showTopCellsOnly(5);
```

#### `reset(): void`
Reinicia todos los datos del heatmap:
```tsx
reset(); // Limpia toda la actividad registrada
```

## Color System

### Heat Value Mapping
- **0.00 - 0.25**: Azul oscuro → Azul claro (240° → 200° HSL)
- **0.25 - 0.50**: Azul claro → Verde (200° → 120° HSL)  
- **0.50 - 0.75**: Verde → Amarillo (120° → 60° HSL)
- **0.75 - 1.00**: Amarillo → Rojo (60° → 0° HSL)

### Functions Available
```tsx
import { getHeatmapColor, createRadialGradient } from '../lib/heatmap';

// Obtener color para un valor normalizado (0-1)
const color = getHeatmapColor(0.7, 0.8); // valor, alpha
// Resultado: "hsla(42, 100%, 62%, 0.8)" (amarillo-naranja)
```

## Migration from Old System

### Cambios principales:
1. **shape**: Cambia `'rect'` por `'gradient'` para el nuevo estilo
2. **Nuevas opciones**: `gradientRadius`, `intensity`
3. **API mejorada**: Los métodos devuelven objetos más ricos con más información

### Ejemplo de migración:
```tsx
// Antes
const { getTopCells } = useHeatmap(ref, { shape: 'rect' });

// Ahora
const { getTopCells } = useHeatmap(ref, { 
  shape: 'gradient',
  gradientRadius: 25,
  intensity: 1.1 
});
```

## Performance Tips

1. **Ajusta `drawIntervalMs`**: Valores más altos = mejor performance, menos fluidez
2. **Usa `maxRows` y `maxCols` apropiados**: Grillas más pequeñas = mejor performance
3. **`gradientRadius`**: Radios más pequeños = menos cálculos = mejor performance
4. **`intensity`**: Solo afecta visualización, no performance

## Browser Compatibility

- ✅ Chrome 60+
- ✅ Firefox 55+  
- ✅ Safari 14+
- ✅ Edge 79+

Requiere soporte para:
- Canvas 2D Context
- RequestAnimationFrame
- Float32Array
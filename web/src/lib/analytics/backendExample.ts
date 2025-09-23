// Ejemplo de métricas optimizadas para envío al backend
// Este es un ejemplo de cómo se verían las métricas listas para enviar

export const exampleBackendMetrics = {
  activeTimeMs: 45230, // Tiempo activo total del usuario en la página
  
  projectMetrics: {
    "998414481": { // ID del proyecto Porflyo
      timeInViewMs: 12000, // 12 segundos viendo este proyecto
      timeToFirstInteractionMs: 3500, // 3.5 segundos hasta primera interacción
      codeViews: 2, // 2 clicks en botones (ver código)
      liveViews: 1, // 1 click en enlaces externos (ver demo)
    },
    "884221032": { // ID del proyecto FarmaciaVendeButano
      timeInViewMs: 8000, // 8 segundos viendo este proyecto
      timeToFirstInteractionMs: null, // No hubo interacciones
      codeViews: 0, // 0 clicks en botones
      liveViews: 0, // 0 clicks en enlaces externos
    }
  },
  
  scrollMetrics: {
    score: 67, // Puntuación de engagement de scroll (0-100)
    scrollTimeMs: 15000, // 15 segundos activamente scrolleando
  },
  
  heatmapData: {
    cols: 64, // Columnas de la grilla del heatmap
    rows: 1024, // Filas de la grilla del heatmap
    topCells: {
      // Solo las top 200 celdas más activas
      indices: [45, 89, 127, 234, 445, 556, 667, 778], // Índices de las celdas
      values: [15, 12, 8, 7, 6, 5, 4, 3], // Valores correspondientes
    }
  }
};

/*
FORMATO OPTIMIZADO PARA BACKEND:

1. activeTimeMs - Tiempo activo total (clave para métricas de engagement)

2. projectMetrics - Métricas por proyecto:
   - timeInViewMs: Tiempo viendo cada proyecto
   - timeToFirstInteractionMs: TTFI por proyecto (null si no hubo)
   - codeViews: Clicks en botones (interés en código)
   - liveViews: Clicks en enlaces externos (interés en ver demos)

3. scrollMetrics - Métricas de scroll:
   - score: Puntuación 0-100 (ya calculada, lista para agregación)
   - scrollTimeMs: Tiempo activo scrolleando

4. heatmapData - Datos del mapa de calor:
   - cols/rows: Dimensiones de la grilla
   - topCells: Solo las 200 celdas más activas (no todo el array)
     - indices: Array de índices de celdas activas
     - values: Array de valores correspondientes

VENTAJAS:
- Tamaño mínimo: Solo datos esenciales
- Fácil agregación: Valores ya procesados
- Escalable: Top cells en lugar de grilla completa
- Backend-ready: Formato directo para BD
*/
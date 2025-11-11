// Ejemplo de métricas optimizadas para envío al backend
// Este es un ejemplo de cómo se verían las métricas listas para enviar

export const exampleBackendMetrics = {
  activeTimeMs: 45230, // Tiempo activo total del usuario en la página
  isMobile: false, // Detecta si es dispositivo móvil
  emailCopied: true, // Si el usuario copió el email al portapapeles
  socialClicks: 2, // Número de clicks en redes sociales
  
  projectMetrics: [
    {
      id: "998414481", // ID del proyecto Porflyo
      viewTime: 12000, // 12 segundos viendo este proyecto
      exposures: 3, // 3 veces mostrado en pantalla
      codeViews: 2, // 2 clicks en botones (ver código)
      liveViews: 1, // 1 click en enlaces externos (ver demo)
    },
    {
      id: "884221032", // ID del proyecto FarmaciaVendeButano
      viewTime: 8000, // 8 segundos viendo este proyecto
      exposures: 1, // 1 vez mostrado en pantalla
      codeViews: 0, // 0 clicks en botones
      liveViews: 0, // 0 clicks en enlaces externos
    }
  ],
  
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

2. isMobile - Detecta si el usuario usa dispositivo móvil

3. emailCopied - Indica si el usuario copió el email al portapapeles

4. socialClicks - Número total de clicks en redes sociales

5. projectMetrics - Array de métricas por proyecto:
   - id: ID único del proyecto
   - viewTime: Tiempo viendo cada proyecto (en milisegundos)
   - exposures: Número de veces que el proyecto fue mostrado en pantalla
   - codeViews: Clicks en botones (interés en código)
   - liveViews: Clicks en enlaces externos (interés en ver demos)

6. scrollMetrics - Métricas de scroll:
   - score: Puntuación 0-100 (ya calculada, lista para agregación)
   - scrollTimeMs: Tiempo activo scrolleando

7. heatmapData - Datos del mapa de calor:
   - cols/rows: Dimensiones de la grilla
   - topCells: Solo las 200 celdas más activas (no todo el array)
     - indices: Array de índices de celdas activas
     - values: Array de valores correspondientes

VENTAJAS:
- Tamaño mínimo: Solo datos esenciales
- Fácil agregación: Valores ya procesados
- Escalable: Top cells en lugar de grilla completa
- Backend-ready: Formato directo para BD
- Exposures: Mide visibilidad real de cada proyecto
*/
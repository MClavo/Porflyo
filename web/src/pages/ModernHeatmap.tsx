/**
 * ModernHeatmap - Dashboard de mapa de calor moderno
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { PortfolioViewer } from '../components/portfolio';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { useMetricsStore } from '../state/metrics.store';
import { latest } from '../lib/dates';
import { demoInitialPortfolio } from '../pages/editor/demoData';
import '../styles/dashboard-theme.css';

function ModernHeatmapContent() {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);
  const [heatmapInstance, setHeatmapInstance] = useState<unknown>(null);
  const [isHeatmapReady, setIsHeatmapReady] = useState(false);

  // Obtener datos del backend usando el store como en ModernOverview
  const { slotByDate, slotIndex, isLoading } = useMetricsStore();

  // Transformar datos del heatmap del backend como en MetricsTest
  const transformBackendHeatmapData = useCallback(() => {
    if (!slotByDate || slotIndex.length === 0) {
      return null;
    }

    const latestDate = latest(slotIndex);
 
    if (!latestDate) {
      return null;
    }

    // Buscar el slot más reciente
    const latestSlot = Object.values(slotByDate).find(slot => slot.date === latestDate);
    if (!latestSlot) {
      return null;
    }

    const { heatmap } = latestSlot;
    
    if (!heatmap || !heatmap.meta || !heatmap.cells) {
      return null;
    }

    const { cells } = heatmap;

    // Calcular dimensiones del portfolio
    const portfolioRect = portfolioRef.current?.getBoundingClientRect();
    if (!portfolioRect) {
      return null;
    }

    const columns = 64; // SIEMPRE 64 columnas como especificaste
    const cellWidth = portfolioRect.width / columns;
    const cellHeight = 25; // altura fija de celda


    if (!isFinite(cellWidth) || cellWidth <= 0) {
      return null;
    }

    // Encontrar el valor máximo para normalizar
    const maxCount = Math.max(...cells.map(c => Number(c.count) || 0), 1);

    // Transformar celdas a formato heatmap.js con validación robusta
    const rawPoints = cells.map((cell, idx) => {
      const indexNum = Number(cell.index);
      const countNum = Number(cell.count) || 0;

      if (!Number.isFinite(indexNum)) {
        return { __invalid: true, reason: 'index NaN', original: cell, idx };
      }

      const row = Math.floor(indexNum / columns);
      const col = indexNum % columns;

      const x = Math.round(col * cellWidth + cellWidth / 2);
      const y = Math.round(row * cellHeight + cellHeight / 2);
      const value = Math.round((countNum / maxCount) * 100); // Normalizar a 0-100

      return { x, y, value, __invalid: false };
    });

    
    const dataPoints = rawPoints.filter(p => !p.__invalid) as {x:number,y:number,value:number}[];
  
    const result = {
      max: 100,
      data: dataPoints
    };

    return result;
  }, [slotByDate, slotIndex]);

  // Inicializar heatmap.js
  useEffect(() => {
    const initHeatmap = async () => {
      try {
        const h337 = await import('heatmap.js');
        
        if (heatmapCanvasRef.current && portfolioRef.current) {
          
          const config = {
            container: portfolioRef.current,
            canvas: heatmapCanvasRef.current,
            radius: 25,
            maxOpacity: 0.6,
            minOpacity: 0.1,
            blur: 0.75,
            gradient: {
              '.0': '#1e3a8a',    // azul oscuro
              '.2': '#3b82f6',    // azul
              '.4': '#10b981',    // verde
              '.6': '#f59e0b',    // amarillo
              '.8': '#ef4444',    // rojo
              '1.0': '#dc2626'    // rojo intenso
            },
            // Evitar problemas con ImageData
            backgroundColor: 'rgba(0,0,0,0)'
          };
          
          const instance = h337.default.create(config);
          
          setHeatmapInstance(instance);
          setIsHeatmapReady(true);

        } 
      } catch {
        // Intentionally left blank: handle or log error if needed
      }
    };

    // Delay para asegurar que el DOM esté renderizado
    setTimeout(initHeatmap, 200);
  }, []);

  // Actualizar heatmap cuando cambien los datos del backend
  useEffect(() => {
    
    if (!heatmapInstance || !isHeatmapReady) {
      return;
    }

    const heatmapData = transformBackendHeatmapData();
    
    // Si no hay datos del backend, usar datos de prueba para confirmar que heatmap.js funciona
    
    if (heatmapData) {

      // Implementación temporal: renderizar puntos usando DOM en el contenedor del portfolio
      // NOTA: no se deben insertar elementos dentro de un <canvas>. Usar el contenedor (portfolioRef).
      const container = portfolioRef.current;
      if (container) {
        // Limpiar puntos previos
        container.querySelectorAll('.hm-dot').forEach(n => n.remove());


        heatmapData.data.forEach((point: {x: number, y: number, value: number}) => {

          const dot = document.createElement('div');
          dot.className = 'hm-dot';
          dot.style.position = 'absolute';
          dot.style.left = `${point.x}px`;
          dot.style.top = `${point.y}px`;
          dot.style.width = '18px';
          dot.style.height = '18px';
          dot.style.borderRadius = '50%';
          dot.style.pointerEvents = 'none';
          dot.style.transform = 'translate(-50%, -50%)';
          // Color basado en intensidad (value 0-100)
          const intensity = Math.max(0, Math.min(100, point.value));
          const red = Math.round(200 + (55 * (intensity / 100)));
          const green = Math.round(120 - (120 * (intensity / 100)));
          dot.style.background = `rgba(${red}, ${green}, 0, ${0.6})`;

          container.appendChild(dot);
        });

      }
    }
  }, [heatmapInstance, isHeatmapReady, transformBackendHeatmapData]);


  return (
    <div className="modern-heatmap-container" style={{ position: 'relative' }}>
      {/* Info panel */}
     

      {/* Portfolio con heatmap overlay */}
      <div 
        ref={portfolioRef}
        style={{ 
          position: 'relative',
          background: 'var(--dashboard-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--card-border)',
          minHeight: '600px', // Altura mínima para debug
          width: '100%'
        }}
        data-project-id="default"
      >
        {/* Canvas para el heatmap - SIMPLIFICADO */}
        <canvas
          ref={heatmapCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
        
        {/* Portfolio viewer */}
        <PortfolioViewer 
          portfolio={demoInitialPortfolio} 
          className="heatmap-portfolio"
        />
      </div>

      {/* Debug info */}
      {import.meta.env.DEV && (
        <div style={{
          marginTop: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--font-xs)',
          color: 'var(--text-secondary)'
        }}>
          <strong>Debug Info:</strong><br/>
          Heatmap Ready: {isHeatmapReady ? '✅' : '❌'}<br/>
          Data Source: {slotIndex.length > 0 ? 'Backend API' : 'No Data'}<br/>
          Latest Date: {latest(slotIndex) || 'None'}<br/>
          Loading: {isLoading ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  );
}

export default function ModernHeatmap() {
  return (
    <MetricsProvider portfolioId="default">
      <ModernHeatmapContent />
    </MetricsProvider>
  );
}
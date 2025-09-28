/**
 * ModernHeatmap - Dashboard de mapa de calor moderno
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { PortfolioViewer } from '../components/portfolio';


import { demoInitialPortfolio } from '../pages/editor/demoData';

import '../styles/dashboard-theme.css';





function ModernHeatmapContent() {
  const portfolioRef = useRef<HTMLDivElement>(null);
  const heatmapCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isHeatmapReady, setIsHeatmapReady] = useState(false);

  // NO llamar al backend por ahora - solo usar datos de ejemplo

  // Crear heatmap con canvas nativo (más confiable)
  useEffect(() => {
    const createNativeHeatmap = () => {
      console.log('🔥 Creando heatmap nativo...');
      
      const canvas = heatmapCanvasRef.current;
      if (!canvas) {
        console.error('❌ Canvas no encontrado');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('❌ Contexto 2D no disponible');
        return;
      }
      
      console.log('✅ Canvas y contexto obtenidos');
      
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Datos de prueba
      const heatmapPoints = [
        { x: 100, y: 100, intensity: 0.8 },
        { x: 200, y: 150, intensity: 0.6 },
        { x: 300, y: 200, intensity: 0.9 },
        { x: 150, y: 250, intensity: 0.7 },
        { x: 400, y: 100, intensity: 0.5 },
        { x: 250, y: 300, intensity: 0.8 },
        { x: 350, y: 180, intensity: 0.4 },
        { x: 120, y: 320, intensity: 0.6 }
      ];
      
      console.log('📊 Dibujando puntos del heatmap:', heatmapPoints);
      
      // Dibujar cada punto del heatmap
      heatmapPoints.forEach((point, index) => {
        const radius = 40;
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, radius
        );
        
        // Crear gradiente basado en intensidad
        const alpha = point.intensity;
        gradient.addColorStop(0, `rgba(255, 0, 0, ${alpha})`); // Rojo en el centro
        gradient.addColorStop(0.5, `rgba(255, 255, 0, ${alpha * 0.6})`); // Amarillo
        gradient.addColorStop(1, `rgba(0, 0, 255, 0)`); // Transparente en los bordes
        
        ctx.globalCompositeOperation = 'screen'; // Mezclar colores
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        console.log(`✨ Punto ${index + 1} dibujado en (${point.x}, ${point.y})`);
      });
      
      setIsHeatmapReady(true);
      console.log('🎉 Heatmap nativo creado exitosamente');
    };
    
    // Delay para asegurar DOM renderizado
    setTimeout(createNativeHeatmap, 200);
  }, []);

  // Generar nuevo heatmap nativo
  const generateNativeHeatmap = useCallback(() => {
    const canvas = heatmapCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Generar puntos aleatorios
    const numPoints = 15 + Math.floor(Math.random() * 10); // 15-25 puntos
    const points = [];
    
    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        intensity: Math.random() * 0.8 + 0.2 // 0.2 a 1.0
      });
    }
    
    // Dibujar puntos
    points.forEach((point) => {
      const radius = 30 + Math.random() * 20; // radio variable
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      );
      
      const alpha = point.intensity;
      // Usar gradiente de calor más realista
      const heatColors = [
        [59, 130, 246],   // Azul (frío)
        [16, 185, 129],   // Verde
        [245, 158, 11],   // Amarillo
        [239, 68, 68],    // Rojo
        [220, 38, 38]     // Rojo intenso (caliente)
      ];
      
      // Elegir color basado en intensidad
      const colorIndex = Math.floor(point.intensity * (heatColors.length - 1));
      const color = heatColors[colorIndex];
      
      gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`);
      gradient.addColorStop(0.7, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.3})`);
      gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
    

  }, []);



  // Los useEffect ya no son necesarios con canvas nativo
  // El heatmap se dibuja directamente en el useEffect inicial

  return (
    <div className="modern-heatmap-container" style={{ position: 'relative' }}>
      {/* Info panel */}
      <div style={{
        padding: 'var(--space-4)',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        marginBottom: 'var(--space-6)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ 
            fontSize: 'var(--font-xl)', 
            color: 'var(--text-primary)', 
            margin: 0,
            marginBottom: 'var(--space-1)'
          }}>
            🔥 Portfolio Heatmap
          </h2>
          <p style={{ 
            fontSize: 'var(--font-sm)', 
            color: 'var(--text-secondary)', 
            margin: 0 
          }}>
            Interaction patterns overlaid on portfolio content
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          alignItems: 'center'
        }}>
          <button
            onClick={() => {
              console.log('🔄 Botón presionado - generando nuevo heatmap nativo');
              generateNativeHeatmap();
            }}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-sm)',
              cursor: 'pointer'
            }}
          >
            🔄 Generate New Heatmap
          </button>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: 'var(--font-sm)', 
              color: 'var(--text-secondary)' 
            }}>
              Data Source
            </div>
            <div style={{ 
              fontSize: 'var(--font-lg)', 
              color: 'var(--text-primary)',
              fontWeight: 'bold'
            }}>
              Sample
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: 'var(--font-sm)', 
              color: 'var(--text-secondary)' 
            }}>
              Active Cells
            </div>
            <div style={{ 
              fontSize: 'var(--font-lg)', 
              color: 'var(--text-primary)',
              fontWeight: 'bold'
            }}>
              Generated
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ 
              fontSize: 'var(--font-sm)', 
              color: 'var(--text-secondary)' 
            }}>
              Coverage
            </div>
            <div style={{ 
              fontSize: 'var(--font-lg)', 
              color: 'var(--text-primary)',
              fontWeight: 'bold'
            }}>
              100%
            </div>
          </div>
        </div>
      </div>

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
          width={800}
          height={600}
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
          Data Mode: Sample Only<br/>
          Backend Calls: None<br/>
          Status: Stable
        </div>
      )}
    </div>
  );
}

export default function ModernHeatmap() {
  return <ModernHeatmapContent />;
}
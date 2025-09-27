import { useRef, useState, useEffect } from 'react';
import { PortfolioViewer } from '../components/portfolio';
import { demoInitialPortfolio } from './editor/demoData';
import useMetrics from '../hooks/metrics/useGetMetrics';
import ScrollMetricsDisplay from '../components/analytics/ScrollMetricsDisplay';
import InteractionMetricsDisplay from '../components/analytics/InteractionMetricsDisplay';
import '../styles/PublicPortfolio.css';
import '../styles/MetricsTest.css';
import type { PortfolioState } from '../state/Portfolio.types';
import { initAnalytics } from '../lib/analytics';

export default function MetricsTest() {
  // initialize analytics client only for this testing page
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const mod = await import('analytics');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Analytics = (mod && (mod.default ?? mod)) as unknown as (...args: any[]) => any;
  const analytics = Analytics({ app: 'reactplayground', plugins: [] });
        if (!mounted) return;
        initAnalytics({
          track: (eventName: string, payload?: unknown) => {
            try {
              analytics.track(eventName, payload);
            } catch (err) {
              console.warn('analytics.track failed', err);
            }
          }
        });
      } catch (err) {
        console.info('analytics not available in MetricsTest', err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const { metricsCollector, heatmap, getBackendMetrics } = useMetrics(mainContentRef, { // Usa mainContentRef en lugar de containerRef 
    trackClicks: true, 
    trackLinks: true,
    enableHeatmap: true,
    heatmapOptions: {
      maxCols: 64,
      maxRows: 1024,
      cellHeight: 25,
      shape: 'rect', // cuadrados que se adaptan al ancho
      idleMs: 2000,
      drawIntervalMs: 100
    }
    // Ya no necesitamos projectId fijo - se detecta automáticamente desde data-project-id
  });

  const [metricsJson, setMetricsJson] = useState<string>('{}');
  const [topCellsCount, setTopCellsCount] = useState<number>(200);
  const [showingTopCells, setShowingTopCells] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'backend' | 'raw' | 'topCells'>('backend');

  const refresh = () => {
    let data;
    if (currentView === 'topCells') {
      data = metricsCollector.getTopCellsMetrics(topCellsCount);
    } else if (currentView === 'backend') {
      data = getBackendMetrics();
    } else {
      data = metricsCollector.getMetrics();
    }
    setMetricsJson(JSON.stringify(data, null, 2));
  };

  const clear = () => {
    metricsCollector.clear();
    setMetricsJson('{}');
    setShowingTopCells(false);
    setCurrentView('backend');
  };

  const showTopCells = () => {
    if (heatmap && heatmap.showTopCellsOnly) {
      heatmap.showTopCellsOnly(topCellsCount);
      setShowingTopCells(true);
      setCurrentView('topCells');
      const data = metricsCollector.getTopCellsMetrics(topCellsCount);
      setMetricsJson(JSON.stringify(data, null, 2));
    }
  };

  const showBackendMetrics = () => {
    const backendData = getBackendMetrics();
    setMetricsJson(JSON.stringify(backendData, null, 2));
    setShowingTopCells(false);
    setCurrentView('backend');
    console.log('🚀 Backend Metrics:', backendData);
  };

  const showRawMetrics = () => {
    const rawData = metricsCollector.getMetrics();
    setMetricsJson(JSON.stringify(rawData, null, 2));
    setShowingTopCells(false);
    setCurrentView('raw');
    console.log('📊 Raw Metrics:', rawData);
  };

  // Auto-refresh every second to show live updates
  useEffect(() => {
    // Initial load - show backend metrics by default
    const updateData = () => {
      let data;
      if (currentView === 'topCells') {
        data = metricsCollector.getTopCellsMetrics(topCellsCount);
      } else if (currentView === 'backend') {
        data = getBackendMetrics();
      } else {
        data = metricsCollector.getMetrics();
      }
      setMetricsJson(JSON.stringify(data, null, 2));
    };
    
    updateData();
    
    const interval = setInterval(updateData, 1000);
    
    return () => clearInterval(interval);
  }, [metricsCollector, currentView, topCellsCount, getBackendMetrics]);

  return (
    <div className="public-portfolio-container metrics-test-container">
      <div className="metrics-test-inner">
        <div className="metrics-test-viewer-wrapper" ref={mainContentRef}>
          <div className="metrics-test-viewer">
            <PortfolioViewer portfolio={demoInitialPortfolio as unknown as PortfolioState} className="public-portfolio" />
            
            {/* Botones de prueba para generar métricas */}
            <div style={{ padding: '20px', borderTop: '1px solid #eee', marginTop: '20px' }}>
              <h4>Botones de prueba (métricas por proyecto + heatmap):</h4>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Los clicks en los proyectos de arriba se agrupan por repoId automáticamente.<br/>
                Mueve el cursor por toda la pantalla para generar datos del heatmap.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button id="general-contact-btn">Contacto General</button>
                <button id="general-info-btn">Más Información</button>
                <button 
                  onClick={() => {
                    // Auto-scroll test
                    if (mainContentRef.current) {
                      mainContentRef.current.scrollTo({ top: 500, behavior: 'smooth' });
                      setTimeout(() => {
                        if (mainContentRef.current) {
                          mainContentRef.current.scrollTo({ top: 1000, behavior: 'smooth' });
                        }
                      }, 1000);
                    }
                  }}
                  style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
                >
                  🧪 Test Auto-Scroll
                </button>
                <button 
                  onClick={() => {
                    // Debug scroll tracking
                    import('../lib/analytics/scrollTracker').then(({ scrollTracker }) => {
                      const status = scrollTracker.getTrackingStatus();
                      console.log('🔍 Scroll Tracking Status:', status);
                      const metrics = scrollTracker.getMetrics();
                      console.log('📊 Current Metrics:', metrics);
                      alert(`Tracking: ${status.isTracking}\nElement: ${status.targetElement}\nEvents: ${status.totalEvents}\nDistance: ${metrics.totalScrollDistance}px`);
                    });
                  }}
                  style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
                >
                  🔍 Debug Scroll
                </button>
                <button 
                  onClick={() => {
                    // Debug interaction tracking
                    import('../lib/analytics/interactionTracker').then(({ interactionTracker }) => {
                      const metrics = interactionTracker.getMetrics();
                      console.log('🔍 Interaction Tracking Status:', metrics);
                      alert(`Views: ${metrics.totalViews}\nInteractions: ${metrics.totalInteractions}\nTTFI: ${metrics.timeToFirstInteractionMs}ms\nProjects: ${Object.keys(metrics.projectMetrics).length}`);
                    });
                  }}
                  style={{ background: '#6f42c1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}
                >
                  🔍 Debug Interactions
                </button>
                <a href="https://portfolio.example.com" style={{ padding: '8px 16px', background: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                  Ver Portfolio Completo
                </a>
              </div>
            </div>
            
            {/* Contenido adicional para hacer scroll más largo */}
            <div style={{ padding: '20px', background: '#f8f9fa', marginTop: '20px' }}>
              <h4>🔄 Área de prueba de scroll</h4>
              <p>Desplázate por esta sección para generar métricas de scroll y ver el engagement score aumentar.</p>
              
              <div style={{ height: '200px', background: 'linear-gradient(45deg, #e3f2fd, #bbdefb)', margin: '20px 0', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Sección 1 - Scroll lentamente para mejor engagement</h3>
              </div>
              
              <div style={{ height: '300px', background: 'linear-gradient(45deg, #f3e5f5, #ce93d8)', margin: '20px 0', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Sección 2 - Prueba diferentes velocidades de scroll</h3>
              </div>
              
              <div style={{ height: '250px', background: 'linear-gradient(45deg, #e8f5e8, #a5d6a7)', margin: '20px 0', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Sección 3 - El score de engagement se actualiza en tiempo real</h3>
              </div>
              
              <div style={{ height: '200px', background: 'linear-gradient(45deg, #fff3e0, #ffcc02)', margin: '20px 0', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3>Sección 4 - Final del contenido</h3>
              </div>
            </div>
          </div>
        </div>

        <aside className="metrics-test-panel" aria-label="metrics panel">
          <h3>Métricas + Heatmap</h3>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            Mueve el cursor para ver el heatmap en tiempo real. Pausa tras 2s sin movimiento.
          </p>
          
          {/* Componente de métricas de scroll */}
          <div style={{ marginBottom: '16px' }}>
            <ScrollMetricsDisplay 
              showEngagementScore={true}
              showDetailedMetrics={true}
              className="scroll-metrics-section"
            />
          </div>

          {/* Componente de métricas de interacción */}
          <div style={{ marginBottom: '16px' }}>
            <InteractionMetricsDisplay 
              showProjectBreakdown={true}
              updateInterval={1000}
              className="interaction-metrics-section"
            />
          </div>
          
          <div style={{ marginBottom: '12px', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
              Top celdas a mostrar/enviar:
            </label>
            <input
              type="number"
              value={topCellsCount}
              onChange={(e) => setTopCellsCount(Math.max(1, parseInt(e.target.value) || 200))}
              min="1"
              max="1000"
              style={{ width: '60px', marginRight: '8px', padding: '2px 4px' }}
            />
            <button 
              onClick={showTopCells}
              style={{ fontSize: '12px', padding: '4px 8px' }}
              title="Limpia el heatmap y muestra solo las N celdas con mayor valor"
            >
              Ver Top {topCellsCount}
            </button>
            {showingTopCells && (
              <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                ✓ Mostrando solo las {topCellsCount} celdas con mayor valor
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button onClick={refresh}>Actualizar</button>
            <button onClick={clear}>Limpiar</button>
            <button onClick={showBackendMetrics} style={{ backgroundColor: '#2563eb', color: 'white' }}>
              📤 Backend
            </button>
            <button onClick={showRawMetrics} style={{ backgroundColor: '#6b7280', color: 'white' }}>
              📊 Raw
            </button>
          </div>
          
          {/* Indicador de vista actual */}
          <div style={{ 
            fontSize: '11px', 
            color: currentView === 'backend' ? '#2563eb' : currentView === 'raw' ? '#6b7280' : '#16a34a',
            marginBottom: '4px',
            fontWeight: 'bold'
          }}>
            📊 Mostrando: {
              currentView === 'backend' ? 'Métricas Backend (optimizadas)' :
              currentView === 'raw' ? 'Métricas Raw (completas)' :
              `Top ${topCellsCount} celdas Heatmap`
            }
          </div>
          
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{metricsJson}</pre>
        </aside>
      </div>
    </div>
  );
}

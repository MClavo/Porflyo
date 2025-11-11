/**
 * ModernDashboard - Router para páginas del dashboard moderno
 */

import { useParams } from 'react-router-dom';
import { DashboardProvider } from '../contexts/DashboardContext';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { useDashboard } from '../hooks/useDashboard';
import { useHeatmapSlots } from '../hooks/useHeatmapSlots';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import ModernOverview from './ModernOverview';
import ModernHeatmap from './ModernHeatmap';
import ModernProjects from './ModernProjects';
import './ModernDashboard.css';

function DashboardRouter() {
  const { currentPage } = useDashboard();
  const { selectedSlot, slotOptions, handleSlotChange, heatmapMode, handleModeChange } = useHeatmapSlots();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <ModernOverview />;
      case 'heatmap':
        return <ModernHeatmap selectedSlot={selectedSlot} heatmapMode={heatmapMode} />;
      case 'projects':
        return <ModernProjects />;
      default:
        return null;
    }
  };

  return (
    <ModernDashboardLayout
      slotOptions={currentPage === 'heatmap' ? slotOptions : []}
      selectedSlot={currentPage === 'heatmap' ? selectedSlot : ''}
      onSlotChange={currentPage === 'heatmap' ? handleSlotChange : () => {}}
      heatmapMode={currentPage === 'heatmap' ? heatmapMode : 'raw'}
      onHeatmapModeChange={currentPage === 'heatmap' ? handleModeChange : () => {}}
    >
      <div className="modern-dashboard__content">
        {renderCurrentPage()}
      </div>
    </ModernDashboardLayout>
  );
}

export default function ModernDashboard() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  
  if (!portfolioId) {
    return <div>Error: Portfolio ID is required</div>;
  }

  return (
    <DashboardProvider portfolioId={portfolioId}>
      <MetricsProvider portfolioId={portfolioId}>
        <DashboardRouter />
      </MetricsProvider>
    </DashboardProvider>
  );
}
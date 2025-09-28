/**
 * ModernDashboard - Router para páginas del dashboard moderno
 */


import { DashboardProvider } from '../contexts/DashboardContext';
import { useDashboard } from '../hooks/useDashboard';
import { useHeatmapSlots } from '../hooks/useHeatmapSlots';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import ModernOverview from './ModernOverview';
import ModernHeatmap from './ModernHeatmap';
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
  return (
    <DashboardProvider>
      <DashboardRouter />
    </DashboardProvider>
  );
}
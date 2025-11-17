/**
 * Dashboard - Router para páginas del dashboard o
 */

import { useParams } from 'react-router-dom';
import { DashboardProvider } from '../contexts/DashboardContext';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { useDashboard } from '../hooks/useDashboard';
import { useHeatmapSlots } from '../hooks/useHeatmapSlots';
import { useSEO } from '../hooks/useSEO';
import DashboardLayout from '../components/layout/DashboardLayout';
import Overview from './Overview';
import Heatmap from './Heatmap';
import Projects from './Projects';
import './Dashboard.css';

function DashboardRouter() {
  const { currentPage } = useDashboard();
  const { selectedSlot, slotOptions, handleSlotChange, heatmapMode, handleModeChange } = useHeatmapSlots();

  // SEO - Block indexing of private dashboard
  useSEO({
    title: 'Dashboard - porflyo',
    description: 'Portfolio analytics and metrics',
    noIndex: true, // Private page - no indexing
  });

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'heatmap':
        return <Heatmap selectedSlot={selectedSlot} heatmapMode={heatmapMode} />;
      case 'projects':
        return <Projects />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout
      slotOptions={currentPage === 'heatmap' ? slotOptions : []}
      selectedSlot={currentPage === 'heatmap' ? selectedSlot : ''}
      onSlotChange={currentPage === 'heatmap' ? handleSlotChange : () => {}}
      heatmapMode={currentPage === 'heatmap' ? heatmapMode : 'raw'}
      onHeatmapModeChange={currentPage === 'heatmap' ? handleModeChange : () => {}}
    >
      <div className="dashboard__content">
        {renderCurrentPage()}
      </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
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
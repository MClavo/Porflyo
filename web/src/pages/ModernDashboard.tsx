/**
 * ModernDashboard - Router para páginas del dashboard moderno
 */


import { DashboardProvider } from '../contexts/DashboardContext';
import { useDashboard } from '../hooks/useDashboard';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import ModernOverview from './ModernOverview';
import ModernHeatmap from './ModernHeatmap';
import './ModernDashboard.css';

function DashboardRouter() {
  const { currentPage } = useDashboard();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'overview':
        return <ModernOverview />;
      case 'heatmap':
        return <ModernHeatmap />;
      default:
        return null;
    }
  };

  return (
    <ModernDashboardLayout>
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
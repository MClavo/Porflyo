/**
 * ModernDashboardLayout - Layout con navbar fijo para el dashboard moderno
 */

import { DashboardNavbar } from '../dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import '../../styles/dashboard-theme.css';

interface ModernDashboardLayoutProps {
  children: React.ReactNode;
}

export function ModernDashboardLayout({ children }: ModernDashboardLayoutProps) {
  const { currentPage, timeRange, setCurrentPage, setTimeRange } = useDashboard();

  return (
    <div className="dashboard-container">
      {/* Navbar fijo que nunca cambia */}
      <DashboardNavbar
        title="Analytics Dashboard"
        subtitle="Professional insights and key performance indicators"
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />
      
      {/* Contenido de la página actual */}
      <div className={`dashboard-content ${currentPage === 'heatmap' ? 'dashboard-content--no-max' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default ModernDashboardLayout;
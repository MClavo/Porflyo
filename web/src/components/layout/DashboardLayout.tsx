/**
 * DashboardLayout - Layout con navbar fijo para el dashboard o
 */

import { DashboardNavbar } from '../dashboard';
import { useDashboard } from '../../hooks/useDashboard';
import type { SlotOption } from '../ui/SlotSelector';
import type { HeatmapMode } from '../ui/HeatmapModeToggle';
import '../../styles/dashboard-theme.css';

interface DashboardLayoutProps {
  children: React.ReactNode;
  // Heatmap slot selection props
  slotOptions?: SlotOption[];
  selectedSlot?: string;
  onSlotChange?: (slot: string) => void;
  // Heatmap calculation mode props
  heatmapMode?: HeatmapMode;
  onHeatmapModeChange?: (mode: HeatmapMode) => void;
}

export function DashboardLayout({ 
  children, 
  slotOptions = [], 
  selectedSlot = '', 
  onSlotChange = () => {},
  heatmapMode = 'raw',
  onHeatmapModeChange = () => {}
}: DashboardLayoutProps) {
  const { currentPage, timeRange, setCurrentPage, setTimeRange } = useDashboard();

  return (
    <div className="dashboard-container">
      {/* Navbar fijo que nunca cambia */}
      <DashboardNavbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        slotOptions={slotOptions}
        selectedSlot={selectedSlot}
        onSlotChange={onSlotChange}
        heatmapMode={heatmapMode}
        onHeatmapModeChange={onHeatmapModeChange}
      />
      
      {/* Contenido de la página actual */}
      <div className={`dashboard-content ${currentPage === 'heatmap' ? 'dashboard-content--no-max' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default DashboardLayout;
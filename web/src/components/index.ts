/**
 * Main exports for all components
 */

// Layout
export { Page } from './layout/Page';

// Stats
export { StatCard } from './stats/StatCard';
export { DeviceMixBadge } from './stats/DeviceMixBadge';

// Charts
export { AreaVisitsByDevice } from './charts/AreaVisitsByDevice';
export { LineEngagement } from './charts/LineEngagement';
export { CalendarHeatmap } from './charts/CalendarHeatmap';

// Projects
export { ProjectBarList } from './projects/ProjectBarList';

// Tables
export { ProjectsDayTable } from './tables/ProjectsDayTable';

// Dashboard Components
export * from './dashboard';


// Types
export type { StatCardProps } from './stats/StatCard';
export type { DeviceMixBadgeProps } from './stats/DeviceMixBadge';
export type { AreaVisitsByDeviceProps } from './charts/AreaVisitsByDevice';
export type { LineEngagementProps } from './charts/LineEngagement';
export type { CalendarHeatmapProps } from './charts/CalendarHeatmap';
export type { ProjectBarListProps } from './projects/ProjectBarList';
export type { ProjectsDayTableProps, ProjectsDayTableRow } from './tables/ProjectsDayTable';
/**
 * Integration test for metrics store, provider, and hooks
 */

// Using preact/compat - React types handled by alias
import { MetricsProvider } from '../contexts/MetricsProvider';
import { 
  useMeta, 
  useDailyByDate, 
  useSlotByDate, 
  useLatestDate, 
  useAllDaily, 
  useSlotDates,
  useMetricsLoading,
  useMetricsError,
  useHasMetricsData
} from '../hooks/metrics/useMetrics';

/**
 * Test component that uses all the metrics hooks
 */
function MetricsTestComponent() {
  const meta = useMeta();
  const isLoading = useMetricsLoading();
  const error = useMetricsError();
  const hasData = useHasMetricsData();
  const latestDate = useLatestDate();
  const allDaily = useAllDaily();
  const slotDates = useSlotDates();
  
  // Test specific date lookups
  const todayDaily = useDailyByDate('2025-09-26');
  const todaySlot = useSlotByDate('2025-09-26');

  if (isLoading) {
    return <div>Loading metrics...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!hasData) {
    return <div>No metrics data available</div>;
  }

  return (
    <div>
      <h2>Metrics Data Loaded Successfully!</h2>
      
      {meta && (
        <div>
          <h3>Metadata:</h3>
          <p>Version: {meta.calcVersion}</p>
          <p>Generated: {meta.generatedAt}</p>
          <p>Timezone: {meta.timezone}</p>
          <p>Time Base: {meta.units.timeBase}</p>
          <p>Display Time: {meta.units.displayTime}</p>
          {meta.baseline && <p>Baseline Window: {meta.baseline.windowDays} days</p>}
        </div>
      )}
      
      <div>
        <h3>Data Summary:</h3>
        <p>Latest Date: {latestDate}</p>
        <p>Total Daily Entries: {allDaily.length}</p>
        <p>Total Slot Dates: {slotDates.length}</p>
      </div>
      
      {todayDaily && (
        <div>
          <h3>Today's Daily Data:</h3>
          <p>Views: {todayDaily.raw.views}</p>
          <p>Email Copies: {todayDaily.raw.emailCopies}</p>
          {todayDaily.derived && (
            <div>
              <p>Engagement Avg: {todayDaily.derived.engagementAvg}</p>
              <p>Desktop %: {todayDaily.derived.deviceMix.desktopPct}</p>
            </div>
          )}
        </div>
      )}
      
      {todaySlot && (
        <div>
          <h3>Today's Slot Data:</h3>
          <p>Projects: {todaySlot.projects.length}</p>
          <p>Heatmap Cells: {todaySlot.heatmap.cells.length}</p>
          <p>Heatmap Dimensions: {todaySlot.heatmap.meta.rows}x{todaySlot.heatmap.meta.columns}</p>
        </div>
      )}
    </div>
  );
}

/**
 * Test app wrapped with MetricsProvider
 */
export function MetricsTestApp() {
  return (
    <MetricsProvider portfolioId="test-portfolio-123">
      <MetricsTestComponent />
    </MetricsProvider>
  );
}

console.log('✅ Metrics store, provider, and hooks integration test compiled successfully!');
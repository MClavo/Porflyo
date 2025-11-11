# Data Hooks System

A collection of pure, memoized hooks that assemble view-ready data from the metrics store. **Pages stay dumb; hooks provide composed data.**

## Architecture Principle

✅ **Hooks are pure readers** - No network calls, only data transformation  
✅ **Memoized outputs** - Performance optimized with `useMemo`  
✅ **Composable data** - Each hook serves a specific UI need  
✅ **Pages stay dumb** - UI components just render hook data  

## Available Hooks

### 1. `useOverviewData(rangeDays)`

**Purpose**: Main dashboard overview with KPIs and chart data

**Input**: 
- `rangeDays` (default: 30) - Number of days for trends

**Output**:
```typescript
{
  todayKpis: {
    totalViews: number;
    avgSessionMs: number | null;
    deviceMix: { desktop: number; mobile: number } | null;
    bounceRate: number | null;
  } | null;
  
  visitsByDeviceSeries: Array<{
    date: string;
    desktop: number;
    mobile: number;
  }>;
  
  engagementSeries: Array<{
    date: string;
    visits: number;
    avgSessionMs: number | null;
    bounceRate: number | null;
  }>;
  
  calendarData: Array<{
    day: string; // YYYY-MM-DD
    value: number;
  }>;
  
  isLoading: boolean;
  error: string | null;
}
```

**Example**:
```tsx
function Dashboard() {
  const overview = useOverviewData(30);
  
  return (
    <SimpleGrid columns={4} gap={6}>
      <StatCard 
        label="Total Views" 
        value={overview.todayKpis?.totalViews?.toLocaleString() || '0'} 
      />
      <StatCard 
        label="Avg Session"
        value={overview.todayKpis?.avgSessionMs ? 
          `${Math.round(overview.todayKpis.avgSessionMs / 1000)}s` : 'N/A'}
      />
      {/* More cards... */}
    </SimpleGrid>
  );
}
```

### 2. `useHeatmapData(date?)`

**Purpose**: Portfolio heatmap visualization data

**Input**:
- `date?` (default: latest slot date) - Target date for heatmap

**Output**:
```typescript
{
  meta: Meta | null;
  cells: Array<{
    slotId: string;
    projectId: number;
    value: number;
    x: number; // grid position
    y: number; // grid position
  }>;
  kpis: {
    coverage: number | null; // percentage of slots with data
    k: number; // total number of projects
    top: {
      projectId: number;
      value: number;
      percentage: number;
    } | null;
  };
  isLoading: boolean;
  error: string | null;
}
```

**Example**:
```tsx
function HeatmapSummary() {
  const heatmap = useHeatmapData();
  
  return (
    <SimpleGrid columns={3} gap={4}>
      <StatCard 
        label="Coverage" 
        value={`${heatmap.kpis.coverage?.toFixed(1) || '0'}%`} 
      />
      <StatCard 
        label="Projects" 
        value={heatmap.kpis.k.toString()} 
      />
      <StatCard 
        label="Top Project" 
        value={heatmap.kpis.top?.projectId?.toString() || 'N/A'} 
      />
    </SimpleGrid>
  );
}
```

### 3. `useProjectsAggregated(rangeDays)`

**Purpose**: Project metrics aggregated across date range with rankings

**Input**:
- `rangeDays` (default: 30) - Date range for aggregation

**Output**:
```typescript
{
  // Three sorted arrays for different rankings
  byExposures: ProjectAggregated[];
  byViewTime: ProjectAggregated[];
  byCtr: ProjectAggregated[];
  
  // Per-day series for trend comparisons
  dailySeries: Record<string, ProjectAggregated[]>;
  
  isLoading: boolean;
  error: string | null;
}

interface ProjectAggregated {
  projectId: number;
  exposures: number;
  viewTimeMs: number;
  codeViews: number;
  liveViews: number;
  avgViewTimeMs: number | null;
  codeCtr: number | null;
  liveCtr: number | null;
}
```

**Example**:
```tsx
function TopProjects() {
  const projects = useProjectsAggregated(30);
  
  return (
    <Box>
      <Heading size="md" mb={4}>Top by Exposures</Heading>
      {projects.byExposures.slice(0, 5).map((project, index) => (
        <Box key={project.projectId} p={3} bg="gray.50">
          <Badge mr={2}>{index + 1}</Badge>
          Project {project.projectId}: {project.exposures.toLocaleString()} exposures
        </Box>
      ))}
    </Box>
  );
}
```

### 4. `useDaily(date?)`

**Purpose**: Daily KPIs and slot-level table data

**Input**:
- `date?` (default: latest date) - Target date

**Output**:
```typescript
{
  dailyKpis: {
    date: string;
    totalViews: number;
    avgSessionMs: number | null;
    engagementAvg: number | null;
    deviceMix: {
      desktopPct: number | null;
      mobileTabletPct: number | null;
    } | null;
    qualityVisitRate: number | null;
  } | null;
  
  slotRows: Array<{
    date: string;
    projectId: number;
    exposures: number;
    viewTimeMs: number;
    codeViews: number;
    liveViews: number;
    avgViewTimeMs: number | null;
    codeCtr: number | null;
    liveCtr: number | null;
  }>;
  
  isLoading: boolean;
  error: string | null;
}
```

**Example**:
```tsx
function DailyDetails() {
  const daily = useDaily();
  
  return (
    <Box>
      <Heading size="md" mb={4}>
        Daily Overview ({daily.dailyKpis?.date})
      </Heading>
      <ProjectsDayTable 
        data={daily.slotRows.map(row => ({
          projectId: row.projectId,
          projectName: `Project ${row.projectId}`,
          exposures: row.exposures,
          viewTime: row.viewTimeMs,
          avgViewTime: row.avgViewTimeMs,
          codeCtr: row.codeCtr,
          liveCtr: row.liveCtr
        }))}
      />
    </Box>
  );
}
```

### 5. `useTrends(rangeDays, metric)`

**Purpose**: Trend analysis with calendar and chart data

**Input**:
- `rangeDays` (default: 30) - Date range for trends
- `metric` (default: 'visits') - 'visits' | 'engagement' | 'tffi'

**Output**:
```typescript
{
  calendarValues: Array<{
    day: string;
    value: number;
  }>;
  
  primarySeries: TrendSeries[];
  secondarySeries: TrendSeries[];
  tertiarySeries?: TrendSeries[];
  
  summary: {
    current: number | null;
    previous: number | null;
    changePct: number | null;
    trend: 'up' | 'down' | 'stable' | null;
  };
  
  isLoading: boolean;
  error: string | null;
}

interface TrendSeries {
  date: string;
  value: number;
  label: string;
}
```

**Example**:
```tsx
function TrendsSummary() {
  const trends = useTrends(30, 'visits');
  
  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" color={
        trends.summary.trend === 'up' ? 'green.500' : 
        trends.summary.trend === 'down' ? 'red.500' : 'gray.500'
      }>
        {trends.summary.changePct ? 
          `${trends.summary.changePct > 0 ? '+' : ''}${trends.summary.changePct.toFixed(1)}%` : 'N/A'}
      </Text>
      <Text color="gray.600">vs yesterday</Text>
    </Box>
  );
}
```

## Usage Patterns

### Basic Dashboard Page

```tsx
import { useOverviewData, useProjectsAggregated } from '../hooks';

function Dashboard() {
  const overview = useOverviewData(30);
  const projects = useProjectsAggregated(30);
  
  if (overview.isLoading) return <Text>Loading...</Text>;
  if (overview.error) return <Text color="red.500">Error: {overview.error}</Text>;
  
  return (
    <VStack spacing={8}>
      {/* KPI Cards */}
      <SimpleGrid columns={4} gap={6}>
        <StatCard label="Views" value={overview.todayKpis?.totalViews || 0} />
        {/* More cards... */}
      </SimpleGrid>
      
      {/* Top Projects */}
      <ProjectBarList items={projects.byExposures.slice(0, 10)} />
    </VStack>
  );
}
```

### Detailed Analytics Page

```tsx
import { useDaily, useTrends, useHeatmapData } from '../hooks';

function AnalyticsPage() {
  const daily = useDaily();
  const trends = useTrends(30, 'engagement');
  const heatmap = useHeatmapData();
  
  return (
    <Grid templateColumns="2fr 1fr" gap={6}>
      <VStack spacing={6}>
        <LineEngagement data={trends.primarySeries} />
        <ProjectsDayTable data={daily.slotRows} />
      </VStack>
      <VStack spacing={6}>
        <CalendarHeatmap data={trends.calendarValues} />
        <Box>Coverage: {heatmap.kpis.coverage}%</Box>
      </VStack>
    </Grid>
  );
}
```

## Performance Notes

- All hooks use `useMemo` for expensive calculations
- Data is read-only from the store (no mutations)
- Hooks only re-compute when dependencies change
- Store data is pre-normalized for O(1) lookups

## Error Handling

- All hooks return consistent `{ isLoading, error }` state
- Graceful degradation when data is missing
- Null-safe operations throughout
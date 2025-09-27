# Overview Page - Health Snapshot + Trends

A minimal and modern analytics dashboard providing a quick health snapshot with short-term trends.

## Features

### 📊 **Header Section**
- **Title**: "Overview" 
- **Action Button**: "Refresh Today" (disabled until `/today` endpoint is available)

### 📈 **KPIs Row** (2-6 responsive columns)
1. **Visits** - Total page views with trend indicator
2. **Engagement** - Average engagement score with change %
3. **Avg Scroll Time** - Time users spend scrolling
4. **TTFI Mean** - Time to First Interaction (estimated)
5. **Email Conversion** - Conversion rate % (estimated)
6. **Device Mix** - Desktop vs Mobile badges

### 📱 **Charts Row** (2 columns)
- **Left**: `AreaVisitsByDevice` - Desktop vs Mobile visits over time
- **Right**: `LineEngagement` - Engagement timeline

### 🗓️ **Calendar Heatmap** (Full width)
- Current month activity colored by visit intensity
- Future: Switch to z-score coloring

## Component Architecture

```tsx
<MetricsProvider portfolioId="default">
  <Page title="Analytics Overview">
    <OverviewContent>
      {/* Header with refresh button */}
      <HStack justify="space-between">
        <Heading>Overview</Heading>
        <Button disabled>🔄 Refresh Today</Button>
      </HStack>

      {/* KPIs Grid */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }}>
        <StatCard label="Visits" value="12.4K" delta={15.3} />
        <StatCard label="Engagement" value="4.2" delta={-2.1} />
        <DeviceMixBadge desktopPct={65} mobilePct={35} />
        {/* ... more KPIs */}
      </SimpleGrid>

      {/* Charts */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }}>
        <AreaVisitsByDevice data={visitsByDevice} />
        <LineEngagement data={engagementTrend} />
      </Grid>

      {/* Calendar */}
      <CalendarHeatmap data={monthlyActivity} />
    </OverviewContent>
  </Page>
</MetricsProvider>
```

## Data Sources

Uses the following hooks from `/hooks/metrics`:

- **`useOverviewData(30)`** - 30-day overview with KPIs and chart series
- **`useTrends(30, 'visits')`** - Visit trends for change indicators  
- **`useTrends(30, 'engagement')`** - Engagement trends

## Responsive Design

- **Mobile (base)**: 2-column KPI grid, stacked charts
- **Tablet (md)**: 3-column KPI grid, stacked charts  
- **Desktop (lg)**: 6-column KPI grid, side-by-side charts

## Loading States

- **Skeleton KPIs**: Shows 6 loading stat cards
- **Skeleton Charts**: Shows placeholder chart containers
- **Skeleton Calendar**: Shows placeholder heatmap container
- **Progressive Loading**: Components render as data becomes available

## Error Handling

- **Network Errors**: Shows retry button with error message
- **Missing Data**: Gracefully shows "N/A" for unavailable metrics
- **Fallback Values**: Uses estimated values when real data unavailable

## Performance

- **Memoized Hooks**: All data transformations are memoized
- **Chart Animations**: Recharts animations on mount (via Chakra Charts)
- **Responsive Images**: Optimized for different screen sizes

## Future Enhancements

1. **Real-time Updates**: Connect to `/today` endpoint for live data
2. **Z-score Heatmaps**: Switch calendar coloring to z-score intensities
3. **Interactive Charts**: Click-to-drill-down functionality
4. **Export Features**: PNG/PDF export of charts
5. **Customizable KPIs**: User-selectable metrics in KPI row

## Usage

```tsx
import OverviewPage from './pages/OverviewPage';

// Use as a route component
<Route path="/overview" component={OverviewPage} />

// Or embed in a dashboard
<OverviewPage />
```

The page is fully self-contained with data loading, error handling, and responsive layout built-in.
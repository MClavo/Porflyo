# Portfolio Metrics System

A comprehensive metrics dashboard system with strict TypeScript types, centralized data management, and composable UI components.

## Architecture Overview

### 🏗️ Type System (`src/api/types/`)
Strict types mirroring backend payloads with explicit time units:

- **`metrics.types.ts`**: Core metrics data types
- **`slots.types.ts`**: Time slot and bucket definitions  
- **`response.types.ts`**: API response structures
- **`shared.types.ts`**: Common types and enums

### 📡 Data Layer (`src/api/`, `src/state/`)
- **HTTP Client**: 10s timeout, normalized error handling
- **Metrics API**: `GET /metrics?portfolioId=<id>` bootstrap endpoint
- **Zustand Store**: Data normalization with `dailyByDate`/`slotByDate` lookups
- **React Context**: Provider pattern with skeleton loading gates

### 🧮 Utilities (`src/lib/`)
Centralized formatting and derived calculations (unit-aware):

- **`format.ts`**: Time formatting, number formatting, percentages
- **`derived.ts`**: Device mix, engagement calculations, CTR metrics
- **`dates.ts`**: Date operations, grouping, latest/earliest utilities

### 🎨 UI Components (`src/components/`)
Small, composable components with built-in skeletons:

- **Layout**: `Page` wrapper component
- **Stats**: `StatCard`, `DeviceMixBadge`
- **Charts**: `AreaVisitsByDevice`, `LineEngagement`, `CalendarHeatmap`
- **Lists**: `ProjectBarList`
- **Tables**: `ProjectsDayTable`

## Quick Start

### 1. Basic Setup

```tsx
import { MetricsProvider } from '../contexts/MetricsProvider';
import { Page, StatCard } from '../components';

function MyDashboard() {
  return (
    <MetricsProvider portfolioId="your-portfolio-id">
      <Page title="Analytics Dashboard">
        <StatCard
          label="Total Views"
          value="12,400"
          delta={15.3} // percentage change
        />
      </Page>
    </MetricsProvider>
  );
}
```

### 2. Using the Store Directly

```tsx
import { useMetricsStore } from '../state/metrics.store';

function CustomComponent() {
  const { data, isLoading, loadBootstrap } = useMetricsStore();
  
  // Access normalized data
  const today = data?.dailyByDate['2024-01-15'];
  const slot = data?.slotByDate['slot-123'];
  
  return isLoading ? <Skeleton /> : <div>{/* Your content */}</div>;
}
```

### 3. Complete Dashboard Example

```tsx
import { VStack, SimpleGrid, Box, Heading } from '@chakra-ui/react';
import { MetricsProvider } from '../contexts/MetricsProvider';
import { 
  Page, 
  StatCard, 
  DeviceMixBadge,
  ProjectsDayTable
} from '../components';

export default function Dashboard() {
  return (
    <MetricsProvider portfolioId="portfolio-123">
      <Page title="Analytics Dashboard">
        <VStack gap={8} align="stretch">
          
          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
            <StatCard label="Total Views" value="12,400" delta={15.3} />
            <StatCard label="Avg Session" value="2m 34s" delta={-5.2} />
            <StatCard label="Code CTR" value="18.7%" delta={8.1} />
            <DeviceMixBadge desktopPct={65} mobilePct={35} />
          </SimpleGrid>

          {/* Project Performance */}
          <Box bg="white" p={6} borderRadius="lg" shadow="sm">
            <Heading size="md" mb={4}>Project Performance</Heading>
            <ProjectsDayTable data={projectData} />
          </Box>

        </VStack>
      </Page>
    </MetricsProvider>
  );
}
```

## Component Reference

### StatCard
Display key metrics with optional trend indicators:

```tsx
<StatCard
  label="Page Views"        // Metric name
  value="1,234"            // Main value (string | number)
  delta={12.5}             // Percentage change (optional)
  suffix="per day"         // Units suffix (optional)
  helpText="Unique views"  // Tooltip text (optional)
  isLoading={false}        // Skeleton state (optional)
/>
```

### DeviceMixBadge
Show device breakdown with percentage badges:

```tsx
<DeviceMixBadge
  desktopPct={65}          // Desktop percentage (0-100)
  mobilePct={35}           // Mobile percentage (0-100)
  isLoading={false}        // Skeleton state (optional)
/>
```

### ProjectsDayTable
Tabular project performance with progress indicators:

```tsx
<ProjectsDayTable
  data={[
    {
      projectId: 1,
      projectName: "Portfolio Site",
      exposures: 1250,
      viewTime: 45000,       // milliseconds
      avgViewTime: 36000,    // milliseconds
      codeCtr: 0.15,         // fraction 0..1
      liveCtr: 0.08          // fraction 0..1
    }
  ]}
  isLoading={false}
/>
```

## Data Flow

1. **Bootstrap Loading**: `MetricsProvider` calls `loadBootstrap()` on mount
2. **Data Normalization**: Raw API response → indexed lookup objects
3. **Component Rendering**: Components receive normalized data via store
4. **Skeleton States**: Built-in loading states during data fetch
5. **Error Handling**: Normalized error messages with retry logic

## Type Safety

All components and utilities are fully typed:

```tsx
// Strict backend payload types
interface DailyEntry {
  date: string;           // ISO date
  viewTimeMs: number;     // explicit time unit
  exposures: number;
  avgViewTimeMs: number | null;
}

// Component prop interfaces
interface StatCardProps {
  label: string;
  value: string | number;
  delta?: number | null;
  // ... other props
}
```

## Utilities

### Formatting Functions
```tsx
import { formatMs, formatNumber, formatPercent } from '../lib/format';

formatMs(2500);        // "2.5s"
formatNumber(1234);    // "1,234"  
formatPercent(0.15);   // "15.0%"
```

### Derived Calculations
```tsx
import { deviceMix, avgScrollTimeMs } from '../lib/derived';

const mix = deviceMix(data.daily);        // { desktop: 0.65, mobile: 0.35 }
const scrollTime = avgScrollTimeMs(data); // average scroll time
```

### Date Utilities
```tsx
import { latest, earliest, groupByMonth } from '../lib/dates';

const recentEntry = latest(data.daily);
const monthlyGroups = groupByMonth(data.daily);
```

## Notes

- All time values use explicit units (e.g., `viewTimeMs`, `durationSec`)
- Components include built-in skeleton loading states
- Data is normalized for O(1) lookups by date/slot
- Error handling is centralized and normalized
- All utilities are unit-aware and type-safe

The system is designed to be composable, type-safe, and performant for analytics dashboards.
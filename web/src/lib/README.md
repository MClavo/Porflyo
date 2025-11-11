# Metrics Utilities

Centralized formatting, derived calculations, and date utilities for the Porflyo metrics system.

## Quick Start

```typescript
import { formatMs, formatPct, deviceMix, latest, toMs } from '../lib';

// Format values for display
const scrollTime = formatMs(1500); // "1.5s"
const conversion = formatPct(0.0273); // "3%"

// Calculate derived metrics
const breakdown = deviceMix(72, 38); // { desktopPct: 0.655, mobileTabletPct: 0.345 }

// Work with dates
const latestDate = latest(dailyIndex); // "2025-09-26"

// Convert time units
const milliseconds = toMs(15, 'ds'); // 1500ms (15 deciseconds → 1500ms)
```

## Formatting (`src/lib/format.ts`)

- `formatMs(n)` - Format milliseconds → "1.5s", "450ms", "N/A"
- `formatPct(n, digits=0)` - Format fraction → "65%", "12.5%", "N/A"  
- `formatInt(n)` - Format integer with thousands separators → "1,234"
- `formatNumber(n, digits=1)` - Format decimal → "12.5"
- `formatCompact(n)` - Format with K/M suffixes → "1.2K", "3.4M"

## Derived Calculations (`src/lib/derived.ts`)

### Portfolio per-day metrics:
- `deviceMix(desktopViews, mobileViews)` → `{ desktopPct, mobileTabletPct }`
- `engagementAvg(sumScrollScore, views)` → average engagement
- `avgScrollTimeMs(sumScrollTime, views, timeBase)` → average scroll time in ms
- `avgCardViewTimeMs(projectViewTimeTotal, projectExposures, timeBase)` → average card view time in ms
- `tffiMeanMs(tffiSum, tffiCount)` → mean Time to First Interactive
- `emailConv(emailCopies, views)` → email conversion rate
- `qualityVisitRate(qualityVisits, views)` → quality visit rate
- `socialCtr(socialClicks, views)` → social click-through rate

### Project per-day metrics:
- `avgViewTimeMs(viewTime, exposures, timeBase)` → average view time in ms
- `codeCtr(codeViews, exposures)` → code click-through rate
- `liveCtr(liveViews, exposures)` → live demo click-through rate

### Utilities:
- `safeDiv(a, b)` → safe division (returns null if b ≤ 0)
- `toMs(value, timeBase)` → convert to milliseconds ('ds' or 'ms')
- `deltaPct(current, previous)` → percentage change
- `clamp(value, min, max)` → clamp value to range

## Date Utilities (`src/lib/dates.ts`)

- `latest(dailyIndex)` → most recent date from sorted array
- `sliceByLastNDays(dates, n)` → last N dates
- `groupByMonth(dates)` → `{ "2025-09": [...], "2025-08": [...] }`
- `filterDateRange(dates, start, end)` → dates within range
- `filterByMonth(dates, "2025-09")` → dates for specific month
- `windowStartDate(endDate, days)` → start date for N-day window
- `getUniqueMonths(dates)` → unique month strings (YYYY-MM)
- `formatDate(date, format)` → format for display ("short", "medium", "long")

## Usage Examples

### Component with Derived Metrics
```typescript
function MetricsCard({ dailyData, meta }: { dailyData: DailyRaw, meta: Meta }) {
  const timeBase = meta.units.timeBase;
  
  // Calculate derived metrics
  const breakdown = deviceMix(dailyData.desktopViews, dailyData.mobileTabletViews);
  const engagement = engagementAvg(dailyData.sumScrollScore, dailyData.views);
  const scrollTime = avgScrollTimeMs(dailyData.sumScrollTime, dailyData.views, timeBase);
  
  return (
    <div>
      <div>Views: {formatInt(dailyData.views)}</div>
      <div>Desktop: {formatPct(breakdown.desktopPct)}</div>
      <div>Engagement: {formatNumber(engagement)}</div>
      <div>Scroll Time: {formatMs(scrollTime)}</div>
    </div>
  );
}
```

### Date Range Filtering
```typescript
function useLastWeekData(dailyIndex: string[], dailyByDate: Record<string, DailyEntry>) {
  const lastWeek = sliceByLastNDays(dailyIndex, 7);
  return lastWeek.map(date => dailyByDate[date]);
}
```

### Window Aggregations
```typescript
function calculateWindowMetrics(entries: DailyEntry[], timeBase: TimeUnit) {
  const totalViews = entries.reduce((sum, entry) => sum + entry.raw.views, 0);
  const totalScrollTime = entries.reduce((sum, entry) => sum + entry.raw.sumScrollTime, 0);
  
  const avgScrollTime = avgScrollTimeMs(totalScrollTime, totalViews, timeBase);
  
  return {
    views: formatInt(totalViews),
    avgScrollTime: formatMs(avgScrollTime),
  };
}
```

## Import Patterns

```typescript
// Import all utilities
import { formatMs, deviceMix, latest } from '../lib';

// Import specific categories
import { formatMs, formatPct } from '../lib/format';
import { deviceMix, engagementAvg } from '../lib/derived';
import { latest, sliceByLastNDays } from '../lib/dates';
```

## Key Benefits

✅ **No duplicated math** - All calculations centralized  
✅ **Unit-aware** - Handles ds→ms conversion automatically  
✅ **Null-safe** - Graceful handling of missing/invalid data  
✅ **Consistent formatting** - Same display format across all components  
✅ **Type-safe** - Full TypeScript coverage  
✅ **Easy to test** - Pure functions, no side effects  

See `src/test/utilities.example.ts` for comprehensive usage examples.
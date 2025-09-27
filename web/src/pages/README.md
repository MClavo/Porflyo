# Metrics Dashboard Pages

This directory contains the complete metrics dashboard system built with strict TypeScript types and comprehensive data visualization.

## Pages Overview

### 📊 OverviewPage.tsx
**Purpose**: Health snapshot dashboard with KPIs, trends, and calendar  
**Goal**: "Health snapshot + short trend; minimal & modern"

**Features**:
- 6-column responsive KPI grid (visitors, conversions, bounce rate, avg session, growth, device mix)
- Device distribution badges with responsive design  
- Dual chart visualization (Area + Line charts)
- Interactive calendar heatmap for daily activity
- Skeleton loading states for all components
- Mobile-optimized responsive layout

**Data Sources**: `useOverviewData` hook with aggregated metrics

---

### 🎯 HeatmapPage.tsx  
**Purpose**: Visual analysis of user interaction patterns  
**Goal**: "Where users look; precise & visual"

**Features**:
- Interactive date range picker for temporal analysis
- Visual calendar heatmap with activity intensity
- Top 10 hotspots ranking with engagement metrics
- KPI summary cards for selected timeframe
- Hotspot analysis with click-through rates
- Responsive design with proper spacing

**Data Sources**: `useHeatmapData` hook with interaction analytics

---

## Technical Architecture

### Data Layer
- **Types**: Strict TypeScript interfaces in `src/api/types/` with explicit time units
- **State**: Zustand + React Context for normalized data management
- **Hooks**: Centralized in `src/hooks/metrics/` for data assembly and transformation

### UI Components
- **Framework**: Chakra UI with fallbacks for compatibility
- **Charts**: Multiple libraries (ECharts, Recharts, @nivo, CalendarHeatmap)
- **Responsive**: Mobile-first design with breakpoint optimization

### Data Flow
```
Backend API → HTTP Clients → Zustand Store → Context Provider → Metrics Hooks → Dashboard Pages
```

## Usage

Both pages are designed for different analytical perspectives:

- **OverviewPage**: Quick health check and trend identification
- **HeatmapPage**: Deep dive into user behavior patterns

Pages integrate seamlessly with the existing routing system and maintain consistent design patterns across the application.

## Development Notes

- All metrics hooks properly organized in `/hooks/metrics/` directory
- Import paths use relative references for maintainability  
- Chakra UI compatibility handled with basic component fallbacks
- Build successfully tested with TypeScript strict mode
- Mobile responsiveness verified across components
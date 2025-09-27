# Hooks Directory

Organized React hooks for different application domains.

## Structure

- **`/metrics`** - Data assembly hooks for analytics and metrics
- **`/ui`** - UI state and interaction hooks  
- **`/save`** - Data persistence and saving hooks
- **`/publication`** - Publishing and sharing hooks
- **`/editor`** - Content editing and manipulation hooks

## Usage

Import hooks from their respective domains:

```typescript
// Metrics hooks
import { useOverviewData, useProjectsAggregated } from './hooks/metrics';

// UI hooks  
import { useSomeUIHook } from './hooks/ui';

// Save hooks
import { useSaveData } from './hooks/save';
```

Or import everything from the main index:

```typescript
import { useOverviewData, useSaveData } from './hooks';
```

## Architecture

- **Domain separation** - Hooks are organized by functional domain
- **Pure functions** - Hooks are side-effect free where possible
- **Memoization** - Performance optimized with appropriate caching
- **TypeScript** - Full type safety across all hooks
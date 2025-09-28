# ToggleSelector Component

A unified, reusable toggle selector component that replaces all individual toggle components in the application. Features smooth animations, flexible sizing, and consistent styling.

## Features

- 🎨 **Unified Design**: One component for all toggle use cases
- 🎯 **Flexible**: Supports any number of options with equal sizing
- 📱 **Responsive**: Auto-scales on mobile devices
- ⚡ **Smooth Animations**: Animated slider with cubic-bezier transitions
- ♿ **Accessible**: Full ARIA support and keyboard navigation
- 🎨 **Correct Gradient**: Blue-to-purple gradient (135deg, blue top-left to purple bottom-right)

## Usage

### Basic Usage

```tsx
import ToggleSelector from '../components/selector/ToggleSelector';

const options = [
  { value: 'option1', label: 'Option 1', description: 'First option' },
  { value: 'option2', label: 'Option 2', description: 'Second option' }
];

<ToggleSelector
  options={options}
  value={currentValue}
  onChange={handleChange}
/>
```

### With Label and Size

```tsx
<ToggleSelector
  options={pageOptions}
  value={currentPage}
  onChange={setCurrentPage}
  label="Select Page"
  size="lg"
  ariaLabel="Choose dashboard page"
/>
```

### Time Range Example

```tsx
const timeRangeOptions = [
  { value: '1d', label: '1D', description: 'Last 24 hours' },
  { value: '7d', label: '7D', description: 'Last 7 days' },
  { value: '30d', label: '30D', description: 'Last 30 days' },
  { value: '90d', label: '90D', description: 'Last 90 days' }
];

<ToggleSelector
  options={timeRangeOptions}
  value={timeRange}
  onChange={setTimeRange}
  label="Time Range"
  size="md"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `ToggleSelectorOption<T>[]` | - | Array of options to display |
| `value` | `T` | - | Currently selected value |
| `onChange` | `(value: T) => void` | - | Callback when selection changes |
| `label` | `string` | - | Optional label above the selector |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Whether the selector is disabled |
| `className` | `string` | `''` | Additional CSS classes |
| `ariaLabel` | `string` | - | Custom aria-label for accessibility |

## Option Type

```tsx
interface ToggleSelectorOption<T = string> {
  value: T;           // The value to return when selected
  label: string;      // Display text
  description?: string; // Optional tooltip/description
}
```

## Size Variants

### Small (`sm`)
- Height: 36px
- Font: xs
- Padding: 1.5/2
- Use for: Mobile, compact spaces

### Medium (`md`) - Default
- Height: 44px  
- Font: sm
- Padding: 2/3
- Use for: Standard controls

### Large (`lg`)
- Height: 52px
- Font: base
- Padding: 3/4  
- Use for: Prominent navigation

## Responsive Behavior

- `md` size auto-scales to `sm` on mobile (≤768px)
- `lg` size scales to `md` on mobile
- Equal width distribution regardless of label length

## Migration from Old Components

### From TimeRangeToggle
```tsx
// Old
<TimeRangeToggle value={range} onChange={setRange} />

// New - wrapped in TimeRangeToggle for backward compatibility
<TimeRangeToggle value={range} onChange={setRange} size="md" />
```

### From HeatmapModeToggle
```tsx
// Old
<HeatmapModeToggle mode={mode} onChange={setMode} />

// New - wrapped in HeatmapModeToggle for backward compatibility  
<HeatmapModeToggle mode={mode} onChange={setMode} size="md" />
```

### From page-selector (manual)
```tsx
// Old (manual implementation)
<div className="page-selector">
  {/* Manual toggle implementation */}
</div>

// New
<ToggleSelector
  options={pageOptions}
  value={currentPage}
  onChange={setCurrentPage}
  size="lg"
/>
```

## Examples in Codebase

1. **Dashboard Navigation**: Page switching (Overview/Heatmap)
2. **Time Range Selection**: 1D/7D/30D/90D options  
3. **Heatmap Mode**: Raw Values/Count Weighted
4. **Future Use Cases**: Any multi-option toggle scenario

## Styling Integration

The component uses CSS custom properties from the design system:
- `--accent-blue` / `--accent-purple`: Gradient colors
- `--space-*`: Spacing scale
- `--radius-*`: Border radius scale
- `--transition-fast`: Animation timing

## Accessibility

- Full ARIA support with `role="tablist"` and `role="tab"`
- Keyboard navigation support
- Screen reader friendly
- Focus indicators with `focus-visible`
- Semantic HTML structure
# Modern Dashboard Components

Sistema de componentes personalizados para el dashboard de métricas con tema oscuro profesional.

## Componentes

### KpiCard
Tarjeta de KPI moderna con tema oscuro, bordes redondeados y efectos hover.

**Props:**
- `title`: Título de la métrica
- `value`: Valor principal (string o number)
- `subtitle?`: Subtítulo opcional
- `change?`: Objeto con valor y tipo de cambio (positive/negative/neutral)
- `icon?`: Icono React
- `color?`: Color de acento ('blue' | 'green' | 'purple' | 'orange' | 'pink')
- `isLoading?`: Estado de carga con skeleton

**Ejemplo:**
```tsx
<KpiCard
  title="Total Visits"
  value="12,400"
  change={{ value: 15.3, type: 'positive' }}
  icon={<FiUsers />}
  color="blue"
/>
```

### KpiGrid
Grid responsivo para organizar las tarjetas KPI.

**Props:**
- `children`: Componentes KpiCard
- `columns?`: Configuración responsiva de columnas
- `gap?`: Espaciado entre cards (múltiplos de 4)
- `className?`: Clase CSS adicional

**Ejemplo:**
```tsx
<KpiGrid columns={{ base: 1, sm: 2, md: 3, lg: 6 }} gap={6}>
  <KpiCard ... />
  <KpiCard ... />
</KpiGrid>
```

### DashboardHeader
Header profesional para el dashboard con gradiente y skeleton loading.

**Props:**
- `title`: Título principal
- `subtitle?`: Subtítulo
- `actions?`: Botones o acciones
- `isLoading?`: Estado de carga

## Tema

### Variables CSS
Todas las variables están definidas en `dashboard-theme.css`:

- **Colores:** Tema obsidiana con acentos de colores
- **Espaciado:** Múltiplos de 4px (--space-1 a --space-16)
- **Tipografía:** Tamaños múltiplos de 4px ajustados
- **Bordes:** Radios de --radius-sm a --radius-2xl
- **Sombras:** Cuatro niveles de profundidad
- **Transiciones:** Tres velocidades estándar

### Paleta de Colores

**Fondo:**
- `--dashboard-bg`: #0a0e16 (fondo principal)
- `--dashboard-obsidian`: #1a202c (color obsidiana)

**Cards:**
- Degradado sutil gris-negro con hover effects
- Bordes con transiciones suaves

**Estados:**
- Verde para valores positivos
- Rojo para valores negativos
- Gris para valores neutrales

## Uso

1. Importar los componentes:
```tsx
import { KpiCard, KpiGrid, DashboardHeader } from '../components/dashboard';
```

2. Aplicar el CSS del tema:
```tsx
import '../styles/dashboard-theme.css';
```

3. Usar con MetricsProvider:
```tsx
<MetricsProvider portfolioId="default">
  <div className="dashboard-container">
    <div className="dashboard-content">
      <DashboardHeader title="Dashboard" subtitle="Analytics" />
      <KpiGrid>
        <KpiCard ... />
      </KpiGrid>
    </div>
  </div>
</MetricsProvider>
```

## Skeleton Loading

Los componentes incluyen estados de carga con `react-loading-skeleton` configurado para el tema oscuro.

## Responsividad

Todos los componentes son completamente responsivos con breakpoints estándar:
- `base`: móvil
- `sm`: 640px+
- `md`: 768px+
- `lg`: 1024px+
- `xl`: 1280px+
# Componentes de Slug y Portfolio

## Estructura

### Componentes

- **`/components/slug/`**
  - `SlugInput.tsx` - Componente para input de slug con validación en tiempo real
  - `SlugInput.css` - Estilos para el componente de slug
  - `index.ts` - Archivo de exportación

- **`/components/portfolio/`**
  - `PortfolioTitleInput.tsx` - Componente para input del título del portfolio
  - `PublicationSettings.tsx` - Componente para configuraciones de publicación
  - `PublicationSettings.css` - Estilos para el componente de publicación
  - `PortfolioViewer.tsx` - Componente para visualizar portfolios (solo lectura)
  - `PortfolioViewer.css` - Estilos para el visor de portfolios
  - `index.ts` - Archivo de exportación

### Hooks

- **`/hooks/useSlugManager.ts`** - Hook personalizado para manejar el estado y lógica del slug
- **`/hooks/usePublicationManager.ts`** - Hook personalizado para manejar la publicación del portfolio

## Uso

### SlugInput

```tsx
import { SlugInput } from '../components/slug';

<SlugInput
  value={slug}
  onChange={setSlug}
  currentSlug={existingPortfolio?.reservedSlug}
  placeholder="my-portfolio-url"
  disabled={false}
  onAvailabilityChange={(isAvailable, isChecking) => {
    // Handle availability changes for publication
  }}
/>
```

**Props:**
- `value` - El valor actual del slug
- `onChange` - Función que se ejecuta cuando cambia el slug
- `currentSlug` - El slug actual del portfolio (para validación)
- `placeholder` - Texto de placeholder (opcional)
- `disabled` - Si el input está deshabilitado (opcional)
- `onAvailabilityChange` - Callback para cambios en la disponibilidad del slug (opcional)

### PortfolioTitleInput

```tsx
import { PortfolioTitleInput } from '../components/portfolio';

<PortfolioTitleInput
  value={portfolio.title}
  onChange={handleTitleChange}
  placeholder="Enter portfolio title..."
  disabled={false}
/>
```

**Props:**
- `value` - El valor actual del título
- `onChange` - Función que se ejecuta cuando cambia el título
- `placeholder` - Texto de placeholder (opcional)
- `disabled` - Si el input está deshabilitado (opcional)

### PublicationSettings

```tsx
import { PublicationSettings } from '../components/portfolio';

<PublicationSettings
  isPublished={isPublished}
  onPublishedChange={setIsPublished}
  slug={slug}
  isSlugAvailable={isSlugAvailable}
  isCheckingSlug={isCheckingSlug}
  onPublish={handlePublish}
  isPublishing={isPublishing}
  disabled={false}
/>
```

**Props:**
- `isPublished` - Si el portfolio está publicado
- `onPublishedChange` - Función para cambiar el estado de publicación
- `slug` - El slug actual
- `isSlugAvailable` - Si el slug está disponible
- `isCheckingSlug` - Si se está verificando la disponibilidad
- `onPublish` - Función para publicar/actualizar configuración
- `isPublishing` - Si se está procesando la publicación
- `disabled` - Si los controles están deshabilitados (opcional)

### PortfolioViewer

```tsx
import { PortfolioViewer } from '../components/portfolio';

<PortfolioViewer
  portfolio={portfolioState}
  showTitle={true}
  className="custom-viewer"
/>
```

**Props:**
- `portfolio` - El estado del portfolio a visualizar
- `showTitle` - Si mostrar el título del portfolio (opcional, default: true)
- `className` - Clases CSS adicionales (opcional)

### useSlugManager

```tsx
import { useSlugManager } from '../hooks/useSlugManager';

const {
  slug,
  setSlug,
  updateSlugFromTitle,
  currentSlug
} = useSlugManager({ isEditing, existingPortfolio });
```

**Retorna:**
- `slug` - El valor actual del slug
- `setSlug` - Función para actualizar el slug
- `updateSlugFromTitle` - Función para generar slug automáticamente desde el título
- `currentSlug` - El slug actual del portfolio (para comparación)

### usePublicationManager

```tsx
import { usePublicationManager } from '../hooks/usePublicationManager';

const {
  isPublished,
  setIsPublished,
  handlePublish,
  isPublishing,
  updateNormalizedSlug,
  initializeFromPortfolio
} = usePublicationManager({ 
  portfolioId, 
  existingPortfolio,
  onSuccess: () => showNotification('Updated!')
});
```

**Retorna:**
- `isPublished` - Si el portfolio está publicado
- `setIsPublished` - Función para cambiar el estado de publicación
- `handlePublish` - Función para enviar cambios al servidor
- `isPublishing` - Si se está procesando la publicación
- `updateNormalizedSlug` - Función para actualizar el slug normalizado
- `initializeFromPortfolio` - Función para inicializar desde portfolio existente

## Funcionalidades

### SlugInput
- ✅ Validación en tiempo real con debounce de 3 segundos
- ✅ Sanitización automática de caracteres especiales
- ✅ Límite de 50 caracteres
- ✅ Estados visuales (Available, Not available, Checking, Current URL)
- ✅ Integración con API backend
- ✅ Manejo de errores 500 como slug no disponible
- ✅ Callback para notificar cambios de disponibilidad

### PublicationSettings
- ✅ Toggle para visibilidad pública del portfolio
- ✅ Botón para actualizar configuración de publicación
- ✅ Validación de disponibilidad de slug antes de permitir publicación
- ✅ Estados de carga y feedback visual
- ✅ Integración con backend para publicar/despublicar

### useSlugManager
- ✅ Inicialización automática según contexto (creación/edición)
- ✅ Auto-generación de slug desde título para portfolios nuevos
- ✅ Gestión de estado unificada

### usePublicationManager
- ✅ Gestión completa del estado de publicación
- ✅ Integración con API de publicación
- ✅ Manejo de errores y estados de carga
- ✅ Sincronización con backend

### PortfolioViewer
- ✅ Renderizado completo de portfolios en modo solo lectura
- ✅ Soporte para todos los templates disponibles
- ✅ Layout responsive automático
- ✅ Integración con sistema de secciones y tarjetas
- ✅ Variante compacta para previews
- ✅ Título opcional y estilos personalizables

### Páginas
- **PublicPortfolio** (`/p/{slug}`) - Página pública para visualizar portfolios
  - ✅ Acceso sin autenticación
  - ✅ Carga de portfolio por slug desde API pública
  - ✅ Solo portfolios publicados
  - ✅ Rendering completo con template correspondiente
  - ✅ Estados de carga y error manejados
  - ✅ SEO optimizado (título dinámico)

### Beneficios de la refactorización
- ✅ Separación de responsabilidades
- ✅ Componentes reutilizables
- ✅ Código más limpio y mantenible
- ✅ Lógica centralizada en hooks personalizados
- ✅ Estilos modulares y organizados
- ✅ Funcionalidad completa de publicación integrada
- ✅ Validación robusta de disponibilidad de URLs
- ✅ Visualización pública de portfolios implementada
- ✅ Componente PortfolioViewer reutilizable
- ✅ Separación entre editor y visualizador
- ✅ API pública integrada para acceso sin autenticación
- ✅ Mappers específicos para diferentes tipos de datos
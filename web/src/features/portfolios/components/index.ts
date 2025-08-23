// Portfolio Editor Components Index
// Barrel exports for better organization and cleaner imports

export { default as PortfolioEditor } from './PortfolioEditor';
export { PortfolioEditorState } from './PortfolioEditorState';
export { PortfolioItemRenderer } from './PortfolioItemRenderer';
export { PortfolioSectionRenderer } from './PortfolioSectionRenderer';

// Re-export types for convenience
export type { ItemRendererCallbacks } from './PortfolioItemRenderer';
export type { SectionRendererCallbacks } from './PortfolioSectionRenderer';

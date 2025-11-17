/**
 * Gradient presets for Glass template background
 */
export interface GradientPreset {
  id: string;
  name: string;
  gradient: string;
  previewColor: string; // Single color for the selector circle
}

export const GLASS_GRADIENTS: GradientPreset[] = [
{
  id: 'purple',
  name: 'Lavender Indigo',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  previewColor: '#764ba2',
},
{
  id: 'ocean-blue',
  name: 'Soft Ocean Blue',
  gradient: 'linear-gradient(135deg, #669acb 0%, #4f78b3 100%)',
  previewColor: '#4f78b3',
},
{
  id: 'steel-blue',
  name: 'Midnight Steel',
  gradient: 'linear-gradient(135deg, #4b5c7a 0%, #3a4863 100%)',
  previewColor: '#3a4863',
},
{
  id: 'petrol-blue',
  name: 'Deep Petrol',
  gradient: 'linear-gradient(135deg, #5a8a9c 0%, #3e687b 100%)',
  previewColor: '#3e687b',
},
{
  id: 'teal-soft',
  name: 'Aqua Mist',
  gradient: 'linear-gradient(135deg, rgba(95,169,201,1) 0%, rgba(98,209,183,1) 100%)',
  previewColor: '#467fa3',
},
{
  id: 'sage',
  name: 'Verdant Teal',
  gradient: 'linear-gradient(135deg, rgba(42,123,155,1) 0%, rgba(87,199,133,1) 100%)',
  previewColor: '#7da88a',
},
{
  id: 'green',
  name: 'Pastel Greenleaf',
  gradient: 'linear-gradient(135deg,rgba(98, 184, 92, 1) 0%, rgba(81, 173, 135, 1) 100%)',
  previewColor: '#7da88a',
},
{
  id: 'soft-sunset',
  name: 'Mauve Sunset',
  gradient: 'linear-gradient(135deg, #d7a5c0 0%, #b589c7 100%)',
  previewColor: '#b589c7',
},
{
  id: 'dusty-rose',
  name: 'Rose Orchid',
  gradient: 'linear-gradient(315deg,rgba(186, 91, 140, 1) 0%, rgba(191, 128, 158, 1) 100%)',
  previewColor: '#a06cc4',
},
{
  id: 'soft-orange',
  name: 'Muted Apricot',
  gradient: 'linear-gradient(135deg, rgba(209,132,84,1) 0%, rgba(217,105,72,1) 100%)',
  previewColor: '#e98c6d',
},
{
  id: 'slate-gray',
  name: 'Blue Slate',
  gradient: 'linear-gradient(135deg, #7c8592 0%, #5c6370 100%)',
  previewColor: '#5c6370',
},
{
  id: 'onyx',
  name: 'Charcoal Onyx',
  gradient: 'linear-gradient(135deg, #3a3a3a 0%, #1e1e1e 100%)',
  previewColor: '#1e1e1e',
},


];

export const DEFAULT_GRADIENT = GLASS_GRADIENTS[0]; // Purple

export function getGradientById(id?: string): GradientPreset {
  if (!id) return DEFAULT_GRADIENT;
  return GLASS_GRADIENTS.find((g) => g.id === id) || DEFAULT_GRADIENT;
}

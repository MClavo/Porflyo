import type { TemplateDefinition } from '../types';
import TemplateLayout from './TemplateLayout';

// Export the template definition directly. Do not attempt to register via a
// side-effect call to the registry — that causes a circular import/runtime
// initialization issue. The registry should import known templates directly.
const def: TemplateDefinition = {
  id: 'template-example',
  title: 'Template Example',
  ThemeClass: 'tpl-example',
  defaultSections: [
    { id: 'user', title: 'Perfil', layoutType: 'column', maxItems: 3, allowedItemTypes: ['text'] },
    { id: 'projects', title: 'Proyectos', layoutType: 'grid', maxItems: 6, allowedItemTypes: ['doubleText', 'text'] },
    { id: 'experience', title: 'Experiencia', layoutType: 'row', maxItems: 5, allowedItemTypes: ['text', 'character'] },
  ],
  Layout: TemplateLayout,
};

export default def;

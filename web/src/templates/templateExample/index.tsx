import { registerTemplate } from '../registry';
import type { TemplateDefinition } from '../types';
import TemplateLayout from './TemplateLayout';

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

registerTemplate(def);

export default def;

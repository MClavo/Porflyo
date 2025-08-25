import type { TemplateDefinition } from '../types';
import TwoColumnDarkLayout from './TwoColumnDarkLayout';

const def: TemplateDefinition = {
  id: 'two-column-dark',
  title: 'Two Column Dark',
  ThemeClass: 'tpl-two-column-dark',
  defaultSections: [
    { id: 'left', title: 'Left', layoutType: 'column', maxItems: 10, allowedItemTypes: ['text'] },
    { id: 'right', title: 'Right', layoutType: 'column', maxItems: 10, allowedItemTypes: ['text'] },
    { id: 'bottom', title: 'Bottom', layoutType: 'row', maxItems: 20, allowedItemTypes: ['text', 'doubleText'] },
  ],
  Layout: TwoColumnDarkLayout,
};

export default def;

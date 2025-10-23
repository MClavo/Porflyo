import { useState, useCallback } from 'react';
import type { TemplateKey } from '../../templates/Template.types';
import { initialEmptyPortfolio } from '../../components/portfolio/initialPortfolio';

export function useEditorMode(initialMode: 'view' | 'edit' = 'view') {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const toggleMode = useCallback(() => setMode(m => (m === 'view' ? 'edit' : 'view')), []);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>(initialEmptyPortfolio.template);

  return {
    mode,
    toggleMode,
    selectedTemplate,
    setSelectedTemplate,
  } as const;
}

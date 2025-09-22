import { useState, useCallback } from 'react';
import type { TemplateKey } from '../../templates/Template.types';
import { initialEmptyPortfolio } from '../../components/portfolio/initialPortfolio';

export function useEditorMode() {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const toggleMode = useCallback(() => setMode(m => (m === 'view' ? 'edit' : 'view')), []);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>(initialEmptyPortfolio.template);

  return {
    mode,
    toggleMode,
    selectedTemplate,
    setSelectedTemplate,
  } as const;
}

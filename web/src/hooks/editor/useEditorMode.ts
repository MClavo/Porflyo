import { useState, useCallback, useEffect } from 'react';
import type { TemplateKey } from '../../templates/Template.types';
import { createInitialEmptyPortfolio } from '../../components/portfolio/initialPortfolio';

export function useEditorMode(initialMode: 'view' | 'edit' = 'view', resetKey?: string) {
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const toggleMode = useCallback(() => setMode(m => (m === 'view' ? 'edit' : 'view')), []);

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateKey>(createInitialEmptyPortfolio().template);

  // Reset mode and template when resetKey changes (e.g., route change)
  useEffect(() => {
    if (resetKey) {

      setMode(initialMode);
      setSelectedTemplate(createInitialEmptyPortfolio().template);
    }
  }, [resetKey, initialMode]);

  return {
    mode,
    toggleMode,
    selectedTemplate,
    setSelectedTemplate,
  } as const;
}

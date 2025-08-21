import React from 'react';
import type { PublicPortfolioView } from '../../../types/dto';

export type TemplateId = 'default' | 'ats' | 'slots';

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  supportsImages: boolean;
  layout: 'vertical' | 'grid';
  notes?: string;
  constraints?: {
    forbidImages?: boolean;
  };
  Render: React.FC<{ portfolio: PublicPortfolioView }>;
}

export type TemplatesRegistry = Record<TemplateId, TemplateMeta>;

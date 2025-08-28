// Types for different kinds of portfolio sections

export type SectionType = 
  | 'savedItems'
  | 'user' 
  | 'experience' 
  | 'projects' 
  | 'education' 
  | 'skills' 
  | 'text' 
  | 'achievements' 
  | 'contact';

export interface SectionDefinition {
  type: SectionType;
  title: string;
  description: string;
  defaultMaxItems: number;
  defaultAllowedItemTypes: import('./itemDto').ItemType[];
}

export interface PortfolioSection {
  id: string;
  type: SectionType;
  title: string;
  columns: number;
  rows: number;
  allowedItemTypes: import('./itemDto').ItemType[];
  items: string[]; // Array of item IDs for DnD compatibility
}

/**
 * Compute max items for a section as rows * columns.
 */
export function getMaxItems(section: PortfolioSection): number {
  return section.columns * section.rows;
}



// Predefined section definitions
export const SECTION_DEFINITIONS: Record<SectionType, SectionDefinition> = {
  user: {
    type: 'user',
    title: 'User Profile',
    description: 'Personal information and profile details',
    defaultMaxItems: 3,
    defaultAllowedItemTypes: ['text', 'doubleText'],
  },
  experience: {
    type: 'experience',
    title: 'Work Experience',
    description: 'Professional experience and career history',
    defaultMaxItems: 5,
    defaultAllowedItemTypes: ['text', 'doubleText'],
  },
  projects: {
    type: 'projects',
    title: 'Projects',
    description: 'Portfolio projects and personal work',
    defaultMaxItems: 6,
    defaultAllowedItemTypes: ['text', 'doubleText', 'textPhoto'],
  },
  education: {
    type: 'education',
    title: 'Education',
    description: 'Academic background and certifications',
    defaultMaxItems: 4,
    defaultAllowedItemTypes: ['text', 'doubleText', 'textPhoto'],
  },
  skills: {
    type: 'skills',
    title: 'Skills',
    description: 'Technical and professional skills',
    defaultMaxItems: 12,
    defaultAllowedItemTypes: ['text', 'character'],
  },
  text: {
    type: 'text',
    title: 'Text Section',
    description: 'General text content and descriptions',
    defaultMaxItems: 3,
    defaultAllowedItemTypes: ['text'],
  },
  achievements: {
    type: 'achievements',
    title: 'Achievements',
    description: 'Awards, recognitions and accomplishments',
    defaultMaxItems: 6,
    defaultAllowedItemTypes: ['text', 'doubleText', 'textPhoto'],
  },
  contact: {
    type: 'contact',
    title: 'Contact Information',
    description: 'Contact details and social links',
    defaultMaxItems: 8,
    defaultAllowedItemTypes: ['text', 'doubleText'],
  },
  savedItems: {
    type: 'savedItems',
    title: 'Saved Items',
    description: 'Items saved for later use or reference',
    defaultMaxItems: 10,
    defaultAllowedItemTypes: ['savedItem'],
  }
};

// Default sections configuration
export const DEFAULT_SECTIONS: PortfolioSection[] = [
  {
    id: 'savedItems',
    type: 'savedItems',
    title: 'Items Guardados',
    columns: 2,
    rows: 5,
    allowedItemTypes: ['savedItem'],
    items: []
  },
  {
    id: 'user',
    type: 'user',
    title: 'Perfil',
    columns: 3,
    rows: 1,
    allowedItemTypes: ['text'],
    
    items: []
  },
  {
    id: 'projects',
    type: 'projects',
    title: 'Proyectos',
    columns: 2,
    rows: 3,
    allowedItemTypes: ['doubleText', 'text', 'textPhoto'],
    
    items: []
  },
  {
    id: 'experience',
    type: 'experience',
    title: 'Experiencia',
    columns: 1,
    rows: 5,
    allowedItemTypes: ['text', 'character'],
    
    items: []
  }
];

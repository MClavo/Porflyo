// Types for different kinds of portfolio sections

export type SectionType = 
  | 'user' 
  | 'experience' 
  | 'projects' 
  | 'education' 
  | 'skills' 
  | 'text' 
  | 'achievements' 
  | 'contact';

export type LayoutType = 'grid' | 'column' | 'row';

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
  layoutType: LayoutType;
  maxItems: number;
  allowedItemTypes: import('./itemDto').ItemType[];
  items: string[]; // Array of item IDs for DnD compatibility
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
    defaultAllowedItemTypes: ['text', 'doubleText'],
  },
  education: {
    type: 'education',
    title: 'Education',
    description: 'Academic background and certifications',
    defaultMaxItems: 4,
    defaultAllowedItemTypes: ['text', 'doubleText'],
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
    defaultAllowedItemTypes: ['text', 'doubleText'],
  },
  contact: {
    type: 'contact',
    title: 'Contact Information',
    description: 'Contact details and social links',
    defaultMaxItems: 8,
    defaultAllowedItemTypes: ['text', 'doubleText'],
  }
};

// Default sections configuration
export const DEFAULT_SECTIONS: PortfolioSection[] = [
  {
    id: 'user',
    type: 'user',
    title: 'Perfil',
    layoutType: 'column',
    maxItems: 3,
    allowedItemTypes: ['text'],
    
    items: []
  },
  {
    id: 'projects',
    type: 'projects',
    title: 'Proyectos',
    layoutType: 'grid',
    maxItems: 6,
    allowedItemTypes: ['doubleText', 'text'],
    
    items: []
  },
  {
    id: 'experience',
    type: 'experience',
    title: 'Experiencia',
    layoutType: 'row',
    maxItems: 5,
    allowedItemTypes: ['text', 'character'],
    
    items: []
  }
];

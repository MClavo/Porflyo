import type { PortfolioZone } from './portfolioGridTypes';

export const PORTFOLIO_ZONES: PortfolioZone[] = [
  {
    id: 'profile',
    label: 'Perfil',
    zoneType: 'about',
    allowed: ['about'],
    maxItems: 3,
    color: '#7193f1'
  },
  {
    id: 'projects',
    label: 'Proyectos', 
    zoneType: 'cards-grid',
    allowed: ['project'],
    maxItems: 6,
    color: '#ffda6c'
  },
  {
    id: 'experience',
    label: 'Experiencia',
    zoneType: 'list',
    allowed: ['skillGroup'],
    maxItems: 5,
    color: '#00bcd4'
  }
];

export function getItemColor(id: string | number) {
  const idStr = String(id);
  if (idStr.startsWith('profile_')) return '#7193f1';
  if (idStr.startsWith('project_')) return '#ffda6c';
  if (idStr.startsWith('skill_')) return '#00bcd4';
  return '#666';
}

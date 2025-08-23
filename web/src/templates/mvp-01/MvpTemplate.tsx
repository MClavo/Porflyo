import React from 'react';
import type { PublicPortfolioView, PortfolioSection, PublicUserDto } from '../../types/dto';
import { ZoneRenderer } from '../../components/portfolio/ZoneRenderer';
import type { TemplateZone, PortfolioZoneData } from '../../components/portfolio/types';
import { readMeta } from '../../components/portfolio/utils';

interface MvpTemplateProps {
  portfolio: PublicPortfolioView;
}

const ZONES: TemplateZone[] = [
  { id: 'profile', label: 'Perfil', zoneType: 'about', allowed: ['about'], maxItems: 3, variants: [], defaultVariant: '' },
  { id: 'projects', label: 'Proyectos', zoneType: 'cards-grid', allowed: ['project'], maxItems: 3, variants: [], defaultVariant: '' },
  { id: 'experience', label: 'Experiencia', zoneType: 'list', allowed: ['skillGroup'], maxItems: 3, variants: [], defaultVariant: '' },
];

export const MvpTemplate: React.FC<MvpTemplateProps> = ({ portfolio }) => {
  // Group sections by zone id using _meta when present, otherwise try simple heuristics
  const zonesData: Record<string, PortfolioZoneData> = {};
  ZONES.forEach(z => (zonesData[z.id] = { variant: z.defaultVariant || '', items: [] }));

  const sections: PortfolioSection[] = portfolio.sections || [];

  sections.forEach(section => {
    const meta = readMeta(section);
    if (meta?.zoneId && zonesData[meta.zoneId]) {
      zonesData[meta.zoneId].items.push(section);
      return;
    }

    // Fallback: place by sectionType -> zone mapping
    if (meta?.sectionType === 'project' && zonesData['projects']) {
      zonesData['projects'].items.push(section);
      return;
    }

    if ((meta?.sectionType === 'about' || meta?.sectionType === 'profileHeader') && zonesData['profile']) {
      zonesData['profile'].items.push(section);
      return;
    }

    // final fallback: push to profile
    zonesData['profile'].items.push(section);
  });

  // Minimal user placeholder - some renderers expect a user object
  const user: PublicUserDto = {
    name: portfolio.title || '',
    email: '',
    description: portfolio.description || '',
    profileImage: null,
    profileImageKey: '',
    providerUserName: '',
    providerAvatarUrl: null,
    socials: {}
  };

  return (
    <div className="mvp-template-root">
      {ZONES.map(zone => (
        <div key={zone.id} className={`mvp-zone mvp-zone-${zone.id}`}>
          <ZoneRenderer zone={zone} zoneData={zonesData[zone.id]} user={user} editorMode={false} />
        </div>
      ))}
    </div>
  );
};

export default MvpTemplate;

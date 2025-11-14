/**
 * Mappers to convert between backend DTOs and frontend state
 */

import type { PortfolioState } from '../../state/Portfolio.types';
import type { SectionState, SectionType } from '../../state/Sections.types';
import type { CardType, AnyCard } from '../../state/Cards.types';
import type { TemplateKey } from '../../templates/Template.types';
import type { PublicPortfolioDto, PortfolioCreateDto, PortfolioPatchDto, PortfolioSection, PublicPortfolioView } from '../types/dto';
import { parseAboutSectionData, serializeAboutSectionData } from '../../components/sections/AboutSection.types';
import type { AboutSectionData } from '../../components/sections/AboutSection.types';

/**
 * Convert backend PortfolioSection to frontend SectionState
 */
export function mapPortfolioSectionToSectionState(section: PortfolioSection, id: string): SectionState {
  const sectionType = (section.sectionType as SectionType) || 'text';
  
  // Special handling for 'about' section - parse as structured data instead of cards
  if (sectionType === 'about') {
    const aboutData = parseAboutSectionData(section.content || '');
    
    return {
      id,
      type: sectionType,
      title: (section.title as string) || 'About Me',
      maxCards: 0, // About section doesn't use cards
      allowedTypes: [], // About section doesn't use cards
      cardsById: {},
      cardsOrder: [],
      parsedContent: aboutData,
    } as SectionState;
  }
  
  // Regular sections with cards
  const cardsById: Record<string, AnyCard> = {};
  const cardsOrder: string[] = [];
  
  if (section.content && typeof section.content === 'string') {
    try {
      const contentArray = JSON.parse(section.content);
      
      if (Array.isArray(contentArray)) {
        contentArray.forEach((cardData, index) => {
          // Generate unique ID that includes section ID to avoid conflicts
          const cardId = `${id}_card_${index}_${crypto.randomUUID()}`;
          cardsById[cardId] = {
            type: cardData.type,
            data: cardData
          };
          cardsOrder.push(cardId);
        });
      }
    } catch (err) {
      console.warn('Failed to parse section content:', err);
    }
  }
  
  // Set default allowedTypes based on section type
  let defaultAllowedTypes: CardType[] = [];
  switch (sectionType) {
    case 'projects':
      defaultAllowedTypes = ['project', 'job'];
      break;
    case 'experiences':
      defaultAllowedTypes = ['job'];
      break;
    case 'text':
      defaultAllowedTypes = ['text'];
      break;
    default:
      defaultAllowedTypes = ['text'];
  }
  
  return {
    id,
    type: sectionType,
    title: (section.title as string) || '',
    maxCards: undefined, // Not provided by backend, use frontend default
    allowedTypes: defaultAllowedTypes, // Use defaults based on section type
    cardsById,
    cardsOrder,
  } as SectionState;
}

/**
 * Convert frontend SectionState to backend PortfolioSection
 * This maps our current editor state to the backend format similar to OLDPortfolioEditorPage
 */
export function mapSectionStateToPortfolioSection(section: SectionState): PortfolioSection {
  // Special handling for 'about' section - serialize structured data
  if (section.type === 'about' && section.parsedContent) {
    const aboutData = section.parsedContent as AboutSectionData;
    return {
      sectionType: section.id,
      title: section.title,
      content: serializeAboutSectionData(aboutData),
      media: []
    } as PortfolioSection;
  }
  
  // Regular sections with cards
  // Convert cards to a simpler format for backend
  const items = section.cardsOrder.map(cardId => {
    const card = section.cardsById[cardId];
    if (!card) return null;
    
    // Return the card in the format expected by backend
    return {
      type: card.type,
      ...card.data
    };
  }).filter(Boolean);

  // Extract media URLs from items
  const mediaUrls: string[] = [];
  items.forEach(item => {
    if (item && typeof item === 'object') {
      // Extract from images array (ProjectCard)
      if ('images' in item && Array.isArray(item.images)) {
        mediaUrls.push(...item.images.filter((url): url is string => typeof url === 'string'));
      }
      // Extract from single image field (CertificateCard)
      if ('image' in item && typeof item.image === 'string') {
        mediaUrls.push(item.image);
      }
      // Extract from profileImage (AboutCard)
      if ('profileImage' in item && typeof item.profileImage === 'string') {
        mediaUrls.push(item.profileImage);
      }
    }
  });

  return {
    sectionType: section.id,
    title: section.title,
    content: JSON.stringify(items),
    media: mediaUrls
  } as PortfolioSection;
}

/**
 * Convert backend PublicPortfolioDto to frontend PortfolioState
 */
export function mapPublicPortfolioDtoToPortfolioState(dto: PublicPortfolioDto | PublicPortfolioDto[]): PortfolioState {
  // Handle case where backend returns array instead of single portfolio
  const portfolioDto = Array.isArray(dto) ? dto[0] : dto;
  
  if (!portfolioDto) {
    throw new Error('No portfolio data received');
  }
  
  const sections: Record<string, SectionState> = {};
  
  // Handle case where sections might be undefined or null
  if (portfolioDto.sections && Array.isArray(portfolioDto.sections)) {
    portfolioDto.sections.forEach((section, index) => {
      // Use sectionType as ID instead of generic section_X
      const id = (section.sectionType as string) || `section_${index}`;
      const mappedSection = mapPortfolioSectionToSectionState(section, id);
      sections[id] = mappedSection;
    });
  }

  const result = {
    template: portfolioDto.template as TemplateKey,
    title: portfolioDto.title,
    sections,
  };
  
  return result;
}

/**
 * Convert frontend PortfolioState to backend PortfolioCreateDto
 */
export function mapPortfolioStateToCreateDto(state: PortfolioState, description: string): PortfolioCreateDto {
  const sections = Object.values(state.sections).map(section => 
    mapSectionStateToPortfolioSection(section)
  );

  return {
    template: state.template,
    title: state.title,
    description,
    sections,
  };
}

/**
 * Convert frontend PortfolioState to backend PortfolioPatchDto
 */
export function mapPortfolioStateToPatchDto(state: PortfolioState, description?: string): PortfolioPatchDto {
  const sections = Object.values(state.sections).map(section => 
    mapSectionStateToPortfolioSection(section)
  );

  return {
    template: state.template,
    title: state.title,
    description,
    sections,
  };
}

/**
 * Convert backend PublicPortfolioView to frontend PortfolioState
 * For public viewing of portfolios
 */
export function mapPublicPortfolioViewToPortfolioState(view: PublicPortfolioView): PortfolioState {
  const sections: Record<string, SectionState> = {};
  
  // Handle case where sections might be undefined or null
  if (view.sections && Array.isArray(view.sections)) {
    view.sections.forEach((section, index) => {
      // Use sectionType as ID instead of generic section_X
      const id = (section.sectionType as string) || `section_${index}`;
      const mappedSection = mapPortfolioSectionToSectionState(section, id);
      sections[id] = mappedSection;
    });
  }

  return {
    template: view.template as TemplateKey,
    title: view.title || '',
    sections,
  };
}
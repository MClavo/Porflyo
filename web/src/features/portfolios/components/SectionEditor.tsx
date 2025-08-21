import type { SectionFormData } from '../schemas/sections.schema';
import { AboutSectionEditor } from './AboutSectionEditor';
import { TextSectionEditor } from './TextSectionEditor';
import { TextWithImageSectionEditor } from './TextWithImageSectionEditor';
import { RepoSectionEditor } from './RepoSectionEditor';
import { RepoListSectionEditor } from './RepoListSectionEditor';
import { GallerySectionEditor } from './GallerySectionEditor';

interface SectionEditorProps {
  section: SectionFormData;
  sectionIndex: number;
}

export function SectionEditor({ section, sectionIndex }: SectionEditorProps) {
  switch (section.kind) {
    case 'ABOUT':
      return <AboutSectionEditor sectionIndex={sectionIndex} />;
    
    case 'TEXT':
      return <TextSectionEditor sectionIndex={sectionIndex} />;
    
    case 'TEXT_WITH_IMAGE_LEFT':
    case 'TEXT_WITH_IMAGE_RIGHT':
      return <TextWithImageSectionEditor sectionIndex={sectionIndex} />;
    
    case 'REPO':
      return <RepoSectionEditor sectionIndex={sectionIndex} />;
    
    case 'REPO_LIST':
      return <RepoListSectionEditor sectionIndex={sectionIndex} />;
    
    case 'GALLERY_LARGE':
    case 'GALLERY_SMALL':
    case 'GALLERY_GRID':
      return <GallerySectionEditor sectionIndex={sectionIndex} />;
    
    default: {
      const _exhaustiveCheck: never = section;
      return (
        <div className="error">
          <p>Unknown section type</p>
        </div>
      );
    }
  }
}

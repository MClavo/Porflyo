import { ProjectCard, JobCard, TextCard, AboutCard } from './index';
import type { AnyCard, ProjectCardSaved, JobCardSaved, TextCardSaved, AboutCardSaved } from '../../state/Cards.types';
import type { Mode } from './subcomponents';
import type { CardId } from '../../state/Sections.types';

// utility function that returns the appropriate card element for a given AnyCard
// now accepts an onPatch callback which will be forwarded to the specific card component
export function renderCard(
  card: AnyCard,
  mode: Mode = 'view',
  cardId?: CardId,
  onPatch?: (patch: Partial<Record<string, unknown>>) => void
): React.ReactElement | null {
  const type = card.type;
  const data = card.data;

  switch (type) {
    case 'project':
      return <ProjectCard key={cardId} mode={mode} {...(data as ProjectCardSaved)} onPatch={onPatch} />;
    case 'job':
      return <JobCard key={cardId} mode={mode} {...(data as JobCardSaved)} onPatch={onPatch} />;
    case 'text':
      return <TextCard key={cardId} mode={mode} {...(data as TextCardSaved)} onPatch={onPatch} />;
    case 'about':
      return <AboutCard key={cardId} mode={mode} data={data as AboutCardSaved} onPatch={onPatch} />;
    default:
      return null;
  }
}

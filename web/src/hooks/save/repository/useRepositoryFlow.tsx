import { useState } from 'react';
import type { Repository } from '../../../api/types/repository.types';
import { mapRepositoryForCard } from '../../../api/types/repository.types';
import type { Dispatch } from 'react';

export function useRepositoryFlow({ dispatch, showNotification }: {
  dispatch: Dispatch<unknown>;
  showNotification: (msg: string, type?: 'success'|'error'|'info') => void;
}) {
  const [isRepositoryDialogOpen, setIsRepositoryDialogOpen] = useState(false);
  const [pendingCardSection, setPendingCardSection] = useState<string | null>(null);

  const openForSection = (sectionId: string) => {
    setPendingCardSection(sectionId);
    setIsRepositoryDialogOpen(true);
  };

  const handleRepositorySelect = (repository: Repository) => {
    if (!pendingCardSection) return;

    const mappedRepo = mapRepositoryForCard(repository);
    const initialData = {
      title: mappedRepo.name,
      description: mappedRepo.description,
      techTitle: 'Technologies:',
      technologies: mappedRepo.topics,
      images: [],
      repoUrl: mappedRepo.html_url,
      liveUrl: mappedRepo.homepage,
      stars: mappedRepo.stargazers_count,
      forks: mappedRepo.forks_count,
    };

    dispatch({ type: 'ADD_CARD', payload: { sectionId: pendingCardSection, cardType: 'project', initialData } });

    setIsRepositoryDialogOpen(false);
    setPendingCardSection(null);
    showNotification('Project card created from repository!', 'success');
  };

  const close = () => {
    setIsRepositoryDialogOpen(false);
    setPendingCardSection(null);
  };

  return {
    isRepositoryDialogOpen,
    openForSection,
    close,
    handleRepositorySelect,
  } as const;
}

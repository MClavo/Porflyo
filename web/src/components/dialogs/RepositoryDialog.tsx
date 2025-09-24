import React from 'react';
import { useRepositoriesContext } from '../../hooks/ui/useRepositoriesContext';
import type { Repository } from '../../api/types/repository.types';
import './RepositoryDialog.css';

interface RepositoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repo: Repository) => void;
}

export function RepositoryDialog({ isOpen, onClose, onSelectRepo }: RepositoryDialogProps) {
  const { repositories, isLoading, error } = useRepositoriesContext();

  if (!isOpen) return null;

  const handleRepoClick = (repo: Repository) => {
    onSelectRepo(repo);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="repository-dialog" onClick={handleBackdropClick}>
      <div className="repository-dialog-content">
        <div className="repository-dialog-header">
          <h2 className="repository-dialog-title">Select Repository</h2>
          <button 
            className="repository-dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        
        <div className="repository-dialog-body">
          <div className="repository-list">
            {isLoading && (
              <div className="repository-loading">
                <div>Loading repositories...</div>
              </div>
            )}
            
            {error && (
              <div className="repository-error">
                <div>Error loading repositories: {error}</div>
              </div>
            )}
            
        {!isLoading && !error && (repositories?.length ?? 0) === 0 && (
              <div className="repository-empty">
                <div className="repository-empty-icon">📁</div>
                <div>No repositories found</div>
              </div>
            )}
            
            {!isLoading && !error && repositories.map((repo, index) => (
              <div
                key={`${repo.name}-${index}`}
                className="repository-item"
                onClick={() => handleRepoClick(repo)}
              >
                <div className="repository-header">
                  <h3 className="repository-name">{repo.name}</h3>
                  <div className="repository-stats">
                    {repo.stargazers_count !== undefined && repo.stargazers_count !== null && repo.stargazers_count > 0 && (
                      <div className="repository-stat">
                        <span className="repository-stat-icon">⭐</span>
                        <span>{repo.stargazers_count}</span>
                      </div>
                    )}
                    {repo.forks_count !== undefined && repo.forks_count !== null && repo.forks_count > 0 && (
                      <div className="repository-stat">
                        <span className="repository-stat-icon">🍴</span>
                        <span>{repo.forks_count}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {repo.description && (
                  <div className="repository-description">
                    {repo.description}
                  </div>
                )}
                
                {repo.topics && repo.topics.length > 0 && (
                  <div className="repository-topics">
                    {repo.topics.map((topic, topicIndex) => (
                      <span key={topicIndex} className="repository-topic">
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
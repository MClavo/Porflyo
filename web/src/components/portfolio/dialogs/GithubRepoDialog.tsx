import React from 'react';
import { useRepos } from '../../../api/hooks/useRepos';
import type { GithubRepo } from '../../../types/repoDto';
import './GithubRepoDialog.css';

interface GithubRepoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRepo: (repo: GithubRepo) => void;
}

export function GithubRepoDialog({ isOpen, onClose, onSelectRepo }: GithubRepoDialogProps) {
  const { repos, loading, error } = useRepos();

  if (!isOpen) return null;

  const handleRepoClick = (repo: GithubRepo) => {
    onSelectRepo(repo);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="github-repo-dialog" onClick={handleBackdropClick}>
      <div className="github-repo-dialog-content">
        <div className="github-repo-dialog-header">
          <h2 className="github-repo-dialog-title">Seleccionar Repositorio</h2>
          <button 
            className="github-repo-dialog-close"
            onClick={onClose}
            aria-label="Cerrar diálogo"
          >
            ×
          </button>
        </div>
        
        <div className="github-repo-dialog-body">
          <div className="github-repo-list">
            {loading && (
              <div className="github-repo-loading">
                <div>Cargando repositorios...</div>
              </div>
            )}
            
            {error && (
              <div className="github-repo-error">
                <div>Error al cargar repositorios: {error}</div>
              </div>
            )}
            
            {!loading && !error && repos.length === 0 && (
              <div className="github-repo-empty">
                <div className="github-repo-empty-icon">📁</div>
                <div>No se encontraron repositorios</div>
              </div>
            )}
            
            {!loading && !error && repos.map((repo, index) => (
              <div
                key={`${repo.name}-${index}`}
                className="github-repo-item"
                onClick={() => handleRepoClick(repo)}
              >
                <div className="github-repo-header">
                  <h3 className="github-repo-name">{repo.name}</h3>
                  <div className="github-repo-stats">
                    {repo.stargazers_count !== undefined && repo.stargazers_count !== null && repo.stargazers_count > 0 && (
                      <div className="github-repo-stat">
                        <span className="github-repo-stat-icon">⭐</span>
                        <span>{repo.stargazers_count}</span>
                      </div>
                    )}
                    {repo.forks_count !== undefined && repo.forks_count !== null && repo.forks_count > 0 && (
                      <div className="github-repo-stat">
                        <span className="github-repo-stat-icon">🍴</span>
                        <span>{repo.forks_count}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {repo.description && (
                  <div className="github-repo-description">
                    {repo.description}
                  </div>
                )}
                
                {repo.topics && repo.topics.length > 0 && (
                  <div className="github-repo-topics">
                    {repo.topics.map((topic, topicIndex) => (
                      <span key={topicIndex} className="github-repo-topic">
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

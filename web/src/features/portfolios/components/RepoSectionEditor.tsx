import { useFormContext } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';
import { useGetRepos } from '../../repos/hooks/useRepos';

interface RepoSectionEditorProps {
  sectionIndex: number;
}

export function RepoSectionEditor({ sectionIndex }: RepoSectionEditorProps) {
  const { register, formState: { errors }, watch } = useFormContext<PortfolioFormData>();
  const { data: repos, isLoading: reposLoading, error: reposError } = useGetRepos();
  
  const sectionPath = `sections.${sectionIndex}` as const;
  const selectedRepoId = watch(`${sectionPath}.repoId`);
  
  // Helper function to get field errors safely
  const getFieldError = (field: string) => {
    const sectionErrors = errors.sections?.[sectionIndex];
    return sectionErrors?.[field as keyof typeof sectionErrors] as { message?: string } | undefined;
  };

  const selectedRepo = repos?.find(repo => repo.name === selectedRepoId);

  return (
    <div className="form-container">
      {/* Repository Selection */}
      <div className="form-group">
        <label htmlFor={`section-${sectionIndex}-repo`} className="form-label">
          Repository *
        </label>
        
        {reposLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading repositories...
          </div>
        ) : reposError ? (
          <div className="error">
            <p>Failed to load repositories. Please try again.</p>
          </div>
        ) : repos && repos.length > 0 ? (
          <select
            id={`section-${sectionIndex}-repo`}
            {...register(`${sectionPath}.repoId`)}
            className={`form-input ${getFieldError('repoId') ? 'error' : ''}`}
          >
            <option value="">Select a repository</option>
            {repos.map((repo) => (
              <option key={repo.name} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="empty-state">
            <p>No repositories found. Connect your GitHub account to see your repositories.</p>
          </div>
        )}
        
        {getFieldError('repoId') && (
          <p className="error-message">{getFieldError('repoId')?.message}</p>
        )}
      </div>

      {/* Repository Preview */}
      {selectedRepo && (
        <div className="form-group">
          <label className="form-label">Preview</label>
          <div className="repo-preview">
            <div className="repo-card">
              <div className="repo-header">
                <h4 className="repo-title">{selectedRepo.name}</h4>
                <a
                  href={selectedRepo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="repo-link"
                >
                  <svg style={{ width: '1rem', height: '1rem' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-1a1 1 0 10-2 0v1H5V7h1a1 1 0 000-2H5z" />
                  </svg>
                </a>
              </div>
              {selectedRepo.description && (
                <p className="repo-description">{selectedRepo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

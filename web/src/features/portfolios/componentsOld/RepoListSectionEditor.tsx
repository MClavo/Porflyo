import { useFormContext } from 'react-hook-form';
import type { PortfolioFormData } from '../schemas/sections.schema';
import { useGetRepos } from '../../repos/hooks/useRepos';

interface RepoListSectionEditorProps {
  sectionIndex: number;
}

export function RepoListSectionEditor({ sectionIndex }: RepoListSectionEditorProps) {
  const { register, formState: { errors }, watch, setValue } = useFormContext<PortfolioFormData>();
  const { data: repos, isLoading: reposLoading, error: reposError } = useGetRepos();
  
  const sectionPath = `sections.${sectionIndex}` as const;
  const selectedRepoIds = watch(`${sectionPath}.repoIds`) || [];
  
  // Helper function to get field errors safely
  const getFieldError = (field: string) => {
    const sectionErrors = errors.sections?.[sectionIndex];
    return sectionErrors?.[field as keyof typeof sectionErrors] as { message?: string } | undefined;
  };

  const addRepo = () => {
    if (selectedRepoIds.length < 10) {
      const newRepoIds = [...selectedRepoIds, ''];
      setValue(`${sectionPath}.repoIds`, newRepoIds);
    }
  };

  const removeRepo = (indexToRemove: number) => {
    const newRepoIds = selectedRepoIds.filter((_, index) => index !== indexToRemove);
    setValue(`${sectionPath}.repoIds`, newRepoIds);
  };

  const getAvailableRepos = (currentIndex: number) => {
    if (!repos) return [];
    
    const currentValue = selectedRepoIds[currentIndex];
    const otherSelectedIds = selectedRepoIds.filter((_, idx) => idx !== currentIndex);
    
    return repos.filter(repo => 
      !otherSelectedIds.includes(repo.name) || repo.name === currentValue
    );
  };

  const getSelectedRepos = () => {
    if (!repos) return [];
    return selectedRepoIds
      .filter(Boolean)
      .map(repoId => repos.find(repo => repo.name === repoId))
      .filter(Boolean);
  };

  return (
    <div className="form-container">
      {/* Repository Selection */}
      <div className="form-group">
        <div className="links-header">
          <label className="form-label">Repositories *</label>
          <button
            type="button"
            onClick={addRepo}
            disabled={selectedRepoIds.length >= 10 || reposLoading}
            className="btn-sm btn-outline"
          >
            Add Repository
          </button>
        </div>

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
          <>
            {selectedRepoIds.length > 0 && (
              <div className="repos-container">
                {selectedRepoIds.map((repoId, repoIndex) => {
                  const availableRepos = getAvailableRepos(repoIndex);
                  
                  return (
                    <div key={repoIndex} className="repo-item">
                      <select
                        {...register(`${sectionPath}.repoIds.${repoIndex}` as const)}
                        className="form-input"
                      >
                        <option value="">Select a repository</option>
                        {availableRepos.map((repo) => (
                          <option key={repo.name} value={repo.name}>
                            {repo.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removeRepo(repoIndex)}
                        className="btn-sm btn-outline delete-btn"
                        title="Remove repository"
                      >
                        <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            
            {selectedRepoIds.length === 0 && (
              <p className="empty-state">No repositories added yet. Click "Add Repository" to add one.</p>
            )}
            
            <p className="field-hint">
              {selectedRepoIds.length}/10 repositories
            </p>
          </>
        ) : (
          <div className="empty-state">
            <p>No repositories found. Connect your GitHub account to see your repositories.</p>
          </div>
        )}
        
        {getFieldError('repoIds') && (
          <p className="error-message">{getFieldError('repoIds')?.message}</p>
        )}
      </div>

      {/* Repository List Preview */}
      {getSelectedRepos().length > 0 && (
        <div className="form-group">
          <label className="form-label">Preview</label>
          <div className="repos-preview">
            {getSelectedRepos().map((repo) => (
              <div key={repo!.name} className="repo-card">
                <div className="repo-header">
                  <h4 className="repo-title">{repo!.name}</h4>
                  <a
                    href={repo!.html_url}
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
                {repo!.description && (
                  <p className="repo-description">{repo!.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

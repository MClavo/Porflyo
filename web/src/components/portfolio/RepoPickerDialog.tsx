import React, { useState, useEffect, useCallback } from "react";
import type { ProviderRepo } from "../../types/dto";

type ExtendedRepo = ProviderRepo & {
  topics?: string[];
  homepage?: string;
  stargazers_count?: number;
  language?: string;
};

interface RepoPickerDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (repo: ExtendedRepo) => void;
  loadUserRepos: () => Promise<ExtendedRepo[]>;
}

export const RepoPickerDialog: React.FC<RepoPickerDialogProps> = ({
  open,
  onCancel,
  onConfirm,
  loadUserRepos
}) => {
  const [repos, setRepos] = useState<ExtendedRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<ExtendedRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<ExtendedRepo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRepos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const userRepos = await loadUserRepos();
      setRepos(userRepos);
      setFilteredRepos(userRepos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, [loadUserRepos]);

  // Load repos when dialog opens
  useEffect(() => {
    if (open && repos.length === 0) {
      loadRepos();
    }
  }, [open, repos.length, loadRepos]);

  // Filter repos based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRepos(repos);
    } else {
      const term = searchTerm.toLowerCase();
      const filtered = repos.filter(repo =>
        repo.name.toLowerCase().includes(term) ||
        repo.description?.toLowerCase().includes(term) ||
        repo.language?.toLowerCase().includes(term) ||
        repo.topics?.some(topic => topic.toLowerCase().includes(term))
      );
      setFilteredRepos(filtered);
    }
  }, [searchTerm, repos]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setSelectedRepo(null);
      setSearchTerm("");
      setError(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (selectedRepo) {
      onConfirm(selectedRepo);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Repository
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search repositories..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-gray-600">Loading repositories...</span>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-red-500 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadRepos}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-center">
              <div className="text-gray-500">
                {repos.length === 0 ? (
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p>No repositories found</p>
                  </div>
                ) : (
                  <div>
                    <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No repositories match your search</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-y-auto max-h-full">
              <div className="p-4 space-y-3">
                {filteredRepos.map((repo) => (
                  <div
                    key={repo.name}
                    onClick={() => setSelectedRepo(repo)}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedRepo?.name === repo.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{repo.name}</h3>
                          {repo.language && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                              {repo.language}
                            </span>
                          )}
                        </div>
                        
                        {repo.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span>{formatNumber(repo.stargazers_count)}</span>
                          </div>
                          
                          {repo.homepage && (
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m0 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.102m4.308 0l-4.308 4.308" />
                              </svg>
                              <span>Demo</span>
                            </div>
                          )}
                        </div>
                        
                        {repo.topics && repo.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {repo.topics.slice(0, 3).map((topic) => (
                              <span
                                key={topic}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                              >
                                {topic}
                              </span>
                            ))}
                            {repo.topics.length > 3 && (
                              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                +{repo.topics.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {selectedRepo?.name === repo.name && (
                        <div className="ml-4">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedRepo}
              className={`px-4 py-2 rounded-md ${
                selectedRepo
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Select Repository
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

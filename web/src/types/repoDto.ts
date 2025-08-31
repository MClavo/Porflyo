// Types for GitHub repositories from the backend API

export interface GithubRepo {
  name: string;
  description?: string | null;
  html_url: string;
  homepage?: string | null;
  languages_url: string;
  stargazers_count?: number | null;
  forks_count?: number | null;
  topics?: string[];
}

// Mapper function to convert backend repo to GithubProjectItem
export function mapRepoToGithubProjectItem(
  repo: GithubRepo, 
  id: number, 
  sectionType: import('./sectionDto').SectionType = 'projects'
): import('./itemDto').GithubProjectItem {
  const stars = repo.stargazers_count && repo.stargazers_count > 0 ? repo.stargazers_count : undefined;
  const forks = repo.forks_count && repo.forks_count > 0 ? repo.forks_count : undefined;
  
  return {
    id,
    type: 'githubProject',
    sectionType,
    name: repo.name,
    description: repo.description,
    htmlUrl: repo.html_url,
    homepage: repo.homepage,
    languages: [], // Se puede obtener después de languages_url
    topics: repo.topics || [],
    stars,
    forks,
    showStars: stars !== undefined,
    showForks: forks !== undefined,
    images: []
  };
}

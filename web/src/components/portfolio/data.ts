import type { 
  ProviderRepo, 
  PublicUserDto, 
  PublicPortfolioDto, 
  PortfolioCreateDto, 
  PortfolioPatchDto 
} from "../../types/dto";

/**
 * Extended repository type with additional GitHub API fields
 */
export type RepoExtended = ProviderRepo & {
  topics?: string[];
  homepage?: string;
  stargazers_count?: number;
  language?: string;
};

/**
 * Load user repositories from GitHub API
 * TODO: Integrate with your API endpoint
 */
export async function loadUserRepos(): Promise<RepoExtended[]> {
  // TODO: Replace with actual API call
  // Example implementation:
  // const response = await fetch('/api/user/repos');
  // if (!response.ok) throw new Error('Failed to load repositories');
  // return response.json();
  
  throw new Error("loadUserRepos not implemented - integrate with your API");
}

/**
 * Load current user profile
 * TODO: Integrate with your API endpoint
 */
export async function loadUserProfile(): Promise<PublicUserDto> {
  // TODO: Replace with actual API call
  // Example implementation:
  // const response = await fetch('/api/user/profile');
  // if (!response.ok) throw new Error('Failed to load user profile');
  // return response.json();
  
  throw new Error("loadUserProfile not implemented - integrate with your API");
}

/**
 * Load portfolio by slug
 * TODO: Integrate with your API endpoint
 */
export async function loadPortfolio(slug: string): Promise<PublicPortfolioDto | null> {
  // TODO: Replace with actual API call
  // Example implementation:
  // const response = await fetch(`/api/portfolios/${slug}`);
  // if (response.status === 404) return null;
  // if (!response.ok) throw new Error('Failed to load portfolio');
  // return response.json();
  
  console.log("loadPortfolio called with slug:", slug);
  throw new Error("loadPortfolio not implemented - integrate with your API");
}

/**
 * Create a new portfolio
 * TODO: Integrate with your API endpoint
 */
export async function saveCreate(dto: PortfolioCreateDto): Promise<void> {
  // TODO: Replace with actual API call
  // Example implementation:
  // const response = await fetch('/api/portfolios', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(dto)
  // });
  // if (!response.ok) throw new Error('Failed to create portfolio');
  
  console.log("saveCreate called with dto:", dto);
  throw new Error("saveCreate not implemented - integrate with your API");
}

/**
 * Update an existing portfolio
 * TODO: Integrate with your API endpoint
 */
export async function savePatch(dto: PortfolioPatchDto): Promise<void> {
  // TODO: Replace with actual API call
  // Example implementation:
  // const response = await fetch(`/api/portfolios/${portfolioId}`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(dto)
  // });
  // if (!response.ok) throw new Error('Failed to update portfolio');
  
  console.log("savePatch called with dto:", dto);
  throw new Error("savePatch not implemented - integrate with your API");
}

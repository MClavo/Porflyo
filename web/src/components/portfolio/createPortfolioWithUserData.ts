import type { PublicUserDto } from "../../api/types/dto";
import type { PortfolioState } from "../../state/Portfolio.types";
import type { AboutSectionData } from "../sections/AboutSection.types";
import { createInitialEmptyPortfolio } from "./initialPortfolio";

/**
 * Creates an initial portfolio with user data pre-populated in the About section
 */
export function createPortfolioWithUserData(user: PublicUserDto): PortfolioState {
  // Start with a fresh empty portfolio
  const portfolio = createInitialEmptyPortfolio();
  
  // Create about section data with user data
  const aboutData: AboutSectionData = {
    name: user.name || '',
    description: user.description || '',
    profileImage: user.profileImage || user.providerAvatarUrl || null,
    profileImageKey: user.profileImageKey || '',
    email: user.email || '',
    socials: user.socials || {},
    templateConfig: {},
  };

  // Set parsedContent directly (no cards for about section)
  portfolio.sections.about.parsedContent = aboutData;

  return portfolio;
}
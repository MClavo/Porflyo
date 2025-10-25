import type { PublicUserDto } from "../../api/types/dto";
import type { PortfolioState } from "../../state/Portfolio.types";
import type { AboutCardSaved } from "../../state/Cards.types";
import { createInitialEmptyPortfolio } from "./initialPortfolio";

/**
 * Creates an initial portfolio with user data pre-populated in the About section
 */
export function createPortfolioWithUserData(user: PublicUserDto): PortfolioState {
  // Start with a fresh empty portfolio
  const portfolio = createInitialEmptyPortfolio();
  
  // Create about card with user data
  const aboutCardId = `about_card_${crypto.randomUUID()}`;
  const aboutCardData: AboutCardSaved = {
    name: user.name || '',
    description: user.description || '',
    profileImage: user.profileImage || user.providerAvatarUrl || undefined,
    email: user.email || undefined,
    socials: user.socials || undefined,
  };

  // Add the about card to the about section (now safe since portfolio is fresh)
  portfolio.sections.about.cardsById[aboutCardId] = {
    type: 'about',
    data: aboutCardData,
  };
  portfolio.sections.about.cardsOrder = [aboutCardId];

  return portfolio;
}
import type { PortfolioState } from "../../state/Portfolio.types";
import type { AboutSectionData } from "../sections/AboutSection.types";
import { createDefaultAboutData } from "../sections/AboutSection.types";
import type { PublicUserDto } from "../../api/types/dto";

/**
 * Creates a fresh initial portfolio state for creating new portfolios from scratch.
 * Contains all standard sections but no cards. Always returns a new object.
 * 
 * @param user - Optional user data to pre-populate the About section
 */
export function createInitialEmptyPortfolio(user?: PublicUserDto | null): PortfolioState {
  // Create about section data from user if available, otherwise use defaults
  const aboutData: AboutSectionData = user ? {
    name: user.name || '',
    description: user.description || '',
    profileImage: user.profileImage || user.providerAvatarUrl || null,
    profileImageKey: user.profileImageKey || '',
    email: user.email || '',
    socials: user.socials || {},
    templateConfig: {},
  } : createDefaultAboutData();

  return {
    template: "glass",
    title: "",
    sections: {
      about: {
        id: "about",
        type: "about",
        title: "About Me",
        allowedTypes: [],
        maxCards: 0,
        cardsById: {},
        cardsOrder: [],
        parsedContent: aboutData,
      },
      projects: {
        id: "projects",
        type: "projects",
        title: "Projects",
        allowedTypes: ["project", "job"],
        maxCards: 3,
        cardsById: {},
        cardsOrder: [],
      },
      experiences: {
        id: "experiences",
        type: "experiences", 
        title: "Experience",
        allowedTypes: ["job"],
        maxCards: 2,
        cardsById: {},
        cardsOrder: [],
      },
      text: {
        id: "text",
        type: "text",
        title: "Text",
        allowedTypes: ["text"],
        maxCards: 2,
        cardsById: {},
        cardsOrder: [],
      },
    },
  };
}

/**
 * @deprecated Use createInitialEmptyPortfolio() instead for guaranteed fresh objects
 */
export const initialEmptyPortfolio: PortfolioState = createInitialEmptyPortfolio();
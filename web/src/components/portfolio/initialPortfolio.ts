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
      experiences: {
        id: "experiences",
        type: "experiences", 
        title: "Experience",
        allowedTypes: ["job"],
        maxCards: 6,
        cardsById: {},
        cardsOrder: [],
      },
      education: {
        id: "education",
        type: "education",
        title: "Education",
        allowedTypes: ["education"],
        maxCards: 6,
        cardsById: {},
        cardsOrder: [],
      },
      projects: {
        id: "projects",
        type: "projects",
        title: "Projects",
        allowedTypes: ["project"],
        maxCards: 6,
        cardsById: {},
        cardsOrder: [],
      },
      skills: {
        id: "skills",
        type: "skills",
        title: "Skills",
        allowedTypes: ["text"],
        maxCards: 4,
        cardsById: {},
        cardsOrder: [],
      },
      achievements: {
        id: "achievements",
        type: "achievements",
        title: "Achievements",
        allowedTypes: ["text", "certificate", "award"],
        maxCards: 6,
        cardsById: {},
        cardsOrder: [],
      },
      contact: {
        id: "contact",
        type: "contact",
        title: "Contact",
        allowedTypes: ["text"],
        maxCards: 6,
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
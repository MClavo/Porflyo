import image from "../../assets/landing/2-codespaces.webp";
import { createCard } from "../../state/Cards.registry";
import type { PortfolioState } from "../../state/Portfolio.types";
import type { AnyCard } from "../../state/Cards.types";

const demoProjects = (() => {
  const a = createCard("project");
  const aCard = a.card as AnyCard;
  if (aCard.type === "project") {
    aCard.data.title = "My Projects";
    aCard.data.description = "A demo project";
    aCard.data.techTitle = "Technologies";
    aCard.data.technologies = ["React", "TypeScript"];
    aCard.data.images = [image];
  }

  const b = createCard("project");
  const bCard = b.card as AnyCard;
  if (bCard.type === "project") {
    bCard.data.title = "Project 2";
    bCard.data.description = "Another demo project";
    bCard.data.techTitle = "Technologies";
    bCard.data.technologies = ["Node.js"];
    bCard.data.images = [];
  }

  return { byId: { [a.id]: a.card, [b.id]: b.card }, order: [a.id, b.id] };
})();

const demoExperiences = (() => {
  const e = createCard("job");
  const eCard = e.card as AnyCard;
  if (eCard.type === "job") {
    eCard.data.title = "Software Engineer";
    eCard.data.company = "Tech Corp";
    eCard.data.description = "Worked on web apps with React and Node.";
    eCard.data.dateStart = { month: 1, year: 2020 };
    eCard.data.dateEnd = { month: 12, year: 2022 };
  }

  return { byId: { [e.id]: e.card }, order: [e.id] };
})();

const demoInitialPortfolio: PortfolioState = {
  template: "template1",
  title: "Demo Portfolio",
  sections: {
    projects: {
      id: "projects",
      type: "projects",
      title: "Projects",
      allowedTypes: ["project", "job"],
      maxCards: 3,
      cardsById: demoProjects.byId,
      cardsOrder: demoProjects.order,
    },
    experiences: {
      id: "experiences",
      type: "experiences",
      title: "Experience",
      allowedTypes: ["job"],
      maxCards: 2,
      cardsById: demoExperiences.byId,
      cardsOrder: demoExperiences.order,
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

export { demoProjects, demoExperiences, demoInitialPortfolio };

import { createCard } from "../../state/Cards.registry";
import type { PortfolioState } from "../../state/Portfolio.types";
import type { AnyCard, CardType } from "../../state/Cards.types";
import type { SectionState, SectionType } from "../../state/Sections.types";
import type { MonthYearValue } from "../../components/cards/subcomponents/Fields.types";

// Raw JSON payload provided by user (inlined here for demo purposes)
const raw = {
  id: "50ac9fd2-5221-4065-b799-ed2782f565a8",
  template: "ats",
  title: "TEST",
  sections: [
    {
      sectionType: "projects",
      title: "Proyectos de ejemplo",
      content:
        "[{\"type\":\"project\",\"title\":\"Porflyo\",\"description\":\"Sistema de portfolio interactivo con métricas avanzadas\",\"techTitle\":\"Technologies:\",\"technologies\":[\"React\",\"TypeScript\",\"Vite\"],\"images\":[],\"repoId\":998414481,\"repoUrl\":\"https://github.com/MClavo/Porflyo\",\"liveUrl\":\"https://portfolio-demo.example.com\"},{\"type\":\"project\",\"title\":\"FarmaciaVendeButano\",\"description\":\"Evolución del Software. Prácticas GIT y desarrollo colaborativo\",\"techTitle\":\"Technologies:\",\"technologies\":[\"Git\",\"Software Engineering\"],\"images\":[],\"repoId\":884221032,\"repoUrl\":\"https://github.com/MClavo/FarmaciaVendeButano\",\"liveUrl\":\"https://farmacia-demo.example.com\"}]"
    },
    {
      sectionType: "experiences",
      title: "EXperiencia",
      content:
        "[{\"type\":\"job\",\"title\":\"EJEMPLO EJEMPLO\",\"company\":\"\",\"description\":\"\",\"dateStart\":{\"month\":9,\"year\":2025},\"dateEnd\":{\"month\":0,\"year\":2025}}]",
    },
    {
      sectionType: "text",
      title: "Text",
      content: "[{\"type\":\"text\",\"title\":\"\",\"description\":\"\"}]",
    },
  ],
  modelVersion: 1,
  reservedSlug: "asdas",
  isPublished: true,
};

// Helper to create cards using registry so shapes match app expectations
function createCardsFromArray(arr: unknown[]) {
  const byId: Record<string, AnyCard> = {};
  const order: string[] = [];

  for (const item of arr) {
    if (!item || typeof item !== 'object') continue;
    const c = item as Record<string, unknown>;
    const typeStr = typeof c.type === 'string' ? c.type : 'text';
    const cardType = (['project', 'job', 'text'].includes(typeStr) ? (typeStr as CardType) : 'text');

    const created = createCard(cardType);
    const id = created.id;
    const card = created.card as AnyCard;

    // populate fields by type safely
    if (card.type === 'project') {
      card.data.title = (c.title as string) ?? card.data.title;
      card.data.description = (c.description as string) ?? card.data.description;
      card.data.techTitle = (c.techTitle as string) ?? card.data.techTitle;
      card.data.technologies = (c.technologies as string[] | undefined) ?? card.data.technologies ?? [];
      card.data.images = (c.images as string[] | undefined) ?? card.data.images ?? [];
      card.data.repoId = (c.repoId as number | undefined) ?? card.data.repoId;
      card.data.repoUrl = (c.repoUrl as string | undefined) ?? card.data.repoUrl;
    }

    if (card.type === 'job') {
      card.data.title = (c.title as string) ?? card.data.title;
      card.data.company = (c.company as string) ?? card.data.company;
      card.data.description = (c.description as string) ?? card.data.description;
      card.data.dateStart = (c.dateStart as MonthYearValue) ?? card.data.dateStart;
      card.data.dateEnd = (c.dateEnd as MonthYearValue) ?? card.data.dateEnd;
    }

    if (card.type === 'text') {
      card.data.title = (c.title as string) ?? card.data.title;
      card.data.description = (c.description as string) ?? card.data.description;
    }

    byId[id] = card;
    order.push(id);
  }

  return { byId, order };
}

// Build sections mapping
const sections: Record<string, SectionState> = {};

raw.sections.forEach((s) => {
  const safe = s as { sectionType: string; title: string; content: string };
  let parsed: unknown[] = [];
  try {
    parsed = JSON.parse(safe.content ?? '[]');
  } catch (err) {
    console.warn('Failed to parse section content', err);
    parsed = [];
  }

  const { byId, order } = createCardsFromArray(parsed);

  const allowedTypes: CardType[] = safe.sectionType === 'projects' ? ['project', 'job'] : safe.sectionType === 'experiences' ? ['job'] : ['text'];

  const sectionState: SectionState = {
    id: safe.sectionType as SectionType,
    type: safe.sectionType as SectionType,
    title: safe.title,
    allowedTypes,
    maxCards: Math.max(10, order.length),
    cardsById: byId,
    cardsOrder: order,
  };

  sections[safe.sectionType] = sectionState;
});

const demoInitialPortfolio: PortfolioState = {
  template: raw.template as 'ats' | 'glass',
  title: raw.title,
  sections,
};

// Derive demoProjects/demoExperiences for backward compatibility exports
const demoProjects = sections.projects
  ? { byId: sections.projects.cardsById, order: sections.projects.cardsOrder }
  : { byId: {}, order: [] };

const demoExperiences = sections.experiences
  ? { byId: sections.experiences.cardsById, order: sections.experiences.cardsOrder }
  : { byId: {}, order: [] };

export { demoProjects, demoExperiences, demoInitialPortfolio };

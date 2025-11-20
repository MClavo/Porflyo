import type {
  AnyCard,
  CardDto,
  CardType,
  ProjectCardSaved,
  JobCardSaved,
  EducationCardSaved,
  TextCardSaved,
  AboutCardSaved,
  CertificateCardSaved,
  AwardCardSaved,
} from "./Cards.types";

export const cardFactoriesFromDto = {
  fromDto: (dto: CardDto): AnyCard => ({
    type: dto.type,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: dto.data as any,
  }),
};

// Helper that creates a new card and returns the runtime id alongside the card object.
export function createCard(type: CardType): { id: string; card: AnyCard } {
  const id = crypto.randomUUID();
  const card = cardFactories[type]();
  return { id, card };
}

export const cardFactories: Record<CardType, () => AnyCard> = {
  project: () => ({
    type: "project",
    data: {
      title: "",
      description: "",
      techTitle: "Technologies:",
      technologies: [],
      images: [],
      // repository provider id (keeps track of the origin repo when created from provider)
      repoId: undefined,
      repoUrl: undefined,
      liveUrl: undefined,
      stars: undefined,
      forks: undefined,
    } satisfies ProjectCardSaved,
  }),
  job: () => ({
    type: "job",
    data: {
      title: "",
      company: "",
      description: "",
      location: "",
      dateStart: { month: 1, year: new Date().getFullYear() },
      dateEnd: { month: 1, year: new Date().getFullYear() },
    } satisfies JobCardSaved,
  }),
  education: () => ({
    type: "education",
    data: {
      title: "",
      institution: "",
      location: "",
      dateStart: { month: 1, year: new Date().getFullYear() },
      dateEnd: { month: 1, year: new Date().getFullYear() },
    } satisfies EducationCardSaved,
  }),
  text: () => ({
    type: "text",
    data: {
      title: "",
      description: "",
    } satisfies TextCardSaved,
  }),
  about: () => ({
    type: "about",
    data: {
      name: "",
      description: "",
      profileImage: undefined,
      email: undefined,
      socials: undefined,
    } satisfies AboutCardSaved,
  }),
  certificate: () => ({
    type: "certificate",
    data: {
      title: "",
      date: { month: 1, year: new Date().getFullYear() },
      image: undefined,
      certificateUrl: undefined,
    } satisfies CertificateCardSaved,
  }),
  award: () => ({
    type: "award",
    data: {
      event: "",
      category: "",
      date: { month: 1, year: new Date().getFullYear() },
      description: "",
    } satisfies AwardCardSaved,
  }),
};

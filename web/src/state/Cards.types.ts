import type { MonthYearValue } from "../components/cards/subcomponents/index";


export type CardType = "project" | "job" | "text" | "about";


export type ProjectCardSaved = {
  title: string;
  description: string;
  techTitle: string;
  technologies: string[];
  images: string[];
  // Repository fields
  // id of the repository in the provider/backend (kept when creating from provider and persisted)
  repoId?: number;
  repoUrl?: string;
  liveUrl?: string;
  stars?: number;
  forks?: number;
};

export type JobCardSaved = {
  title: string;
  company: string;
  description: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
};

export type TextCardSaved = {
  title: string;
  description: string;
};

export type AboutCardSaved = {
  name: string;
  description: string;
  profileImage?: string;
  email?: string;
  socials?: Record<string, string>;
};


export type BaseCard = {
  type: CardType;
};

export type ProjectCard = BaseCard & {type: "project"; data: ProjectCardSaved};
export type JobCard = BaseCard & {type: "job"; data: JobCardSaved};
export type TextCard = BaseCard & {type: "text"; data: TextCardSaved};
export type AboutCard = BaseCard & {type: "about"; data: AboutCardSaved};

export type AnyCard = ProjectCard | JobCard | TextCard | AboutCard;

export type CardPatchByType = {
  project: Partial<ProjectCardSaved>;
  job: Partial<JobCardSaved>;
  text: Partial<TextCardSaved>;
  about: Partial<AboutCardSaved>;
}

export type CardDto = 
  | {type: "project"; data: ProjectCardSaved}
  | {type: "job"; data: JobCardSaved}
  | {type: "text"; data: TextCardSaved}
  | {type: "about"; data: AboutCardSaved};
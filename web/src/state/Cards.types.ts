import type { MonthYearValue } from "../components/cards/subcomponents/index";


export type CardType = "project" | "job" | "text" | "about" | "education" | "certificate" | "award";


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
  location: string;
  description: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
};

export type EducationCardSaved = {
  title: string;
  institution: string;
  location: string;
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

export type CertificateCardSaved = {
  title: string;
  date: MonthYearValue;
  image?: string;
  certificateUrl?: string;
};

export type AwardCardSaved = {
  event: string;
  category: string;
  date: MonthYearValue;
  description: string;
};


export type BaseCard = {
  type: CardType;
};

export type ProjectCard = BaseCard & {type: "project"; data: ProjectCardSaved};
export type JobCard = BaseCard & {type: "job"; data: JobCardSaved};
export type EducationCard = BaseCard & {type: "education"; data: EducationCardSaved};
export type TextCard = BaseCard & {type: "text"; data: TextCardSaved};
export type AboutCard = BaseCard & {type: "about"; data: AboutCardSaved};
export type CertificateCard = BaseCard & {type: "certificate"; data: CertificateCardSaved};
export type AwardCard = BaseCard & {type: "award"; data: AwardCardSaved};

export type AnyCard = ProjectCard | JobCard | EducationCard | TextCard | AboutCard | CertificateCard | AwardCard;

export type CardPatchByType = {
  project: Partial<ProjectCardSaved>;
  job: Partial<JobCardSaved>;
  education: Partial<EducationCardSaved>;
  text: Partial<TextCardSaved>;
  about: Partial<AboutCardSaved>;
  certificate: Partial<CertificateCardSaved>;
  award: Partial<AwardCardSaved>;
}

export type CardDto = 
  | {type: "project"; data: ProjectCardSaved}
  | {type: "job"; data: JobCardSaved}
  | {type: "education"; data: EducationCardSaved} 
  | {type: "text"; data: TextCardSaved}
  | {type: "about"; data: AboutCardSaved}
  | {type: "certificate"; data: CertificateCardSaved}
  | {type: "award"; data: AwardCardSaved};
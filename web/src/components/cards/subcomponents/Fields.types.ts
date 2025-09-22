export type Mode = "edit" | "view";


export type FieldConstraints = {
  className?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  rows?: number;
};

export type BaseFieldProps = {
  mode: Mode;
  value?: string;
  onChange?: (v: string) => void; // only used in edit
} & FieldConstraints;


export type ImagesProps = {
  mode: Mode;
  images?: string[];
  onChange?: (next: string[]) => void;
  className?: string;
  maxImages?: number;
};

export type ListProps = {
  mode: Mode;
  className?: string;
  title?: string; // optional heading
  items?: string[];
  maxItems?: number;
  onChange?: (next: string[]) => void; // edit-only
};

export type ButtonProps = {
  mode: Mode;
  className?: string;
  label: string;
  href?: string; // view mode
  
  onClick?: () => void;
  onChangeHref?: (v: string) => void;
};

export type MonthYearValue = { month: number; year: number };
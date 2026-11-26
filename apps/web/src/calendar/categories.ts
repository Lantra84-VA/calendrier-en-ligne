export interface Category {
  label: string;
  color: string;
}

export const CATEGORIES: readonly Category[] = [
  { label: "Travail", color: "#2563eb" },
  { label: "Personnel", color: "#16a34a" },
  { label: "Famille", color: "#d97706" },
  { label: "Sport", color: "#dc2626" },
  { label: "Santé", color: "#0d9488" },
  { label: "Autre", color: "#64748b" },
];

export const DEFAULT_COLOR = CATEGORIES[CATEGORIES.length - 1].color;

export const categoryFor = (label: string | undefined): Category =>
  CATEGORIES.find((category) => category.label === label) ?? {
    label: label ?? "Autre",
    color: DEFAULT_COLOR,
  };

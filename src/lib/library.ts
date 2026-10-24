export type ResourceType = "NOTE" | "AUDIOBOOK";

export type MaterialSection =
  | "NOTES"
  | "BOOKS"
  | "WORKSHEETS"
  | "PRACTICE"
  | "PYQS";

export const MATERIAL_SECTIONS: {
  key: MaterialSection;
  label: string;
  hint: string;
}[] = [
  { key: "NOTES", label: "Notes", hint: "Class notes & PDF summaries" },
  { key: "BOOKS", label: "Books", hint: "E-books & reading material" },
  { key: "WORKSHEETS", label: "Worksheets", hint: "Printable practice sheets" },
  { key: "PRACTICE", label: "Practice", hint: "Exercises & drills" },
  { key: "PYQS", label: "PYQs", hint: "Previous year questions" }
];

export type LibraryPlan = {
  id: string;
  title: string;
  description: string | null;
  pricePaise: number;
  freeLimit: number;
};

export type LibraryResource = {
  id: string;
  type: ResourceType;
  section: MaterialSection;
  title: string;
  description: string | null;
  coverUrl: string | null;
  isFree: boolean;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  locked: boolean;
  fileUrl: string | null;
};

export type LibraryPayload = {
  plan: LibraryPlan;
  subscribed: boolean;
  resources: LibraryResource[];
};

export function materialSectionLabel(section?: string | null) {
  return (
    MATERIAL_SECTIONS.find((item) => item.key === section)?.label || "Notes"
  );
}

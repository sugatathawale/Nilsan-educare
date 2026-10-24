import type { LibraryResource, MaterialSection } from "@/lib/library";

export const MOCK_STUDY_MATERIALS: LibraryResource[] = [
  {
    id: "mock-book-1",
    type: "NOTE",
    section: "BOOKS",
    title: "Spoken English Handbook",
    description: "Free e-book for everyday speaking confidence.",
    coverUrl: null,
    isFree: true,
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    locked: false,
    fileUrl: null
  },
  {
    id: "mock-pdf-1",
    type: "NOTE",
    section: "NOTES",
    title: "Grammar Quick Revision PDF",
    description: "Short PDF notes on tenses, articles, and prepositions.",
    coverUrl: null,
    isFree: true,
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    locked: false,
    fileUrl: null
  },
  {
    id: "mock-pyq-1",
    type: "NOTE",
    section: "PYQS",
    title: "English PYQ Pack 2024",
    description: "Previous year questions with short answer hints.",
    coverUrl: null,
    isFree: true,
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    locked: false,
    fileUrl: null
  }
];

export function isMockMaterialId(id: string) {
  return id.startsWith("mock-");
}

export function mockSectionLabel(section: MaterialSection | string) {
  return section;
}

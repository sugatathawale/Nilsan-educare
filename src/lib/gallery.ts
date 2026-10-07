export type GalleryCategory = "EVENTS" | "RESULTS" | "CLASSROOM";

export type GalleryImage = {
  id: string;
  category: GalleryCategory;
  title: string | null;
  imageUrl: string;
  createdAt: string;
};

export const GALLERY_TABS: Array<{
  key: GalleryCategory;
  label: string;
  href: string;
  description: string;
}> = [
  {
    key: "EVENTS",
    label: "Events",
    href: "/gallery/events",
    description: "Workshops, celebrations, and campus moments."
  },
  {
    key: "RESULTS",
    label: "Results",
    href: "/gallery/results",
    description: "Student wins, certificates, and success stories."
  },
  {
    key: "CLASSROOM",
    label: "Classroom",
    href: "/gallery/classroom",
    description: "Live classes, practice sessions, and learning vibes."
  }
];

export function categoryFromSlug(slug: string): GalleryCategory | null {
  const map: Record<string, GalleryCategory> = {
    events: "EVENTS",
    results: "RESULTS",
    classroom: "CLASSROOM"
  };
  return map[slug.toLowerCase()] ?? null;
}

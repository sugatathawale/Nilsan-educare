import { notFound } from "next/navigation";
import { GalleryHub } from "@/components/gallery/gallery-hub";
import { categoryFromSlug, GALLERY_TABS } from "@/lib/gallery";

type Props = {
  params: Promise<{ category: string }>;
};

export function generateStaticParams() {
  return GALLERY_TABS.map((tab) => ({
    category: tab.href.split("/").pop()
  }));
}

export default async function GalleryCategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const category = categoryFromSlug(slug);

  if (!category) {
    notFound();
  }

  return <GalleryHub initialCategory={category} />;
}

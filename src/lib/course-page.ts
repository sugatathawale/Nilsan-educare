import { featuredCourse } from "@/data/dashboard";
import type { CourseSummary } from "@/lib/admin-types";
import { formatPaise, mediaUrl } from "@/lib/api";

/** Static sections shared by all course detail pages */
export const coursePageStatic = {
  stats: featuredCourse.stats,
  highlights: featuredCourse.highlights,
  audience: featuredCourse.audience,
  outcomes: featuredCourse.outcomes,
  includes: featuredCourse.includes,
  structuredPlan: featuredCourse.structuredPlan,
  faqs: featuredCourse.faqs
};

export type CoursePageHero = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  badge: string;
  duration: string;
  level: string;
  mode: string;
  classLength: string;
  image: string;
  price: string;
  originalPrice: string | null;
  pricePaise: number;
};

export function mapCourseToHero(course: CourseSummary): CoursePageHero {
  return {
    slug: course.slug,
    title: course.title,
    tagline: course.tagline || featuredCourse.tagline,
    description: course.description || featuredCourse.longDescription,
    badge: course.badge || featuredCourse.badge,
    duration: course.duration || featuredCourse.duration,
    level: course.level || featuredCourse.level,
    mode: course.mode || featuredCourse.mode,
    classLength: course.classLength || featuredCourse.classLength,
    image: course.imageUrl
      ? mediaUrl(course.imageUrl)
      : featuredCourse.image,
    price: formatPaise(course.pricePaise),
    originalPrice: course.originalPricePaise
      ? formatPaise(course.originalPricePaise)
      : null,
    pricePaise: course.pricePaise
  };
}

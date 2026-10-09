"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { apiRequest, mediaUrl } from "@/lib/api";
import type { GalleryImage } from "@/lib/gallery";
import { teacherProfile, testimonials } from "@/data/dashboard";

const FALLBACK_GALLERY = [
  { src: "/result/result-1.jpeg", alt: "Students in classroom" },
  { src: "/result/result-2.jpeg", alt: "Learning session results" },
  { src: "/result/result-3.jpeg", alt: "Classroom moments" },
  { src: "/images/demo-student.png", alt: "Student learning English" },
  { src: "/images/teacher-1.png", alt: "Live training session" },
  { src: "/images/teacher-2.png", alt: "Speaking practice class" }
];

function isUsableGalleryImage(item: GalleryImage) {
  const url = (item.imageUrl || "").toLowerCase();
  const title = (item.title || "").toLowerCase();
  if (!url) return false;
  if (url.includes("logo") || url.includes("nilsanlogo")) return false;
  if (title.includes("logo")) return false;
  return true;
}

export function HomeStorySection() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const reviews = testimonials.slice(0, 3);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await apiRequest<{ images: GalleryImage[] }>("/gallery");
        if (alive) {
          setGallery(data.images.filter(isUsableGalleryImage).slice(0, 6));
        }
      } catch {
        // Fall back to local result images below
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const previewImages =
    gallery.length >= 3
      ? gallery.map((item) => ({
          src: mediaUrl(item.imageUrl),
          alt: item.title || "Gallery photo",
          remote: true
        }))
      : FALLBACK_GALLERY.map((item) => ({
          ...item,
          remote: false
        }));

  return (
    <section className="home-story" id="about">
      <div className="site-container home-story__grid">
        <div className="home-story__about">
          <p className="section-eyebrow">About Nilsan Educare</p>
          <h2>Learn English with a trainer who focuses on real speaking</h2>
          <p>{teacherProfile.bio[0]}</p>
          <ul>
            {teacherProfile.highlights.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="home-story__link" href="/about">
            Read full story
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="home-story__aside">
          <div className="home-story__teacher">
            <Image
              alt={teacherProfile.name}
              height={420}
              src={teacherProfile.image}
              width={360}
            />
            <div>
              <strong>{teacherProfile.name}</strong>
              <span>
                {teacherProfile.role} · {teacherProfile.experience}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-story__band home-story__band--reviews">
        <div className="site-container">
          <div className="home-story__reviews-head">
            <div>
              <p className="section-eyebrow">Student reviews</p>
              <h3>What learners say</h3>
              <p className="home-story__lead">
                Real feedback from students who improved fluency and confidence.
              </p>
            </div>
          </div>
          <div className="home-story__review-grid">
            {reviews.map((review) => (
              <article key={`${review.author}-${review.quote}`}>
                <div aria-label={`${review.rating} stars`}>
                  {Array.from({ length: review.rating }).map((_, index) => (
                    <Star fill="currentColor" key={index} size={14} />
                  ))}
                </div>
                <p>&quot;{review.quote}&quot;</p>
                <strong>{review.author}</strong>
                <span>{review.role}</span>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="home-story__band home-story__band--gallery">
        <div className="site-container">
          <div className="home-story__reviews-head">
            <div>
              <p className="section-eyebrow">Gallery</p>
              <h3>Moments from class & results</h3>
              <p className="home-story__lead">
                Classroom energy, practice sessions, and student milestones.
              </p>
            </div>
            <Link className="home-story__link" href="/gallery">
              View gallery
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="home-story__photo-grid">
            {previewImages.slice(0, 6).map((photo, index) => (
              <div
                className={`home-story__photo ${index === 0 ? "is-wide" : ""}`}
                key={`${photo.src}-${index}`}
              >
                <Image
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 720px) 50vw, 220px"
                  src={photo.src}
                  unoptimized={photo.remote}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

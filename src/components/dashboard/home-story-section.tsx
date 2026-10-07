"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { apiRequest, mediaUrl } from "@/lib/api";
import type { GalleryImage } from "@/lib/gallery";
import { resultImages, teacherProfile, testimonials } from "@/data/dashboard";

export function HomeStorySection() {
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const reviews = testimonials.slice(0, 3);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await apiRequest<{ images: GalleryImage[] }>("/gallery");
        if (alive) setGallery(data.images.slice(0, 6));
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
    gallery.length > 0
      ? gallery.map((item) => ({
          src: mediaUrl(item.imageUrl),
          alt: item.title || "Gallery photo",
          remote: true
        }))
      : resultImages.map((item) => ({
          src: item.src,
          alt: item.alt,
          remote: false
        }));

  return (
    <section className="home-story" id="about">
      <div className="site-container home-story__grid">
        <div className="home-story__about">
          <p className="section-eyebrow">About Nilsan Educare</p>
          <h2>Learn English with a trainer who focuses on real speaking</h2>
          <p>
            {teacherProfile.bio[0]}
          </p>
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

      <div className="site-container home-story__reviews">
        <div className="home-story__reviews-head">
          <div>
            <p className="section-eyebrow">Student reviews</p>
            <h3>What learners say</h3>
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

      <div className="site-container home-story__gallery">
        <div className="home-story__reviews-head">
          <div>
            <p className="section-eyebrow">Gallery</p>
            <h3>Moments from class & results</h3>
          </div>
          <Link className="home-story__link" href="/gallery">
            View gallery
            <ArrowRight size={16} />
          </Link>
        </div>
        <div className="home-story__photo-grid">
          {previewImages.slice(0, 6).map((photo) => (
            <div className="home-story__photo" key={photo.src}>
              <Image
                alt={photo.alt}
                fill
                sizes="(max-width: 720px) 50vw, 180px"
                src={photo.src}
                unoptimized={photo.remote}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

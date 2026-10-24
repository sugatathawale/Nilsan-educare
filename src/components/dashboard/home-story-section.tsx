"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  FileQuestion,
  FileText,
  Star
} from "lucide-react";
import { apiRequest, mediaUrl } from "@/lib/api";
import { materialSectionLabel, type LibraryPayload, type LibraryResource } from "@/lib/library";
import { MOCK_STUDY_MATERIALS } from "@/lib/study-materials-mock";
import { teacherProfile, testimonials } from "@/data/dashboard";

const sectionIcon = {
  NOTES: FileText,
  BOOKS: BookOpen,
  WORKSHEETS: FileText,
  PRACTICE: FileText,
  PYQS: FileQuestion
} as const;

export function HomeStorySection() {
  const [materials, setMaterials] = useState<LibraryResource[]>(
    MOCK_STUDY_MATERIALS
  );
  const reviews = testimonials.slice(0, 3);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const data = await apiRequest<LibraryPayload>("/library?type=NOTE");
        if (!alive) return;
        const notes = data.resources
          .filter((item) => item.type === "NOTE" && !item.locked)
          .slice(0, 3);
        setMaterials(notes.length > 0 ? notes : MOCK_STUDY_MATERIALS);
      } catch {
        if (alive) setMaterials(MOCK_STUDY_MATERIALS);
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  const preview = materials.slice(0, 3);

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

      <div className="home-story__band home-story__band--materials">
        <div className="site-container">
          <div className="home-story__reviews-head">
            <div>
              <p className="section-eyebrow">Study Materials</p>
              <h3>Free books, PDFs &amp; PYQs</h3>
              <p className="home-story__lead">
                Download speaking handbooks, revision PDFs, and previous year
                questions — all in one place.
              </p>
            </div>
            <Link className="home-story__link" href="/study-materials">
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="home-materials-grid">
            {preview.map((item) => {
              const Icon = sectionIcon[item.section] || FileText;
              const href = item.fileUrl ? mediaUrl(item.fileUrl) : "/study-materials";
              return (
                <article className="home-material-card" key={item.id}>
                  <div className="home-material-card__icon" aria-hidden>
                    <Icon size={20} />
                  </div>
                  <div className="home-material-card__body">
                    <span>{materialSectionLabel(item.section)}</span>
                    <strong>{item.title}</strong>
                    {item.description ? <p>{item.description}</p> : null}
                  </div>
                  <a className="home-material-card__action" href={href}>
                    <Download size={15} />
                    {item.fileUrl ? "Download" : "Open"}
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

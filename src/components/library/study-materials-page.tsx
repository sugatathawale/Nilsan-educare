"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  Download,
  FileQuestion,
  FileText,
  Lock,
  PenLine
} from "lucide-react";
import { apiRequest, mediaUrl } from "@/lib/api";
import {
  MATERIAL_SECTIONS,
  materialSectionLabel,
  type LibraryPayload,
  type LibraryResource,
  type MaterialSection
} from "@/lib/library";
import { MOCK_STUDY_MATERIALS } from "@/lib/study-materials-mock";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cx } from "@/lib/utils";

const sectionIcons = {
  NOTES: FileText,
  BOOKS: BookOpen,
  WORKSHEETS: ClipboardList,
  PRACTICE: PenLine,
  PYQS: FileQuestion
} as const;

export function StudyMaterialsPage() {
  const [activeSection, setActiveSection] = useState<MaterialSection | "ALL">(
    "ALL"
  );

  const materialsQuery = useQuery({
    queryKey: ["study-materials"],
    queryFn: () => apiRequest<LibraryPayload>("/library?type=NOTE"),
    retry: 1
  });

  const allMaterials = useMemo(() => {
    if (materialsQuery.data?.resources?.length) {
      return materialsQuery.data.resources.filter((item) => item.type === "NOTE");
    }
    // API down / enum issues → show mock cards for now
    if (materialsQuery.isError || materialsQuery.isSuccess) {
      return MOCK_STUDY_MATERIALS;
    }
    return [];
  }, [materialsQuery.data, materialsQuery.isError, materialsQuery.isSuccess]);

  const materials = useMemo(() => {
    if (activeSection === "ALL") return allMaterials;
    return allMaterials.filter((item) => item.section === activeSection);
  }, [allMaterials, activeSection]);

  const grouped = useMemo(() => {
    return MATERIAL_SECTIONS.map((section) => ({
      ...section,
      items: allMaterials.filter((item) => item.section === section.key)
    })).filter((group) => group.items.length > 0);
  }, [allMaterials]);

  const showingMock =
    !materialsQuery.data?.resources?.length &&
    (materialsQuery.isError || materialsQuery.isSuccess);

  return (
    <section className="study-materials-page">
      <div className="site-container">
        <header className="study-materials-page__hero">
          <p className="section-eyebrow">Free resources</p>
          <h1>Study Materials</h1>
          <p>
            Browse by section — Notes, Books, Worksheets, Practice, and PYQs —
            then download what you need.
          </p>
          {showingMock ? (
            <p className="study-materials-page__mock-note">
              Showing sample materials for now. Admin uploads will appear here
              once the library API is healthy.
            </p>
          ) : null}
        </header>

        <div className="gallery-tabs study-materials-tabs">
          <button
            className={cx(
              "gallery-tabs__item",
              activeSection === "ALL" && "is-active"
            )}
            type="button"
            onClick={() => setActiveSection("ALL")}
          >
            All
          </button>
          {MATERIAL_SECTIONS.map((item) => (
            <button
              key={item.key}
              className={cx(
                "gallery-tabs__item",
                activeSection === item.key && "is-active"
              )}
              type="button"
              onClick={() => setActiveSection(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>

        {materialsQuery.isLoading ? (
          <LoadingSpinner label="Loading study materials…" size="lg" />
        ) : null}

        {!materialsQuery.isLoading && materials.length === 0 ? (
          <p className="study-materials-page__empty">
            No materials in this section yet. Check back soon.
          </p>
        ) : null}

        {activeSection === "ALL" ? (
          grouped.map((group) => {
            const Icon = sectionIcons[group.key];
            return (
              <section className="study-materials-group" key={group.key}>
                <div className="study-materials-group__head">
                  <span>
                    <Icon size={18} />
                  </span>
                  <div>
                    <h2>{group.label}</h2>
                    <p>{group.hint}</p>
                  </div>
                </div>
                <div className="study-materials-grid">
                  {group.items.map((item) => (
                    <MaterialCard item={item} key={item.id} />
                  ))}
                </div>
              </section>
            );
          })
        ) : materials.length > 0 ? (
          <div className="study-materials-grid">
            {materials.map((item) => (
              <MaterialCard item={item} key={item.id} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function MaterialCard({ item }: { item: LibraryResource }) {
  const href = item.fileUrl ? mediaUrl(item.fileUrl) : null;
  const Icon = sectionIcons[item.section] || FileText;

  return (
    <article className={cx("study-material-card", item.locked && "is-locked")}>
      <div className="study-material-card__icon" aria-hidden>
        <Icon size={22} />
      </div>
      <div className="study-material-card__body">
        <div className="study-material-card__tags">
          <span>{materialSectionLabel(item.section)}</span>
          {item.isFree ? <span className="is-free">Free</span> : null}
          {item.locked ? <span className="is-premium">Locked</span> : null}
        </div>
        <strong>{item.title}</strong>
        {item.description ? <p>{item.description}</p> : null}
      </div>
      {item.locked || !href ? (
        <span className="study-material-card__action is-locked">
          <Lock size={16} />
          Preview
        </span>
      ) : (
        <a
          className="study-material-card__action"
          href={href}
          target="_blank"
          rel="noreferrer"
          download
        >
          <Download size={16} />
          Download
        </a>
      )}
    </article>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  controls?: boolean;
};

export function SectionHeading({ eyebrow, title, controls }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <p className="section-heading__eyebrow">{eyebrow}</p> : null}
        <h2>{title}</h2>
      </div>
      {controls ? (
        <div className="section-heading__controls" aria-hidden="true">
          <button type="button" aria-label="Previous">
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="Next">
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

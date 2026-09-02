"use client";

import { Download } from "lucide-react";
import { featuredCourse } from "@/data/dashboard";

function buildBrochureContent() {
  const plan = featuredCourse.structuredPlan
    .map(
      (week) =>
        `${week.week}: ${week.title}\nFocus: ${week.focus}\n${week.topics.map((topic) => `  - ${topic}`).join("\n")}`
    )
    .join("\n\n");

  return `
NILSAN EDUCARE
Course Brochure

Course: ${featuredCourse.title}
Level: ${featuredCourse.level}
Duration: ${featuredCourse.duration}
Class Length: ${featuredCourse.classLength}
Mode: ${featuredCourse.mode}
Price: ${featuredCourse.price} (Offer from ${featuredCourse.originalPrice})

ABOUT THE PROGRAM
${featuredCourse.longDescription}

WHO SHOULD JOIN
${featuredCourse.audience.map((item) => `- ${item}`).join("\n")}

WHAT YOU WILL LEARN
${featuredCourse.outcomes.map((item) => `- ${item}`).join("\n")}

COURSE INCLUDES
${featuredCourse.includes.map((item) => `- ${item}`).join("\n")}

STRUCTURED 4-WEEK PLAN
${plan}

CONTACT
Phone: +91 97632 61058
Email: contact@nilsaneducare.com
Website: Nilsan Educare
`.trim();
}

export function BrochureDownload() {
  function handleDownload() {
    const content = buildBrochureContent();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${featuredCourse.slug}-brochure.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button className="course-details__brochure" onClick={handleDownload} type="button">
      <Download size={18} />
      Download Brochure
    </button>
  );
}

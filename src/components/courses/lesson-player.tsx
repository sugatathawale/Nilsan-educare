"use client";

import { useMemo } from "react";
import { toPlaybackEmbedUrl } from "@/lib/video-url";

type LessonPlayerProps = {
  embedUrl: string;
  title?: string;
};

/** Plain native iframe only — nothing stacked above the player. */
export function LessonPlayer({
  embedUrl,
  title = "Lesson video"
}: LessonPlayerProps) {
  const src = useMemo(
    () => toPlaybackEmbedUrl(embedUrl) || embedUrl,
    [embedUrl]
  );

  if (!embedUrl) return null;

  return (
    <div className="lesson-player">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="lesson-player__frame"
        referrerPolicy="origin-when-cross-origin"
        src={src}
        title={title}
      />
    </div>
  );
}

/** @deprecated Use LessonPlayer */
export const BunnyPlayer = LessonPlayer;

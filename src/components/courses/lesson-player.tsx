"use client";

import {
  isYouTubeEmbedUrl,
  toPlaybackEmbedUrl
} from "@/lib/video-url";

type LessonPlayerProps = {
  embedUrl: string;
  title?: string;
};

/** Embeds Bunny Stream or YouTube (and other) lesson videos in a 16:9 frame. */
export function LessonPlayer({
  embedUrl,
  title = "Lesson video"
}: LessonPlayerProps) {
  if (!embedUrl) return null;

  const isYouTube = isYouTubeEmbedUrl(embedUrl);
  const src = toPlaybackEmbedUrl(embedUrl) || embedUrl;

  return (
    <div
      className={
        isYouTube ? "lesson-player lesson-player--youtube" : "lesson-player"
      }
    >
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="lesson-player__frame"
        loading="eager"
        referrerPolicy="origin-when-cross-origin"
        src={src}
        title={title}
        // iOS Safari / Chrome mobile need these for inline playback + fullscreen
        {...{
          playsInline: true,
          webkitallowfullscreen: "true",
          mozallowfullscreen: "true"
        }}
      />
      {isYouTube ? (
        <>
          {/*
            Desktop-only: YouTube has no API to hide Share.
            Hidden on touch/mobile so the play button stays tappable.
          */}
          <div
            aria-hidden
            className="lesson-player__shield lesson-player__shield--top-right"
          />
          <div
            aria-hidden
            className="lesson-player__shield lesson-player__shield--brand"
          />
        </>
      ) : null}
    </div>
  );
}

/** @deprecated Use LessonPlayer */
export const BunnyPlayer = LessonPlayer;

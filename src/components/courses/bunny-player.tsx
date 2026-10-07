type BunnyPlayerProps = {
  embedUrl: string;
  title?: string;
};

/** Embeds a Bunny Stream iframe for lesson playback. */
export function BunnyPlayer({ embedUrl, title = "Lesson video" }: BunnyPlayerProps) {
  if (!embedUrl) return null;

  return (
    <div className="bunny-player">
      <iframe
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        loading="lazy"
        src={embedUrl}
        title={title}
      />
    </div>
  );
}

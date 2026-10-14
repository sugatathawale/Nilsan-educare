/**
 * Normalize lesson video URLs so the iframe player can embed them.
 * YouTube watch / share / shorts → embed. Bunny and other embeds pass through.
 */

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be"
]);

function youtubeIdFromPath(pathname: string): string | null {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return null;

  // /embed/ID, /shorts/ID, /live/ID, /v/ID
  if (
    (parts[0] === "embed" ||
      parts[0] === "shorts" ||
      parts[0] === "live" ||
      parts[0] === "v") &&
    parts[1]
  ) {
    return parts[1].slice(0, 11);
  }

  // youtu.be/ID
  if (parts[0] && parts[0].length >= 11) {
    return parts[0].slice(0, 11);
  }

  return null;
}

export function toEmbedVideoUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;

  const trimmed = raw.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return trimmed;
  }

  const host = parsed.hostname.toLowerCase();

  if (YOUTUBE_HOSTS.has(host)) {
    const fromQuery = parsed.searchParams.get("v");
    const id =
      (fromQuery && fromQuery.slice(0, 11)) ||
      youtubeIdFromPath(parsed.pathname);

    if (id && /^[\w-]{11}$/.test(id)) {
      return `https://www.youtube-nocookie.com/embed/${id}`;
    }
  }

  return trimmed;
}

export function isYouTubeEmbedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      (YOUTUBE_HOSTS.has(host) ||
        host === "youtube-nocookie.com" ||
        host === "www.youtube-nocookie.com") &&
      parsed.pathname.includes("/embed/")
    );
  } catch {
    return false;
  }
}

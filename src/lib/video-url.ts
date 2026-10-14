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

  if (
    (parts[0] === "embed" ||
      parts[0] === "shorts" ||
      parts[0] === "live" ||
      parts[0] === "v") &&
    parts[1]
  ) {
    return parts[1].slice(0, 11);
  }

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
      YOUTUBE_HOSTS.has(host) ||
      host === "youtube-nocookie.com" ||
      host === "www.youtube-nocookie.com"
    );
  } catch {
    return false;
  }
}

export function getYouTubeVideoId(raw: string | null | undefined): string | null {
  if (!raw) return null;

  try {
    const parsed = new URL(raw.trim());
    const host = parsed.hostname.toLowerCase();
    if (
      !YOUTUBE_HOSTS.has(host) &&
      host !== "youtube-nocookie.com" &&
      host !== "www.youtube-nocookie.com"
    ) {
      return null;
    }

    const fromQuery = parsed.searchParams.get("v");
    const id =
      (fromQuery && fromQuery.slice(0, 11)) ||
      youtubeIdFromPath(parsed.pathname);

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Playback URL with privacy-friendly YouTube params (still cannot fully remove Share via API). */
export function toPlaybackEmbedUrl(raw: string | null | undefined): string | null {
  const embed = toEmbedVideoUrl(raw);
  if (!embed || !isYouTubeEmbedUrl(embed)) return embed;

  try {
    const parsed = new URL(embed);
    // Standard youtube.com embeds are more reliable on iOS/Android WebViews
    // than youtube-nocookie for tap-to-play.
    parsed.hostname = "www.youtube.com";
    parsed.searchParams.set("controls", "1");
    parsed.searchParams.set("modestbranding", "1");
    parsed.searchParams.set("rel", "0");
    parsed.searchParams.set("iv_load_policy", "3");
    parsed.searchParams.set("playsinline", "1");
    parsed.searchParams.set("fs", "1");
    return parsed.toString();
  } catch {
    return embed;
  }
}

export function videoProviderLabel(url: string | null | undefined): string {
  if (!url) return "No video";
  if (
    isYouTubeEmbedUrl(url) ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("youtube-nocookie.com")
  ) {
    return "YouTube";
  }
  if (url.includes("mediadelivery.net") || url.includes("b-cdn.net")) {
    return "Bunny Stream";
  }
  return "Video";
}

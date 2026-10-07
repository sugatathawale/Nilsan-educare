import { env } from "../config/env.js";
import { AppError } from "../middleware/error.middleware.js";

const BUNNY_VIDEO_API = "https://video.bunnycdn.com";

export const isBunnyConfigured = Boolean(
  env.BUNNY_STREAM_LIBRARY_ID && env.BUNNY_STREAM_API_KEY
);

export type BunnyVideo = {
  videoId: string;
  embedUrl: string;
  hlsUrl: string | null;
};

const requireBunny = () => {
  if (!isBunnyConfigured) {
    throw new AppError(
      "Bunny Stream is not configured. Set BUNNY_STREAM_LIBRARY_ID and BUNNY_STREAM_API_KEY.",
      503
    );
  }
};

export const getBunnyEmbedUrl = (videoId: string): string => {
  requireBunny();
  return `https://iframe.mediadelivery.net/embed/${env.BUNNY_STREAM_LIBRARY_ID}/${videoId}`;
};

export const getBunnyHlsUrl = (videoId: string): string | null => {
  if (!env.BUNNY_STREAM_CDN_HOSTNAME) return null;
  return `https://${env.BUNNY_STREAM_CDN_HOSTNAME}/${videoId}/playlist.m3u8`;
};

export const createBunnyVideo = async (title: string): Promise<BunnyVideo> => {
  requireBunny();

  const response = await fetch(
    `${BUNNY_VIDEO_API}/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos`,
    {
      method: "POST",
      headers: {
        AccessKey: env.BUNNY_STREAM_API_KEY!,
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ title })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(
      `Bunny create video failed: ${text || response.statusText}`,
      502
    );
  }

  const data = (await response.json()) as { guid: string };
  const videoId = data.guid;

  return {
    videoId,
    embedUrl: getBunnyEmbedUrl(videoId),
    hlsUrl: getBunnyHlsUrl(videoId)
  };
};

export const uploadBunnyVideo = async (
  videoId: string,
  fileBuffer: Buffer,
  contentType = "application/octet-stream"
): Promise<void> => {
  requireBunny();

  const response = await fetch(
    `${BUNNY_VIDEO_API}/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
    {
      method: "PUT",
      headers: {
        AccessKey: env.BUNNY_STREAM_API_KEY!,
        Accept: "application/json",
        "Content-Type": contentType
      },
      body: fileBuffer
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new AppError(
      `Bunny upload failed: ${text || response.statusText}`,
      502
    );
  }
};

export const deleteBunnyVideo = async (videoId: string): Promise<void> => {
  if (!isBunnyConfigured || !videoId) return;

  const response = await fetch(
    `${BUNNY_VIDEO_API}/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`,
    {
      method: "DELETE",
      headers: {
        AccessKey: env.BUNNY_STREAM_API_KEY!,
        Accept: "application/json"
      }
    }
  );

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    console.warn(`Bunny delete warning for ${videoId}:`, text || response.statusText);
  }
};

export const getBunnyConfigPublic = () => ({
  configured: isBunnyConfigured,
  libraryId: isBunnyConfigured ? env.BUNNY_STREAM_LIBRARY_ID : null,
  cdnHostname: env.BUNNY_STREAM_CDN_HOSTNAME || null
});

import { ExternalLink, ListVideo, Play } from "lucide-react";
import {
  playlistCover,
  type YoutubePlaylist,
  type YoutubeVideo
} from "@/data/youtube";

export function VideoScrollRow({
  videos,
  label = "Featured videos"
}: {
  videos: YoutubeVideo[];
  label?: string;
}) {
  return (
    <div className="yt-scroll">
      <div className="yt-scroll__head">
        <h2>{label}</h2>
        <p>Watch on YouTube — swipe or scroll sideways.</p>
      </div>
      <div className="yt-scroll__track" role="list">
        {videos.map((video) => (
          <a
            className="yt-video-card"
            href={video.url}
            key={video.id}
            rel="noreferrer"
            role="listitem"
            target="_blank"
          >
            <div className="yt-video-card__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" loading="lazy" src={video.thumbnail} />
              <span className="yt-video-card__play" aria-hidden>
                <Play size={22} fill="currentColor" />
              </span>
            </div>
            <div className="yt-video-card__body">
              <strong>{video.title}</strong>
              <span>{video.playlistTitle}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export function PlaylistScrollRow({
  playlists,
  label = "YouTube playlists",
  showDescription = false
}: {
  playlists: YoutubePlaylist[];
  label?: string;
  showDescription?: boolean;
}) {
  return (
    <div className="yt-scroll">
      <div className="yt-scroll__head">
        <h2>{label}</h2>
        <p>Open any playlist directly on YouTube.</p>
      </div>
      <div className="yt-scroll__track" role="list">
        {playlists.map((playlist) => (
          <a
            className="yt-playlist-card"
            href={playlist.url}
            key={playlist.id}
            rel="noreferrer"
            role="listitem"
            target="_blank"
          >
            <div className="yt-playlist-card__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" loading="lazy" src={playlistCover(playlist)} />
              <span className="yt-playlist-card__badge">
                <ListVideo size={14} />
                {playlist.videoCount} videos
              </span>
            </div>
            <div className="yt-playlist-card__body">
              <strong>{playlist.title}</strong>
              {showDescription ? <p>{playlist.description}</p> : null}
              <span className="yt-playlist-card__cta">
                Open on YouTube
                <ExternalLink size={14} />
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

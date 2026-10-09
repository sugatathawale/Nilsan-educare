import Link from "next/link";
import { ExternalLink, MonitorPlay } from "lucide-react";
import {
  featuredYoutubeVideos,
  youtubeChannel,
  youtubePlaylists
} from "@/data/youtube";
import {
  PlaylistScrollRow,
  VideoScrollRow
} from "@/components/playlist/playlist-scroll";

export function PlaylistPage() {
  return (
    <div className="playlist-page">
      <section className="playlist-page__hero">
        <div className="site-container playlist-page__hero-inner">
          <p className="section-eyebrow">YouTube · NilSan Educare</p>
          <h1>Playlists & free video lessons</h1>
          <p>
            Watch featured lessons here, then open full playlists on YouTube for
            grammar, novels, writing skills, and board paper practice.
          </p>
          <div className="playlist-page__hero-actions">
            <a
              className="playlist-page__primary"
              href={youtubeChannel.playlistsUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MonitorPlay size={18} />
              All playlists on YouTube
            </a>
            <a
              className="playlist-page__secondary"
              href={youtubeChannel.url}
              rel="noreferrer"
              target="_blank"
            >
              Visit channel
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="playlist-page__section">
        <div className="site-container">
          <VideoScrollRow videos={featuredYoutubeVideos} />
        </div>
      </section>

      <section className="playlist-page__section playlist-page__section--soft">
        <div className="site-container">
          <PlaylistScrollRow
            playlists={youtubePlaylists}
            label="Full playlists"
            showDescription
          />
          <div className="playlist-page__grid">
            {youtubePlaylists.map((playlist) => (
              <a
                className="yt-playlist-row"
                href={playlist.url}
                key={playlist.id}
                rel="noreferrer"
                target="_blank"
              >
                <div>
                  <strong>{playlist.title}</strong>
                  <p>{playlist.description}</p>
                </div>
                <span>
                  {playlist.videoCount} videos
                  <ExternalLink size={15} />
                </span>
              </a>
            ))}
          </div>
          <p className="playlist-page__footnote">
            Prefer live coaching?{" "}
            <Link href="/dashboard#courses">Browse our courses</Link> or{" "}
            <Link href="/contact">contact us</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}

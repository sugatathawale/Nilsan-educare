import Link from "next/link";
import { ArrowRight, MonitorPlay } from "lucide-react";
import { youtubeChannel, youtubePlaylists } from "@/data/youtube";
import { PlaylistScrollRow } from "@/components/playlist/playlist-scroll";

export function HomePlaylistsSection() {
  return (
    <section className="home-playlists" id="playlists">
      <div className="site-container">
        <div className="home-playlists__heading">
          <div>
            <p className="section-eyebrow">Free on YouTube</p>
            <h2>Learn from our playlists</h2>
            <p>
              Grammar, novels, writing skills, and board paper practice — open
              any playlist on YouTube.
            </p>
          </div>
          <div className="home-playlists__actions">
            <Link className="home-playlists__link" href="/playlists">
              View all
              <ArrowRight size={16} />
            </Link>
            <a
              className="home-playlists__ghost"
              href={youtubeChannel.playlistsUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MonitorPlay size={16} />
              Channel
            </a>
          </div>
        </div>

        <PlaylistScrollRow playlists={youtubePlaylists} label="Playlists" />
      </div>
    </section>
  );
}

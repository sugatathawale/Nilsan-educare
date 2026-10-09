import type { Metadata } from "next";
import { PlaylistPage } from "@/components/playlist/playlist-page";

export const metadata: Metadata = {
  title: "YouTube Playlists | Nilsan Educare",
  description:
    "Watch NilSan Educare YouTube videos and open full playlists for grammar, novels, writing skills, and board paper practice."
};

export default function PlaylistsRoutePage() {
  return <PlaylistPage />;
}

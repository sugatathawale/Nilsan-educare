import type { Metadata } from "next";
import { AudiobooksPage } from "@/components/library/audiobooks-page";

export const metadata: Metadata = {
  title: "Audiobooks | Nilsan Educare",
  description:
    "Listen to English audiobooks from Nilsan Educare. Free titles are open to everyone; subscribe to unlock premium audio lessons."
};

export default function AudiobooksRoutePage() {
  return <AudiobooksPage />;
}

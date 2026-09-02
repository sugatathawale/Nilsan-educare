import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Classes Online | Nilsan Educare",
  description:
    "Student dashboard and admin panel for Nilsan Educare online English classes."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LolosCPNS — Persiapan CPNS & PPPK",
  description: "Platform belajar independen untuk persiapan CPNS dan PPPK melalui materi, latihan soal, dan simulasi CAT.",
  applicationName: "LolosCPNS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SuksesCPNS — Persiapan CPNS & PPPK",
  description: "Platform belajar independen untuk persiapan CPNS dan PPPK melalui materi, latihan soal, dan simulasi CAT.",
  applicationName: "SuksesCPNS",
  metadataBase: new URL("https://suksescpns.vercel.app"),
  openGraph: { title: "SuksesCPNS — Persiapan CPNS & PPPK", description: "Belajar materi, latihan soal, dan simulasi CAT dalam satu platform.", url: "https://suksescpns.vercel.app", siteName: "SuksesCPNS", locale: "id_ID", type: "website" },
  twitter: { card: "summary_large_image", title: "SuksesCPNS — Persiapan CPNS & PPPK", description: "Platform belajar independen untuk persiapan seleksi ASN." },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

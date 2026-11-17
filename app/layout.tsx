import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASN Platform — Persiapan CPNS & PPPK",
  description: "Belajar lebih terarah dan latihan simulasi CAT untuk persiapan seleksi CPNS dan PPPK.",
  applicationName: "ASN Platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}

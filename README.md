# SuksesCPNS

Platform belajar independen untuk persiapan seleksi CPNS dan PPPK.

> SuksesCPNS bukan situs resmi pemerintah, BKN, atau instansi penyelenggara seleksi. Informasi resmi seleksi tetap merujuk pada pengumuman resmi instansi terkait.

## Teknologi
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Row Level Security, dan Auth
- Midtrans Snap untuk pembayaran premium
- Vercel untuk deployment

## Modul aplikasi
- Beranda dan navigasi responsif.
- Bank soal TWK, TIU, TKP dengan CRUD admin, pembahasan, CSV import, dan konten premium.
- Simulasi CAT dengan timer 110 menit, navigasi soal, penanda ragu, pengumpulan otomatis, dan riwayat hasil.
- Registrasi, login, pemulihan password, profil, progres, riwayat, dan persetujuan tampil di leaderboard.
- Materi, rangkuman, video pembelajaran, dan pengelolaan materi oleh admin.
- Paket Gratis dan Premium, checkout Midtrans, webhook bertanda tangan, aktivasi langganan idempotent, dan akses premium berbasis RLS.
- SEO metadata, sitemap, robots, security headers, health endpoint, halaman privasi, syarat ketentuan, loading, dan 404.

## Setup Supabase
1. Buat project Supabase.
2. Jalankan migration SQL berikut secara berurutan melalui Supabase SQL Editor:
   - `supabase/migrations/202611170001_bank_soal.sql`
   - `supabase/migrations/202611170002_platform_core.sql`
   - `supabase/migrations/202611170003_premium_access.sql`
   - `supabase/migrations/202611170004_seed_starter_content.sql`
   - `supabase/migrations/202611170005_payment_atomic.sql`
3. Tambahkan environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; jangan gunakan awalan NEXT_PUBLIC_)
4. Tambahkan `https://suksescpns.vercel.app/reset-password` pada daftar Redirect URLs Supabase Auth.
5. Buat akun admin melalui Supabase Auth dan tetapkan `app_metadata.role = admin` melalui Supabase Dashboard/Admin API yang aman.
6. Setelah seluruh konfigurasi tersedia, redeploy aplikasi.

## Setup Midtrans
- `MIDTRANS_SERVER_KEY` (server-only)
- `MIDTRANS_IS_PRODUCTION=false` untuk sandbox atau `true` untuk production
- Atur Payment Notification URL ke `https://suksescpns.vercel.app/api/payment/webhook`.
- Pastikan service role key dan server key Midtrans tidak pernah diekspos ke browser.

## Routes penting
- `/` beranda
- `/masuk`, `/lupa-password`, `/reset-password` autentikasi
- `/akun` profil dan progres
- `/materi`, `/latihan`, `/simulasi` belajar dan ujian
- `/peringkat` leaderboard opt-in
- `/paket` paket dan pembayaran
- `/admin`, `/admin/materi` dashboard pengelola
- `/api/health` health check
- `/kebijakan-privasi`, `/syarat-ketentuan` kebijakan layanan

## Pengembangan lokal
```bash
npm install
npm run dev
```

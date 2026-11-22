# SuksesCPNS

Platform belajar independen untuk persiapan seleksi CPNS dan PPPK.

> SuksesCPNS bukan situs resmi pemerintah, BKN, atau instansi penyelenggara seleksi. Informasi resmi seleksi tetap merujuk pada pengumuman resmi instansi terkait.

## Teknologi
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL, Row Level Security, dan Auth
- Vercel untuk deployment

## Model layanan website
- Website saat ini menyediakan Paket Reguler secara gratis.
- Materi dan latihan yang ditampilkan di website dibatasi untuk konten Reguler.
- Paket Premium direncanakan tersedia melalui aplikasi SuksesCPNS; website tidak menyediakan checkout atau pembayaran.
- Tidak diperlukan konfigurasi Midtrans untuk menjalankan website saat ini.

## Modul aplikasi
- Beranda dan navigasi responsif.
- Bank soal TWK, TIU, TKP dengan pengelolaan admin, pembahasan, dan impor CSV.
- Simulasi CAT dengan timer 110 menit, navigasi soal, penanda ragu, pengumpulan otomatis, dan riwayat hasil.
- Registrasi, login, pemulihan password, profil, progres, riwayat, dan persetujuan tampil di leaderboard.
- Materi, rangkuman, video pembelajaran, dan pengelolaan materi oleh admin.
- SEO metadata, sitemap, robots, security headers, health endpoint, halaman privasi, syarat ketentuan, loading, dan 404.

## Setup Supabase
1. Buat project Supabase.
2. Jalankan migration SQL berikut secara berurutan melalui Supabase SQL Editor:
   - `supabase/migrations/202611170001_bank_soal.sql`
   - `supabase/migrations/202611170002_platform_core.sql`
   - `supabase/migrations/202611170003_premium_access.sql`
   - `supabase/migrations/202611170004_seed_starter_content.sql`
   - `supabase/migrations/202611170005_payment_atomic.sql`
   - `supabase/migrations/202611170006_admin_transactions.sql`
   - `supabase/migrations/202611170007_seed_pppk_materials.sql`
3. Tambahkan environment variables di Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; jangan gunakan awalan NEXT_PUBLIC_)
4. Tambahkan `https://suksescpns.vercel.app/reset-password` pada daftar Redirect URLs Supabase Auth.
5. Buat akun admin melalui Supabase Auth dan tetapkan `app_metadata.role = admin` melalui Supabase Dashboard/Admin API yang aman.
6. Setelah seluruh konfigurasi tersedia, redeploy aplikasi.

> Migrasi dan tabel transaksi lama masih dipertahankan untuk kompatibilitas pengembangan lanjutan. Fitur pembayaran tidak ditawarkan pada website saat ini.

## Routes penting
- `/` beranda
- `/masuk`, `/lupa-password`, `/reset-password` autentikasi
- `/akun` profil dan progres
- `/materi`, `/latihan`, `/simulasi` belajar dan ujian
- `/peringkat` leaderboard opt-in
- `/paket` informasi Paket Reguler gratis
- `/admin`, `/admin/dashboard` dashboard pengelola\n- `/admin/pengguna`, `/admin/soal`, `/admin/materi`, `/admin/analitik`, `/admin/transaksi` modul administrasi
- `/api/health` health check
- `/kebijakan-privasi`, `/syarat-ketentuan` kebijakan layanan

## Pengembangan lokal
```bash
npm install
npm run dev
```

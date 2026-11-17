# SuksesCPNS

Platform belajar independen untuk persiapan seleksi CPNS dan PPPK.

> SuksesCPNS bukan situs resmi pemerintah, BKN, atau instansi penyelenggara seleksi. Informasi resmi seleksi tetap merujuk pada pengumuman instansi terkait.

## Teknologi
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase PostgreSQL dan Auth
- Vercel untuk deployment

## Fase 2 — Bank Soal & Admin
- Bank soal TWK, TIU, dan TKP.
- CRUD soal melalui dashboard admin.
- Pembahasan jawaban.
- Import CSV dan unduh template.
- Akses admin dibatasi oleh role `admin` di Supabase Auth (app_metadata).

## Menyiapkan Supabase
1. Buat project di Supabase.
2. Jalankan SQL dari `supabase/migrations/202611170001_bank_soal.sql` melalui SQL Editor.
3. Tambahkan environment variables berikut di Vercel (Production, Preview, Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Buat akun admin melalui Supabase Auth, lalu set `app_metadata.role` menjadi `admin` menggunakan Supabase Dashboard atau Admin API yang aman.
5. Redeploy aplikasi.

Saat variabel Supabase belum tersedia, halaman admin menampilkan petunjuk konfigurasi dan tidak mengaktifkan operasi database.

## Pengembangan
```bash
npm install
npm run dev
```

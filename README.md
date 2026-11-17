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
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose with NEXT_PUBLIC_)
4. Buat akun admin melalui Supabase Auth, lalu set `app_metadata.role` menjadi `admin` menggunakan Supabase Dashboard atau Admin API yang aman.
5. Redeploy aplikasi.

Saat variabel Supabase belum tersedia, halaman admin menampilkan petunjuk konfigurasi dan tidak mengaktifkan operasi database.

## Pengembangan
```bash
npm install
npm run dev
```

## Modul platform tambahan
- `/masuk`: registrasi dan login peserta melalui Supabase Auth.
- `/akun`: profil, status langganan, ringkasan dan riwayat latihan.
- `/materi`: materi dasar dan materi yang diterbitkan admin.
- `/latihan`: latihan per subtes dengan pembahasan.
- `/simulasi`: simulasi CAT dengan timer, navigasi soal, penanda ragu, dan pengumpulan otomatis.
- `/admin` dan `/admin/materi`: pengelolaan bank soal dan materi.
- `/paket`: paket gratis/premium dan checkout Midtrans.
- `/peringkat`: leaderboard publik berbasis persetujuan peserta.
- `/kebijakan-privasi` dan `/syarat-ketentuan`: informasi kebijakan layanan.

## Konfigurasi pembayaran
Tambahkan variabel server-only `MIDTRANS_SERVER_KEY`, `MIDTRANS_IS_PRODUCTION` (`false` untuk sandbox, `true` untuk production), serta `SUPABASE_SERVICE_ROLE_KEY`. Variabel publik `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` tetap diperlukan. Atur URL notifikasi Midtrans ke `https://suksescpns.vercel.app/api/payment/webhook`. Jangan pernah menaruh service role key atau server key Midtrans pada variabel berawalan `NEXT_PUBLIC_`.

Jalankan juga migration `supabase/migrations/202611170002_platform_core.sql` setelah migration bank soal.

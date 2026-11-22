# Sukses CPNS Admin — Flutter

Aplikasi Android khusus administrator Sukses CPNS. Folder ini terisolasi dari aplikasi web Next.js, tetapi menggunakan project Supabase yang sama.

## Status implementasi

- [x] Branch pengembangan terpisah: `feat/admin-mobile-flutter`
- [x] Fondasi Flutter dan identitas visual
- [x] Login email/password menggunakan Supabase Auth
- [x] Layar verifikasi email OTP enam digit
- [x] Klien Flutter untuk Edge Function OTP
- [x] Edge Function untuk mengirim dan memverifikasi OTP
- [x] SQL untuk challenge OTP, sesi terverifikasi, dan RLS admin
- [ ] Konfigurasi domain pengirim email dan secrets
- [x] Terapkan migration direktori siswa `202611220004_admin_student_directory.sql` ke project Supabase
- [ ] Terapkan SQL OTP/RLS ke project Supabase (menunggu website admin siap)
- [ ] Deploy Edge Function
- [ ] Jalankan pengujian Flutter/Android
- [x] Statistik dashboard dari Supabase
- [x] Direktori siswa: pencarian, detail, status akses, dan riwayat ujian
- [x] Pengelolaan bank soal: tambah, edit, hapus, draft/terbit, premium
- [x] Pengelolaan materi: tambah, edit, hapus, draft/terbit, premium
- [x] Laporan aktivitas ujian terbaru dan ringkasan skor
- [x] Pemantauan transaksi pembayaran (read-only)
- [x] GitHub Actions: Flutter analyze, test, dan build APK artifact

## Konfigurasi lokal

Gunakan Flutter SDK dan Android SDK. Karena folder aplikasi ini belum menyertakan folder platform Android yang dihasilkan Flutter, buat scaffolding Android satu kali dari folder ini:

```bash
flutter create --platforms=android --org com.suksescpns --project-name sukses_cpns_admin .
flutter pub get
flutter run \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Build APK:

```bash
flutter build apk --release \
  --dart-define=SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co \
  --dart-define=SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Jangan pernah memasukkan Supabase service-role key, Resend API key, atau OTP pepper ke aplikasi Flutter.

## Konfigurasi server OTP

Edge Function: `supabase/functions/admin-email-otp/index.ts`

Server secrets yang wajib disetel di Supabase:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (atau `SUPABASE_PUBLISHABLE_KEY`)
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `OTP_FROM_EMAIL` — alamat pengirim pada domain yang telah diverifikasi di Resend
- `OTP_PEPPER` — nilai acak rahasia minimal 32 byte; simpan hanya di server

Email dikirim melalui Resend. Domain pengirim harus diverifikasi agar email OTP dapat terkirim dengan baik. Saat ini fungsi belum dapat diaktifkan sampai kredensial email pengirim dan secrets server tersedia.

## Aktivasi database

Tinjau dan jalankan `supabase/sql/admin_email_otp.sql` pada project Supabase setelah mengonfirmasi seluruh admin client (termasuk website) akan memakai alur OTP.

SQL tersebut:
- Membuat tabel challenge OTP dan sesi admin terverifikasi.
- Menyimpan hash OTP, bukan kode aslinya.
- Membatasi akses tabel hanya untuk service role.
- Mengubah kebijakan RLS admin agar memerlukan role tepercaya di `app_metadata.role` dan sesi OTP yang masih berlaku.

Jangan aktifkan SQL sebelum website admin juga siap mengikuti OTP, karena operasi admin-only dari website akan ditolak sampai sesi tersebut terverifikasi.

## Keamanan autentikasi

- Edge Function memvalidasi access token dengan Supabase Auth.
- Hanya user dengan `app_metadata.role = admin` dan email terkonfirmasi yang dapat meminta OTP.
- OTP berlaku 5 menit, sekali pakai, maksimal 5 percobaan, dan resend dibatasi.
- Hash OTP menggunakan server-side pepper.
- Sesi admin terverifikasi berlaku maksimal 8 jam.
- RLS memeriksa user ID, session ID, role admin, dan masa berlaku sesi.
- Authorization tidak pernah didasarkan pada `user_metadata` yang dapat diubah pengguna.

Catatan: email OTP khusus ini bukan Supabase Auth MFA AAL2 bawaan. Kebijakan RLS admin menggunakan tabel sesi terverifikasi yang dikelola server. Untuk kebutuhan assurance level AAL2 native, gunakan TOTP atau phone MFA yang didukung Supabase Auth.

## Struktur

- `lib/features/auth`: login, OTP, dan layanan autentikasi
- `lib/features/dashboard`: dashboard admin dan statistik Supabase
- `lib/features/students`: direktori siswa dan detail akun
- `lib/features/content`: bank soal dan materi belajar
- `lib/features/reports`: laporan pengerjaan ujian
- `lib/features/payments`: pemantauan transaksi
- `lib/theme`: tema dan komponen visual
- `supabase/functions/admin-email-otp`: server OTP
- `supabase/sql/admin_email_otp.sql`: skema dan kebijakan RLS


## Catatan fitur dan keamanan

- Direktori siswa memakai RPC `admin_list_students` pada migration `202611220004_admin_student_directory.sql`. Migration ini sudah diterapkan pada project Supabase produksi. Fungsi hanya mengembalikan kolom profil yang diperlukan dan mengecualikan akun ber-role admin.
- Jika tabel sesi OTP `admin_verified_sessions` sudah dipasang, RPC direktori siswa juga memeriksa sesi OTP terverifikasi.
- Menu konten dan laporan memerlukan migration platform, bank soal, premium access, serta SQL OTP/RLS admin yang sesuai.
- Menu transaksi hanya membaca status dari database. Aplikasi tidak dapat mengubah status pembayaran; webhook penyedia pembayaran tetap menjadi sumber status.
- Build CI memakai kredensial placeholder hanya untuk memeriksa kompilasi dan menghasilkan artifact uji. APK itu tidak dapat dipakai untuk login ke project produksi. Build produksi harus memakai URL dan publishable key project yang benar.
- Perubahan akun (ban/unban, hapus user, ubah role) sengaja tidak disediakan dari aplikasi mobile sampai endpoint server-side dengan audit log dan kontrol izin disiapkan.

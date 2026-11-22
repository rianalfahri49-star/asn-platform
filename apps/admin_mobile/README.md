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
- [ ] Terapkan SQL ke project Supabase
- [ ] Deploy Edge Function
- [ ] Jalankan pengujian Flutter/Android
- [ ] Hubungkan statistik dashboard ke query database

## Konfigurasi lokal

Gunakan Flutter SDK dan Android SDK. Dari folder ini:

```bash
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
- `lib/features/dashboard`: dashboard admin
- `lib/theme`: tema dan komponen visual
- `supabase/functions/admin-email-otp`: server OTP
- `supabase/sql/admin_email_otp.sql`: skema dan kebijakan RLS

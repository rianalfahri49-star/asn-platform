# Sukses CPNS Admin — Flutter

Aplikasi Android khusus administrator Sukses CPNS. Folder ini terisolasi dari aplikasi web Next.js, tetapi akan menggunakan project Supabase yang sama.

## Status
- [x] Branch pengembangan terpisah: `feat/admin-mobile-flutter`
- [x] Fondasi Flutter dan identitas visual disiapkan
- [ ] Konfigurasi environment Supabase
- [ ] Login email/password
- [ ] Faktor verifikasi tambahan (jenis OTP perlu diputuskan)
- [ ] Pemeriksaan role admin dari `app_metadata.role`
- [ ] Dashboard dan modul administrasi terhubung ke data produksi
- [ ] Build dan pengujian APK

## Konfigurasi lokal

1. Install Flutter SDK dan Android SDK.
2. Jalankan `flutter pub get` dari folder ini.
3. Salin `.env.example` menjadi `.env`, lalu isi URL Supabase dan publishable/anon key.
4. Jangan pernah memasukkan Supabase service-role key ke aplikasi mobile.
5. Jalankan `flutter run`.

## Keamanan autentikasi

Aplikasi hanya boleh membuka area admin setelah:
- Kredensial email/password valid.
- Faktor tambahan tervalidasi.
- Role pengguna berasal dari klaim tepercaya `app_metadata.role`, bukan `user_metadata`.

Supabase Auth menyediakan MFA tambahan melalui TOTP authenticator atau phone/SMS. Email OTP bawaan Supabase adalah metode login passwordless, bukan faktor MFA kedua setelah password. Karena itu, kanal OTP harus dipastikan sebelum autentikasi produksi diaktifkan.

## Struktur

- `lib/features/auth`: login dan verifikasi faktor
- `lib/features/dashboard`: dashboard admin
- `lib/theme`: tema dan komponen visual
- `lib/core`: konfigurasi aplikasi dan layanan bersama

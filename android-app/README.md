# SuksesCPNS Android

Aplikasi Android native berbasis React Native + Expo, terpisah dari aplikasi website Next.js yang sudah berjalan.

## Status Fase 4

- [x] Fondasi proyek Expo + TypeScript
- [x] Kerangka UI Android awal
- [x] Integrasi awal Supabase Auth (masuk, daftar, sesi tersimpan, keluar)
- [ ] Deep link konfirmasi email dan reset password
- [ ] Profil, paket Reguler/Premium, dan pengecekan hak akses
- [ ] Materi, latihan, simulasi CAT, hasil, dan riwayat
- [ ] Build APK internal dan pengujian perangkat

## Menjalankan secara lokal

1. Salin `.env.example` menjadi `.env`.
2. Isi `EXPO_PUBLIC_SUPABASE_URL` dan `EXPO_PUBLIC_SUPABASE_ANON_KEY` dengan URL dan anon/publishable key project Supabase SuksesCPNS.
3. Dari folder ini jalankan:

```bash
npm install
npx expo install --fix
npx expo start
```

Untuk build Android lokal, siapkan Android Studio/Android SDK lalu jalankan `npm run android`.

## Keamanan

- Hanya Supabase anon/publishable key yang boleh dipakai di aplikasi.
- Jangan pernah memasukkan Supabase service-role key ke aplikasi mobile.
- Akses Premium wajib divalidasi melalui kebijakan/RPC Supabase; jangan hanya mengandalkan kondisi UI.
- Website tetap menyediakan Paket Reguler gratis. Premium direncanakan tersedia hanya melalui aplikasi Android.
- Tidak ada perubahan skema database pada tahap fondasi ini.

## Catatan identitas aplikasi

Android application ID saat ini adalah nilai awal `com.suksescpns.app`. Konfirmasikan sebelum rilis Play Store karena application ID bersifat identitas permanen aplikasi.

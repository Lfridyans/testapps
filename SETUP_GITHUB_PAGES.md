# Cara Mengaktifkan GitHub Pages

## Langkah-langkah:

### 1. Buka Repository Settings
- Buka: https://github.com/Lfridyans/testapps
- Klik tab **Settings** (di bagian atas)

### 2. Aktifkan GitHub Pages
- Scroll ke bawah ke bagian **Pages** (di sidebar kiri)
- Atau langsung buka: https://github.com/Lfridyans/testapps/settings/pages

### 3. Konfigurasi Source
- Di bagian **Source**, pilih:
  - Branch: `main`
  - Folder: `/ (root)` atau `/dist` (jika sudah build)
- Klik **Save**

### 4. Tunggu Deploy
- GitHub akan otomatis build dan deploy
- Proses ini memakan waktu 1-5 menit
- Setelah selesai, akan muncul link: `https://lfridyans.github.io/testapps/`

## ⚠️ Catatan Penting:

### Untuk Aplikasi React/Vite:
Karena ini adalah aplikasi Vite, Anda perlu:

1. **Build aplikasi terlebih dahulu**
2. **Push folder `dist` ke GitHub**
3. **Set GitHub Pages source ke `/dist`**

### Atau gunakan GitHub Actions untuk auto-deploy

## 🚀 Opsi Deploy Otomatis dengan GitHub Actions

Saya bisa buatkan workflow GitHub Actions yang akan otomatis build dan deploy setiap kali Anda push.

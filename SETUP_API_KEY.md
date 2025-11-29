# 🔑 Setup API Key untuk Production

## Masalah yang Diperbaiki

Error **"API Key not found"** terjadi karena di production (GitHub Pages), environment variables tidak tersedia secara langsung.

## ✅ Solusi yang Sudah Diterapkan

### 1. **Fallback ke User Input**
Aplikasi sekarang memiliki modal input API key yang muncul otomatis jika API key tidak ditemukan. User dapat memasukkan API key mereka sendiri yang akan disimpan di localStorage browser.

### 2. **GitHub Secrets (Recommended untuk Production)**
Untuk production, API key dapat di-inject saat build time melalui GitHub Secrets.

## 📋 Cara Setup GitHub Secrets

### Step 1: Buka Repository Settings
1. Buka: https://github.com/Lfridyans/testapps/settings/secrets/actions
2. Atau: Repository → Settings → Secrets and variables → Actions

### Step 2: Dapatkan API Key Baru
1. Buka: **https://aistudio.google.com/apikey**
2. Login dengan akun Google Anda
3. Klik **"Create API Key"** atau **"Get API Key"**
4. Copy API key yang baru dibuat

### Step 3: Tambahkan Secret
1. Klik **"New repository secret"**
2. Name: `GEMINI_API_KEY`
3. Secret: Paste API key baru Anda
4. Klik **"Add secret"**

> **⚠️ PENTING**: API key lama telah dilaporkan sebagai leaked. Gunakan API key baru yang Anda buat sendiri.

### Step 3: Re-run Workflow
1. Buka: https://github.com/Lfridyans/testapps/actions
2. Klik workflow terbaru
3. Klik **"Re-run jobs"** → **"Re-run failed jobs"**
4. Tunggu build selesai

## 🎯 Cara Kerja

### Prioritas API Key (dari tinggi ke rendah):
1. **localStorage** - User input (untuk keamanan, user bisa input sendiri)
2. **process.env.GEMINI_API_KEY** - Dari GitHub Secrets (saat build)
3. **process.env.API_KEY** - Fallback dari GitHub Secrets

### Jika Semua Tidak Ada:
- Modal input akan muncul otomatis
- User dapat memasukkan API key mereka
- API key disimpan di localStorage browser (hanya di browser user)

## 🔒 Keamanan

- ✅ API key dari GitHub Secrets hanya tersedia saat build time
- ✅ API key dari localStorage hanya tersimpan di browser user
- ✅ Tidak ada API key yang ter-expose di source code

## 🧪 Testing

### Test di Local:
1. File `.env.local` sudah dibuat dengan API key
2. Run: `npm run dev`
3. API key akan otomatis digunakan dari `.env.local`

### Test di Production:
1. Set GitHub Secret `GEMINI_API_KEY`
2. Push ke main branch
3. Tunggu deployment selesai
4. Jika masih error, modal input akan muncul

## 📝 Catatan

- API key dari GitHub Secrets akan di-inject ke bundle saat build
- Untuk keamanan maksimal, gunakan GitHub Secrets untuk production
- User input adalah fallback yang aman untuk testing/demo

---

**Status**: ✅ Sudah diperbaiki dan di-push ke GitHub
**Commit**: `fb7c629` - Fix API Key error: Add fallback to localStorage and user input modal


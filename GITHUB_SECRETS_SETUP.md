# 🔐 Setup GitHub Secrets untuk Production

## ⚠️ PENTING: API Key Baru Diperlukan

**API key sebelumnya telah dilaporkan sebagai leaked dan tidak dapat digunakan lagi.**

Anda perlu membuat API key baru dari Google AI Studio.

## 📋 Langkah Setup (PENTING!)

### Step 1: Dapatkan API Key Baru
1. Buka: **https://aistudio.google.com/apikey**
2. Login dengan akun Google Anda
3. Klik **"Create API Key"** atau **"Get API Key"**
4. Copy API key yang baru dibuat (format: `AIzaSy...`)

### Step 2: Setup GitHub Secrets
1. Buka: **https://github.com/Lfridyans/testapps/settings/secrets/actions**
2. Klik tombol **"New repository secret"** (di kanan atas)
3. Isi form:
   - **Name**: `GEMINI_API_KEY` (HARUS tepat seperti ini!)
   - **Secret**: Paste API key baru Anda di sini
4. Klik **"Add secret"**

### Step 3: Verifikasi
Pastikan secret `GEMINI_API_KEY` muncul di daftar secrets.

### Step 4: Trigger Rebuild
1. Buka: **https://github.com/Lfridyans/testapps/actions**
2. Klik workflow terbaru (yang mungkin gagal karena API key)
3. Klik **"Re-run jobs"** → **"Re-run all jobs"**
4. Tunggu build selesai (sekitar 2-5 menit)

### Step 5: Test
Setelah deployment selesai, buka:
**https://lfridyans.github.io/testapps/**

Coba jalankan prediksi. Jika tidak ada error "API Key not found", berarti berhasil! ✅

---

## ⚠️ Catatan Penting

- **JANGAN** commit API key ke repository (sudah di `.gitignore`)
- API key ini akan di-inject saat build time oleh GitHub Actions
- Setelah di-set, setiap push ke `main` akan otomatis rebuild dengan API key ini
- API key hanya tersedia di GitHub Actions, tidak ter-expose di source code

---

## 🆘 Troubleshooting

### Jika masih error "API Key not found":
1. Pastikan secret name **tepat**: `GEMINI_API_KEY` (huruf besar semua)
2. Pastikan sudah klik "Add secret" (jangan hanya ketik)
3. Pastikan sudah re-run workflow setelah menambah secret
4. Cek log workflow untuk memastikan secret ter-load

### Jika workflow gagal:
- Cek tab "Actions" untuk melihat error detail
- Pastikan secret sudah di-set dengan benar
- Pastikan workflow file sudah update (sudah ada `env: GEMINI_API_KEY`)

---

**Status**: ✅ API key sudah siap digunakan
**File**: `.env.local` sudah dibuat untuk local development




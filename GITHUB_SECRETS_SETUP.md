# 🔐 Setup GitHub Secrets untuk Production

## API Key yang Akan Digunakan

```
AIzaSyCPMXA5VvqQOTNXKhWeQdOc9xynA1h2K1g
```

## 📋 Langkah Setup (PENTING!)

### Step 1: Buka GitHub Secrets
Buka link ini: **https://github.com/Lfridyans/testapps/settings/secrets/actions**

### Step 2: Tambahkan Secret Baru
1. Klik tombol **"New repository secret"** (di kanan atas)
2. Isi form:
   - **Name**: `GEMINI_API_KEY` (HARUS tepat seperti ini!)
   - **Secret**: `AIzaSyCPMXA5VvqQOTNXKhWeQdOc9xynA1h2K1g`
3. Klik **"Add secret"**

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




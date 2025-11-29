# ⚠️ API Key Leaked - Solusi

## Masalah

Error yang muncul:
```
ApiError: {"error":{"code":403,"message":"Your API key was reported as leaked. Please use another API key.","status":"PERMISSION_DENIED"}}
```

**Penyebab**: API key yang digunakan sebelumnya telah ter-expose di dokumentasi yang ter-commit ke GitHub, sehingga Google menandainya sebagai leaked dan menonaktifkannya.

## ✅ Solusi

### 1. Buat API Key Baru

1. Buka: **https://aistudio.google.com/apikey**
2. Login dengan akun Google Anda
3. Klik **"Create API Key"** atau **"Get API Key"**
4. Pilih project atau buat project baru
5. Copy API key yang baru dibuat (format: `AIzaSy...`)

### 2. Update Local Development

Update file `.env.local`:
```bash
GEMINI_API_KEY=your_new_api_key_here
```

### 3. Update GitHub Secrets (Untuk Production)

1. Buka: **https://github.com/Lfridyans/testapps/settings/secrets/actions**
2. Jika secret `GEMINI_API_KEY` sudah ada:
   - Klik secret tersebut
   - Klik **"Update"**
   - Paste API key baru
   - Klik **"Update secret"**
3. Jika belum ada:
   - Klik **"New repository secret"**
   - Name: `GEMINI_API_KEY`
   - Secret: Paste API key baru
   - Klik **"Add secret"**

### 4. Re-run GitHub Actions

1. Buka: **https://github.com/Lfridyans/testapps/actions**
2. Klik workflow terbaru
3. Klik **"Re-run jobs"** → **"Re-run all jobs"**
4. Tunggu build selesai

## 🔒 Pencegahan di Masa Depan

1. **JANGAN** commit API key ke repository
2. **JANGAN** hardcode API key di source code
3. **JANGAN** share API key di dokumentasi publik
4. Gunakan environment variables atau secrets management
5. File `.env.local` sudah di `.gitignore` (aman)

## 📝 Catatan

- API key lama (`AIzaSyCPMXA5VvqQOTNXKhWeQdOc9xynA1h2K1g`) sudah tidak bisa digunakan lagi
- Buat API key baru dari Google AI Studio
- Update `.env.local` untuk local development
- Update GitHub Secrets untuk production

---

**Status**: ⚠️ Perlu API key baru
**Action Required**: Buat API key baru dan update konfigurasi


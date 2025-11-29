# ⚠️ URGENT: Setup API Key Sekarang

## Error yang Terjadi

```
ApiError: {"error":{"code":400,"message":"API key not valid. Please pass a valid API key."}}
```

**Penyebab**: File `.env.local` masih berisi placeholder `YOUR_NEW_API_KEY_HERE`, bukan API key yang valid.

## ✅ Solusi Cepat (5 Menit)

### Step 1: Dapatkan API Key Baru

1. Buka: **https://aistudio.google.com/apikey**
2. Login dengan akun Google Anda
3. Klik **"Create API Key"** atau **"Get API Key"**
4. Copy API key yang baru dibuat (format: `AIzaSy...`)

### Step 2: Update File `.env.local`

Buka file `.env.local` di root project dan ganti dengan:

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**Contoh:**
```bash
GEMINI_API_KEY=AIzaSyABC123xyz789...
```

### Step 3: Restart Development Server

1. Stop server yang sedang berjalan (Ctrl + C)
2. Jalankan lagi: `npm run dev`
3. Test aplikasi - error seharusnya sudah hilang

## 🔧 Untuk Production (GitHub Pages)

### Update GitHub Secrets

1. Buka: **https://github.com/Lfridyans/testapps/settings/secrets/actions**
2. Jika secret `GEMINI_API_KEY` sudah ada:
   - Klik secret tersebut
   - Klik **"Update"**
   - Paste API key baru Anda
   - Klik **"Update secret"**
3. Jika belum ada:
   - Klik **"New repository secret"**
   - Name: `GEMINI_API_KEY`
   - Secret: Paste API key baru Anda
   - Klik **"Add secret"**

### Re-run GitHub Actions

1. Buka: **https://github.com/Lfridyans/testapps/actions**
2. Klik workflow terbaru
3. Klik **"Re-run jobs"** → **"Re-run all jobs"**

## ✅ Verifikasi

Setelah update `.env.local`:
- File harus berisi: `GEMINI_API_KEY=AIzaSy...` (bukan placeholder)
- Restart development server
- Test fitur Event Intelligence - seharusnya tidak ada error lagi

---

**Status**: ⚠️ Perlu API key valid di `.env.local`
**Action**: Update `.env.local` dengan API key yang valid dari Google AI Studio


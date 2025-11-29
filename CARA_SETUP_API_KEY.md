# 🔑 Cara Setup API Key yang Benar

## ⚠️ MASALAH SAAT INI

File `.env.local` masih berisi placeholder:
```
GEMINI_API_KEY=AIzaSyABC123xyz789...
```

**Ini TIDAK VALID** karena:
- ❌ Berakhiran `...` (placeholder)
- ❌ Terlalu pendek
- ❌ Bukan API key yang sebenarnya

## ✅ SOLUSI - Setup API Key yang Valid

### Step 1: Dapatkan API Key dari Google AI Studio

1. **Buka**: https://aistudio.google.com/apikey
2. **Login** dengan akun Google Anda
3. **Klik** "Create API Key" atau "Get API Key"
4. **Copy SELURUH** API key yang diberikan

**Format API key yang benar:**
- Dimulai dengan: `AIzaSy`
- Panjang: 39+ karakter
- Contoh: `AIzaSyCPMXA5VvqQOTNXKhWeQdOc9xynA1h2K1g`

### Step 2: Update File `.env.local`

**Buka file `.env.local` di root project** dan ganti dengan:

```bash
GEMINI_API_KEY=AIzaSy[API_KEY_LENGKAP_ANDA_DI_SINI]
```

**Contoh yang benar:**
```bash
GEMINI_API_KEY=AIzaSyCPMXA5VvqQOTNXKhWeQdOc9xynA1h2K1g
```

**PENTING:**
- ✅ Gunakan API key LENGKAP (tanpa `...`)
- ✅ Tidak ada spasi di awal atau akhir
- ✅ Tidak ada tanda kutip
- ✅ Hanya satu baris: `GEMINI_API_KEY=...`

### Step 3: Verifikasi File

Setelah update, cek file:
```bash
type .env.local
```

Pastikan:
- ✅ Tidak ada `...` di akhir
- ✅ Dimulai dengan `AIzaSy`
- ✅ Panjang minimal 30 karakter
- ✅ Format: `GEMINI_API_KEY=AIzaSy...`

### Step 4: Restart Development Server

1. **Stop** server yang sedang berjalan (Ctrl + C)
2. **Jalankan lagi**: `npm run dev`
3. **Test** aplikasi - seharusnya tidak ada error lagi

## 🔍 Troubleshooting

### Jika masih error "API Key not found":

1. **Pastikan file `.env.local` ada** di root project (sama level dengan `package.json`)
2. **Pastikan format benar**: `GEMINI_API_KEY=AIzaSy...` (tanpa spasi, tanpa kutip)
3. **Restart server** setelah update `.env.local`
4. **Cek console browser** untuk error message yang lebih detail

### Jika error "API key not valid":

1. **Pastikan API key lengkap** (tidak ada `...` di akhir)
2. **Pastikan API key masih aktif** di Google AI Studio
3. **Coba buat API key baru** jika yang lama tidak bekerja
4. **Pastikan tidak ada spasi** di awal atau akhir API key

## 📝 Catatan

- File `.env.local` sudah di `.gitignore` (aman, tidak akan ter-commit)
- API key hanya untuk local development
- Untuk production, gunakan GitHub Secrets

---

**Status**: ⚠️ Perlu API key valid di `.env.local`
**Action**: Update `.env.local` dengan API key lengkap dari Google AI Studio


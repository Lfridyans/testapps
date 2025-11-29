# 🔐 SETUP GITHUB SECRETS - LANGKAH DEMI LANGKAH

## ⚠️ MASALAH

Error di production: **"API Key not found"**

**Penyebab**: GitHub Secrets belum di-set atau belum di-update dengan API key baru.

## ✅ SOLUSI - Setup GitHub Secrets

### API Key yang Akan Digunakan:
```
AIzaSyA51X1QvrUFyk5OafI1AGpT_gw2i58qtOE
```

---

## 📋 LANGKAH SETUP (WAJIB DILAKUKAN)

### Step 1: Buka GitHub Secrets
**Link langsung**: https://github.com/Lfridyans/testapps/settings/secrets/actions

Atau:
1. Buka repository: https://github.com/Lfridyans/testapps
2. Klik tab **"Settings"**
3. Di sidebar kiri, klik **"Secrets and variables"** → **"Actions"**

### Step 2: Update atau Buat Secret

**Jika secret `GEMINI_API_KEY` sudah ada:**
1. Klik secret `GEMINI_API_KEY` di daftar
2. Klik tombol **"Update"** (di kanan)
3. **Hapus** API key lama di field "Value"
4. **Paste** API key baru: `AIzaSyA51X1QvrUFyk5OafI1AGpT_gw2i58qtOE`
5. Klik **"Update secret"**

**Jika secret `GEMINI_API_KEY` belum ada:**
1. Klik tombol **"New repository secret"** (di kanan atas, warna hijau)
2. Isi form:
   - **Name**: `GEMINI_API_KEY` (HARUS tepat seperti ini, huruf besar semua!)
   - **Secret**: `AIzaSyA51X1QvrUFyk5OafI1AGpT_gw2i58qtOE`
3. Klik **"Add secret"**

### Step 3: Verifikasi Secret Sudah Ada
Pastikan di daftar secrets muncul:
- ✅ `GEMINI_API_KEY` (dengan icon gembok)

### Step 4: Re-run GitHub Actions Workflow

**PENTING**: Setelah update secret, **WAJIB** re-run workflow!

1. Buka: **https://github.com/Lfridyans/testapps/actions**
2. Klik workflow terbaru (yang mungkin gagal atau sudah selesai)
3. Klik tombol **"Re-run jobs"** (di kanan atas)
4. Pilih **"Re-run all jobs"**
5. Tunggu build selesai (sekitar 2-5 menit)

### Step 5: Verifikasi Build Log

Saat workflow berjalan:
1. Klik workflow yang sedang running
2. Klik job **"build"**
3. Klik step **"Build"**
4. Scroll ke bawah, cek apakah ada error
5. Pastikan build berhasil (✅ hijau)

### Step 6: Test Aplikasi

Setelah deployment selesai:
1. Buka: **https://lfridyans.github.io/testapps/**
2. Coba jalankan prediksi
3. Seharusnya **tidak ada error** "API Key not found"

---

## 🔍 Troubleshooting

### Jika masih error "API Key not found":

1. **Pastikan secret name tepat**: `GEMINI_API_KEY` (huruf besar semua, tidak ada spasi)
2. **Pastikan sudah klik "Add secret" atau "Update secret"** (jangan hanya ketik)
3. **Pastikan sudah re-run workflow** setelah menambah/update secret
4. **Cek build log** di GitHub Actions untuk melihat apakah secret ter-load

### Cara cek apakah secret ter-load:

1. Buka workflow di Actions
2. Klik job "build"
3. Klik step "Build"
4. Di log, cari apakah ada error tentang API key
5. Jika ada error, berarti secret belum ter-load dengan benar

### Jika workflow gagal:

- Cek tab "Actions" untuk melihat error detail
- Pastikan secret sudah di-set dengan benar
- Pastikan workflow file sudah benar (sudah ada `env: GEMINI_API_KEY`)

---

## ✅ Checklist

Sebelum test aplikasi, pastikan:
- [ ] Secret `GEMINI_API_KEY` sudah ada di GitHub Secrets
- [ ] Value secret adalah: `AIzaSyA51X1QvrUFyk5OafI1AGpT_gw2i58qtOE`
- [ ] Sudah re-run workflow setelah update secret
- [ ] Workflow build berhasil (✅ hijau)
- [ ] Deployment selesai

---

**Status**: ⚠️ Perlu setup GitHub Secrets
**Action Required**: Setup GitHub Secrets dengan API key baru dan re-run workflow


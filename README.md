# Jadual Kuliah Generator | Lecture Schedule Generator

[**العربية**](#arabic) | [**Bahasa Melayu**](#bahasa-melayu) | [**English**](#english)

---

<a name="bahasa-melayu"></a>

## 🕌 Jadual Kuliah Generator — Panduan Pengguna

Alat jana jadual kuliah interaktif untuk masjid, surau, dan institusi pengajian Islam. Jana poster kuliah bulanan secara profesional dengan mudah — hanya perlukan nama penceramah, kitab/tajuk, dan jenis kuliah.

### ✨ Ciri-Ciri

- **Mudah Digunakan** — Antara muka intuitif dalam Bahasa Melayu
- **Tanpa Perlu Setup** — Buka fail HTML sahaja, tak perlu install apa-apa
- **Penyimpanan Lokal** — Data tersimpan di peranti anda sendiri (browser localStorage)
- **Pelbagai Jenis Kuliah** — Kuliah Subuh, Kuliah Maghrib, Tazkirah Jumaat, Ceramah Perdana, Kuliah Khas, Tazkirah Khas, Bacaan Yasin & Tahlil, atau custom tajuk
- **Logo & Gambar** — Muat naik logo masjid, logo jabatan, dan gambar masjid ikut personaliti premis anda
- **Program Banner Penuh** — Buat program utama/banner yang memenuhi seluruh kotak tarikh
- **Export Profesional** — Hasilkan poster dalam format PNG atau PDF bersaiz A3/A4 dengan resolusi tinggi
- **Ubahsuai Warna** — Pilih warna untuk setiap jenis kuliah
- **Pilihan Fon** — 7 pilihan fon untuk poster (Poppins, Montserrat, Inter, Nunito, Jost, Figtree, Gotham)
- **Saiz Fon Boleh Laras** — Sesuaikan ukuran teks untuk keterbacaan optimal
- **Latar Belakang Fleksibel** — Gunakan warna atau gambar sebagai latar belakang poster
- **Sidebar Boleh Diubah Saiz** — Laraskan lebar panel kawalan mengikut keinginan
- **Simpan & Muat Semula** — Simpan data jadual dalam format JSON untuk digunakan kembali

### 🚀 Cara Memulai

1. **Muat turun atau buka fail HTML**
   ```
   jadual-kuliah-generator.html
   ```

2. **Buka di browser** (Chrome, Firefox, Safari, Edge)
   - Salin fail ke folder anda dan buka dengan double-click, ATAU
   - Drag-drop fail ke jendela browser anda

3. **Isi butiran masjid/institusi anda**
   - Nama Masjid / Surau / Institut (wajib)
   - Alamat (pilihan)
   - No. Telefon (pilihan)
   - Logo Masjid (pilihan)
   - Logo Jabatan (pilihan)
   - Gambar Masjid (pilihan)

4. **Tambah slot kuliah**
   - Pilih tarikh, jenis program, nama penceramah, tajuk/kitab
   - (Pilihan) Muat naik gambar penceramah
   - Tekan "Tambah Slot ke Jadual"

5. **Buat program banner penuh** (opsyonal)
   - Untuk acara istimewa/utama
   - Muat naik poster/banner yang memenuhi kotak tarikh

6. **Ubahsuai warna & fon**
   - Bab 5: Tukar warna kategori untuk setiap jenis kuliah
   - Bab 6: Pilih jenis dan saiz fon poster
   - Bab 7: Tetapkan latar belakang poster

7. **Export jadual**
   - **PNG**: Untuk media sosial, email, atau cetakan digital
   - **PDF**: Untuk ketepatan cetak profesional di percetakan

### 💾 Penyimpanan Data

- **Profil Masjid**: Disimpan secara automatik selepas anda klik "Create" pertama kali
- **Jadual Kuliah**: Simpan sebagai file JSON menggunakan butang "💾 Simpan Data (.json)" untuk:
  - Backup jadual
  - Membuat jadual bulan depan dengan data yang sama
  - Perkongsian dengan admin lain di masjid

### ⚙️ Petua & Trik

**Gambar Penceramah**
- Format: JPG, PNG
- Saiz yang dicadangkan: 300-500px (akan dimampatkan secara automatik)
- Pilih "Cover" untuk mengisi penuh (mungkin dipotong sikit), atau "Contain" untuk tampil utuh

**Saiz Kertas Export**
- **A3** (420 x 297mm): Untuk cetakan besar, lebih jelas
- **A4** (210 x 297mm): Standard, lebih mudah cetak

**Program Banner Penuh**
- Guna untuk program besar: Seminar, Workshop, Forum Perdana, Haflah Khatam Al-Quran
- Banner memenuhi seluruh kotak tarikh, boleh ada gambar penceramah kecil di sudut

**Fon Latar Belakang**
- Kalau gambar latar terlalu cerah, tajuk mungkin sukar dibaca
- Gunakan warna latar yang gelap atau gambar dengan overlay gelap untuk kontras lebih baik

**Kotak Tarikh Penuh**
- Setiap kotak tarikh boleh muat maksimum 2 slot kuliah
- Untuk 3+ kuliah dalam satu hari, pertimbangkan menggunakan program banner atau split ke dua hari

### 🖥️ Kompatibilitas Browser

| Browser | Sokongan | Nota |
|---------|----------|------|
| Chrome/Chromium | ✅ Penuh | Diuji optimal |
| Firefox | ✅ Penuh | Penuh sokongan |
| Safari | ✅ Penuh | macOS dan iOS |
| Edge | ✅ Penuh | Berbasis Chromium |
| IE 11 | ❌ Tidak | Terlalu lama, tidak disokong |

**Keperluan**: JavaScript mesti diaktifkan, localStorage diperlukan untuk penyimpanan data.

### 🔧 Penyelesaian Masalah

**"Fail data tak sah / rosak"**
- File JSON yang dimuat mungkin rosak atau format salah
- Cuba simpan data baru dan export semula

**"Gambar tidak muncul selepas muat naik"**
- Saiz fail mungkin terlalu besar (localStorage ada had ~5-10MB)
- Cuba gunakan gambar dengan resolusi lebih rendah
- App akan padam gambar latar jika kuota localStorage hampir penuh

**"Eksport PDF/PNG lambat atau fail"**
- Kemastikanlah browser mempunyai akses internet (html2canvas perlu CDN pertama kali)
- Cuba refresh halaman dan eksport semula
- Jika masih gagal, gunakan PNG sebagai alternatif atau edit browser console untuk debug

**"Teks judul terpotong atau terlalu kecil"**
- Gunakan "Saiz Fon Poster" di Bab 6 untuk laraskan
- Jika gambar logo/masjid terlalu besar, ia akan mengecilkan ruang untuk judul — cuba gunakan logo lebih kecil

**Data saya hilang selepas tutup browser**
- Profil masjid perlu disimpan (localStorage)
- Jadual kuliah tidak disimpan automatik — gunakan "💾 Simpan Data" sebelum tutup

### 📱 Penggunaan di Smartphone

- Aplikasi ini disediakan untuk desktop/tablet
- Boleh diakses di mobile tetapi antara muka mungkin tidak optimal
- Lebih baik gunakan desktop untuk export yang berkualiti tinggi
- Disarankan guna laptop/desktop untuk experience yang lebih padu

### 📄 Lesen

GNU General Public License v3 (GPLv3) — Lihat fail LICENSE untuk maklumat lengkap.

### 🤝 Sumbangan

Laporkan bug, cadangan ciri, atau pull request amat diterima! 

**Cara melaporkan bug:**
1. Buka Issues di GitHub
2. Terangkan masalah dengan jelas (langkah reproduksi, screenshot)
3. Termasuk versi browser dan sistem operasi anda

### ❓ Soalan Lazim

**P: Boleh kah saya gunakan ini untuk komersial?**
J: Ya, di bawah GPLv3. Jika anda ubahsuai kod, ubahsuaian mesti turut open-source.

**P: Adakah data saya selamat?**
J: Ya, semua data disimpan **LOKAL di peranti anda** sahaja. Tiada data dihantar ke server/cloud.

**P: Boleh kah saya gunakan offline/tanpa internet?**
J: Boleh, TETAPI export PNG/PDF memerlukan internet untuk muat/upload html2canvas library pertama kali (selepas itu, offline mode berfungsi).

**P: Bagaimana cara ganti bahasa?**
J: Aplikasi dalam Bahasa Melayu sepenuhnya. Untuk bahasa lain, sumbang terjemahan ke GitHub.

---

<a name="english"></a>

## 🕌 Lecture Schedule Generator — User Guide

Interactive lecture schedule creation tool for mosques, prayer halls, and Islamic educational institutions. Generate professional monthly lecture posters easily — just provide speaker names, topics/books, and lecture types.

### ✨ Features

- **Easy to Use** — Intuitive interface with Malay UI
- **No Setup Required** — Open the HTML file, no installation needed
- **Local Storage** — All data stored on your device (browser localStorage)
- **Multiple Lecture Types** — Subuh, Maghrib, Friday Tazkirah, First Sermon, Special Lecture, Special Tazkirah, Yasin Recitation, or custom types
- **Logos & Images** — Upload mosque logo, department logo, and mosque photos for personalization
- **Full-Width Banner Programs** — Create special events that fill an entire date cell
- **Professional Export** — Generate posters in PNG or PDF format at A3/A4 resolution
- **Color Customization** — Set colors for each lecture type
- **Font Options** — 7 font choices (Poppins, Montserrat, Inter, Nunito, Jost, Figtree, Gotham)
- **Adjustable Font Size** — Customize text size for optimal readability
- **Flexible Backgrounds** — Use solid colors or images as poster backgrounds
- **Resizable Sidebar** — Adjust control panel width to your preference
- **Save & Load** — Export schedule to JSON for future reuse

### 🚀 Getting Started

1. **Download or open HTML file**
   ```
   jadual-kuliah-generator.html
   ```

2. **Open in your browser** (Chrome, Firefox, Safari, Edge)
   - Double-click the file, OR
   - Drag-drop into browser window

3. **Enter mosque/institution details**
   - Mosque/Prayer Hall/Institute Name (required)
   - Address (optional)
   - Phone Number (optional)
   - Mosque Logo (optional)
   - Department Logo (optional)
   - Mosque Photo (optional)

4. **Add lecture slots**
   - Select date, program type, speaker name, topic/book
   - (Optional) Upload speaker photo
   - Click "Tambah Slot ke Jadual"

5. **Create full-width banners** (optional)
   - For special/major events
   - Upload a poster/banner image that fills the date cell

6. **Customize colors & fonts**
   - Section 5: Change colors for each lecture type
   - Section 6: Select font type and size
   - Section 7: Set poster background

7. **Export schedule**
   - **PNG**: For social media, email, digital printing
   - **PDF**: For professional printing accuracy

### 💾 Data Storage

- **Mosque Profile**: Automatically saved after first "Create"
- **Schedule**: Save as JSON using "💾 Simpan Data" for:
  - Backup
  - Next month's schedule
  - Sharing with other mosque admins

### ⚙️ Tips & Tricks

**Speaker Photos**
- Format: JPG, PNG
- Recommended size: 300-500px (automatically compressed)
- Choose "Cover" to fill space (may crop), or "Contain" for full display

**Paper Size**
- **A3** (420 x 297mm): Large printing, clearer details
- **A4** (210 x 297mm): Standard, easier to print

**Full-Width Banners**
- For major events: Seminars, Workshops, Quranic circles
- Banner fills entire cell, can include small speaker photo

**Background Fonts**
- Bright background images may reduce title readability
- Use dark background or overlay for better contrast

**Date Cell Capacity**
- Maximum 2 lecture slots per date
- For 3+ lectures, use banners or split across days

### 🖥️ Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome/Chromium | ✅ Full | Optimal performance |
| Firefox | ✅ Full | Full support |
| Safari | ✅ Full | macOS and iOS |
| Edge | ✅ Full | Chromium-based |
| IE 11 | ❌ Not supported | Legacy browser |

**Requirements**: JavaScript enabled, localStorage for data persistence.

### 🔧 Troubleshooting

**"File data invalid / corrupt"**
- Loaded JSON file may be corrupted
- Try saving fresh data and exporting again

**"Images don't appear after upload"**
- File size too large (localStorage ~5-10MB limit)
- Try lower resolution images
- App may clear images if localStorage quota full

**"Export PDF/PNG slow or fails"**
- Browser needs internet (html2canvas requires CDN on first run)
- Try refreshing and exporting again
- Use PNG as alternative or check browser console

**"Title text truncated or too small"**
- Use "Saiz Fon Poster" in Section 6 to adjust
- Large logos reduce title space — use smaller images

**Data lost after closing browser**
- Mosque profile needs saving (localStorage)
- Schedule not auto-saved — use "💾 Simpan Data" before closing

### 📱 Mobile Usage

- Designed for desktop/tablet
- Accessible on mobile but UI may not be optimal
- Desktop recommended for high-quality export

### 📄 License

GNU General Public License v3 (GPLv3) — See LICENSE file for details.

### 🤝 Contributing

Bug reports, feature suggestions, and pull requests welcome!

**How to report bugs:**
1. Open Issues on GitHub
2. Describe clearly (reproduction steps, screenshots)
3. Include browser version and OS

### ❓ FAQ

**Q: Can I use this commercially?**
A: Yes, under GPLv3. If modified, modifications must also be open-source.

**Q: Is my data safe?**
A: Yes, all data stored **LOCALLY on your device**. No server/cloud uploads.

**Q: Can I use offline?**
A: Yes, except PNG/PDF export requires internet for html2canvas library on first load (then offline works).

**Q: How do I change language?**
A: Fully Malay interface. Contribute translations to GitHub.

---

## 📋 Version History

- **v1.0.0** (2026) — Initial release
  - Full lecture schedule creation and export
  - Multi-language support (Malay/English in UI)
  - Local storage with JSON import/export
  - PNG/PDF export at A3/A4 sizes

---

**Made with ❤️ for Muslim communities**  
Open source under GPLv3

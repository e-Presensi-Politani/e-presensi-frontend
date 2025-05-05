# 📌 e-Presensi Politani Frontend

Frontend aplikasi **e-Presensi Politani** berbasis **React + TypeScript** dengan Vite, dirancang untuk mendukung presensi berbasis lokasi (geo-fencing), manajemen kehadiran, pengajuan izin, dan dashboard kehadiran dosen serta ketua jurusan.

---

## 🚀 Teknologi yang Digunakan

- ⚛️ React + TypeScript
- ⚡ Vite
- 💅 Tailwind CSS
- 🌐 React Router DOM
- 📦 React Query
- 📸 Kamera & Geolocation (HTML5 API)
- 🧠 React Context API
- 📊 Chart.js
- 🗺️ Leaflet.js
- 🧪 React Hook Form + Zod

---

## 📂 Struktur Folder

```
.
├── public/                 # Aset publik seperti favicon, ikon, dll
├── src/
│   ├── assets/            # Gambar dan logo
│   ├── components/        # Komponen UI yang dapat digunakan ulang
│   ├── contexts/          # Context API untuk global state (auth, user, absensi, dsb)
│   ├── pages/             # Halaman-halaman utama
│   │   ├── attendance/    # Halaman presensi, koreksi, detail kehadiran
│   │   ├── auth/          # Login, ubah password
│   │   ├── dashboard/     # Dashboard user dan kajur
│   │   ├── leave/         # Pengajuan dan persetujuan cuti
│   │   ├── misc/          # NotFound dan UnderDevelopment
│   │   └── profile/       # Halaman profil pengguna
│   ├── services/          # API service untuk komunikasi ke backend
│   ├── types/             # Tipe-tipe TypeScript untuk entitas
│   ├── App.tsx            # Entry utama aplikasi React
│   ├── main.tsx           # Bootstrap aplikasi
│   └── index.css          # Global styling
├── index.html
├── vite.config.ts
├── tsconfig\*.json
└── package.json
```

---

## ⚙️ Instalasi & Menjalankan Project

```bash
# Clone repositori ini
git clone https://github.com/e-Presensi-Politani/e-presensi-frontend.git
cd e-presensi-frontend

# Install dependencies
npm install

# Jalankan secara lokal
npm run dev
````

Aplikasi akan berjalan di `http://localhost:5173`.

---

## 🌍 Konfigurasi Environment

Buat file `.env` di root proyek jika dibutuhkan:

```env
VITE_API_URL=http://localhost:3000/api
```
---
## 📦 Build untuk Produksi

```bash
npm run build
```

Output akan berada di folder `dist/`.

---

## 🧩 Fitur Utama

* ✅ Login dengan autentikasi JWT
* 🧭 Presensi berbasis lokasi (Geo-fencing)
* 🧾 Riwayat kehadiran harian
* 📝 Pengajuan cuti, WFH, dinas luar, dll
* ✅ Approval izin oleh Ketua Jurusan & Wadir 3
* 📊 Dashboard kehadiran untuk user & kajur
* 📍 Visualisasi lokasi dengan Leaflet
* 🛡️ Route protection berbasis role
* 👤 Manajemen profil & ubah password

---

## 📝 Contributing

Kontribusi sangat terbuka! Ikuti langkah-langkah berikut:

1. **Fork** repositori ini
2. **Buat branch fitur baru**

   ```bash
   git checkout -b feature/nama-fitur-anda
   ```
3. **Commit** perubahan Anda

   ```bash
   git commit -m "Menambahkan fitur baru"
   ```
4. **Push** ke branch Anda

   ```bash
   git push origin feature/nama-fitur-anda
   ```
5. **Buka Pull Request** ke branch `main`

---
## 📫 Kontak

> Email: [ghozi286@gmail.com](mailto:ghozi286@gmail.com)
---

## 📄 Lisensi

MIT License © 2025

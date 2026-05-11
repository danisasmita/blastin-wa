# Blastin WA

Sistem manajemen pesan WhatsApp berbasis web, dirancang untuk memudahkan interaksi dengan pelanggan dan memantau pesan secara efisien.

## Persyaratan Sistem

Pastikan sistem atau server Anda sudah terinstal:
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Panduan Instalasi (Docker)

Proyek ini telah dikonfigurasi sepenuhnya untuk berjalan di dalam container Docker. Anda tidak perlu menginstal Node.js atau MySQL di mesin lokal Anda secara manual.

### 1. Kloning Repositori

Pertama, unduh (kloning) repositori ini ke komputer atau server Anda:

```bash
git clone https://github.com/danisasmita/blastin-wa.git
cd blastin-wa
```

### 2. Pengaturan Lingkungan (Environment Variables)

Secara default, proyek ini sudah bisa berjalan tanpa modifikasi `.env` karena sudah disediakan nilai *default* di `docker-compose.yaml`. Namun, jika Anda ingin mengubah *password* database atau *port*, silakan salin file `.env.example`:

```bash
cp .env.example .env
```
Lalu ubah isinya sesuai kebutuhan Anda menggunakan *text editor* favorit Anda (misal: `nano .env`).

### 3. Jalankan Aplikasi

Jalankan perintah berikut untuk membangun (*build*) image dan menyalakan semua layanan (Backend, Frontend, dan Database MySQL):

```bash
docker-compose up -d --build
```

*Catatan: Proses build pertama kali akan memakan waktu karena sistem akan mengunduh image Node.js, menginstal semua dependensi, dan melakukan kompilasi frontend.*

### 4. Mengakses Aplikasi

Setelah proses selesai dan status container berjalan (*running*), Anda bisa mengakses aplikasi melalui browser:

- **Frontend**: `http://localhost:3000` (atau port yang Anda tentukan di `.env` pada variabel `FRONTEND_PORT`)
- **Backend API**: `http://localhost:8080`

### 5. Mematikan Aplikasi

Jika Anda ingin mematikan aplikasi tanpa menghapus datanya, jalankan:
```bash
docker-compose down
```

## Lisensi
Aplikasi ini berlisensi [MIT License](LICENSE). Hak Cipta (c) 2026 danisasmita.

# Deployment Guide

Dokumen ini menjelaskan setup deploy FE-SIGAP-V2 menggunakan GitHub Actions ke VPS.

## Ringkasan

Project ini adalah aplikasi React/Vite. Build production dilakukan di GitHub Actions dengan perintah:

```bash
pnpm build
```

Hasil build berada di folder `dist`, lalu dikemas sebagai artifact dan dikirim ke VPS. Di VPS, artifact diekstrak ke folder release baru dan symlink `current` diarahkan ke release terbaru.

## Flow CI/CD

Workflow berada di:

```txt
.github/workflows/ci.yml
```

Alurnya:

1. `start_notify`: membaca metadata project dan mengirim notifikasi Telegram jika secret tersedia.
2. `build`: install dependency, lint, format check, install browser dependency, test, dan build Vite.
3. `deploy`: upload artifact `dist` ke VPS, extract ke release folder, update symlink `current`, dan hapus release lama.
4. `notify`: mengirim hasil akhir workflow ke Telegram.

Workflow berjalan saat:

- push ke branch `main`
- manual trigger lewat `workflow_dispatch`

## GitHub Secrets

Tambahkan secrets berikut di GitHub repository:

| Secret | Wajib | Keterangan |
|---|---:|---|
| `VITE_API_BASE_URL` | Ya | Base URL backend production, contoh `https://api.example.com` |
| `VPS_SSH_KEY` | Ya | Private SSH key untuk deploy user |
| `VPS_HOST` | Ya | Host/IP VPS |
| `VPS_PORT` | Tidak | Port SSH. Default `22` jika kosong |
| `VPS_USER` | Ya | User SSH untuk deploy |
| `DEPLOY_PATH` | Tidak | Folder deploy. Contoh `/var/www/sigap-v2`. Jika kosong, workflow memakai `${HOME}/apps/fe-sigap-v2` |
| `TELEGRAM_BOT_TOKEN_NOTIFICATION` | Tidak | Token bot Telegram untuk notifikasi |
| `TELEGRAM_CHAT_ID` | Tidak | Chat ID Telegram tujuan notifikasi |

Catatan:

- Semua env dengan prefix `VITE_` akan masuk ke bundle frontend dan bisa dilihat dari browser.
- Jangan masukkan secret private ke env `VITE_*`.
- `VITE_API_BASE_URL` bukan rahasia; ini hanya alamat API public yang dipakai browser.
- `VPS_PORT` adalah port SSH untuk deploy, bukan port HTTP aplikasi.
- Port HTTP aplikasi static diatur di web server seperti Nginx, Caddy, atau reverse proxy.

## Struktur Folder VPS

Rekomendasi `DEPLOY_PATH` untuk production:

```txt
/var/www/sigap-v2
```

Struktur setelah deploy:

```txt
/var/www/sigap-v2/
├── current -> releases/<commit-sha>
└── releases/
    ├── <commit-sha-1>/
    ├── <commit-sha-2>/
    └── <commit-sha-3>/
```

Folder `current` adalah symlink ke release aktif. Web server harus mengarah ke folder ini.

## Port Aplikasi

Vite production build menghasilkan file static, jadi aplikasi ini tidak menjalankan server Node.js sendiri di VPS.

Artinya:

- port frontend diatur oleh web server, misalnya Nginx `listen 8080;`
- port SSH deploy tetap memakai secret `VPS_PORT`
- port backend tetap berasal dari `VITE_API_BASE_URL`

Jika port `80` atau `3000` sudah dipakai, gunakan port HTTP lain di web server:

```nginx
listen 8080;
```

Atau gunakan reverse proxy utama untuk meneruskan traffic dari domain tertentu ke folder static `/var/www/sigap-v2/current`.

## Persiapan VPS

1. Buat deploy user atau gunakan user VPS yang sudah ada.
2. Pastikan public key dari `VPS_SSH_KEY` sudah masuk ke:

```txt
~/.ssh/authorized_keys
```

3. Buat folder deploy:

```bash
sudo mkdir -p /var/www/sigap-v2/releases
sudo chown -R deploy:deploy /var/www/sigap-v2
```

Ganti `deploy:deploy` dengan user dan group yang dipakai untuk deploy.

4. Pastikan user deploy punya permission tulis ke `/var/www/sigap-v2`.

## Contoh Nginx

Contoh konfigurasi untuk SPA Vite dengan port HTTP custom:

```nginx
server {
    listen 8080;
    server_name app.example.com;

    root /var/www/sigap-v2/current;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

Ubah `listen 8080;` ke port yang tersedia di server Anda. Jika port `80` sudah dipakai, gunakan port lain seperti `8080`, `8081`, atau letakkan aplikasi ini di belakang reverse proxy utama.

Aktifkan konfigurasi:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

Untuk HTTPS, gunakan Certbot atau reverse proxy yang sudah mengelola TLS.

## Build Environment

Workflow memakai:

```txt
NODE_VERSION=24.x
PNPM_VERSION=9.15.2
```

Build akan menjalankan:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm test:browser:install
pnpm test
pnpm build
```

Karena build dilakukan di GitHub Actions, VPS tidak perlu Node.js atau pnpm untuk menjalankan aplikasi frontend static.

## Rollback Manual

Jika perlu rollback, arahkan symlink `current` ke release sebelumnya:

```bash
cd /var/www/sigap-v2
ls -lt releases
ln -sfn releases/<previous-commit-sha> current
sudo systemctl reload nginx
```

Pastikan folder release target memiliki `index.html`.

## Troubleshooting

### Aplikasi masih call `localhost:3000`

Pastikan secret `VITE_API_BASE_URL` di GitHub sudah diisi dengan URL backend production, lalu jalankan ulang workflow.

### Route refresh menghasilkan 404

Pastikan konfigurasi web server memakai fallback:

```nginx
try_files $uri $uri/ /index.html;
```

### Deploy gagal saat SSH

Cek:

- `VPS_HOST`, `VPS_PORT`, dan `VPS_USER` benar.
- public key dari `VPS_SSH_KEY` sudah ada di `authorized_keys`.
- user deploy punya akses tulis ke `DEPLOY_PATH`.

### Telegram notification skipped

Itu normal jika `TELEGRAM_BOT_TOKEN_NOTIFICATION` atau `TELEGRAM_CHAT_ID` belum diisi.

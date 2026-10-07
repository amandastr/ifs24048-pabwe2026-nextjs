# ifs24048-pabwe2026-nextjs

Aplikasi Postingan (Posts) menggunakan **Next.js + TypeScript + Redux Toolkit + Vitest**, dibangun sesuai modul **PABWE 2026 P4 – Studi Kasus 2.2**.

## Fitur

- Autentikasi (Register, Login, Logout) dengan token Bearer
- Daftar & Detail Postingan (public + is_me)
- Live search
- Like / Unlike
- Komentar (tambah & hapus)
- CRUD Postingan + ganti cover
- Daftar Pengguna
- Profil & pengaturan akun (update profil, foto, password)
- Route protection (dashboard)
- Unit & Integration Testing (target coverage 100%)
- Siap CI/CD Jenkins + SonarQube (Delcom)

## Teknologi

- Next.js 15 (App Router)
- TypeScript
- Bun (disarankan) / npm
- Tailwind CSS v4
- Redux Toolkit + React Redux
- Vitest + React Testing Library + jsdom
- SweetAlert2
- Tabler Icons
- Google Fonts (Plus Jakarta Sans)

## Prasyarat

- Node.js 20+ atau Bun 1.1+
- Akses internet ke `https://open-api.delcom.org`

## Instalasi

```bash
# dengan Bun (disarankan)
bun install

# atau npm
npm install
```

## Konfigurasi Lingkungan

Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Isi:

```
NEXT_PUBLIC_DELCOM_BASEURL=https://open-api.delcom.org/api/v1
APP_PORT=3000
```

## Menjalankan

```bash
# Development
bun run dev
# atau
npm run dev

# Production build
bun run build
bun run start
```

Buka http://localhost:3000

## Testing

```bash
bun run test
bun run test:coverage
```

Target coverage: **100%** (lines, functions, branches, statements).

## Struktur Direktori

Lihat `src/` — mengikuti struktur wajib modul 2.2.1–2.2.8:

- `src/features/auth`
- `src/features/users`
- `src/features/posts`
- `src/helpers`, `src/hooks`, `src/types`, `src/store.ts`
- App Router di `src/app` dengan route group `(dashboard)`

## CI/CD (Jenkins & SonarQube)

Ikuti panduan **Padanduan Submit CICD - Jenkins & SonarQube.html**:

1. Buat repository GitHub dengan nama `ifs24048-pabwe2026-nextjs`
2. Tambahkan webhook ke `https://jenkins.delcom.org/github-webhook/`
3. Buat project di SonarQube dengan project key = nama repo
4. Tambahkan `Jenkinsfile` dan `sonar-project.properties` (sudah disiapkan di root)
5. Jalankan pipeline dari SCM

## Catatan Implementasi

Proyek ini mengikuti requirement matrix yang telah disusun dari dokumen modul.  
Beberapa file implementasi penuh (pages, modals, slices lengkap, dan seluruh test suite) masih dalam proses penyelesaian agar memenuhi coverage 100% dan semua endpoint API.

Jalankan perintah berikut setelah `bun install` / `npm install` untuk memverifikasi:

```bash
bun run lint
bun run typecheck
bun run test:coverage
bun run build
```

## Author

ifs24048 – PABWE 2026 P4


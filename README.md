# Kanggo - Task Management Application

Kanggo adalah aplikasi manajemen tugas yang memungkinkan pengguna untuk membuat akun, melakukan autentikasi, dan mengelola daftar tugas mereka. Dibangun dengan React (frontend), Express.js (backend), dan MySQL (database).

**Aplikasi sudah di-hosting dan dapat diakses melalui:** https://kanggo-task.creativa.tools/

> **Disclaimer:** Domain yang sedang digunakan merupakan domain pribadi yang saya re-use dengan utilize sub-domain.

## Cara Menjalankan Aplikasi

Ada 2 cara untuk menjalankan aplikasi ini:

---

## Cara 1: Setup Manual (Backend, Frontend, Database)

### 1. Setup Environment Variables

Buat file `.env` di root project:

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan Anda:

```env
MYSQL_ROOT_PASSWORD=root_password
MYSQL_DATABASE=kanggo
MYSQL_USER=kanggo_user
MYSQL_PASSWORD=kanggo_password
BACKEND_PORT=5000
FRONTEND_PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
```

### 2. Setup Database

Buat database dan user di MySQL:

```sql
CREATE DATABASE kanggo;
CREATE USER 'kanggo_user'@'localhost' IDENTIFIED BY 'kanggo_password';
GRANT ALL PRIVILEGES ON kanggo.* TO 'kanggo_user'@'localhost';
FLUSH PRIVILEGES;
```

Import schema:

```bash
mysql -u kanggo_user -p kanggo < backend/src/database/schema.sql
```

### 3. Setup Backend

```bash
cd backend
npm install
npm start
```

Backend akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
npm install
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

---

## Cara 2: Docker Compose (Recommended)

Cara termudah untuk menjalankan seluruh aplikasi. Docker akan handle setup database, backend, dan frontend.

### 1. Setup Environment Variables

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan (atau gunakan default yang sudah ada).

### 2. Jalankan Docker Compose

```bash
docker compose up -d
```

Services akan berjalan:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Database**: Internal only (port 3306)

### 3. Stop Services

```bash
docker compose down
```

### 4. View Logs

```bash
docker compose logs -f
```

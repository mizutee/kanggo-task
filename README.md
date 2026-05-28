# Kanggo - Task Management Application

Kanggo adalah aplikasi manajemen tugas yang memungkinkan pengguna untuk membuat akun, melakukan autentikasi, dan mengelola daftar tugas mereka. Dibangun dengan React (frontend), Express.js (backend), dan MySQL (database).

**Aplikasi sudah di-hosting dan dapat diakses melalui:**
https://kanggo-task.creativa.tools/

> **Disclaimer:** Domain yang sedang digunakan merupakan domain pribadi yang saya re-use dengan utilize sub-domain.

---

# Struktur Project

```bash
/kanggo-task
├── .env                      # Konfigurasi Docker Compose & database
├── docker-compose.yml
├── backend
│   ├── .env                  # Konfigurasi backend Express.js
│   └── ...
├── frontend
│   ├── .env                  # Konfigurasi frontend React/Vite
│   └── ...
```

### Penjelasan Environment Variables

* Root `.env` digunakan oleh Docker Compose untuk konfigurasi container, database, dan port mapping.
* `backend/.env` digunakan oleh aplikasi backend (Express.js) melalui `dotenv`.
* `frontend/.env` digunakan oleh frontend React/Vite.

---

# Cara Menjalankan Aplikasi

Ada 2 cara untuk menjalankan aplikasi ini:

1. Setup manual (backend, frontend, database)
2. Menggunakan Docker Compose (recommended)

---

# Cara 1: Setup Manual (Backend, Frontend, Database)

## 1. Setup Root Environment Variables

Buat file `.env` di root project:

```bash
cp .env.example .env
```

Edit `.env` sesuai kebutuhan:

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

---

## 2. Setup Database

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

---

## 3. Setup Backend

Masuk ke folder backend:

```bash
cd backend
```

Copy environment file backend:

```bash
cp .env.example .env
```

Edit `backend/.env` sesuai kebutuhan:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=kanggo
DB_CONNECTION_LIMIT=10

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# JWT Configuration
JWT_SECRET=development-secret
JWT_EXPIRES_IN=1d
```

Install dependencies dan jalankan backend:

```bash
npm install
npm start
```

Backend akan berjalan di:

```text
http://localhost:5000
```

---

## 4. Setup Frontend

Buka terminal baru:

```bash
cd frontend
```

Copy environment file frontend:

```bash
cp .env.example .env
```

Install dependencies dan jalankan frontend:

```bash
npm install
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:5173
```

---

# Cara 2: Docker Compose (Recommended)

Cara termudah untuk menjalankan seluruh aplikasi. Docker akan handle setup database, backend, dan frontend secara otomatis.

## 1. Setup Environment Variables

Buat file `.env` di root project:

```bash
cp .env.example .env
```

Masuk ke folder backend dan copy environment file:

```bash
cd backend
cp .env.example .env
```

Kembali ke root project:

```bash
cd ..
```

Edit kedua file sesuai kebutuhan.

> **Catatan:**
> Saat menjalankan aplikasi menggunakan Docker Compose, backend akan menggunakan hostname `database` untuk terhubung ke MySQL container melalui internal Docker network.

Contoh `backend/.env` untuk Docker:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=database
DB_PORT=3306
DB_USER=kanggo_user
DB_PASSWORD=kanggo_password
DB_NAME=kanggo
DB_CONNECTION_LIMIT=10

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=10

# JWT Configuration
JWT_SECRET=development-secret
JWT_EXPIRES_IN=1d
```

---

## 2. Jalankan Docker Compose

```bash
docker compose up -d
```

Services akan berjalan:

* **Frontend**: http://localhost:3000
* **Backend**: http://localhost:5000
* **Database**: Internal only (port 3306)

---

## 3. Stop Services

```bash
docker compose down
```

---

## 4. View Logs

```bash
docker compose logs -f
```

---

# Features

* User Registration
* User Login & Authentication
* JWT Authorization
* CRUD Task Management
* Password Hashing dengan bcrypt
* Dockerized Full Stack Setup

---

# Production Deployment

Aplikasi di-deploy menggunakan:

* Frontend & Backend: Docker Containers
* Database: MySQL
* Reverse Proxy: Nginx
* Hosting: VPS pribadi (Linux Ubuntu 24.04)

# JanSamadhan

> **Grievance Redressal Portal** — A production-grade civic complaint management system with real-time notifications, multi-role access control, OAuth2 social login, and WebSocket-powered live chat.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://mysql.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?logo=socket.io)](https://socket.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Security Model](#security-model)
- [Real-Time Layer](#real-time-layer)
- [Getting Started](#getting-started)
  - [Docker (Recommended)](#docker-recommended)
  - [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Browser / Client                         │
│           React 19 · Vite 7 · TailwindCSS 4                 │
│       Socket.IO-client · i18next (en/hi) · Framer Motion    │
└────────────┬──────────────────────────┬──────────────────────┘
             │  REST  /api/*            │  WebSocket  /socket.io
             ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│             Nginx (Reverse Proxy)  :80                       │
│   location /api/    → proxy_pass http://server:5000          │
│   location /socket.io/ → proxy_pass + WS upgrade headers    │
└────────────┬──────────────────────────┬──────────────────────┘
             │                          │
             ▼                          ▼
┌──────────────────────────────────────────────────────────────┐
│         Express + Socket.IO  (Node 20 · :5000)               │
│                                                              │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐   │
│  │   Auth   │  │   Routes     │  │   Socket Handlers   │   │
│  │ JWT/OAuth│  │  8 routers   │  │  chatSocket         │   │
│  │  Google  │  │              │  │  notificationSocket │   │
│  └──────────┘  └──────────────┘  └─────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Middleware Stack                        │   │
│  │  helmet · cors · rate-limit · verifyToken · roles    │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────┘
                            │  mysql2 connection pool (×10)
                            ▼
┌──────────────────────────────────────────────────────────────┐
│               MySQL 8.0  (InnoDB · utf8mb4)                  │
│  11 tables · 7 indexes · UUID primary keys on core tables    │
└──────────────────────────────────────────────────────────────┘
```

### Container Topology

```
Docker Network: jansamadhan-net (bridge)

  [db]             [server]             [client]
  mysql:8.0   ←──  node:20-alpine  ←──  nginx:alpine
  :3306            :5000                :80 → host:80
  (internal)       host:5000
```

Startup order: `db` (health check: `mysqladmin ping`) → `server` → `client`.

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Runtime | Node.js 20 | `engines` field enforced in `package.json` |
| API Framework | Express 4.18 | `trust proxy 1` set for correct IP behind Nginx |
| Auth | JWT (`jsonwebtoken`) + Passport.js | Google OAuth2 via `passport-google-oauth20` |
| Real-Time | Socket.IO 4.7 | Attached to raw `http.Server`, not Express |
| ORM | `mysql2/promise` | Connection pool (limit: 10), raw SQL |
| Validation | Joi 17 | Request body validation on all mutation endpoints |
| Password Reset | `nodemailer` + Gmail SMTP | SHA-256 hashed tokens, 1hr expiry |
| Media Upload | `multer` + Cloudinary | Complaint image uploads |
| Logging | Winston | File + console transport, production-safe |
| Security | `helmet` + `express-rate-limit` | CSP disabled in dev, 5 distinct rate limit tiers |
| Frontend | React 19 + Vite 7 | ESM-only, multi-stage Docker build |
| Styling | TailwindCSS 4 | Vite plugin integration |
| Animation | Framer Motion 12 | Page transitions + micro-interactions |
| i18n | i18next 25 | `en` / `hi` with browser language detection |
| State | React Context | Auth state; Socket.IO singleton ref |
| Containerization | Docker + Compose | Multi-stage builds, named volumes |

---

## Features

### Complaint Lifecycle

```
User files complaint
  → category + GPS coordinates + optional images
  → auto-assigned to relevant department admin
  → timeline entry created (Pending)

Admin reviews
  → status: Pending → In Progress → Resolved / Rejected
  → each transition appends complaint_timeline row
  → real-time socket notification pushed to user's private room

User rates resolution
  → 1–5 stars + optional feedback
  → stored in complaint_ratings (one per complaint)
```

### Role Hierarchy

```
super_admin  →  full platform access, user management, all admin controls
admin        →  manages complaints in assigned department, can assign/resolve
user         →  files complaints, views own history, rates resolutions
```

**JWT carries stale-proof roles** — every request re-validates `role`, `status`, and `department` from the DB, so banning a user mid-session takes effect immediately without waiting for token expiry.

### Real-Time

- **Public chat room** — all authenticated users share `public_chat` Socket.IO room
- **Typing indicators** — `typing` event broadcast to room (excluding sender)
- **Online count** — room size emitted on connect/disconnect
- **Private notifications** — users join `user:<uuid>` room; admins join `admins` room
- **Complaint status push** — `notificationService` emits to target user's private room on every status change

### Internationalization

English and Hindi supported out of the box. Language detected from: `queryString → cookie → localStorage → browser → htmlTag`. Fallback: `en`.

---

## Project Structure

```
JanSamadhan/
├── server/
│   ├── src/
│   │   ├── app.js                    # Express app (no server logic)
│   │   ├── server.js                 # HTTP server + Socket.IO init + SIGTERM handler
│   │   ├── config/
│   │   │   ├── db.js                 # mysql2 pool — fails fast on bad credentials
│   │   │   ├── passport.js           # Google OAuth2 strategy + auto-link logic
│   │   │   └── socket.js             # getIO() singleton accessor
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # JWT verify + live DB status check
│   │   │   ├── roleMiddleware.js     # requireRole(...roles) factory
│   │   │   ├── rateLimiter.js        # 5 distinct limiters (login/register/oauth/general/forgot)
│   │   │   ├── uploadMiddleware.js   # multer config for complaint images
│   │   │   └── errorHandler.js       # Central error handler (Joi, JWT, generic)
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/*
│   │   │   ├── complaintRoutes.js    # /api/complaints/*
│   │   │   ├── adminRoutes.js        # /api/admin/*
│   │   │   ├── superAdminRoutes.js   # /api/superadmin/*
│   │   │   ├── notificationRoutes.js # /api/notifications/*
│   │   │   ├── chatRoutes.js         # /api/chat/*
│   │   │   ├── categoryRoutes.js     # /api/categories/*
│   │   │   └── userRoutes.js         # /api/users/*
│   │   ├── controllers/
│   │   │   ├── user/                 # authController, complaintController, chatController, profileController
│   │   │   ├── admin/                # adminComplaintController, adminUserController
│   │   │   └── superadmin/
│   │   ├── services/
│   │   │   └── notificationService.js # DB insert + socket emit (graceful if socket uninitialized)
│   │   ├── sockets/
│   │   │   ├── chatSocket.js         # sendMessage, typing, disconnect, online count
│   │   │   └── notificationSocket.js # Room join logic for users + admins
│   │   └── utils/
│   │       ├── logger.js             # Winston instance
│   │       └── responseHelper.js     # sendSuccess / sendError wrappers
│   ├── database/
│   │   └── schema.sql                # Full schema — auto-run by Docker on first boot
│   ├── Dockerfile                    # Multi-stage: node:20-alpine builder → production
│   └── .env                          # Never committed — see .env.example
│
├── client/
│   ├── src/
│   │   ├── pages/                    # Route-level components (13 pages + admin sub-pages)
│   │   ├── components/               # ChatWidget, Navbar, Sidebar, ProtectedRoute, etc.
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # JWT decode, user state, socket disconnect on logout
│   │   ├── services/
│   │   │   ├── socketService.js      # connectSocket / getSocket / disconnectSocket singleton
│   │   │   └── complaintService.js
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── hi.json
│   │   └── i18n.js                   # i18next init with browser language detection
│   ├── nginx.conf                    # SPA fallback + /api/ + /socket.io/ proxy
│   └── Dockerfile                    # Multi-stage: node:20-alpine Vite build → nginx:alpine
│
├── docker-compose.yml                # Local dev: builds from source + MySQL container
├── docker-compose.prod.yml           # EC2: pulls from Docker Hub + expects external RDS
└── .env.example
```

---

## Database Schema

11 tables, all InnoDB, `utf8mb4_unicode_ci`. Core entities use UUID v4 primary keys.

```
departments ──< categories ──< complaints >── complaint_images
                                    │
                                    ├──< complaint_timeline   (audit log per status change)
                                    └──< complaint_ratings    (one rating per resolved complaint)

users >── complaints (as reporter)
users >── complaints (as assigned_admin)
users >── chat_messages
users >── notifications
users >── admin_logs
users >── password_reset_tokens
```

**Indexes created at schema init:**

| Table | Index | Columns |
|-------|-------|---------|
| `complaints` | `idx_complaints_user_id` | `user_id` |
| `complaints` | `idx_complaints_status` | `status` |
| `complaints` | `idx_complaints_category` | `category_id` |
| `complaint_timeline` | `idx_timeline_complaint` | `complaint_id` |
| `notifications` | `idx_notifications_user` | `user_id, is_read` |
| `chat_messages` | `idx_chat_created` | `created_at` |
| `users` | `idx_users_google_id` | `google_id` |

> Schema is idempotent — uses `CREATE TABLE IF NOT EXISTS` and a helper stored procedure to skip indexes that already exist.

---

## Security Model

### Authentication Flow

```
POST /api/auth/login
  → bcrypt.compare(password, hash)
  → jwt.sign({ id, role, email }, JWT_SECRET, { expiresIn: '7d' })
  → client stores token in localStorage

Every subsequent request:
  → Authorization: Bearer <token>
  → authMiddleware: jwt.verify(token, JWT_SECRET)
  → DB query: SELECT role, status, department FROM users WHERE id = ?
  → Checks status ∈ { banned, inactive } — immediate 403 if true
  → Attaches fresh DB values to req.user (not stale token values)
```

### OAuth2 (Google)

Three cases handled in `passport.js`:

1. **Returning Google user** — matched by `google_id`, returned as-is
2. **Existing local account with same email** — `google_id` auto-linked, `auth_provider` set to `'both'`
3. **Brand new user** — UUID generated, inserted with `auth_provider = 'google'`

### Rate Limiting

All limiters use `X-RateLimit-*` standard headers (RFC 6585). Real client IP read via `X-Forwarded-For` (`trust proxy 1`).

| Limiter | Window | Max | Applies to |
|---------|--------|-----|-----------|
| `loginLimiter` | 15 min | 5 | `POST /api/auth/login` |
| `registerLimiter` | 60 min | 10 | `POST /api/auth/register` |
| `oauthLimiter` | 60 min | 20 | OAuth callback |
| `forgotLimiter` | 15 min | 3 | `POST /api/auth/forgot-password` |
| `generalLimiter` | 15 min | 200 | All `/api/*` routes |

### Socket Authentication

Socket.IO uses the same JWT as REST:

```js
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  socket.user = jwt.verify(token, process.env.JWT_SECRET);
  next();
});
```

Unauthenticated WebSocket connections are rejected at the handshake level.

---

## Real-Time Layer

Socket.IO 4.7 attached to the raw `http.Server` (not Express), enabling native WebSocket upgrades.

### Transport

```js
// Client-side socketService.js
socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],  // WS first, polling as fallback
  auth: { token },
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

WebSocket is tried first — no initial HTTP polling round-trip.

### Rooms

| Room | Members | Events emitted |
|------|---------|---------------|
| `public_chat` | All authenticated users | `receiveMessage`, `userTyping`, `onlineCount` |
| `user:<uuid>` | Single user | `notification` (complaint updates) |
| `admins` | All admin + super_admin roles | Broadcast notifications for new complaints |

### Nginx WebSocket Proxy

```nginx
location /socket.io/ {
    proxy_pass http://server:5000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

---

## Getting Started

### Docker (Recommended)

**Prerequisites:** Docker Desktop running.

```bash
git clone https://github.com/panduranga0811/JanSamadhan.git
cd JanSamadhan

# Copy and fill in your secrets
cp .env.example server/.env
# Edit server/.env — minimum required: JWT_SECRET, GOOGLE_CLIENT_ID/SECRET, CLOUDINARY_*, EMAIL_*

# Build images and start all 3 containers
docker compose up -d --build

# Watch logs
docker compose logs -f

# Check health
curl http://localhost/health          # Nginx → Express
curl http://localhost:5000/health     # Express direct
```

Startup sequence: MySQL initializes from `server/database/schema.sql` on first boot (~30s), then server starts once DB health check passes, then Nginx starts.

**Subsequent starts** (images already built):

```bash
docker compose up -d
```

**Teardown:**

```bash
docker compose down          # stops containers, keeps mysql_data volume
docker compose down -v       # also deletes the database volume (destructive)
```

---

### Manual Setup

**Prerequisites:** Node.js ≥ 20, MySQL 8.0 running locally.

#### 1. Database

```sql
CREATE DATABASE jansamadhan CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'jan_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON jansamadhan.* TO 'jan_user'@'localhost';
FLUSH PRIVILEGES;
```

Initialize schema:

```bash
mysql -u jan_user -p jansamadhan < server/database/schema.sql
```

#### 2. Backend

```bash
cd server
cp ../.env.example .env
# Edit .env — see Environment Variables section below

npm install
npm run dev       # nodemon, hot-reload
# or
npm start         # production mode
```

API available at `http://localhost:5000`. Health check: `GET /health`.

#### 3. Frontend

```bash
cd client
npm install
npm run dev       # Vite dev server with HMR
```

Frontend at `http://localhost:5173`. API calls proxy to `http://localhost:5000` via Vite's dev proxy.

> **Note:** In dev mode the frontend connects Socket.IO directly to `http://localhost:5000`. In production (Docker), it connects to `window.location.origin` and Nginx proxies the WebSocket.

---

## Environment Variables

All vars live in `server/.env`. See `.env.example` for the full template.

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API port (default: `5000`) |
| `NODE_ENV` | No | `development` \| `production` |
| `DB_HOST` | **Yes** | MySQL host. Use `db` in Docker, `localhost` for manual |
| `DB_PORT` | No | MySQL port (default: `3306`) |
| `DB_USER` | **Yes** | MySQL username |
| `DB_PASSWORD` | **Yes** | MySQL password |
| `DB_NAME` | **Yes** | Database name |
| `DB_ROOT_PASSWORD` | Docker only | Used by MySQL container health check |
| `JWT_SECRET` | **Yes** | Min 64 chars. Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_EXPIRES_IN` | No | Token lifetime (default: `7d`) |
| `JWT_ADMIN_EXPIRES_IN` | No | Admin token lifetime (default: `1h`) |
| `GOOGLE_CLIENT_ID` | OAuth | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth | From Google Cloud Console |
| `GOOGLE_CALLBACK_URL` | OAuth | e.g. `http://localhost:5000/api/auth/google/callback` |
| `CLOUDINARY_CLOUD_NAME` | Uploads | From cloudinary.com dashboard |
| `CLOUDINARY_API_KEY` | Uploads | From cloudinary.com dashboard |
| `CLOUDINARY_API_SECRET` | Uploads | From cloudinary.com dashboard |
| `EMAIL_HOST` | Password reset | e.g. `smtp.gmail.com` |
| `EMAIL_PORT` | Password reset | `587` (TLS) |
| `EMAIL_USER` | Password reset | Gmail address |
| `EMAIL_PASS` | Password reset | Gmail App Password (not your login password) |
| `FRONTEND_URL` | **Yes** | CORS origin. `http://localhost:5173` (dev) or your domain |
| `RATE_LIMIT_WINDOW_MS` | No | General limiter window in ms (default: `900000`) |
| `RATE_LIMIT_MAX` | No | General limiter max requests (default: `200`) |

---

## API Reference

Base URL (local): `http://localhost:5000`  
All protected endpoints require: `Authorization: Bearer <token>`

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | — | Register with email/password |
| `POST` | `/api/auth/login` | — | Login → JWT |
| `GET` | `/api/auth/google` | — | Initiate Google OAuth2 |
| `GET` | `/api/auth/google/callback` | — | OAuth2 callback |
| `POST` | `/api/auth/forgot-password` | — | Send reset email (rate limited: 3/15min) |
| `POST` | `/api/auth/reset-password` | — | Token + new password |

### Complaints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/complaints` | User | File new complaint (multipart, images optional) |
| `GET` | `/api/complaints/my` | User | Paginated list of own complaints |
| `GET` | `/api/complaints/:id` | User | Complaint detail + timeline + images |
| `POST` | `/api/complaints/:id/rate` | User | Rate resolved complaint (1–5 stars) |
| `GET` | `/api/admin/complaints` | Admin | All complaints (filterable by status/category) |
| `PUT` | `/api/admin/complaints/:id/status` | Admin | Update status + optional note |
| `POST` | `/api/admin/complaints/:id/assign` | Admin | Assign to admin |

### Users & Profile

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users/profile` | User | Own profile |
| `PUT` | `/api/users/profile` | User | Update name/phone/address/avatar |

### Notifications

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/notifications` | User | All notifications (unread first) |
| `PUT` | `/api/notifications/:id/read` | User | Mark one as read |
| `PUT` | `/api/notifications/read-all` | User | Mark all as read |

### Chat (REST)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/chat/messages` | User | Paginated message history |
| `POST` | `/api/chat/messages` | User | Send via REST (Socket preferred) |
| `GET` | `/api/chat/online-count` | User | Current public_chat room size |

### Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/users` | Admin | List users in own department |
| `GET` | `/api/superadmin/users` | Super Admin | All users platform-wide |
| `PUT` | `/api/superadmin/users/:id/role` | Super Admin | Promote/demote role |
| `PUT` | `/api/superadmin/users/:id/status` | Super Admin | active/inactive/banned |

### WebSocket Events

Connect to `/socket.io/` with `auth: { token: '<jwt>' }`.

**Client → Server:**

| Event | Payload | Description |
|-------|---------|-------------|
| `sendMessage` | `{ text: string }` | Send chat message to `public_chat` |
| `typing` | — | Broadcast typing indicator |

**Server → Client:**

| Event | Payload | Description |
|-------|---------|-------------|
| `receiveMessage` | `{ id, text, sender, role, time, userId, avatarUrl }` | New chat message |
| `userTyping` | `{ userName: string }` | Someone is typing |
| `onlineCount` | `{ count: number }` | Connected users in public chat |
| `notification` | `{ type, message, refId }` | Personal notification (complaint updates) |

---

## Deployment

### Local Docker → EC2 Production

**Step 1: Build and push images**

```bash
# Tag local images with Docker Hub names
docker tag jansamadhan-server:latest panduranga0811/jansamadhan-server-v2:latest
docker tag jansamadhan-client:latest panduranga0811/jansamadhan-client-v2:latest

# Push
docker login --username panduranga0811
docker push panduranga0811/jansamadhan-server-v2:latest
docker push panduranga0811/jansamadhan-client-v2:latest
```

**Step 2: EC2 setup**

```bash
# On your EC2 instance (Ubuntu)
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER  # then re-login

# Copy files to EC2
scp docker-compose.prod.yml ubuntu@<ec2-ip>:~/
scp server/.env ubuntu@<ec2-ip>:~/server/.env

# On EC2 — update DB_HOST to your RDS endpoint in server/.env
# then pull and start
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

`docker-compose.prod.yml` uses pre-built Docker Hub images and expects an external AWS RDS instance — no MySQL container.

**Step 3: Nginx + SSL (on EC2, outside Docker)**

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

Nginx on the EC2 host proxies `:80`/`:443` → Docker's exposed `:80`.

---

## Scripts

```bash
# Seed super admin account (run once after DB init)
node server/scripts/seedSuperAdmin.js

# Check container status
docker compose ps

# Tail all container logs
docker compose logs -f

# Restart only the server container (after code change)
docker compose up -d --build server

# Open MySQL shell inside container
docker exec -it jansamadhan-db mysql -u jan_user -p jansamadhan
```

---

## License

MIT — see [LICENSE](LICENSE).

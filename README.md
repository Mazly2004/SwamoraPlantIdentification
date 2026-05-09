# SwamoraPlant

A mobile-first plant image capture system. Users sign in, point their camera at a plant, capture a photo, and send it for downstream processing.

```
Swamora/
├── SwamoraPlant.Server/   # HonoJS API — auth + image upload
├── SwamoraPlant.ui/       # React frontend — camera capture
└── docker-compose.yml     # Full stack (db + api + ui)
```

---

## Quick start (Docker — full stack)

Requires Docker and Docker Compose.

```bash
# From the repo root
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| API      | http://localhost:3000        |
| API docs | http://localhost:3000/reference |

After the stack is up, seed the default account (first time only):

```bash
docker compose exec api node dist/db/seed.js
```

> Default login: `swamora@img.plant` / `abcd1234`

---

## Development setup (local)

Prerequisites: Node 20+, PostgreSQL running locally.

**Backend**

```bash
cd SwamoraPlant.Server
cp .env.example .env        # fill in DATABASE_URL and JWT_SECRET
npm install
npm run db:push             # push schema to postgres
npm run db:seed             # seed default account
npm run dev                 # http://localhost:3000
```

**Frontend**

```bash
cd SwamoraPlant.ui
cp .env.example .env        # set VITE_API_BASE_URL if needed
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:3000` automatically.

---

## Individual Docker stacks

Each subproject has its own `docker-compose.yml` for running that piece independently:

```bash
# Backend + DB only
cd SwamoraPlant.Server && docker compose up --build

# Frontend only
cd SwamoraPlant.ui && docker compose up --build
```

---

## Stack

| Layer    | Technology                            |
|----------|---------------------------------------|
| Backend  | HonoJS · Drizzle ORM · PostgreSQL     |
| Auth     | JWT (jose) · bcryptjs                 |
| API docs | Scalar · OpenAPI 3.0                  |
| Frontend | React 19 · Vite · TanStack Router     |
| UI       | Tailwind v4 · shadcn/ui               |

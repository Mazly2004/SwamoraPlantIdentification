# SwamoraPlant Server

HonoJS REST API for plant image collection. Handles JWT authentication and image upload.

## Stack

- **Runtime**: Node 20 (ESM)
- **Framework**: [HonoJS](https://hono.dev) + `@hono/zod-openapi`
- **Database**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team)
- **Auth**: JWT via [jose](https://github.com/panva/jose) · passwords via bcryptjs
- **Docs**: Scalar UI at `/reference`, raw OpenAPI spec at `/doc`

## Environment variables

Copy `.env.example` to `.env` and fill in the values.

| Variable          | Description                                 | Example                                      |
|-------------------|---------------------------------------------|----------------------------------------------|
| `PORT`            | Port to listen on                           | `3000`                                       |
| `DATABASE_URL`    | PostgreSQL connection string                | `postgres://admin:root@localhost:5432/swamora`|
| `JWT_SECRET`      | Secret for signing JWTs — keep this strong  | `openssl rand -hex 32`                       |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins                | `http://localhost:5173`                      |
| `SSL_KEY_PATH`    | (optional) Path to TLS private key          |                                              |
| `SSL_CERT_PATH`   | (optional) Path to TLS certificate          |                                              |

## Scripts

```bash
npm run dev          # start with hot reload (tsx watch)
npm run start        # start without hot reload
npm run db:push      # push schema changes to the database
npm run db:generate  # generate Drizzle migration files
npm run db:seed      # seed the default user account
```

## Default account

Run `npm run db:seed` after the first `db:push`:

| Field    | Value               |
|----------|---------------------|
| Email    | `swamora@img.plant` |
| Password | `abcd1234`          |

## API routes

| Method | Path                  | Auth required | Description                  |
|--------|-----------------------|---------------|------------------------------|
| POST   | `/api/auth/login`     | No            | Sign in, returns JWT token   |
| GET    | `/api/auth/me`        | Bearer token  | Get current user profile     |
| POST   | `/api/image/upload`   | Bearer token  | Upload a plant image         |

Full interactive docs: `GET /reference`

## Database schema

Single `users` table:

| Column          | Type        |
|-----------------|-------------|
| `id`            | serial (PK) |
| `name`          | text        |
| `email`         | text unique |
| `password_hash` | text        |
| `created_at`    | timestamp   |

## Docker

```bash
# Backend + DB only
docker compose up --build

# For the full stack (frontend included), use the root docker-compose.yml
```

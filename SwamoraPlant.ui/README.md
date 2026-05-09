# SwamoraPlant UI

Mobile-first React frontend for plant image capture. Sign in, use your camera to capture a plant photo, and send it to the backend for processing.

## Stack

- **Framework**: [React 19](https://react.dev) + [Vite 8](https://vite.dev)
- **Routing**: [TanStack Router](https://tanstack.com/router) (file-based)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com)
- **Auth**: JWT stored in localStorage, axios interceptor auto-attaches the token
- **State**: [Zustand](https://zustand.docs.pmnd.rs)
- **Font**: Geist Variable

## Environment variables

Copy `.env.example` to `.env`.

| Variable            | Description                                                  | Default |
|---------------------|--------------------------------------------------------------|---------|
| `VITE_API_BASE_URL` | API base URL in production. Leave empty to use nginx proxy.  | `""`    |

> In development, Vite proxies `/api` to `http://localhost:3000` automatically — no env var needed.
>
> In Docker (via root `docker-compose.yml`), leave this empty and nginx handles the `/api` proxy to the `api` service.

## Scripts

```bash
npm run dev      # start dev server at http://localhost:5173
npm run build    # production build into dist/
npm run preview  # preview the production build locally
npm run lint     # ESLint
```

## Routes

| Path     | Description                               |
|----------|-------------------------------------------|
| `/login` | Sign-in form                              |
| `/`      | Camera capture + image upload (protected) |

## Camera features

- Requests `environment` (rear) camera by default on mobile
- Detects multiple cameras after permission is granted — shows a **Switch Camera** button when more than one video input is available
- Captures a JPEG frame, previews it, then uploads via `POST /api/image/upload`

## Design

Paper and botanical aesthetic: warm parchment background, white cards, deep forest green accents, Geist font. Light mode by default.

## Docker

```bash
# Frontend only (serves on :5173, expects API at VITE_API_BASE_URL)
docker compose up --build

# Full stack with DB + API + UI — use the root docker-compose.yml
```

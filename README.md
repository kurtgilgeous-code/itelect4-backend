# itelect4-backend

TypeScript, Express, and MongoDB API for the Campus Lost & Found app.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN`. `CORS_ORIGIN` accepts a comma-separated list of exact browser origins.
3. Start the development server with `npm run dev`.
4. Seed the public category dropdown with `npm run seed:categories`.

## Scripts

- `npm run dev` starts the watch server.
- `npm run build` compiles TypeScript to `dist/`.
- `npm run typecheck` checks types without emitting files.
- `npm start` runs the compiled server.
- `npm run seed:categories` upserts the five item categories into MongoDB.

## API

- `GET /api/health` reports API and database readiness.
- `/api/auth` provides registration and login.
- `GET /api/categories` and `GET /api/categories/:id` provide public item categories.
- `/api/items` provides authenticated, owner-scoped item CRUD.

For deployment, set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` in the host's environment settings. Add the frontend's deployed origin to `CORS_ORIGIN` and redeploy the backend after changing it. Never commit `.env`.

# itelect4-backend

TypeScript, Express, and MongoDB API for the Campus Lost & Found app.

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
3. Start the development server with `npm run dev`.

## Scripts

- `npm run dev` starts the watch server.
- `npm run build` compiles TypeScript to `dist/`.
- `npm run typecheck` checks types without emitting files.
- `npm start` runs the compiled server.

## API

- `GET /api/health` reports API and database readiness.
- `/api/auth` provides registration and login.
- `/api/items` provides authenticated, owner-scoped item CRUD.
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
- `POST /api/auth/register` and `POST /api/auth/login` register accounts and issue JWTs.
- `GET /api/categories` and `GET /api/categories/:id` provide public item categories.
- `GET /api/items` and `GET /api/items/:id` provide public item browsing. Creating, editing, and deleting items requires a bearer token and is limited to the item's owner.
- `POST /api/claims` lets an authenticated user claim an item. Item owners can list and review their item's claims; administrators can list and review all claims.

For deployment, set `MONGODB_URI`, `JWT_SECRET`, and `CORS_ORIGIN` in the host's environment settings. Add the frontend's deployed origin to `CORS_ORIGIN` and redeploy the backend after changing it. Never commit `.env`.

Seed the category collection once with `npm run seed:categories` before using the category filters or item report form. Set newly promoted staff accounts' `role` to `admin` in MongoDB; public registration always creates a student account.

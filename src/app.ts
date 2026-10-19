import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import type { ErrorRequestHandler } from "express";
import authRouter from "./routes/auth.js";
import categoriesRouter from "./routes/categories.js";
import claimsRouter from "./routes/claims.js";
import { aiRouter } from "./routes/ai.js";
import itemsRouter from "./routes/items.js";
import ensureDatabaseConnection from "./middleware/ensureDatabaseConnection.js";

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, false);
        return;
      }

      const defaultDevelopmentOrigins =
        process.env.NODE_ENV === "production"
          ? ""
          : "http://localhost:5173,http://localhost:5174";
      const allowedOrigins = (process.env.CORS_ORIGIN ?? defaultDevelopmentOrigins)
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (!allowedOrigins?.length) {
        callback(new Error("CORS_ORIGIN is not configured"));
        return;
      }

      callback(null, allowedOrigins.includes(origin));
    },
  }),
);
app.use(express.json());
app.use(ensureDatabaseConnection);

app.get("/api/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;

  res.status(ready ? 200 : 503).json({
    ok: ready,
    db: ready,
    status: ready ? "ok" : "unavailable",
    message: ready ? "API is running and connected to MongoDB" : "API is running but MongoDB is disconnected",
    database: ready ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/items", itemsRouter);
app.use("/api/claims", claimsRouter);
app.use("/api/ai", aiRouter);

app.use((_req, res) => {
  res.status(404).json({
    message: "Route not found",
    status: "not_found",
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: error.message });
    return;
  }
  console.error(error);
  res.status(500).json({ message: "Internal server error" });
};

app.use(errorHandler);

export default app;
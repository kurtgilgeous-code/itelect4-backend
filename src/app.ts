import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import type { ErrorRequestHandler } from "express";
import authRouter from "./routes/auth.js";
import itemsRouter from "./routes/items.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ status: ready ? "ok" : "unavailable" });
});

app.use("/api/auth", authRouter);
app.use("/api/items", itemsRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
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
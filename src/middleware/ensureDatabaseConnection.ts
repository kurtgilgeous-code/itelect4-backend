import type { RequestHandler } from "express";
import { connectDB } from "../config/db.js";

const ensureDatabaseConnection: RequestHandler = async (_req, _res, next) => {
  await connectDB();
  next();
};

export default ensureDatabaseConnection;

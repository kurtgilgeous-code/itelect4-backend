import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import type { NewUserBody } from "../types/index.js";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body as NewUserBody;
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

  if (typeof name !== "string" || !name.trim() || !normalizedEmail || typeof password !== "string") {
    res.status(400).json({ message: "Name, email, and password are required" });
    return;
  }

  try {
    const user = await User.create({ name, email: normalizedEmail, password });
    res.status(201).json({ user });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({ message: "An account with this email already exists" });
      return;
    }
    throw error;
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ message: "Email and password are required" });
    return;
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ message: "Invalid email or password" });
    return;
  }
  if (!user.isActive) {
    res.status(401).json({ message: "This account is inactive" });
    return;
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "2h" });
  res.status(200).json({ token, user });
});

export default router;
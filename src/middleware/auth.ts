import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.get("authorization");
  const [scheme, token] = authorization?.split(" ") ?? [];
  const secret = process.env.JWT_SECRET;

  if (scheme !== "Bearer" || !token || !secret) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.userId !== "string") {
      res.status(401).json({ message: "Invalid or expired token" });
      return;
    }

    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
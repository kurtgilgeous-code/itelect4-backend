import { ApiError } from "@google/genai";
import { rateLimit } from "express-rate-limit";
import { Router } from "express";
import type { Request, Response } from "express";
import { AiReplyError, reviewProject } from "../ai/gemini.js";
import { requireAuth } from "../middleware/auth.js";
import { aiRequestSchema } from "../schemas/review.js";

export const aiRouter = Router();

aiRouter.use(requireAuth);

const aiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  keyGenerator: (req) => req.userId!,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ message: "Five reviews a minute is the limit. Try again shortly." });
  },
});

aiRouter.post("/", aiLimiter, async (req: Request, res: Response) => {
  const parsed = aiRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.issues,
    });
    return;
  }

  try {
    const review = await reviewProject(parsed.data.prompt);
    res.status(200).json(review);
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) {
      res.status(429).json({ message: "The AI quota is used up for now. Try again later." });
      return;
    }

    if (error instanceof ApiError || error instanceof AiReplyError) {
      console.error(error);
      res.status(502).json({ message: "The AI service did not answer properly. Try again." });
      return;
    }

    throw error;
  }
});
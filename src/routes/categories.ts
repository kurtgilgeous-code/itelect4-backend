import { Router } from "express";
import type { Request, Response } from "express";
import Category from "../models/Category.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const categories = await Category.find().sort({ id: 1 });
  res.status(200).json(categories);
});

router.get("/:id", async (req: Request, res: Response) => {
  const category = await Category.findOne({ id: req.params.id });
  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }
  res.status(200).json(category);
});

export default router;

import { Router } from "express";
import type { Request, Response } from "express";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import Item from "../models/Item.js";
import type { NewItemBody } from "../types/index.js";

const router = Router();

router.use(optionalAuth);

router.get("/", async (req: Request, res: Response) => {
  const items = await Item.find().sort({ dateReported: -1 });
  res.status(200).json(
    items.map((item) => ({
      ...item.toJSON(),
      isOwner: req.userId !== undefined && item.userId.toString() === req.userId,
    })),
  );
});

router.get("/:id", async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  res.status(200).json({
    ...item.toJSON(),
    isOwner: req.userId !== undefined && item.userId.toString() === req.userId,
  });
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const body = req.body as NewItemBody;
  const item = await Item.create({
    ...body,
    dateReported: body.dateReported ? new Date(body.dateReported) : undefined,
    userId: req.userId,
  });
  res.status(201).json(item);
});

router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  const body = req.body as Partial<NewItemBody>;
  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = body.title;
  if (body.description !== undefined) updates.description = body.description;
  if (body.location !== undefined) updates.location = body.location;
  if (body.status !== undefined) updates.status = body.status;
  if (body.dateReported !== undefined) updates.dateReported = new Date(body.dateReported);
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
  if (body.quantity !== undefined) updates.quantity = body.quantity;

  const item = await Item.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId as string },
    { $set: updates },
    { new: true, runValidators: true },
  );
  if (!item) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  res.status(200).json(item);
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.userId as string });
  if (!item) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  res.status(204).send();
});

export default router;
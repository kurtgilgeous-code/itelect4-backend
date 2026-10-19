import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../middleware/auth.js";
import Claim from "../models/Claim.js";
import Item from "../models/Item.js";
import User from "../models/User.js";

const router = Router();

router.get("/", requireAuth, async (req: Request, res: Response) => {
  const itemId = req.query.itemId;
  const user = await User.findById(req.userId).select("role");
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }

  if (typeof itemId === "string") {
    const item = await Item.findById(itemId);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    if (user.role !== "admin" && item.userId.toString() !== req.userId) {
      res.status(403).json({ message: "Only the item owner or an administrator can review claims" });
      return;
    }
    res.status(200).json(await Claim.find({ itemId }).sort({ claimDate: -1 }));
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({ message: "Administrator access required" });
    return;
  }
  res.status(200).json(await Claim.find().sort({ claimDate: -1 }));
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const itemId = req.body?.itemId;
  if (typeof itemId !== "string" || !itemId.trim()) {
    res.status(400).json({ message: "itemId is required" });
    return;
  }

  const [item, user] = await Promise.all([
    Item.findById(itemId),
    User.findById(req.userId).select("name"),
  ]);
  if (!item) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (item.userId.toString() === req.userId) {
    res.status(403).json({ message: "You cannot claim your own item" });
    return;
  }
  if (item.status === "claimed") {
    res.status(409).json({ message: "This item has already been claimed" });
    return;
  }

  try {
    const claim = await Claim.create({
      itemId: item._id,
      claimantId: user._id,
      claimantName: user.name,
    });
    res.status(201).json(claim);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      res.status(409).json({ message: "You have already submitted a claim for this item" });
      return;
    }
    throw error;
  }
});

router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  const { status } = req.body as { status?: unknown };
  if (status !== "approved" && status !== "rejected") {
    res.status(400).json({ message: "Status must be approved or rejected" });
    return;
  }

  const claim = await Claim.findById(req.params.id);
  if (!claim) {
    res.status(404).json({ message: "Claim not found" });
    return;
  }
  const [item, user] = await Promise.all([
    Item.findById(claim.itemId),
    User.findById(req.userId).select("role"),
  ]);
  if (!item) {
    res.status(404).json({ message: "Item not found" });
    return;
  }
  if (!user) {
    res.status(401).json({ message: "Authentication required" });
    return;
  }
  if (user.role !== "admin" && item.userId.toString() !== req.userId) {
    res.status(403).json({ message: "Only the item owner or an administrator can review claims" });
    return;
  }
  if (claim.status !== "pending") {
    res.status(409).json({ message: "Only pending claims can be reviewed" });
    return;
  }

  const updatedClaim = await Claim.findOneAndUpdate(
    { _id: claim._id, status: "pending" },
    { $set: { status } },
    { new: true, runValidators: true },
  );
  if (!updatedClaim) {
    res.status(409).json({ message: "This claim has already been reviewed" });
    return;
  }

  if (status === "approved") {
    await Item.findByIdAndUpdate(item._id, { $set: { status: "claimed" } });
    await Claim.updateMany(
      { itemId: item._id, _id: { $ne: updatedClaim._id }, status: "pending" },
      { $set: { status: "rejected" } },
    );
  }
  res.status(200).json(updatedClaim);
});

export default router;
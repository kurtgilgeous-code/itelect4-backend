import { model, Schema } from "mongoose";
import type { ClaimDoc } from "../types/index.js";

const claimSchema = new Schema<ClaimDoc>(
  {
    itemId: { type: Schema.Types.ObjectId, ref: "Item", required: true },
    claimantId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    claimantName: { type: String, required: true, trim: true },
    claimDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      required: true,
    },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        const json = ret as unknown as Record<string, unknown>;
        json.id = String(json._id);
        json.itemId = String(json.itemId);
        delete json._id;
        delete json.__v;
        delete json.claimantId;
        return json;
      },
    },
  },
);

claimSchema.index({ itemId: 1, claimantId: 1 }, { unique: true });

export default model<ClaimDoc>("Claim", claimSchema);
import { model, Schema } from "mongoose";
import type { ItemDoc } from "../types/index.js";

const itemSchema = new Schema<ItemDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: {
      type: String,
      required: [true, "Item title is required"],
      minlength: [3, "Item title must be at least 3 characters long"],
      maxlength: [80, "Item title cannot exceed 80 characters"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Item description is required"],
      minlength: [10, "Item description must be at least 10 characters long"],
    },
    location: {
      type: String,
      required: [true, "Campus location is required"],
      minlength: [3, "Campus location must be at least 3 characters long"],
    },
    status: {
      type: String,
      enum: {
        values: ["lost", "found", "claimed"],
        message: "Item status must be lost, found, or claimed",
      },
      required: [true, "Item status is required"],
    },
    dateReported: {
      type: Date,
      required: [true, "Date reported is required"],
      validate: {
        validator: (date: Date) => date.getTime() <= Date.now() + 5 * 60 * 1000,
        message: "Date reported cannot be in the future",
      },
    },
    categoryId: {
      type: String,
      required: [true, "Item category is required"],
      match: [/^[1-9]\d*$/, "Category ID must be a valid positive numeric ID"],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Item quantity must be at least 1"],
      max: [100, "Item quantity cannot exceed 100"],
    },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        const json = ret as unknown as Record<string, unknown>;
        json.id = String(json._id);
        delete json._id;
        delete json.__v;
        return json;
      },
    },
  },
);

const ItemModel = model<ItemDoc>("Item", itemSchema);

export default ItemModel;
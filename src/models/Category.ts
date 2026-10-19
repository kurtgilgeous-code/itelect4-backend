import { model, Schema } from "mongoose";
import type { CategoryDoc } from "../types/index.js";

const categorySchema = new Schema<CategoryDoc>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        const json = ret as unknown as Record<string, unknown>;
        delete json._id;
        delete json.__v;
        return json;
      },
    },
  },
);

const CategoryModel = model<CategoryDoc>("Category", categorySchema);

export default CategoryModel;

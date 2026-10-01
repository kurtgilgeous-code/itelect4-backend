import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";
import type { UserDoc } from "../types/index.js";

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "instructor"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },
    password: { type: String, required: true, minlength: 8, select: false },
  },
  {
    toJSON: {
      transform: (_doc, ret) => {
        const json = ret as unknown as Record<string, unknown>;
        json.id = String(json._id);
        delete json._id;
        delete json.__v;
        delete json.password;
        return json;
      },
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User = model<UserDoc>("User", userSchema);

export default User;
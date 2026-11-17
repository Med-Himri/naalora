import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { L10n } from "./shared.ts";

const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: L10n, required: true },
    intro: { type: L10n, default: () => ({}) },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof CategorySchema>;
export const Category =
  (mongoose.models.Category as mongoose.Model<CategoryDoc>) || mongoose.model("Category", CategorySchema);

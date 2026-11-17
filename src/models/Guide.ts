import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { L10n } from "./shared.ts";

const GuideSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: L10n, required: true },
    excerpt: { type: L10n, default: () => ({}) },
    content: { type: L10n, default: () => ({}) },
    cover: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      alt: { type: L10n, default: () => ({}) },
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type GuideDoc = InferSchemaType<typeof GuideSchema>;
export const Guide = (mongoose.models.Guide as mongoose.Model<GuideDoc>) || mongoose.model("Guide", GuideSchema);

import mongoose, { Schema, type InferSchemaType } from "mongoose";
import { L10n } from "./shared.ts";

export const TONES = ["brown", "pastel", "dark", "other"] as const;
export const BADGES = ["best", "new", "none"] as const;

const ImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    alt: { type: L10n, default: () => ({}) },
    position: { type: Number, default: 0 },
  },
  { _id: true },
);

const SizeSchema = new Schema(
  {
    size: { type: Number, required: true, min: 15, max: 50 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    sku: { type: String, default: "", trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    name: { type: L10n, required: true },
    summary: { type: L10n, default: () => ({}) },
    description: { type: L10n, default: () => ({}) },
    specs: {
      material: { type: L10n, default: () => ({}) },
      lining: { type: L10n, default: () => ({}) },
      soleHeight: { type: L10n, default: () => ({}) },
      care: { type: L10n, default: () => ({}) },
    },
    colorName: { type: L10n, default: () => ({}) },
    swatchHex: { type: String, default: "#cccccc" },
    tone: { type: String, enum: TONES, default: "other" },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null, min: 0 },
    badge: { type: String, enum: BADGES, default: "none" },
    images: { type: [ImageSchema], default: [] },
    sizes: { type: [SizeSchema], default: [] },
    active: { type: Boolean, default: true },
    position: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ProductSchema.index({ category: 1, active: 1 });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;
export const Product =
  (mongoose.models.Product as mongoose.Model<ProductDoc>) || mongoose.model("Product", ProductSchema);

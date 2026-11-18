import mongoose, { Schema, type InferSchemaType } from "mongoose";

/** Store settings editable in the admin (one document, key "main"). */
const SettingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "main" },
    shippingFee: { type: Number, default: 0, min: 0 },
    freeShippingFrom: { type: Number, default: null, min: 0 },
    /** Home hero picture (empty url = built-in illustration). */
    hero: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      alt: { fr: { type: String, default: "" }, ar: { type: String, default: "" } },
    },
  },
  { timestamps: true },
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;
export const Settings =
  (mongoose.models.Settings as mongoose.Model<SettingsDoc>) || mongoose.model("Settings", SettingsSchema);

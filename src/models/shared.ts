import { Schema } from "mongoose";

/** { fr, ar } localized string */
export const L10n = new Schema(
  { fr: { type: String, default: "", trim: true }, ar: { type: String, default: "", trim: true } },
  { _id: false },
);

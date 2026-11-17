import mongoose, { Schema, type InferSchemaType } from "mongoose";

export const ORDER_STATUSES = ["nouveau", "confirme", "expedie", "livre", "annule"] as const;

const OrderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: ORDER_STATUSES, default: "nouveau" },
    locale: { type: String, enum: ["fr", "ar"], default: "fr" },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      note: { type: String, default: "" },
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
  },
  { timestamps: true },
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ status: 1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema>;
export const Order = (mongoose.models.Order as mongoose.Model<OrderDoc>) || mongoose.model("Order", OrderSchema);

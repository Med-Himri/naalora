import "server-only";
import { randomInt } from "node:crypto";
import mongoose from "mongoose";
import { connectDB, isDemo } from "./db";
import { demoStore } from "./demo-store";
import { shippingFor, type ShippingSettings } from "./pricing";
import { loadShippingFresh } from "./data";
import { isObjectId } from "./validation";
import { Order, Product } from "@/models";
import { toProductDTO } from "./mappers";
import { colorByKey, priceOf } from "./product";
import type { Locale } from "./locales";
import type { OrderDTO } from "./types";

export type OrderLineInput = { productId: string; colorKey: string; size: number; qty: number };
export type CustomerInput = { name: string; phone: string; city: string; address: string; note: string };

/** A line that cannot be served: unknown/inactive product, or not enough stock. */
export type Problem = { productId: string; colorKey: string; size: number; name: string; available: number; reason: "gone" | "stock" };

export class OrderProblemError extends Error {
  constructor(public problems: Problem[]) {
    super("ORDER_PROBLEM");
  }
}

const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newRef(): string {
  let s = "NA";
  for (let i = 0; i < 6; i++) s += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return s;
}

type Built = { items: OrderDTO["items"]; subtotal: number; shipping: number; total: number };

function totals(items: OrderDTO["items"], s: ShippingSettings): Omit<Built, "items"> {
  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.qty, 0);
  const shipping = shippingFor(subtotal, s);
  return { subtotal, shipping, total: subtotal + shipping };
}

/**
 * Creates an order. Prices and names always come from the database.
 * Stock is decremented atomically (conditional $inc) inside a transaction:
 * if any line fails, nothing is written and an OrderProblemError lists the lines.
 */
export async function createOrder(lines: OrderLineInput[], customer: CustomerInput, locale: Locale): Promise<{ ref: string; total: number; built: Built }> {
  const shipping = await loadShippingFresh();
  return isDemo ? createDemoOrder(lines, customer, locale, shipping) : createDbOrder(lines, customer, locale, shipping);
}

async function createDbOrder(lines: OrderLineInput[], customer: CustomerInput, locale: Locale, shippingSettings: ShippingSettings) {
  await connectDB();
  const ids = lines.map((l) => l.productId);
  if (!ids.every(isObjectId)) {
    throw new OrderProblemError(lines.filter((l) => !isObjectId(l.productId)).map((l) => ({ ...l, name: "?", available: 0, reason: "gone" as const })));
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const ref = newRef();
    const session = await mongoose.startSession();
    try {
      let built: Built | null = null;
      await session.withTransaction(async () => {
        const products = await Product.find({ _id: { $in: ids } }).session(session).lean();
        const problems: Problem[] = [];
        const items: OrderDTO["items"] = [];

        for (const line of lines) {
          const doc = products.find((x) => String(x._id) === line.productId);
          const p = doc ? toProductDTO(doc) : null;
          const color = p ? colorByKey(p, line.colorKey) : null;
          const label = p ? `${p.name[locale] || p.name.fr}${color ? ` — ${color.name[locale] || color.name.fr}` : ""}` : "?";
          if (!doc || !p || !p.active || !color) {
            problems.push({ ...line, name: label, available: 0, reason: "gone" });
            continue;
          }
          const sizeRow = color.sizes.find((s) => s.size === line.size);
          if (!sizeRow) {
            problems.push({ ...line, name: label, available: 0, reason: "gone" });
            continue;
          }
          // Atomic: only decrements if this colour + size still has enough stock.
          const legacy = !(doc.colors && doc.colors.length);
          const res = legacy
            ? await Product.updateOne(
                { _id: doc._id, active: true, sizes: { $elemMatch: { size: line.size, stock: { $gte: line.qty } } } },
                { $inc: { "sizes.$.stock": -line.qty } },
                { session },
              )
            : await Product.updateOne(
                { _id: doc._id, active: true, colors: { $elemMatch: { key: line.colorKey, sizes: { $elemMatch: { size: line.size, stock: { $gte: line.qty } } } } } },
                { $inc: { "colors.$[c].sizes.$[s].stock": -line.qty } },
                { session, arrayFilters: [{ "c.key": line.colorKey }, { "s.size": line.size }] },
              );
          if (res.modifiedCount !== 1) {
            problems.push({ ...line, name: label, available: Math.max(0, sizeRow.stock), reason: "stock" });
            continue;
          }
          items.push({ productId: p.id, slug: p.slug, name: p.name.fr, color: { key: color.key, name: color.name.fr }, size: line.size, qty: line.qty, unitPrice: priceOf(p, color) });
        }

        if (problems.length) throw new OrderProblemError(problems); // aborts the transaction

        const t = totals(items, shippingSettings);
        await Order.create(
          [
            {
              ref,
              status: "nouveau",
              locale,
              customer,
              items: items.map((i) => ({ product: i.productId, slug: i.slug, name: i.name, color: i.color, size: i.size, qty: i.qty, unitPrice: i.unitPrice })),
              ...t,
            },
          ],
          { session },
        );
        built = { items, ...t };
      });
      if (!built) throw new Error("Transaction finished without an order");
      const b = built as Built;
      return { ref, total: b.total, built: b };
    } catch (err) {
      // Duplicate ref (E11000 on "ref"): retry with a new one.
      if (err instanceof Error && "code" in err && (err as { code?: number }).code === 11000 && attempt < 2) continue;
      throw err;
    } finally {
      await session.endSession();
    }
  }
  throw new Error("Could not generate a unique order reference");
}

function createDemoOrder(lines: OrderLineInput[], customer: CustomerInput, locale: Locale, shippingSettings: ShippingSettings) {
  const store = demoStore();
  const problems: Problem[] = [];
  for (const line of lines) {
    const p = store.products.find((x) => x.id === line.productId);
    const color = p ? colorByKey(p, line.colorKey) : null;
    const row = color?.sizes.find((s) => s.size === line.size);
    const label = p ? `${p.name[locale]}${color ? ` — ${color.name[locale]}` : ""}` : "?";
    if (!p || !p.active || !color || !row) problems.push({ ...line, name: label, available: 0, reason: "gone" });
    else if (row.stock < line.qty) problems.push({ ...line, name: label, available: row.stock, reason: "stock" });
  }
  if (problems.length) throw new OrderProblemError(problems);

  // Single-threaded: check-then-write is atomic here.
  const items: OrderDTO["items"] = lines.map((line) => {
    const p = store.products.find((x) => x.id === line.productId)!;
    const color = colorByKey(p, line.colorKey)!;
    color.sizes.find((s) => s.size === line.size)!.stock -= line.qty;
    return { productId: p.id, slug: p.slug, name: p.name.fr, color: { key: color.key, name: color.name.fr }, size: line.size, qty: line.qty, unitPrice: priceOf(p, color) };
  });
  const t = totals(items, shippingSettings);
  let ref = newRef();
  while (store.orders.some((o) => o.ref === ref)) ref = newRef();
  store.orders.unshift({
    id: `demo-order-${store.orders.length + 1}`,
    ref,
    status: "nouveau",
    locale,
    customer,
    items,
    ...t,
    createdAt: new Date().toISOString(),
  });
  return { ref, total: t.total, built: { items, ...t } };
}

/**
 * npm run seed            → inserts the category, the 6 slippers and 3 draft guides if missing
 * npm run seed -- --force → also overwrites existing seeded items (same slugs) with the seed values
 * Orders are never touched.
 */
import mongoose from "mongoose";
import { Category } from "../src/models/Category.ts";
import { Product } from "../src/models/Product.ts";
import { Guide } from "../src/models/Guide.ts";
import { seedCategories, seedGuides, seedProducts } from "../src/lib/seed-data.ts";

const uri = process.env.MONGODB_URI;
const force = process.argv.includes("--force");

async function main() {
  if (!uri) {
    console.error("✗ MONGODB_URI is missing. Add it to .env.local (see .env.example).");
    process.exit(1);
  }
  await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "naalora" });
  console.log(`✓ Connected to "${mongoose.connection.name}"${force ? " (force mode)" : ""}`);
  await Promise.all([Category.syncIndexes(), Product.syncIndexes(), Guide.syncIndexes()]);
  const { Order } = await import("../src/models/Order.ts");
  await Order.syncIndexes();
  console.log("✓ Indexes synced");

  const report = { inserted: 0, updated: 0, skipped: 0 };
  async function upsert(model: mongoose.Model<any>, slug: string, data: Record<string, unknown>) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const exists = await model.exists({ slug });
    if (!exists) {
      await model.create(data);
      report.inserted++;
    } else if (force) {
      await model.updateOne({ slug }, { $set: data });
      report.updated++;
    } else {
      report.skipped++;
    }
  }

  for (const c of seedCategories) await upsert(Category, c.slug, c);
  const catIds = new Map<string, unknown>();
  for (const c of await Category.find().lean()) catIds.set(c.slug, c._id);

  for (const { categorySlug, ...p } of seedProducts) {
    await upsert(Product, p.slug, { ...p, category: catIds.get(categorySlug) });
  }
  for (const g of seedGuides) await upsert(Guide, g.slug, g);

  console.log(`✓ Done — inserted ${report.inserted}, updated ${report.updated}, skipped ${report.skipped} (already there).`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error("✗ Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});

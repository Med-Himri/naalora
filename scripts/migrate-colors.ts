/**
 * npm run migrate
 * Converts products from the old format (one product per colour) to products with colours:
 * - products sharing a model code (same category) are merged into ONE product with several colours;
 * - a product without a model code becomes a product with one colour.
 * Stock, photos and prices are kept. Safe to run several times (only old-format products are touched).
 * Also run automatically by `npm run seed`.
 */
import mongoose from "mongoose";
import { pathToFileURL } from "node:url";
import { Product } from "../src/models/Product.ts";
import { slugKey } from "../src/lib/product.ts";

type L = { fr: string; ar: string };
type Legacy = {
  _id: mongoose.Types.ObjectId;
  slug: string;
  category: mongoose.Types.ObjectId;
  model?: string;
  name: L;
  colorName?: L;
  swatchHex?: string;
  tone?: string;
  price: number;
  oldPrice?: number | null;
  images?: { _id?: mongoose.Types.ObjectId; url: string; publicId?: string; alt?: L; position?: number }[];
  sizes?: { size: number; stock: number }[];
  position?: number;
  colors?: unknown[];
};

const LEGACY_UNSET = { colorName: "", swatchHex: "", tone: "", images: "", sizes: "", model: "" };

/** "Pantoufle plateforme Chocolat" − "Chocolat" → "Pantoufle plateforme" */
function stripColor(name: string, color: string): string {
  const n = (name || "").trim();
  const c = (color || "").trim();
  return c && n.toLowerCase().endsWith(c.toLowerCase()) ? n.slice(0, n.length - c.length).replace(/[\s—–-]+$/, "").trim() || n : n;
}

function toColor(p: Legacy, base: Legacy, position: number) {
  const name: L = { fr: p.colorName?.fr || "Unique", ar: p.colorName?.ar || "لون واحد" };
  const samePrice = p.price === base.price;
  return {
    key: slugKey(name.fr) || `couleur-${position + 1}`,
    name,
    hex: p.swatchHex || "#cccccc",
    tone: ["brown", "pastel", "dark", "other"].includes(p.tone || "") ? p.tone : "other",
    price: samePrice ? null : p.price,
    oldPrice: samePrice ? null : (p.oldPrice ?? null),
    images: (p.images ?? []).map((img, k) => ({ url: img.url, publicId: img.publicId ?? "", alt: img.alt ?? { fr: "", ar: "" }, position: img.position ?? k })),
    sizes: (p.sizes ?? []).map((s) => ({ size: s.size, stock: s.stock })),
    position,
  };
}

export async function migrateColors(log: (msg: string) => void = console.log): Promise<{ merged: number; converted: number; removed: number }> {
  const legacy = (await Product.find({ $or: [{ colors: { $exists: false } }, { colors: { $size: 0 } }] }).lean()) as unknown as Legacy[];
  if (!legacy.length) return { merged: 0, converted: 0, removed: 0 };

  const groups = new Map<string, Legacy[]>();
  for (const p of legacy) {
    const key = p.model ? `${p.category}::${p.model}` : `single::${p._id}`;
    groups.set(key, [...(groups.get(key) ?? []), p]);
  }

  const report = { merged: 0, converted: 0, removed: 0 };
  for (const [key, list] of groups) {
    list.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const base = list[0];
    const colors = list.map((p, i) => toColor(p, base, i));
    // Keep colour keys unique inside the product.
    colors.forEach((c, i) => {
      if (colors.findIndex((x) => x.key === c.key) !== i) c.key = `${c.key}-${i + 1}`;
    });

    const set: Record<string, unknown> = { colors };
    if (list.length > 1 && base.model) {
      // Merged product: name without the colour, slug = model code (if free).
      set.name = { fr: stripColor(base.name.fr, base.colorName?.fr ?? ""), ar: stripColor(base.name.ar, base.colorName?.ar ?? "") };
      const taken = await Product.exists({ slug: base.model, _id: { $nin: list.map((p) => p._id) } });
      if (!taken) set.slug = base.model;
    }
    // Delete the merged-away products first so the new slug is free.
    const others = list.slice(1).map((p) => p._id);
    if (others.length) {
      await Product.deleteMany({ _id: { $in: others } });
      report.removed += others.length;
    }
    await Product.updateOne({ _id: base._id }, { $set: set, $unset: LEGACY_UNSET });
    if (list.length > 1) {
      report.merged++;
      log(`  ✓ ${list.length} produits fusionnés → « ${(set.name as L | undefined)?.fr ?? base.name.fr} » (${colors.map((c) => c.name.fr).join(", ")})`);
    } else {
      report.converted++;
      log(`  ✓ « ${base.name.fr} » → 1 couleur (${colors[0].name.fr})`);
    }
    void key;
  }
  return report;
}

// Run directly: npm run migrate
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ MONGODB_URI is missing. Add it to .env.local (see .env.example).");
    process.exit(1);
  }
  mongoose
    .connect(uri, { dbName: process.env.MONGODB_DB || "naalora" })
    .then(async () => {
      console.log(`✓ Connected to "${mongoose.connection.name}"`);
      const r = await migrateColors();
      console.log(r.merged + r.converted ? `✓ Done — merged ${r.merged}, converted ${r.converted}, removed ${r.removed} duplicate(s).` : "✓ Nothing to migrate: all products already use colours.");
      await mongoose.disconnect();
    })
    .catch(async (err) => {
      console.error("✗ Migration failed:", err.message);
      await mongoose.disconnect();
      process.exit(1);
    });
}

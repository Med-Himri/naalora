import { isDemo } from "@/lib/db";
import { testCatalogEnabled, testPhotosDir } from "@/lib/test-catalog";

/** Development only (npm run dev): shows which data the site is using. Never rendered in production. */
export default function DevStatus() {
  if (process.env.NODE_ENV !== "development") return null;
  const flag = process.env.NAALORA_TEST_CATALOG;
  const msg = !isDemo
    ? "MongoDB (MONGODB_URI défini) — photos de test non utilisées. Pour les voir : mettez # devant MONGODB_URI dans .env.local et relancez npm run dev."
    : testCatalogEnabled
      ? "Démo — photos de test ACTIVÉES."
      : flag === "0"
        ? "Démo — photos de test coupées (NAALORA_TEST_CATALOG=0 dans .env.local)."
        : `Démo — photos de test introuvables dans ${testPhotosDir}`;
  const ok = isDemo && testCatalogEnabled;
  return (
    <p
      className={`fixed bottom-3 start-14 z-[70] max-w-[min(90vw,34rem)] rounded-xl px-3 py-2 text-xs font-medium shadow-lift ${ok ? "bg-success text-paper" : "bg-accent-dark text-paper"}`}
      dir="ltr"
      role="note"
    >
      [dev] {msg}
    </p>
  );
}

"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { headers } from "next/headers";
import { updateTag } from "next/cache";
import { TAGS } from "@/lib/data";
import { checkPassword, createSession, destroySession, isAdmin, adminEnabled } from "@/lib/admin/auth";
import { parseCategory, parseGuide, parseProduct, str, type FieldErrors } from "@/lib/admin/forms";
import {
  AdminError, addProductImage, createCategory, moveCategory, moveProductImage, removeProductImage, saveGuide, saveProduct,
  setGuideCover, setGuidePublished, setOrderStatus, setProductActive, setProductImageAlt, updateCategory, ORDER_STATUS_VALUES,
} from "@/lib/admin/repo";
import { cloudinaryConfigured, destroyImage, isOwnUpload, signUpload, type Folder } from "@/lib/admin/cloudinary";
import { rateLimit } from "@/lib/rate-limit";
import type { OrderStatus } from "@/lib/types";

export type AdminResult = { ok: boolean; message: string; errors?: FieldErrors };
const OK = (message: string): AdminResult => ({ ok: true, message });
const FAIL = (message: string, errors?: FieldErrors): AdminResult => ({ ok: false, message, errors });

async function guard<T>(fn: () => Promise<T>): Promise<T | AdminResult> {
  if (!(await isAdmin())) return FAIL("Session expirée : reconnectez-vous.");
  try {
    return await fn();
  } catch (err) {
    unstable_rethrow(err); // let redirect() through
    if (err instanceof AdminError) return FAIL(err.message);
    console.error("[admin]", err);
    return FAIL("Erreur serveur. Réessayez.");
  }
}

const catalogChanged = () => updateTag(TAGS.catalog);
const guidesChanged = () => updateTag(TAGS.guides);

/* ---------- Auth ---------- */

export async function login(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  if (!adminEnabled()) return FAIL("Admin désactivé : définissez ADMIN_PASSWORD.");
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!rateLimit(`login:${ip}`, 8, 15 * 60 * 1000)) return FAIL("Trop de tentatives. Réessayez dans 15 minutes.");
  if (!checkPassword(String(fd.get("password") ?? "").slice(0, 200))) return FAIL("Mot de passe incorrect.");
  await createSession();
  redirect("/admin/commandes");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

/* ---------- Orders ---------- */

export async function changeOrderStatus(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  return guard(async () => {
    const id = str(fd, "id", 64);
    const status = str(fd, "status", 20) as OrderStatus;
    if (!ORDER_STATUS_VALUES.includes(status)) return FAIL("Statut invalide.");
    await setOrderStatus(id, status);
    if (status === "annule") catalogChanged(); // stock restored
    return OK("Statut mis à jour.");
  }) as Promise<AdminResult>;
}

/* ---------- Products ---------- */

export async function saveProductAction(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  return guard(async () => {
    const id = str(fd, "id", 64) || null;
    const { data, errors } = parseProduct(fd);
    if (Object.keys(errors).length) return FAIL("Corrigez les champs en rouge.", errors);
    const savedId = await saveProduct(id, data);
    catalogChanged();
    if (!id) redirect(`/admin/produits/${savedId}?created=1`);
    return OK("Produit enregistré.");
  }) as Promise<AdminResult>;
}

export async function toggleProductActive(fd: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = str(fd, "id", 64);
  await setProductActive(id, str(fd, "active", 5) === "true").catch(() => undefined);
  catalogChanged();
}

export async function getUploadSignature(folder: Folder): Promise<{ ok: true; sig: ReturnType<typeof signUpload> } | AdminResult> {
  if (!(await isAdmin())) return FAIL("Session expirée.");
  if (folder !== "products" && folder !== "guides") return FAIL("Dossier invalide.");
  if (!cloudinaryConfigured()) return FAIL("Cloudinary n’est pas configuré (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).");
  return { ok: true, sig: signUpload(folder) };
}

export async function addProductImageAction(productId: string, url: string, publicId: string, alt: { fr: string; ar: string }): Promise<AdminResult> {
  return guard(async () => {
    if (!isOwnUpload(String(url), String(publicId), "products")) return FAIL("Image refusée (origine inconnue).");
    await addProductImage(String(productId).slice(0, 64), {
      url: String(url),
      publicId: String(publicId),
      alt: { fr: String(alt?.fr ?? "").slice(0, 160), ar: String(alt?.ar ?? "").slice(0, 160) },
    });
    catalogChanged();
    return OK("Image ajoutée.");
  }) as Promise<AdminResult>;
}

export async function deleteProductImageAction(productId: string, imageId: string): Promise<AdminResult> {
  return guard(async () => {
    const publicId = await removeProductImage(String(productId).slice(0, 64), String(imageId).slice(0, 64));
    await destroyImage(publicId);
    catalogChanged();
    return OK("Image supprimée.");
  }) as Promise<AdminResult>;
}

export async function moveProductImageAction(productId: string, imageId: string, dir: number): Promise<AdminResult> {
  return guard(async () => {
    await moveProductImage(String(productId).slice(0, 64), String(imageId).slice(0, 64), dir < 0 ? -1 : 1);
    catalogChanged();
    return OK("Ordre mis à jour.");
  }) as Promise<AdminResult>;
}

export async function saveImageAltAction(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  return guard(async () => {
    await setProductImageAlt(str(fd, "productId", 64), str(fd, "imageId", 64), { fr: str(fd, "alt_fr", 160), ar: str(fd, "alt_ar", 160) });
    catalogChanged();
    return OK("Texte alternatif enregistré.");
  }) as Promise<AdminResult>;
}

/* ---------- Categories ---------- */

export async function saveCategoryAction(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  return guard(async () => {
    const id = str(fd, "id", 64) || null;
    const { data, errors } = parseCategory(fd);
    if (Object.keys(errors).length) return FAIL("Corrigez les champs en rouge.", errors);
    if (id) await updateCategory(id, data);
    else await createCategory(data);
    catalogChanged();
    return OK(id ? "Catégorie enregistrée." : "Catégorie créée.");
  }) as Promise<AdminResult>;
}

export async function moveCategoryAction(fd: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  await moveCategory(str(fd, "id", 64), str(fd, "dir", 2) === "-1" ? -1 : 1).catch(() => undefined);
  catalogChanged();
}

/* ---------- Guides ---------- */

export async function saveGuideAction(_prev: AdminResult | null, fd: FormData): Promise<AdminResult> {
  return guard(async () => {
    const id = str(fd, "id", 64) || null;
    const { data, errors } = parseGuide(fd);
    if (Object.keys(errors).length) return FAIL("Corrigez les champs en rouge.", errors);
    const savedId = await saveGuide(id, data);
    guidesChanged();
    if (!id) redirect(`/admin/guides/${savedId}?created=1`);
    return OK("Guide enregistré.");
  }) as Promise<AdminResult>;
}

export async function toggleGuidePublished(fd: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  await setGuidePublished(str(fd, "id", 64), str(fd, "published", 5) === "true").catch(() => undefined);
  guidesChanged();
}

export async function setGuideCoverAction(guideId: string, url: string | null, publicId: string | null): Promise<AdminResult> {
  return guard(async () => {
    if (url !== null && !isOwnUpload(String(url), String(publicId), "guides")) return FAIL("Image refusée (origine inconnue).");
    const prev = await setGuideCover(String(guideId).slice(0, 64), url ? { url: String(url), publicId: String(publicId) } : null);
    await destroyImage(prev);
    guidesChanged();
    return OK(url ? "Couverture enregistrée." : "Couverture supprimée.");
  }) as Promise<AdminResult>;
}

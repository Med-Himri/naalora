"use client";

import { getUploadSignature } from "@/app/admin/actions";

const MAX_BYTES = 10 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Signed direct upload: the server signs, the browser sends the file straight to Cloudinary. */
export async function uploadToCloudinary(file: File, folder: "products" | "guides"): Promise<{ url: string; publicId: string }> {
  if (!TYPES.includes(file.type)) throw new Error("Format accepté : JPG, PNG, WebP ou AVIF.");
  if (file.size > MAX_BYTES) throw new Error("Image trop lourde (10 Mo maximum).");
  const res = await getUploadSignature(folder);
  if (!("sig" in res)) throw new Error(res.message);
  const { cloudName, apiKey, timestamp, signature, folder: dir } = res.sig;
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("signature", signature);
  body.append("folder", dir);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  const json = await r.json().catch(() => ({}));
  if (!r.ok || !json.secure_url) throw new Error(json?.error?.message ? `Cloudinary : ${json.error.message}` : "Échec de l’envoi vers Cloudinary.");
  return { url: json.secure_url as string, publicId: json.public_id as string };
}

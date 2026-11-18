import "server-only";
import { v2 as cloudinary } from "cloudinary";

export const FOLDERS = { products: "naalora/products", guides: "naalora/guides", site: "naalora/site" } as const;
export type Folder = keyof typeof FOLDERS;

export function cloudinaryConfigured(): boolean {
  return !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}

function configure() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Signature for a direct browser → Cloudinary upload (the secret never leaves the server).
 * Direct upload avoids Vercel's 4.5 MB request limit for phone photos.
 */
export function signUpload(folder: Folder) {
  configure();
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: FOLDERS[folder], timestamp };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET as string);
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    folder: FOLDERS[folder],
    timestamp,
    signature,
  };
}

/** Accept only images uploaded to our own cloud and folder. */
export function isOwnUpload(url: string, publicId: string, folder: Folder): boolean {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  return (
    !!cloud &&
    url.startsWith(`https://res.cloudinary.com/${cloud}/image/upload/`) &&
    publicId.startsWith(`${FOLDERS[folder]}/`) &&
    /^[\w/-]+$/.test(publicId) &&
    url.length < 500
  );
}

export async function destroyImage(publicId: string): Promise<void> {
  if (!publicId || !cloudinaryConfigured()) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (err) {
    console.error("[cloudinary] destroy failed", publicId, err);
  }
}

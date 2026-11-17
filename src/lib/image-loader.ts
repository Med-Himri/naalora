type LoaderArgs = { src: string; width: number; quality?: number };

/**
 * Global next/image loader.
 * Cloudinary URLs get on-the-fly transforms (f_auto,q_auto + width).
 * Local files (logos, placeholders) are served as they are.
 */
export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  if (src.includes("res.cloudinary.com") && src.includes("/upload/")) {
    const q = quality ? `q_${quality}` : "q_auto";
    return src.replace("/upload/", `/upload/f_auto,${q},c_limit,w_${width}/`);
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}

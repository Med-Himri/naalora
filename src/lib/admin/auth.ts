import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "naalora_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Admin password: ADMIN_PASSWORD. In development only, falls back to "admin".
 * In production without ADMIN_PASSWORD the admin is disabled.
 */
export function adminPassword(): string | null {
  const p = process.env.ADMIN_PASSWORD;
  if (p && p.length > 0) return p;
  return process.env.NODE_ENV === "production" ? null : "admin";
}

export const adminEnabled = () => adminPassword() !== null;

function key(): Buffer {
  // Signing key derived from the password: changing the password logs everyone out.
  return createHash("sha256").update(`naalora-admin-v1:${adminPassword() ?? ""}`).digest();
}

function sign(payload: string): string {
  return createHmac("sha256", key()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkPassword(input: string): boolean {
  const p = adminPassword();
  return p !== null && safeEqual(input, p);
}

export async function createSession(): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `v1.${exp}`;
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).set(COOKIE, "", { httpOnly: true, path: "/admin", maxAge: 0, sameSite: "strict", secure: process.env.NODE_ENV === "production" });
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const parts = value.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const [v, exp, sig] = parts;
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(sig, sign(`${v}.${exp}`));
}

/** Call at the top of every admin server action. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Non autorisé");
}
